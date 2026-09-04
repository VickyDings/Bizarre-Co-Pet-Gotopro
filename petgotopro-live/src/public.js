// ——— Public website routes ———
import { Hono } from 'hono';
import { esc, fmtDate, readingTime, excerpt, getSettings, stripHtml, applyAmazonTag } from './util.js';
import { layout, pawDivider, logoUrl } from './theme.js';

export const CATEGORIES = [
  { key: 'Dogs', emoji: '🐕' },
  { key: 'Cats', emoji: '🐈' },
  { key: 'Small Pets', emoji: '🐹' },
  { key: 'Birds', emoji: '🦜' },
  { key: 'Reptiles', emoji: '🦎' },
  { key: 'Aquatics', emoji: '🐠' },
  { key: 'Invertebrates', emoji: '🦂' },
  { key: 'General', emoji: '🐾' },
];

async function getMenu(db) {
  const rows = (await db.prepare('SELECT label, url FROM menu_items ORDER BY sort ASC, id ASC').all()).results || [];
  return rows.length ? rows : [{ label: 'Home', url: '/' }, { label: 'Blog', url: '/blog' }];
}

function siteUrl(c, settings) {
  if (settings.site_url) return settings.site_url.replace(/\/$/, '');
  const u = new URL(c.req.url);
  return `${u.protocol}//${u.host}`;
}

function postCard(p) {
  const thumb = p.hero_image
    ? `<img src="${esc(p.hero_image)}" alt="${esc(p.title)}" loading="lazy">`
    : `<span class="ph">🐾</span>`;
  return `<article class="post-card">
    <div class="thumb">${thumb}</div>
    <div class="card-body">
      <div class="card-cat">${esc(p.category)}</div>
      <h3><a href="/blog/${esc(p.slug)}">${esc(p.title)}</a></h3>
      <p class="card-ex">${esc(p.description || excerpt(p.body_html, 140))}</p>
      <div class="card-meta">${esc(fmtDate(p.published_at || p.created_at))} · ${readingTime(p.body_html)} min read</div>
    </div>
  </article>`;
}

export const publicRoutes = new Hono();

// Homepage
publicRoutes.get('/', async (c) => {
  const db = c.env.DB;
  const settings = await getSettings(db);
  const menu = await getMenu(db);
  const posts = (await db.prepare("SELECT * FROM posts WHERE status='published' ORDER BY published_at DESC LIMIT 9").all()).results || [];
  const cats = CATEGORIES.filter(cat => cat.key !== 'General').map(cat =>
    `<a class="cat-tile" href="/category/${encodeURIComponent(cat.key)}"><div class="emoji">${cat.emoji}</div><div class="name">${esc(cat.key)}</div></a>`).join('');
  const body = `
<section class="home-hero">
  <h1>Trusted pet care advice, honest product reviews</h1>
  <p>${esc(settings.tagline)} — covering dogs, cats, and the exotic companions other sites forget: birds, reptiles, small pets, aquatics and more.</p>
  <a class="hero-cta" href="/blog">Read the latest articles</a>
</section>
<div class="container">
  <h2 class="section-title">Browse by pet</h2>
  <p class="section-sub">Expert care guides and tested product picks for every kind of companion.</p>
  <div class="cat-grid">${cats}</div>
  ${pawDivider()}
  <h2 class="section-title" style="margin-top:10px">Latest articles</h2>
  <p class="section-sub">Fresh guides and reviews from the ${esc(settings.site_name)} team.</p>
  <div class="post-grid">${posts.map(postCard).join('') || '<p style="color:var(--ink-soft)">Articles coming soon — check back shortly!</p>'}</div>
</div>`;
  const base = siteUrl(c, settings);
  return c.html(layout({
    settings, menu,
    title: `${settings.site_name} — ${settings.tagline}`,
    description: `Expert pet care advice, product reviews and guides for dogs, cats, birds, reptiles, small pets and aquatics from ${settings.site_name}.`,
    canonical: `${base}/`,
    ogImage: `${base}${logoUrl(settings)}`,
    jsonLd: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: settings.site_name, url: `${base}/` }),
    body,
  }));
});

// Blog index + category pages
async function renderList(c, category) {
  const db = c.env.DB;
  const settings = await getSettings(db);
  const menu = await getMenu(db);
  const posts = category
    ? (await db.prepare("SELECT * FROM posts WHERE status='published' AND category=? ORDER BY published_at DESC").bind(category).all()).results || []
    : (await db.prepare("SELECT * FROM posts WHERE status='published' ORDER BY published_at DESC").all()).results || [];
  const chips = ['All', ...CATEGORIES.map(x => x.key)].map(k => {
    const href = k === 'All' ? '/blog' : `/category/${encodeURIComponent(k)}`;
    const active = (k === 'All' && !category) || k === category;
    return `<a class="chip${active ? ' active' : ''}" style="text-decoration:none" href="${href}">${esc(k)}</a>`;
  }).join('');
  const title = category ? `${category} — Articles & Reviews` : 'All Articles & Reviews';
  const body = `
<div class="container">
  <h1 class="section-title" style="margin-top:40px">${esc(title)}</h1>
  <p class="section-sub">${posts.length} article${posts.length === 1 ? '' : 's'}</p>
  <div class="chip-row" style="margin-bottom:10px">${chips}</div>
  <div class="post-grid">${posts.map(postCard).join('') || '<p style="color:var(--ink-soft)">No articles in this category yet.</p>'}</div>
</div>`;
  const base = siteUrl(c, settings);
  return c.html(layout({
    settings, menu,
    title: `${title} | ${settings.site_name}`,
    description: `${title} from ${settings.site_name} — expert pet care guides and honest product reviews.`,
    canonical: category ? `${base}/category/${encodeURIComponent(category)}` : `${base}/blog`,
    ogImage: `${base}${logoUrl(settings)}`,
    body,
  }));
}
publicRoutes.get('/blog', (c) => renderList(c, null));
publicRoutes.get('/category/:cat', (c) => renderList(c, decodeURIComponent(c.req.param('cat'))));

// Single post
publicRoutes.get('/blog/:slug', async (c) => {
  const db = c.env.DB;
  const slug = c.req.param('slug');
  const p = await db.prepare("SELECT * FROM posts WHERE slug=? AND status='published'").bind(slug).first();
  if (!p) {
    // The post may have been renamed — send old links to the new address permanently
    const moved = await db.prepare("SELECT new_slug FROM slug_history WHERE old_slug=? AND kind='post'").bind(slug).first();
    if (moved) return c.redirect(`/blog/${moved.new_slug}`, 301);
    return notFound(c);
  }
  const settings = await getSettings(db);
  const menu = await getMenu(db);
  const base = siteUrl(c, settings);
  const hasAffiliate = /amazon\./i.test(p.body_html);
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article',
    headline: p.title, description: p.description,
    datePublished: (p.published_at || p.created_at || '').slice(0, 10),
    dateModified: (p.updated_at || '').slice(0, 10),
    author: { '@type': 'Organization', name: settings.site_name },
    publisher: { '@type': 'Organization', name: settings.site_name, logo: { '@type': 'ImageObject', url: `${base}${logoUrl(settings)}` } },
    mainEntityOfPage: `${base}/blog/${p.slug}`,
  });
  const body = `
<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> &nbsp;›&nbsp; <a href="/category/${encodeURIComponent(p.category)}">${esc(p.category)}</a> &nbsp;›&nbsp; <span>${esc(p.title)}</span></nav>
<article class="article">
  <span class="eyebrow">${esc(p.category)} · ${esc(fmtDate(p.published_at || p.created_at))}</span>
  <h1>${esc(p.title)}</h1>
  ${p.description ? `<p class="deck">${esc(p.description)}</p>` : ''}
  <div class="byline">
    <span>By The ${esc(settings.site_name)} Team</span><span class="byline-dot"></span>
    <span>Updated ${esc(fmtDate(p.updated_at))}</span><span class="byline-dot"></span>
    <span>${readingTime(p.body_html)} min read</span>
  </div>
  ${hasAffiliate ? `<div class="disclosure"><strong>Affiliate disclosure:</strong> As an Amazon Associate, ${esc(settings.site_name)} earns from qualifying purchases. When you buy through links on this page, we may earn a small commission — at no extra cost to you.</div>` : ''}
  ${p.hero_image ? `<div class="hero-img"><img src="${esc(p.hero_image)}" alt="${esc(p.title)}"></div>` : ''}
  <div class="prose">${applyAmazonTag(p.body_html, settings.amazon_tag)}</div>
  ${pawDivider()}
</article>`;
  return c.html(layout({
    settings, menu,
    title: `${p.title} | ${settings.site_name}`,
    description: p.description || excerpt(p.body_html),
    canonical: `${base}/blog/${p.slug}`,
    ogImage: p.hero_image ? `${base}${p.hero_image.startsWith('http') ? '' : ''}${p.hero_image}` : `${base}${logoUrl(settings)}`,
    ogType: 'article',
    jsonLd, body,
  }));
});

// Media serving (images stored in D1). Add ?download=1 to force a file download.
publicRoutes.get('/media/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (!Number.isFinite(id)) return c.text('Not found', 404);
  const row = await c.env.DB.prepare('SELECT mime, data, filename FROM media WHERE id=?').bind(id).first();
  if (!row || row.data == null) return c.text('Not found', 404);
  // D1 can return BLOBs as ArrayBuffer, a typed array, or a plain number array
  // depending on environment — normalise all of them to bytes.
  let body = row.data;
  if (Array.isArray(body)) body = new Uint8Array(body);
  else if (body instanceof ArrayBuffer) body = new Uint8Array(body);
  else if (ArrayBuffer.isView(body)) body = new Uint8Array(body.buffer, body.byteOffset, body.byteLength);
  else if (typeof body === 'object') body = new Uint8Array(Object.values(body));
  const headers = { 'Content-Type': row.mime, 'Content-Length': String(body.byteLength ?? body.length ?? 0), 'Cache-Control': 'public, max-age=31536000, immutable' };
  if (c.req.query('download') != null) {
    const safe = String(row.filename || `petgotopro-${id}`).replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 80);
    headers['Content-Disposition'] = `attachment; filename="${safe}"`;
  }
  return new Response(body, { headers });
});

// Logo + favicon fall back to bundled defaults
import defaultLogo from '../assets/logo.bin';
import defaultFavicon from '../assets/favicon.bin';
publicRoutes.get('/logo.png', (c) => new Response(defaultLogo, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' } }));
publicRoutes.get('/favicon.png', (c) => new Response(defaultFavicon, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' } }));

// ——— Free downloadable guides (stored in D1, not bundled) ———
export async function getGuides(db) {
  const rows = await db.prepare(
    'SELECT g.file, g.title, g.category, g.blurb, g.related, g.media_id FROM guides g ORDER BY g.sort ASC, g.id ASC'
  ).all();
  return rows.results || [];
}

async function serveGuide(c, asDownload) {
  const file = c.req.param('file');
  const g = await c.env.DB.prepare('SELECT media_id FROM guides WHERE file=?').bind(file).first();
  if (!g) return c.text('Not found', 404);
  const row = await c.env.DB.prepare('SELECT mime, data FROM media WHERE id=?').bind(g.media_id).first();
  if (!row || row.data == null) return c.text('Not found', 404);
  let body = row.data;
  if (Array.isArray(body)) body = new Uint8Array(body);
  else if (body instanceof ArrayBuffer) body = new Uint8Array(body);
  else if (ArrayBuffer.isView(body)) body = new Uint8Array(body.buffer, body.byteOffset, body.byteLength);
  else if (typeof body === 'object') body = new Uint8Array(Object.values(body));
  const headers = {
    'Content-Type': row.mime || 'image/jpeg',
    'Content-Length': String(body.byteLength ?? body.length ?? 0),
    'Cache-Control': 'public, max-age=86400',
  };
  if (asDownload || c.req.query('download') != null) {
    headers['Content-Disposition'] = `attachment; filename="petgotopro-${file.replace(/[^A-Za-z0-9._-]+/g, '-')}"`;
  }
  return new Response(body, { headers });
}

publicRoutes.get('/img/:file', (c) => serveGuide(c, false));
publicRoutes.get('/download/:file', (c) => serveGuide(c, true));

// Free guides library page
publicRoutes.get('/free-guides', async (c) => {
  const db = c.env.DB;
  const settings = await getSettings(db);
  const menu = await getMenu(db);
  const base = siteUrl(c, settings);
  const guides = await getGuides(db);
  const cards = guides.map(g => `<article class="guide-card">
    <div class="g-preview"><img src="/img/${esc(g.file)}" alt="${esc(g.title)}" loading="lazy"></div>
    <div class="g-body">
      <div class="g-cat">${esc(g.category)}</div>
      <h3>${esc(g.title)}</h3>
      <p>${esc(g.blurb)}</p>
      <a class="g-btn" href="/download/${esc(g.file)}">⬇️ Download free</a>
      ${g.related ? `<a href="${esc(g.related)}" style="font-size:13px;text-align:center;margin-top:9px;text-decoration:none">Read the full guide →</a>` : ''}
    </div>
  </article>`).join('');
  const body = `
<section class="home-hero" style="padding:52px 24px">
  <h1>Free Pet Care Guides</h1>
  <p>Download, print and share — completely free, no sign-up, no email required. Our gift to good pet owners.</p>
</section>
<div class="container">
  <h2 class="section-title">Printable guides &amp; care sheets</h2>
  <p class="section-sub">Click any guide to view it full size, or hit download to save the original.</p>
  <div class="guide-grid prose">${cards || '<p style="color:var(--ink-soft)">Guides coming soon.</p>'}</div>
  <div class="vet-tip" style="margin-bottom:60px">
    <h4>💚 Please share these</h4>
    <p>These guides are free to download, print, and pass on to friends, fellow pet owners, rescues, breeders, classrooms and vet waiting rooms. We only ask that you leave the ${esc(settings.site_name)} branding intact so people know where to find more.</p>
  </div>
</div>`;
  return c.html(layout({
    settings, menu,
    title: `Free Pet Care Guides & Printables | ${settings.site_name}`,
    description: `Download free printable pet care guides and care sheets from ${settings.site_name} — vet-informed, no sign-up required.`,
    canonical: `${base}/free-guides`,
    ogImage: guides[0] ? `${base}/img/${guides[0].file}` : `${base}${logoUrl(settings)}`,
    body,
  }));
});

// SEO endpoints
publicRoutes.get('/robots.txt', async (c) => {
  const settings = await getSettings(c.env.DB);
  const base = siteUrl(c, settings);
  return c.text(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${base}/sitemap.xml\n`);
});

publicRoutes.get('/sitemap.xml', async (c) => {
  const db = c.env.DB;
  const settings = await getSettings(db);
  const base = siteUrl(c, settings);
  const posts = (await db.prepare("SELECT slug, updated_at FROM posts WHERE status='published'").all()).results || [];
  const pages = (await db.prepare("SELECT slug, updated_at FROM pages WHERE status='published'").all()).results || [];
  const urls = [
    `<url><loc>${base}/</loc></url>`,
    `<url><loc>${base}/blog</loc></url>`,
    `<url><loc>${base}/free-guides</loc></url>`,
    ...CATEGORIES.map(x => `<url><loc>${base}/category/${encodeURIComponent(x.key)}</loc></url>`),
    ...posts.map(p => `<url><loc>${base}/blog/${esc(p.slug)}</loc><lastmod>${(p.updated_at || '').slice(0, 10)}</lastmod></url>`),
    ...pages.map(p => `<url><loc>${base}/${esc(p.slug)}</loc><lastmod>${(p.updated_at || '').slice(0, 10)}</lastmod></url>`),
  ].join('\n');
  return c.body(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`, 200, { 'Content-Type': 'application/xml' });
});

publicRoutes.get('/rss.xml', async (c) => {
  const db = c.env.DB;
  const settings = await getSettings(db);
  const base = siteUrl(c, settings);
  const posts = (await db.prepare("SELECT * FROM posts WHERE status='published' ORDER BY published_at DESC LIMIT 20").all()).results || [];
  const items = posts.map(p => `<item>
<title>${esc(p.title)}</title>
<link>${base}/blog/${esc(p.slug)}</link>
<guid>${base}/blog/${esc(p.slug)}</guid>
<pubDate>${new Date(p.published_at || p.created_at).toUTCString()}</pubDate>
<description>${esc(p.description || excerpt(p.body_html))}</description>
</item>`).join('\n');
  return c.body(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${esc(settings.site_name)}</title>
<link>${base}/</link>
<description>${esc(settings.tagline)}</description>
${items}
</channel></rss>`, 200, { 'Content-Type': 'application/rss+xml' });
});

// Custom pages — keep LAST so it doesn't shadow other routes
publicRoutes.get('/:slug', async (c) => {
  const db = c.env.DB;
  const slug = c.req.param('slug');
  const p = await db.prepare("SELECT * FROM pages WHERE slug=? AND status='published'").bind(slug).first();
  if (!p) {
    const moved = await db.prepare("SELECT new_slug FROM slug_history WHERE old_slug=? AND kind='page'").bind(slug).first();
    if (moved) return c.redirect(`/${moved.new_slug}`, 301);
    return notFound(c);
  }
  const settings = await getSettings(db);
  const menu = await getMenu(db);
  const base = siteUrl(c, settings);
  const body = `
<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> &nbsp;›&nbsp; <span>${esc(p.title)}</span></nav>
<article class="article">
  <h1>${esc(p.title)}</h1>
  <div class="prose" style="margin-top:24px">${applyAmazonTag(p.body_html, settings.amazon_tag)}</div>
</article>`;
  return c.html(layout({
    settings, menu,
    title: `${p.title} | ${settings.site_name}`,
    description: p.description || excerpt(p.body_html),
    canonical: `${base}/${p.slug}`,
    ogImage: `${base}${logoUrl(settings)}`,
    body,
  }));
});

export async function notFound(c) {
  const settings = await getSettings(c.env.DB);
  const menu = await getMenu(c.env.DB);
  const body = `<div class="container" style="text-align:center;padding:90px 24px">
    <div style="font-size:64px">🐾</div>
    <h1 class="section-title" style="margin-top:10px">Page not found</h1>
    <p class="section-sub">That page has wandered off. <a href="/">Head back home</a> or <a href="/blog">browse the blog</a>.</p>
  </div>`;
  return c.html(layout({ settings, menu, title: `Not Found | ${settings.site_name}`, description: 'Page not found', body }), 404);
}
