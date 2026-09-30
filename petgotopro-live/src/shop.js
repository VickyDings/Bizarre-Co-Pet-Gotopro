// ——— Pet-GoToPro shop: Printful catalog sync + public storefront ———
//
// Self-contained module. It creates its own tables on first request, so the
// only wiring needed in index.js is two route lines (see WIRING notes at the
// bottom of this file).
//
// Phase 1 = catalog only. Nothing here takes payment. Product pages show a
// "coming soon" call to action until settings.shop_mode is switched to 'live'
// and a checkout is added.

import { Hono } from 'hono';
import {
  esc, slugify, now, getSettings, setSetting, checkAuth, sameOrigin,
} from './util.js';
import { layout, logoUrl, pawDivider } from './theme.js';
import { adminLayout } from './admin.js';

// ————————————————————————————————————————————————
// Schema — created on demand, safe to run on every request
// ————————————————————————————————————————————————
const SHOP_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS shop_products (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     printful_id INTEGER UNIQUE NOT NULL,
     slug TEXT UNIQUE NOT NULL,
     name TEXT NOT NULL,
     description TEXT DEFAULT '',
     category TEXT DEFAULT 'Merch',
     thumb_media_id INTEGER,
     thumb_url TEXT DEFAULT '',
     base_cost REAL DEFAULT 0,
     retail_price REAL DEFAULT 0,
     price_override REAL,
     currency TEXT DEFAULT 'USD',
     status TEXT NOT NULL DEFAULT 'draft',
     sort INTEGER DEFAULT 0,
     synced_at TEXT,
     created_at TEXT NOT NULL,
     updated_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_shop_products_status ON shop_products(status, sort)`,
  `CREATE TABLE IF NOT EXISTS shop_variants (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     product_id INTEGER NOT NULL,
     printful_variant_id INTEGER UNIQUE NOT NULL,
     catalog_variant_id INTEGER,
     catalog_product_id INTEGER,
     name TEXT DEFAULT '',
     size TEXT DEFAULT '',
     color TEXT DEFAULT '',
     color_code TEXT DEFAULT '',
     sku TEXT DEFAULT '',
     base_cost REAL DEFAULT 0,
     retail_price REAL DEFAULT 0,
     image_url TEXT DEFAULT '',
     availability TEXT DEFAULT '',
     sort INTEGER DEFAULT 0)`,
  `CREATE INDEX IF NOT EXISTS idx_shop_variants_product ON shop_variants(product_id, sort)`,
  `CREATE TABLE IF NOT EXISTS shop_images (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     product_id INTEGER NOT NULL,
     media_id INTEGER,
     url TEXT NOT NULL,
     alt TEXT DEFAULT '',
     sort INTEGER DEFAULT 0)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_shop_images_url ON shop_images(product_id, url)`,
  `CREATE TABLE IF NOT EXISTS shop_sync_log (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     ran_at TEXT NOT NULL,
     ok INTEGER NOT NULL DEFAULT 1,
     products INTEGER DEFAULT 0,
     variants INTEGER DEFAULT 0,
     images INTEGER DEFAULT 0,
     message TEXT DEFAULT '')`,
];

let shopMigrated = false;
async function ensureShopSchema(db) {
  if (shopMigrated) return;
  await db.batch(SHOP_SCHEMA.map(s => db.prepare(s)));
  shopMigrated = true;
}

// ————————————————————————————————————————————————
// Printful API client
// ————————————————————————————————————————————————
const PF_BASE = 'https://api.printful.com';

async function pf(env, path) {
  const token = env.PRINTFUL_TOKEN;
  if (!token) {
    throw new Error('PRINTFUL_TOKEN is not set. Run: npx wrangler secret put PRINTFUL_TOKEN');
  }
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  // Only needed when the token is account-level rather than scoped to one store
  if (env.PRINTFUL_STORE_ID) headers['X-PF-Store-Id'] = String(env.PRINTFUL_STORE_ID);

  const res = await fetch(PF_BASE + path, { headers });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON error body */ }

  if (!res.ok || !json || json.code !== 200) {
    const reason = json?.error?.message || json?.result || `HTTP ${res.status}`;
    if (res.status === 401) throw new Error(`Printful rejected the token (401). It may be expired or wrong: ${reason}`);
    if (res.status === 403) throw new Error(`Printful denied that call (403) — a token scope is probably missing: ${reason}`);
    if (res.status === 429) throw new Error('Printful rate limit hit (429). Wait a minute and sync again.');
    throw new Error(`Printful ${path} failed: ${reason}`);
  }
  return json;
}

// Store one remote image in the media table and return its local id.
// Returns null on failure — a missing image should never fail a whole sync.
async function cacheImage(db, url, filenameHint) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const mime = res.headers.get('Content-Type') || 'image/jpeg';
    if (!/^image\//i.test(mime)) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    if (!buf.length || buf.length > 4_000_000) return null;
    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
    const filename = `${slugify(filenameHint || 'shop-image')}.${ext}`;
    const r = await db.prepare(
      'INSERT INTO media (filename, mime, data, created_at) VALUES (?, ?, ?, ?)'
    ).bind(filename, mime, buf, now()).run();
    return r.meta?.last_row_id ?? null;
  } catch {
    return null;
  }
}

// ————————————————————————————————————————————————
// The sync itself
// ————————————————————————————————————————————————
function pickOption(variant, key) {
  // Printful puts size/colour on the sync variant name and on the catalog variant
  const v = variant?.[key];
  return v ? String(v) : '';
}

export async function syncFromPrintful(env, db, { cacheImages = true } = {}) {
  await ensureShopSchema(db);
  const stamp = now();
  let productCount = 0, variantCount = 0, imageCount = 0;

  // 1. List every sync product in the store (paginated)
  const list = [];
  let offset = 0;
  for (let guard = 0; guard < 20; guard++) {
    const json = await pf(env, `/sync/products?limit=100&offset=${offset}`);
    const batch = json.result || [];
    list.push(...batch);
    const total = json.paging?.total ?? batch.length;
    offset += batch.length;
    if (!batch.length || offset >= total) break;
  }

  // 2. Detail call per product, collecting the catalog product ids we need prices for
  const details = [];
  const catalogProductIds = new Set();
  for (const item of list) {
    const json = await pf(env, `/sync/products/${item.id}`);
    const d = json.result || {};
    details.push(d);
    for (const v of d.sync_variants || []) {
      if (v.product?.product_id) catalogProductIds.add(v.product.product_id);
    }
  }

  // 3. One catalog call per unique product gives base costs for all of its variants.
  //    (Far cheaper than one call per variant — matters against the 120/min limit.)
  const basePrice = new Map();   // catalog variant id -> base cost
  const variantMeta = new Map(); // catalog variant id -> { size, color, color_code }
  for (const pid of catalogProductIds) {
    try {
      const json = await pf(env, `/products/${pid}`);
      for (const v of json.result?.variants || []) {
        basePrice.set(v.id, parseFloat(v.price) || 0);
        variantMeta.set(v.id, {
          size: v.size || '',
          color: v.color || '',
          color_code: v.color_code || '',
          availability: v.availability_status || '',
        });
      }
    } catch {
      // A single catalog miss shouldn't kill the sync — we just lose base cost for it
    }
  }

  // 4. Upsert
  for (const d of details) {
    const p = d.sync_product || {};
    const variants = (d.sync_variants || []).filter(v => !v.is_ignored);
    if (!p.id) continue;

    const existing = await db.prepare('SELECT * FROM shop_products WHERE printful_id = ?').bind(p.id).first();

    // Never regenerate a slug for a product that already has one — that would
    // break live URLs and anything Google has indexed.
    let slug = existing?.slug;
    if (!slug) {
      slug = slugify(p.name);
      let n = 2;
      while (await db.prepare('SELECT 1 FROM shop_products WHERE slug = ?').bind(slug).first()) {
        slug = `${slugify(p.name)}-${n++}`;
      }
    }

    const costs = variants.map(v => basePrice.get(v.product?.variant_id) || 0).filter(Boolean);
    const retails = variants.map(v => parseFloat(v.retail_price) || 0).filter(Boolean);
    const baseCost = costs.length ? Math.min(...costs) : 0;
    const retail = retails.length ? Math.min(...retails) : 0;
    const currency = variants[0]?.currency || 'USD';

    let productId, thumbMediaId = existing?.thumb_media_id ?? null;

    if (existing) {
      await db.prepare(
        `UPDATE shop_products SET name=?, thumb_url=?, base_cost=?, retail_price=?, currency=?, synced_at=?, updated_at=? WHERE id=?`
      ).bind(p.name || existing.name, p.thumbnail_url || existing.thumb_url, baseCost, retail, currency, stamp, stamp, existing.id).run();
      productId = existing.id;
    } else {
      const r = await db.prepare(
        `INSERT INTO shop_products (printful_id, slug, name, thumb_url, base_cost, retail_price, currency, status, sort, synced_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', 0, ?, ?, ?)`
      ).bind(p.id, slug, p.name || 'Untitled', p.thumbnail_url || '', baseCost, retail, currency, stamp, stamp, stamp).run();
      productId = r.meta?.last_row_id;
    }
    productCount++;

    // Thumbnail into the media table so pages don't depend on Printful's CDN
    if (cacheImages && !thumbMediaId && p.thumbnail_url) {
      const mid = await cacheImage(db, p.thumbnail_url, p.name);
      if (mid) {
        thumbMediaId = mid;
        imageCount++;
        await db.prepare('UPDATE shop_products SET thumb_media_id=? WHERE id=?').bind(mid, productId).run();
      }
    }

    // Variants — replace wholesale, they're cheap and Printful is the source of truth
    await db.prepare('DELETE FROM shop_variants WHERE product_id = ?').bind(productId).run();
    let sort = 0;
    for (const v of variants) {
      const cvid = v.product?.variant_id || null;
      const meta = variantMeta.get(cvid) || {};
      await db.prepare(
        `INSERT INTO shop_variants (product_id, printful_variant_id, catalog_variant_id, catalog_product_id, name, size, color, color_code, sku, base_cost, retail_price, image_url, availability, sort)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(printful_variant_id) DO UPDATE SET
           product_id=excluded.product_id, name=excluded.name, size=excluded.size, color=excluded.color,
           base_cost=excluded.base_cost, retail_price=excluded.retail_price, image_url=excluded.image_url,
           availability=excluded.availability, sort=excluded.sort`
      ).bind(
        productId, v.id, cvid, v.product?.product_id || null,
        v.name || '', pickOption(meta, 'size'), pickOption(meta, 'color'), meta.color_code || '',
        v.sku || '', basePrice.get(cvid) || 0, parseFloat(v.retail_price) || 0,
        v.files?.find(f => f.type === 'preview')?.preview_url || v.product?.image || '',
        meta.availability || v.availability_status || '', sort++
      ).run();
      variantCount++;
    }

    // Gallery images — one row per distinct preview URL
    if (cacheImages) {
      const urls = [...new Set(variants.map(v => v.files?.find(f => f.type === 'preview')?.preview_url).filter(Boolean))].slice(0, 6);
      for (const [i, url] of urls.entries()) {
        const seen = await db.prepare('SELECT 1 FROM shop_images WHERE product_id=? AND url=?').bind(productId, url).first();
        if (seen) continue;
        const mid = await cacheImage(db, url, `${p.name}-${i + 1}`);
        await db.prepare('INSERT OR IGNORE INTO shop_images (product_id, media_id, url, alt, sort) VALUES (?, ?, ?, ?, ?)')
          .bind(productId, mid, url, p.name || '', i).run();
        if (mid) imageCount++;
      }
    }
  }

  await db.prepare('INSERT INTO shop_sync_log (ran_at, ok, products, variants, images, message) VALUES (?, 1, ?, ?, ?, ?)')
    .bind(stamp, productCount, variantCount, imageCount, 'OK').run();

  return { products: productCount, variants: variantCount, images: imageCount };
}

// ————————————————————————————————————————————————
// Shared helpers
// ————————————————————————————————————————————————
async function getMenu(db) {
  const rows = (await db.prepare('SELECT label, url FROM menu_items ORDER BY sort ASC, id ASC').all()).results || [];
  return rows.length ? rows : [{ label: 'Home', url: '/' }, { label: 'Blog', url: '/blog' }];
}

function siteUrl(c, settings) {
  if (settings.site_url) return settings.site_url.replace(/\/$/, '');
  const u = new URL(c.req.url);
  return `${u.protocol}//${u.host}`;
}

function money(n, currency = 'USD') {
  const v = Number(n) || 0;
  const symbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';
  return `${symbol}${v.toFixed(2)}`;
}

// What the customer pays: your override wins, then Printful's retail price,
// then a 2× fallback off base cost so a page never shows $0.00.
function displayPrice(p) {
  if (p.price_override != null && p.price_override > 0) return p.price_override;
  if (p.retail_price > 0) return p.retail_price;
  return Math.max(0, Math.round(p.base_cost * 2 * 100) / 100);
}

function productImg(p) {
  return p.thumb_media_id ? `/media/${p.thumb_media_id}` : (p.thumb_url || '/logo.png');
}

export async function getShopUrls(db) {
  try {
    await ensureShopSchema(db);
    const rows = (await db.prepare("SELECT slug, updated_at FROM shop_products WHERE status='published'").all()).results || [];
    return rows;
  } catch { return []; }
}

const SHOP_CSS = `
.shop-hero{background:linear-gradient(160deg,#15111C,#514860);color:#FBFAFD;padding:56px 20px 48px;text-align:center}
.shop-hero h1{font-family:'Instrument Serif',Georgia,serif;font-size:clamp(28px,5vw,42px);margin-bottom:10px}
.shop-hero p{max-width:60ch;margin:0 auto;color:#E5E0EE;font-size:17px}
.shop-note{background:#F1EDF7;border:1px solid #E5E0EE;border-radius:10px;padding:14px 18px;margin:26px 0;color:#514860;font-size:15px}
.shop-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:22px;margin:26px 0 50px}
.shop-card{background:#fff;border:1px solid #E5E0EE;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 2px 10px rgba(21,17,28,.05)}
.shop-card .pic{aspect-ratio:1;background:#F1EDF7;display:flex;align-items:center;justify-content:center;overflow:hidden}
.shop-card .pic img{width:100%;height:100%;object-fit:cover}
.shop-card .body{padding:14px 16px 18px;display:flex;flex-direction:column;gap:6px;flex:1}
.shop-card h3{font-size:16px;line-height:1.35;margin:0}
.shop-card h3 a{color:#15111C;text-decoration:none}
.shop-card h3 a:hover{color:#C42A6E}
.shop-card .price{font-weight:700;color:#C42A6E;font-size:17px;margin-top:auto}
.shop-card .vcount{font-size:12px;color:#6E6480}
.pdp{display:grid;grid-template-columns:1fr;gap:34px;margin:34px 0 56px}
@media(min-width:820px){.pdp{grid-template-columns:1.05fr 1fr}}
.pdp-gallery .main{aspect-ratio:1;background:#F1EDF7;border:1px solid #E5E0EE;border-radius:12px;overflow:hidden;display:flex;align-items:center;justify-content:center}
.pdp-gallery .main img{width:100%;height:100%;object-fit:cover}
.pdp-thumbs{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.pdp-thumbs button{width:62px;height:62px;border:2px solid #E5E0EE;border-radius:8px;overflow:hidden;background:none;padding:0;cursor:pointer}
.pdp-thumbs button.on{border-color:#FF3D96}
.pdp-thumbs img{width:100%;height:100%;object-fit:cover;display:block}
.pdp h1{font-family:'Instrument Serif',Georgia,serif;font-size:clamp(24px,4vw,34px);margin-bottom:8px}
.pdp .pdp-price{font-size:26px;font-weight:700;color:#C42A6E;margin-bottom:16px}
.opt-group{margin-bottom:16px}
.opt-group .lab{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#6E6480;margin-bottom:7px}
.opt-row{display:flex;gap:8px;flex-wrap:wrap}
.opt{border:1.5px solid #E5E0EE;background:#fff;border-radius:8px;padding:8px 14px;font-size:14px;cursor:pointer;font-family:inherit}
.opt.on{border-color:#FF3D96;background:#F5EFFA;font-weight:700}
.opt.swatch{width:34px;height:34px;padding:0;border-radius:50%}
.buy{display:block;width:100%;text-align:center;background:#FF3D96;color:#fff;border:none;border-radius:10px;padding:15px;font-size:16px;font-weight:700;font-family:inherit;text-decoration:none;cursor:pointer}
.buy:hover{background:#C42A6E}
.buy.soon{background:#2C7A57}
.pdp-meta{margin-top:18px;font-size:14px;color:#514860;line-height:1.7}
.pdp-meta ul{margin:8px 0 0 18px}
`;

// ————————————————————————————————————————————————
// Public routes
// ————————————————————————————————————————————————
export const shopRoutes = new Hono();

shopRoutes.use('*', async (c, next) => {
  await ensureShopSchema(c.env.DB);
  return next();
});

shopRoutes.get('/shop', async (c) => {
  const db = c.env.DB;
  const settings = await getSettings(db);
  const menu = await getMenu(db);
  const products = (await db.prepare(
    "SELECT * FROM shop_products WHERE status='published' ORDER BY sort ASC, name ASC"
  ).all()).results || [];

  const counts = new Map();
  for (const p of products) {
    const r = await db.prepare('SELECT COUNT(*) n FROM shop_variants WHERE product_id=?').bind(p.id).first();
    counts.set(p.id, r?.n || 0);
  }

  const preview = (settings.shop_mode || 'preview') !== 'live';
  const cards = products.map(p => `
    <article class="shop-card">
      <div class="pic"><a href="/shop/${esc(p.slug)}"><img src="${esc(productImg(p))}" alt="${esc(p.name)}" loading="lazy"></a></div>
      <div class="body">
        <h3><a href="/shop/${esc(p.slug)}">${esc(p.name)}</a></h3>
        <div class="vcount">${counts.get(p.id)} option${counts.get(p.id) === 1 ? '' : 's'}</div>
        <div class="price">${money(displayPrice(p), p.currency)}</div>
      </div>
    </article>`).join('');

  const body = `
<section class="shop-hero">
  <h1>Pet-GoToPro Shop</h1>
  <p>Gear for the humans and the animals — designed by us, printed and shipped on demand.</p>
</section>
<div class="container">
  ${preview ? `<div class="shop-note"><strong>Opening soon.</strong> The range is live to browse while we finish setting up checkout. Spotted something you want? <a href="/contact">Tell us</a> and we'll let you know the moment it's buyable.</div>` : ''}
  <div class="shop-grid">${cards || '<p style="color:var(--ink-soft)">Products are on their way — check back shortly.</p>'}</div>
  ${pawDivider()}
</div>`;

  const base = siteUrl(c, settings);
  return c.html(layout({
    settings, menu,
    title: `Shop | ${settings.site_name}`,
    description: `Pet-GoToPro merchandise — bandanas, mugs, totes and tees for pet people, printed on demand.`,
    canonical: `${base}/shop`,
    ogImage: products[0] ? `${base}${productImg(products[0])}` : `${base}${logoUrl(settings)}`,
    body: `<style>${SHOP_CSS}</style>${body}`,
  }));
});

shopRoutes.get('/shop/:slug', async (c) => {
  const db = c.env.DB;
  const slug = c.req.param('slug');
  const p = await db.prepare("SELECT * FROM shop_products WHERE slug=? AND status='published'").bind(slug).first();
  if (!p) return c.notFound();

  const settings = await getSettings(db);
  const menu = await getMenu(db);
  const variants = (await db.prepare('SELECT * FROM shop_variants WHERE product_id=? ORDER BY sort ASC').bind(p.id).all()).results || [];
  const images = (await db.prepare('SELECT * FROM shop_images WHERE product_id=? ORDER BY sort ASC').bind(p.id).all()).results || [];

  const gallery = images.length
    ? images.map(im => im.media_id ? `/media/${im.media_id}` : im.url)
    : [productImg(p)];

  const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))];
  const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];
  const colorCode = new Map(variants.filter(v => v.color).map(v => [v.color, v.color_code || '#D8D2E2']));

  const price = displayPrice(p);
  const preview = (settings.shop_mode || 'preview') !== 'live';

  const optionBlock = (label, values, kind) => values.length > 1 ? `
    <div class="opt-group" data-kind="${kind}">
      <div class="lab">${label}</div>
      <div class="opt-row">
        ${values.map((v, i) => kind === 'color'
          ? `<button class="opt swatch${i === 0 ? ' on' : ''}" data-val="${esc(v)}" title="${esc(v)}" aria-label="${esc(v)}" style="background:${esc(colorCode.get(v) || '#D8D2E2')}"></button>`
          : `<button class="opt${i === 0 ? ' on' : ''}" data-val="${esc(v)}">${esc(v)}</button>`).join('')}
      </div>
    </div>` : '';

  const body = `
<div class="container">
  <p style="margin:26px 0 0;font-size:14px"><a href="/shop" style="color:#C42A6E;text-decoration:none">← Back to shop</a></p>
  <div class="pdp">
    <div class="pdp-gallery">
      <div class="main"><img id="pdp-main" src="${esc(gallery[0])}" alt="${esc(p.name)}"></div>
      ${gallery.length > 1 ? `<div class="pdp-thumbs">${gallery.map((g, i) =>
        `<button class="${i === 0 ? 'on' : ''}" data-src="${esc(g)}"><img src="${esc(g)}" alt="${esc(p.name)} view ${i + 1}" loading="lazy"></button>`).join('')}</div>` : ''}
    </div>
    <div class="pdp-info">
      <h1>${esc(p.name)}</h1>
      <div class="pdp-price" id="pdp-price">${money(price, p.currency)}</div>
      ${p.description ? `<div class="prose" style="margin-bottom:18px">${p.description}</div>` : ''}
      ${optionBlock('Colour', colors, 'color')}
      ${optionBlock('Size', sizes, 'size')}
      ${preview
        ? `<a class="buy soon" href="/contact">Tell me when this is available</a>
           <p style="font-size:13px;color:#6E6480;margin-top:10px;text-align:center">Checkout opens shortly — this page is live so you can see the range.</p>`
        : `<button class="buy" id="pdp-buy" data-slug="${esc(p.slug)}">Add to basket</button>`}
      <div class="pdp-meta">
        <strong>Printed on demand</strong>
        <ul>
          <li>Made after you order, so nothing is wasted on unsold stock</li>
          <li>Typically produced in 2–5 business days, then shipped</li>
          <li>Misprints and damage replaced free — see <a href="/shipping-returns">shipping &amp; returns</a></li>
        </ul>
      </div>
    </div>
  </div>
</div>
<script>
(function(){
  var main=document.getElementById('pdp-main');
  document.querySelectorAll('.pdp-thumbs button').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('.pdp-thumbs button').forEach(function(x){x.classList.remove('on');});
      b.classList.add('on'); if(main) main.src=b.dataset.src;
    });
  });
  document.querySelectorAll('.opt-group').forEach(function(g){
    g.querySelectorAll('.opt').forEach(function(o){
      o.addEventListener('click',function(){
        g.querySelectorAll('.opt').forEach(function(x){x.classList.remove('on');});
        o.classList.add('on');
      });
    });
  });
})();
</script>`;

  const base = siteUrl(c, settings);
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: gallery.map(g => g.startsWith('http') ? g : base + g),
    description: (p.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || `${p.name} from ${settings.site_name}`,
    brand: { '@type': 'Brand', name: settings.site_name },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: p.currency || 'USD',
      lowPrice: price.toFixed(2),
      highPrice: price.toFixed(2),
      offerCount: Math.max(1, variants.length),
      availability: preview ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock',
      url: `${base}/shop/${p.slug}`,
    },
  });

  return c.html(layout({
    settings, menu,
    title: `${p.name} | ${settings.site_name} Shop`,
    description: (p.description || '').replace(/<[^>]+>/g, ' ').slice(0, 155) || `${p.name} — Pet-GoToPro merchandise, printed on demand.`,
    canonical: `${base}/shop/${p.slug}`,
    ogImage: gallery[0].startsWith('http') ? gallery[0] : base + gallery[0],
    ogType: 'product',
    jsonLd,
    body: `<style>${SHOP_CSS}</style>${body}`,
  }));
});

// ————————————————————————————————————————————————
// Admin routes  (mounted at /admin, guarded the same way admin.js is)
// ————————————————————————————————————————————————
export const shopAdminRoutes = new Hono();

shopAdminRoutes.use('*', async (c, next) => {
  await ensureShopSchema(c.env.DB);
  const settings = await getSettings(c.env.DB);
  if (!settings.password_hash) return c.redirect('/admin/setup');
  if (!(await checkAuth(c))) return c.redirect('/admin/login');
  if (c.req.method !== 'GET' && !sameOrigin(c)) return c.text('Cross-origin request blocked', 403);
  return next();
});

shopAdminRoutes.get('/shop', async (c) => {
  const db = c.env.DB;
  const settings = await getSettings(db);
  const products = (await db.prepare('SELECT * FROM shop_products ORDER BY sort ASC, name ASC').all()).results || [];
  const last = await db.prepare('SELECT * FROM shop_sync_log ORDER BY id DESC LIMIT 1').first();
  const flash = c.req.query('ok');
  const flashErr = c.req.query('err');
  const mode = settings.shop_mode || 'preview';

  const rows = products.map(p => `
    <tr>
      <td style="width:56px"><img src="${esc(productImg(p))}" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:6px;background:#F1EDF7"></td>
      <td><a href="/admin/shop/${p.id}"><strong>${esc(p.name)}</strong></a><br><span style="font-size:12px;color:#6E6480">/shop/${esc(p.slug)}</span></td>
      <td style="font-size:13px">${money(p.base_cost, p.currency)}</td>
      <td style="font-size:13px"><strong>${money(displayPrice(p), p.currency)}</strong>${p.price_override ? ' <span style="font-size:11px;color:#C42A6E">override</span>' : ''}</td>
      <td><span class="badge ${p.status === 'published' ? 'published' : 'draft'}">${esc(p.status)}</span></td>
      <td style="text-align:right"><a class="btn small ghost" href="/admin/shop/${p.id}">Edit</a></td>
    </tr>`).join('');

  const body = `
<h1 class="pagetitle">🛍️ Shop</h1>
<p class="pagesub">Products pulled from your Printful store. Nothing here charges anyone — checkout comes later.</p>

<div class="card">
  <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap">
    <div>
      <strong>Sync from Printful</strong>
      <div style="font-size:13px;color:#6E6480;margin-top:4px">
        ${last ? `Last run ${esc(last.ran_at.slice(0, 16).replace('T', ' '))} — ${last.products} product${last.products === 1 ? '' : 's'}, ${last.variants} variant${last.variants === 1 ? '' : 's'}, ${last.images} image${last.images === 1 ? '' : 's'} cached.` : 'Never run yet.'}
      </div>
    </div>
    <form method="POST" action="/admin/shop/sync"><button class="btn">Sync now</button></form>
  </div>
</div>

<div class="card">
  <form method="POST" action="/admin/shop/mode" style="display:flex;align-items:end;gap:14px;flex-wrap:wrap">
    <div style="flex:1;min-width:220px">
      <label for="mode">Shop mode</label>
      <select name="mode" id="mode">
        <option value="preview"${mode === 'preview' ? ' selected' : ''}>Preview — browsable, "coming soon" buttons</option>
        <option value="live"${mode === 'live' ? ' selected' : ''}>Live — checkout enabled (needs a payment integration first)</option>
      </select>
    </div>
    <button class="btn ghost">Save mode</button>
  </form>
</div>

<table class="list">
  <tr><th></th><th>Product</th><th>Base cost</th><th>Your price</th><th>Status</th><th></th></tr>
  ${rows || '<tr><td colspan="6" style="padding:22px;text-align:center;color:#6E6480">No products yet. Build them in the Printful dashboard, then hit <strong>Sync now</strong>.</td></tr>'}
</table>`;

  return c.html(adminLayout({ title: 'Shop', active: 'shop', body, flash, flashErr }));
});

shopAdminRoutes.post('/shop/sync', async (c) => {
  try {
    const r = await syncFromPrintful(c.env, c.env.DB);
    return c.redirect(`/admin/shop?ok=${encodeURIComponent(`Synced ${r.products} products, ${r.variants} variants, ${r.images} images cached.`)}`);
  } catch (e) {
    await c.env.DB.prepare('INSERT INTO shop_sync_log (ran_at, ok, message) VALUES (?, 0, ?)')
      .bind(now(), String(e.message || e)).run().catch(() => {});
    return c.redirect(`/admin/shop?err=${encodeURIComponent(String(e.message || e))}`);
  }
});

shopAdminRoutes.post('/shop/mode', async (c) => {
  const form = await c.req.parseBody();
  const mode = form.mode === 'live' ? 'live' : 'preview';
  await setSetting(c.env.DB, 'shop_mode', mode);
  return c.redirect(`/admin/shop?ok=${encodeURIComponent(`Shop set to ${mode} mode.`)}`);
});

shopAdminRoutes.get('/shop/:id', async (c) => {
  const db = c.env.DB;
  const p = await db.prepare('SELECT * FROM shop_products WHERE id=?').bind(c.req.param('id')).first();
  if (!p) return c.notFound();
  const variants = (await db.prepare('SELECT * FROM shop_variants WHERE product_id=? ORDER BY sort ASC').bind(p.id).all()).results || [];

  const vrows = variants.map(v => `
    <tr>
      <td>${esc(v.name || '—')}</td>
      <td>${esc(v.color || '—')}</td>
      <td>${esc(v.size || '—')}</td>
      <td>${money(v.base_cost, p.currency)}</td>
      <td>${money(v.retail_price, p.currency)}</td>
      <td style="font-size:12px;color:#6E6480">${esc(v.availability || '')}</td>
    </tr>`).join('');

  const body = `
<h1 class="pagetitle">${esc(p.name)}</h1>
<p class="pagesub">Printful product #${p.printful_id} · last synced ${esc((p.synced_at || '').slice(0, 16).replace('T', ' ')) || 'never'}</p>

<form method="POST" action="/admin/shop/save">
  <input type="hidden" name="id" value="${p.id}">
  <div class="card">
    <label for="slug">Page address</label>
    <input type="text" name="slug" id="slug" value="${esc(p.slug)}">
    <p style="font-size:12px;color:#6E6480;margin-top:5px">Lives at /shop/${esc(p.slug)} — changing this breaks any existing links to the product.</p>

    <label for="description">Description</label>
    <textarea name="description" id="description" rows="7" placeholder="Why someone wants this. HTML is allowed.">${esc(p.description)}</textarea>

    <div class="grid2">
      <div>
        <label for="price_override">Your price (overrides Printful)</label>
        <input type="text" name="price_override" id="price_override" value="${p.price_override ?? ''}" placeholder="${displayPrice(p).toFixed(2)}">
        <p style="font-size:12px;color:#6E6480;margin-top:5px">Base cost ${money(p.base_cost, p.currency)} · Printful retail ${money(p.retail_price, p.currency)} · aim for roughly 2× base.</p>
      </div>
      <div>
        <label for="status">Status</label>
        <select name="status" id="status">
          <option value="draft"${p.status === 'draft' ? ' selected' : ''}>Draft — hidden from the site</option>
          <option value="published"${p.status === 'published' ? ' selected' : ''}>Published — visible in the shop</option>
        </select>
        <label for="sort">Sort order</label>
        <input type="text" name="sort" id="sort" value="${p.sort || 0}">
      </div>
    </div>

    <div style="margin-top:20px;display:flex;gap:10px">
      <button class="btn">Save</button>
      <a class="btn ghost" href="/admin/shop">Back to shop</a>
      <a class="btn ghost" href="/shop/${esc(p.slug)}" target="_blank">Preview</a>
    </div>
  </div>
</form>

<div class="card">
  <strong>Variants</strong>
  <p style="font-size:13px;color:#6E6480;margin:4px 0 12px">Managed in Printful — sync to update them here.</p>
  <table class="list">
    <tr><th>Name</th><th>Colour</th><th>Size</th><th>Base</th><th>Printful retail</th><th>Availability</th></tr>
    ${vrows || '<tr><td colspan="6" style="padding:16px;color:#6E6480">No variants synced.</td></tr>'}
  </table>
</div>`;

  return c.html(adminLayout({ title: p.name, active: 'shop', body }));
});

shopAdminRoutes.post('/shop/save', async (c) => {
  const db = c.env.DB;
  const f = await c.req.parseBody();
  const id = parseInt(f.id, 10);
  const p = await db.prepare('SELECT * FROM shop_products WHERE id=?').bind(id).first();
  if (!p) return c.notFound();

  let slug = slugify(f.slug || p.slug);
  if (slug !== p.slug) {
    const clash = await db.prepare('SELECT 1 FROM shop_products WHERE slug=? AND id<>?').bind(slug, id).first();
    if (clash) slug = p.slug;
    else {
      // Keep old shop URLs working, same as posts and pages do
      await db.prepare('INSERT OR REPLACE INTO slug_history (old_slug, kind, new_slug, changed_at) VALUES (?, ?, ?, ?)')
        .bind(p.slug, 'shop', slug, now()).run().catch(() => {});
    }
  }

  const override = String(f.price_override || '').trim();
  const priceOverride = override === '' ? null : (parseFloat(override.replace(/[^0-9.]/g, '')) || null);

  await db.prepare(
    `UPDATE shop_products SET slug=?, description=?, price_override=?, status=?, sort=?, updated_at=? WHERE id=?`
  ).bind(
    slug, String(f.description || ''), priceOverride,
    f.status === 'published' ? 'published' : 'draft',
    parseInt(f.sort, 10) || 0, now(), id
  ).run();

  return c.redirect(`/admin/shop?ok=${encodeURIComponent('Product saved.')}`);
});

/* ————————————————————————————————————————————————
   WIRING — three edits, all tiny

   1. src/index.js — import and mount BEFORE publicRoutes, because
      publicRoutes ends with a catch-all '/:slug' that would swallow /shop:

        import { shopRoutes, shopAdminRoutes } from './shop.js';
        ...
        app.route('/admin', shopAdminRoutes);   // before app.route('/admin', adminRoutes)
        app.route('/', shopRoutes);             // before app.route('/', publicRoutes)

   2. src/admin.js — two one-line changes:
        a) `function adminLayout(` becomes `export function adminLayout(`
        b) in adminLayout's nav array add:
             ['shop', '/admin/shop', '🛍️ Shop'],

   3. src/public.js — add shop pages to the sitemap. At the top:
        import { getShopUrls } from './shop.js';
      then inside the '/sitemap.xml' handler, add the rows:
        const shop = await getShopUrls(db);
        ...shop.map(s => `<url><loc>${base}/shop/${s.slug}</loc><lastmod>${s.updated_at}</lastmod></url>`)

   Secrets:
     npx wrangler secret put PRINTFUL_TOKEN
     npx wrangler secret put PRINTFUL_STORE_ID   (only for an account-level token)

   Then: /admin → Shop → Sync now.
———————————————————————————————————————————————— */
