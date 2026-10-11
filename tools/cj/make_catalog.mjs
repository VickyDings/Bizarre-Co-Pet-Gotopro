#!/usr/bin/env node
// Node port of make_catalog.py. Same output; exists so the pipeline can run on
// the owner's machine, where the data is.
//   node tools/cj/make_catalog.mjs pet-products.json catalog.html
import fs from 'fs';

const [SRC, OUT] = process.argv.slice(2);
if (!SRC || !OUT) { console.error('usage: node make_catalog.mjs <in.json> <out.html>'); process.exit(1); }
const d = JSON.parse(fs.readFileSync(SRC, 'utf8'));

// CJ tracking PID for pet-gotopro.com, read off a link CJ generated. NOT the
// Website ID under Account — links built with that one never track.
const PID = '100786792';
// Per-advertiser link ID, the second number in click-PID-AID. Absent from the
// product feed, so each is read off a link generated in CJ's UI.
const AIDS = {
  '5360120': '13998414',   // Aosom.com
  '6446547': '15513660',   // FYE
  '129899':  '13599892',   // Books-A-Million
  '6185946': '15292997',   // UntilGone
  '7127091': '17234724',   // Raw Paws Pet Food
  '7889430': '17278691',   // Abracadabra NYC
};

// cjsku is optional but it is what makes CJ's reports show which product
// earned, not just which advertiser. Each merchant hides it somewhere else.
function skuOf(x) {
  const adv = x.advertiserId, link = x.link || '';
  let m;
  if (adv === '5360120') return (m = link.match(/~([A-Za-z0-9-]+)\.html/)) ? m[1] : null;
  if (adv === '6446547') { m = link.match(/_aec-([a-z0-9-]+)/);
    return m ? m[1].replace(/-(\d+)$/, '.$1').toUpperCase() : null; }   // _pid- form has none
  if (adv === '129899')  return (m = link.match(/\/([0-9A-Za-z]{10,14})\/?(?:\?|$)/)) ? m[1] : null;
  if (adv === '6185946') return (m = link.match(/[?&]sku=([^&]+)/)) ? m[1] : null;
  if (adv === '7889430') return (m = link.match(/[?&]variant=(\d+)/)) ? m[1] : null;
  return null;
}

// CJ's own clickUrl always wins. Never hand-build the /links/<pid>/type/dlg/
// form — it returns ERR_TOO_MANY_REDIRECTS, encoded or raw.
function track(x) {
  if (x.clickUrl) return x.clickUrl;
  const aid = AIDS[x.advertiserId];
  if (!aid) return x.link;
  const u = `https://www.tkqlhce.com/click-${PID}-${aid}?url=${encodeURIComponent(x.link)}`;
  const sku = skuOf(x);
  return u + (sku ? `&cjsku=${encodeURIComponent(sku)}` : '');
}
const isTracked = x => !!(x.clickUrl || AIDS[x.advertiserId]);
const untracked = d.filter(x => !isTracked(x)).length;

const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ORDER = ['Dogs','Cats','Small Pets','Birds','Reptiles','Aquatics','Poultry','Horses','Costumes','General pet','Books'];
const EMOJI = {Dogs:'🐕',Cats:'🐈','Small Pets':'🐹',Birds:'🦜',Reptiles:'🦎',Aquatics:'🐠',
  Poultry:'🐔',Horses:'🐴',Costumes:'🎃','General pet':'🐾',Books:'📚'};

// The page is built by walking ORDER, so a species missing from it vanishes
// silently -- that is how two costumes disappeared from the Python build.
const unknown = [...new Set(d.map(x => x.species))].filter(sp => !ORDER.includes(sp)).sort();
if (unknown.length) {
  console.error(`species not in ORDER, they would be dropped: ${unknown.join(', ')}`);
  process.exit(2);
}

const money = x => (x.salePrice && x.salePrice !== x.price)
  ? `<b>${esc(x.salePrice)}</b> <s>${esc(x.price)}</s>`
  : `<b>${esc(x.price || x.salePrice || '—')}</b>`;

const groups = ORDER.map(sp => [sp, d.filter(x => x.species === sp)]).filter(([, r]) => r.length);
const missing = [...new Set(d.filter(x => !isTracked(x)).map(x => x.advertiser))].sort();
const banner = !untracked ? '' :
  `<p class="warn">⚠️ ${untracked} of ${d.length} products are not tracked yet and earn nothing — `
  + `they fall back to the plain merchant URL. Still needed: a link ID (AID) for ${missing.join(', ')}.</p>`;

const CSS = `:root{--ink:#15111C;--ink-soft:#514860;--cream:#FBFAFD;--amber:#FF3D96;
--amber-deep:#C42A6E;--forest:#2C7A57;--line:#E5E0EE;--page:#15111C}
*{box-sizing:border-box}
body{margin:0;background:var(--page);color:var(--ink);font:15px/1.55 Manrope,system-ui,-apple-system,Segoe UI,sans-serif}
.wrap{max-width:1240px;margin:0 auto;padding:28px 16px 60px}
h1{font-family:Georgia,serif;font-weight:400;color:#F4F0F7;margin:0 0 4px;font-size:30px}
.sub{color:#B5ABC0;margin:0 0 20px}
.warn{background:#3A1020;border:1px solid var(--amber-deep);color:#FFD8E8;padding:11px 14px;border-radius:10px;margin:0 0 20px}
nav{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 26px}
nav a{background:#292234;color:#F4F0F7;text-decoration:none;padding:7px 14px;border-radius:999px;font-size:13px;font-weight:600;border:1px solid #3A3348}
nav a:hover{background:var(--amber);color:#2A0A18}
section{background:var(--cream);border-radius:14px;padding:20px;margin:0 0 22px}
h2{font-family:Georgia,serif;font-weight:400;font-size:23px;margin:0 0 2px}
.cnt{color:var(--ink-soft);font-size:13px;margin:0 0 16px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}
.card{border:1px solid var(--line);border-radius:12px;padding:11px;background:#fff;display:flex;flex-direction:column;min-width:0;overflow-wrap:anywhere}
.card img{width:100%;height:150px;object-fit:contain;background:#F1EDF7;border-radius:8px;margin:0 0 9px}
.adv{font-size:11px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--amber-deep);margin:0 0 3px}
.nm{font-size:13px;font-weight:600;line-height:1.35;margin:0 0 7px;flex:1}
.pr{color:var(--forest);font-size:15px;margin:0 0 9px}
.pr s{color:var(--ink-soft);font-weight:400;font-size:12px}
.card a.go{display:block;text-align:center;background:var(--amber);color:#2A0A18;text-decoration:none;font-weight:700;font-size:13px;padding:9px;border-radius:999px}
.tags{font-size:11px;color:var(--ink-soft);margin:6px 0 0}
@media(max-width:600px){.grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}.card img{height:110px}}`;

const parts = [`<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CJ Pet Catalog</title><style>${CSS}</style></head><body><div class="wrap">
<h1>CJ pet catalog</h1>
<p class="sub">${d.length} products · ${new Set(d.map(x => x.advertiser)).size} advertisers · generated for pet-gotopro.com</p>
${banner}<nav>`];
for (const [sp, rows] of groups)
  parts.push(`<a href="#${encodeURIComponent(sp)}">${EMOJI[sp]} ${esc(sp)} (${rows.length})</a>`);
parts.push('</nav>');

for (const [sp, rows] of groups) {
  const shared = d.filter(x => x.serves.includes(sp) && x.species !== sp).length;
  parts.push(`<section id="${encodeURIComponent(sp)}"><h2>${EMOJI[sp]} ${esc(sp)}</h2>`
    + `<p class="cnt">${rows.length} products${shared ? ` · ${shared} more also suit ${sp.toLowerCase()}` : ''}</p><div class="grid">`);
  for (const x of rows) {
    const also = x.serves.filter(t => t !== sp);
    parts.push(`<div class="card">${x.image ? `<img src="${esc(x.image)}" alt="" loading="lazy">` : '<img alt="">'}`
      + `<p class="adv">${esc(x.advertiser)}</p><p class="nm">${esc(x.title.slice(0, 110))}</p>`
      + `<p class="pr">${money(x)}</p>`
      + `<a class="go" href="${esc(track(x))}" target="_blank" rel="nofollow noopener sponsored">View product</a>`
      + (also.length ? `<p class="tags">also: ${esc(also.join(', '))}</p>` : '') + `</div>`);
  }
  parts.push('</div></section>');
}
parts.push('</div></body></html>');
fs.writeFileSync(OUT, parts.join('\n'));
console.log(`wrote ${OUT}  (${Math.round(fs.statSync(OUT).size / 1024)} KB, ${d.length} products, `
  + `${groups.length} groups, ${d.length - untracked} tracked / ${untracked} untracked)`);
