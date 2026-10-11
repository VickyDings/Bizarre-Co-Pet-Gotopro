#!/usr/bin/env node
// Pull pet products from your CJ advertisers.
//   set CJ_TOKEN=your_token
//   node cj-products.mjs
// Writes cj-products.json + cj-products.html next to wherever you run it.

import fs from 'node:fs';

const TOKEN = process.env.CJ_TOKEN;
const CID   = process.env.CJ_CID;  // CJ publisher company ID — kept out of this
                                   // file because the repo is public.
const PID   = process.env.CJ_PID || '100786792';  // CJ tracking PID. Read off a
                                   // link CJ generated: click-<PID>-<AID>. It is
                                   // NOT the Website ID shown under Account.
                                   // Used to ask CJ for its own clickUrl per
                                   // product — hand-built wrappers do not work.
const API   = process.env.CJ_API || 'https://ads.api.cj.com/query';  // CJ_API is for local testing

const PARTNERS = {
  '7127091': 'Raw Paws Pet Food',
  '5360120': 'Aosom.com',
  '6185946': 'UntilGone',
  '6423982': '2nd & Charles',
  '129899':  'Books-A-Million',
  '6446547': 'FYE',
  '7889430': 'Abracadabra NYC',   // costumes — mostly human, a pet range in it
};
const ALL_PET = new Set(['7127091']);   // everything Raw Paws sells is pet

const PET = ['pet costume','dog costume','cat costume','pet hoodie','dog hoodie','pet bandana',
 'dog','dogs','puppy','puppies','canine','cat','cats','kitten','kittens','feline',
 'pet','pets','paw','paws','leash','collar','harness','muzzle','kennel','crate','litter box',
 'litter tray','scratching post','catnip','cat tree','pet bed','dog bed','aquarium','fish tank',
 'vivarium','terrarium','reptile','gecko','snake','python','bird cage','birdcage','parrot',
 'cockatiel','budgie','parakeet','aviary','hamster','gerbil','guinea pig','rabbit','bunny',
 'ferret','chinchilla','hedgehog','axolotl','tortoise','turtle','hermit crab','kibble','chew',
 'rawhide','pet food','dog food','cat food','pet treat','dog treat','cat treat','grooming',
 'flea','tick','dewormer','pet carrier','pet gate','pet stroller','pet playpen','dog house',
 'chicken coop','rabbit hutch','pawhut','veterinary','animal'];
const rx = new RegExp('\\b(' + PET.map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|') + ')\\b','i');

if (!TOKEN || !CID) {
  console.error('\nSet both first:\n\n  set CJ_TOKEN=your_token\n  set CJ_CID=your_company_id\n');
  process.exit(1);
}

const REQ_TIMEOUT_MS = 60000;   // a stalled response must not hang the whole run

async function gql(query) {
  const r = await fetch(API, { method:'POST',
    headers:{ Authorization:`Bearer ${TOKEN}`, 'Content-Type':'application/json' },
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(REQ_TIMEOUT_MS) });
  const t = await r.text();
  let j; try { j = JSON.parse(t); } catch { throw new Error(`HTTP ${r.status}: ${t.slice(0,300)}`); }
  if (j.errors) throw new Error(j.errors.map(e=>e.message).join(' | '));
  return j.data;
}
const unwrap = t => { while (t && !t.name) t = t.ofType; return t?.name; };

// Six levels of ofType. Three was not enough: a NON_NULL(LIST(NON_NULL(X)))
// bottoms out past the depth we asked for, unwrap() then returns undefined and
// the next __type lookup comes back null.
const TYPE_REF = 'name kind ofType { name kind ofType { name kind ofType { name kind ofType { name kind ofType { name kind } } } } }';

async function typeFields(name, label) {
  if (!name) die(`could not resolve the type name for ${label}`);
  console.log(`  ${label} -> type "${name}"`);
  const t = (await gql(`{ __type(name:"${name}") { name fields { name args { name } type { ${TYPE_REF} } } } }`)).__type;
  if (!t || !t.fields) die(`the schema has no fields on type "${name}" (${label})`);
  return t;
}
function die(msg, extra) {
  console.error(`\nSchema mismatch: ${msg}.`);
  if (extra) console.error(extra);
  console.error('\nCJ has changed the shape of its product query, or this script is');
  console.error('reading it wrongly. Send back EVERYTHING printed above, including');
  console.error('the "raw products field" dump, and it can be re-pointed.\n');
  process.exit(3);
}

// --- learn the real shape of products(...) before asking for anything ---
console.log('Reading the schema...');
const roots = (await gql(`{ __schema { queryType { fields { name args { name type { ${TYPE_REF} } } type { ${TYPE_REF} } } } } }`)).__schema.queryType.fields;
const qf = roots.find(f => f.name === 'products');
if (!qf) {
  console.error('\nNo products query on this schema. Root queries available:');
  console.error('  ' + roots.map(f => f.name).join(', ') + '\n');
  process.exit(3);
}
// Paging stops dead at 10,000, so a server-side filter is the only way to see
// everything a large advertiser sells. Print what products(...) will accept.
console.log(`\nproducts(...) accepts: ${(qf.args||[]).map(a => a.name + ':' + (unwrap(a.type) || '?')).join(', ')}\n`);

const resultTypeName = unwrap(qf.type);
if (!resultTypeName) die('the products query has an unreadable return type',
  '  raw products field: ' + JSON.stringify(qf, null, 2));
const resultType = await typeFields(resultTypeName, 'the products(...) result');

const listField = resultType.fields.find(f => /resultList|results|edges|items|nodes/i.test(f.name))
  || resultType.fields.find(f => unwrap(f.type) && f.type.kind === 'LIST');
if (!listField) {
  console.error(`\n${resultTypeName} has no list field. Its fields are:`);
  console.error('  ' + resultType.fields.map(f => f.name).join(', ') + '\n');
  process.exit(3);
}
const itemTypeName = unwrap(listField.type);
if (!itemTypeName) die(`${resultTypeName}.${listField.name} has an unreadable element type`,
  '  raw list field: ' + JSON.stringify(listField, null, 2));
const itemType = await typeFields(itemTypeName, `${resultTypeName}.${listField.name}`);
const have = new Map(itemType.fields.map(f => [f.name, f]));
console.log(`products -> ${resultTypeName}.${listField.name} -> ${itemTypeName} (${itemType.fields.length} fields)`);

// Pick the fields we want, but only the ones that exist on this schema.
const WANT_SCALAR = ['id','title','description','link','imageLink','brand','availability',
  'advertiserName','advertiserId','productType','currency','gtin','mpn','condition','adId',
  // No googleProductCategory on this schema. These are the fields that might
  // carry category-ish text instead -- grab them all and let the data decide.
  'catalogName','catalogId','itemListName','itemListId','sourceFeedType',
  'customLabel0','customLabel1','customLabel2','customLabel3','customLabel4',
  // and the housekeeping worth having
  'isDeleted','targetCountry','discountPercentage'];
// 'shipping' used to be requested here and then thrown away -- nothing
// downstream reads it. It also broke the whole query, because shipping.price is
// itself an object (ShippingAmountWithCurrency) and this builder only goes one
// level deep. Dropped rather than made to recurse for a field nobody wants.
const WANT_OBJECT = { price:['amount','currency'], salePrice:['amount','currency'],
  googleProductCategory:['name'], };

// The category is the classifier's main signal, so if CJ renames it we need to
// see that rather than silently losing it.
const CATEGORY_ALIASES = ['googleProductCategory','productCategory','category',
  'googleCategory','productType'];

console.log(`\n${itemType.fields.length} fields on ${itemTypeName}:`);
console.log('  ' + itemType.fields.map(f => f.name).join(', ') + '\n');

// No type info means we cannot tell, so trust the hand-picked name -- every
// sub-field named in WANT_OBJECT is a scalar on any sane schema.
const isLeaf = t => { if (!t) return true;
  const k = (() => { while (t && !t.name) t = t.ofType; return t; })();
  return !k || !k.kind || k.kind === 'SCALAR' || k.kind === 'ENUM'; };

const sel = [], missing = [];
for (const n of WANT_SCALAR) have.has(n) ? sel.push(n) : missing.push(n);
for (const [n, subs] of Object.entries(WANT_OBJECT)) {
  const f = have.get(n); if (!f) { missing.push(n); continue; }
  const tn = unwrap(f.type);
  const sub = (await gql(`{ __type(name:"${tn}") { fields { name type { ${TYPE_REF} } } } }`)).__type;
  if (!sub?.fields) { sel.push(n); continue; }
  // Only take sub-fields that are scalars. One that is itself an object needs
  // its own sub-selection, and asking for it bare fails the whole query.
  const ok = subs.filter(x => sub.fields.some(y => y.name === x && isLeaf(y.type)));
  // Never emit an object field bare -- that is what "must have a sub selection"
  // means, and it fails the entire query, not just that field.
  if (ok.length) sel.push(`${n} { ${ok.join(' ')} }`);
  else { missing.push(`${n} (no usable scalar sub-field)`); }
}
if (missing.length) console.log(`! not on this schema, skipped: ${missing.join(', ')}`);
if (!CATEGORY_ALIASES.some(a => have.has(a))) {
  console.log('\n!! NO CATEGORY FIELD. The classifier keys off the Google product');
  console.log('   category for most of its matches, so it will be far weaker.');
  console.log('   Look for the right name in the field list above.\n');
}
// --- CJ's own tracked link, if this schema offers one -----------------------
// A hand-built https://www.anrdoezrs.net/links/<pid>/type/dlg/<url> wrapper
// gives ERR_TOO_MANY_REDIRECTS, so take the link CJ generates instead of
// constructing one. Field and argument names are read, not assumed.
let linkSel = '', linkField = null, linkUrlKeys = [];
{
  const withArgs = itemType;   // already fetched with args and full type depth
  const cand = withArgs.fields.find(f => /^link_?code$/i.test(f.name))
            || withArgs.fields.find(f => f.args.length && /link|click|track/i.test(f.name));
  if (!cand) {
    console.log('! no linkCode field on this schema — links will be untracked');
  } else {
    const argName = (cand.args.find(a => /^pid$|website/i.test(a.name)) || cand.args[0] || {}).name;
    const sub = (await gql(`{ __type(name:"${unwrap(cand.type)}") { fields { name } } }`)).__type;
    linkUrlKeys = (sub?.fields || []).map(f => f.name).filter(n => /url|link/i.test(n));
    if (argName && linkUrlKeys.length) {
      linkField = cand.name;
      linkSel = `${cand.name}(${argName}:"${PID}") { ${linkUrlKeys.join(' ')} }`;
      console.log(`tracked links via: ${linkSel}`);
    } else {
      console.log(`! ${cand.name} found but unusable (arg=${argName}, urls=${linkUrlKeys})`);
    }
  }
}
if (linkSel) sel.push(linkSel);

const hasTotal = resultType.fields.some(f => f.name === 'totalCount');
console.log(`asking for: ${sel.join(', ')}\n`);

const PAGE = 1000, MAX_WINDOW = 10000;   // CJ's hard paging ceiling
const num = v => (v && typeof v === 'object') ? [v.amount, v.currency].filter(Boolean).join(' ') : v;
const out = [], seen = new Set();

/* Paging dies at 10,000 and FYE alone has 329,657 products, so pulling a whole
   catalogue and filtering locally can never be complete. products(...) takes a
   server-side `keywords` filter, so ask narrow questions instead: each keyword
   is its own small result set, well inside the window, and the union is the
   pet range rather than whichever 10,000 came back first. */
const KEYWORDS = ['dog','puppy','cat','kitten','pet','bird','parrot','parakeet','cockatiel',
  'reptile','gecko','snake','tortoise','turtle','aquarium','fish tank','hamster','gerbil',
  'guinea pig','rabbit','bunny','ferret','chinchilla','hedgehog','chicken coop','litter box',
  'leash','collar','kennel','crate','aviary','terrarium','vivarium','pet bed','pet food',
  'pet toy','pet costume','grooming','catnip','scratching post','cat tree'];

async function page(pid, args, offset, lim) {
  const a = [`companyId:"${CID}"`, `partnerIds:["${pid}"]`, args,
             `limit:${lim}`, `offset:${offset}`].filter(Boolean).join(', ');
  const q = `{ products(${a}) { ${hasTotal ? 'totalCount' : ''} ${listField.name} { ${sel.join(' ')} } } }`;
  return (await gql(q)).products;
}

function take(p, pid, name) {
  if (p.isDeleted === true || p.isDeleted === 'true') return 0;
  // keywords searches descriptions too, so the local test still earns its keep:
  // it is what keeps "safe for kids, pets and the elderly" fireplaces out.
  const hay = [p.title, p.description, p.productType, p.googleProductCategory?.name,
    p.brand, p.catalogName, p.itemListName,
    p.customLabel0, p.customLabel1, p.customLabel2, p.customLabel3, p.customLabel4]
    .filter(Boolean).join(' ');
  if (!ALL_PET.has(pid) && !rx.test(hay)) return 0;
  const key = p.link || p.id; if (seen.has(key)) return 0; seen.add(key);
  out.push({ advertiser:name, advertiserId:pid, title:p.title,
    description:(p.description||'').replace(/\s+/g,' ').trim().slice(0,600),
    price:num(p.price)||null, salePrice:num(p.salePrice)||null,
    brand:p.brand||null, availability:p.availability||null,
    category:p.googleProductCategory?.name||p.productType||null,
    catalogName:p.catalogName||null, itemListName:p.itemListName||null,
    sourceFeedType:p.sourceFeedType||null,
    labels:[p.customLabel0,p.customLabel1,p.customLabel2,p.customLabel3,p.customLabel4]
      .filter(Boolean),
    image:p.imageLink||null, link:p.link,
    clickUrl: (linkField && p[linkField])
      ? (linkUrlKeys.map(k => p[linkField][k]).find(Boolean) || null) : null });
  return 1;
}

// Pages one query to exhaustion (or to the wall) and returns what it kept.
async function sweep(pid, name, args) {
  let offset = 0, kept = 0, scanned = 0, capped = false, total = 0;
  for (;;) {
    const lim = Math.min(PAGE, MAX_WINDOW - offset);
    if (lim <= 0) { capped = true; break; }
    const node = await page(pid, args, offset, lim);
    const list = node[listField.name] || [];
    if (hasTotal) total = node.totalCount ?? 0;
    if (!list.length) break;
    scanned += list.length;
    for (const p of list) kept += take(p, pid, name);
    offset += list.length;
    if (list.length < lim || (hasTotal && offset >= total)) break;
  }
  return { kept, scanned, capped, total };
}

console.log(`Sweeping ${KEYWORDS.length} keywords across ${Object.keys(PARTNERS).length} advertisers.`);
console.log('"#" means that keyword found something, "." means it found nothing.');
console.log('This takes a few minutes -- it is a few hundred queries.\n');

for (const [pid, name] of Object.entries(PARTNERS)) {
  let kept = 0, scanned = 0, capped = 0;
  try {
    // Does the category filter work? It is not a field on this schema, but it
    // IS an argument, and a category sweep beats keyword guessing when it does.
    let catNote = '';
    try {
      const r = await sweep(pid, name, 'googleProductCategoryIds:["1"]');
      kept += r.kept; scanned += r.scanned; if (r.capped) capped++;
      catNote = `  [category:${r.total || r.scanned}]`;
    } catch { catNote = '  [no category filter]'; }

    // ~40 sweeps per advertiser, so say something or it looks hung
    process.stdout.write(`${name.padEnd(22)} `);
    for (const kw of KEYWORDS) {
      const r = await sweep(pid, name, `keywords:${JSON.stringify(kw)}`);
      kept += r.kept; scanned += r.scanned; if (r.capped) capped++;
      process.stdout.write(r.kept ? '#' : '.');
    }
    const note = capped ? `  [${capped} sweep(s) hit the 10k wall]` : '';
    console.log(`  ${String(kept).padStart(5)} pet  (of ${scanned} scanned)${catNote}${note}`);
  } catch (e) {
    console.log(`${name.padEnd(22)}   --   ${e.message.slice(0,150)}`);
  }
}

out.sort((a,b)=>a.advertiser.localeCompare(b.advertiser)||a.title.localeCompare(b.title));
fs.writeFileSync('cj-products.json', JSON.stringify(out,null,2));
const tracked = out.filter(o => o.clickUrl).length;
console.log(`\n${tracked} of ${out.length} carry a CJ tracked clickUrl` +
            (tracked ? `\nexample: ${out.find(o=>o.clickUrl).clickUrl.slice(0,120)}` : ''));

const esc = s => String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
fs.writeFileSync('cj-products.html', `<!doctype html><meta charset="utf-8"><title>CJ pet products</title>
<style>body{font-family:Manrope,system-ui,sans-serif;background:#15111C;color:#F4F0F7;padding:24px}
h1{font-weight:400;font-size:26px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
.c{background:#1E1927;border:1px solid rgba(244,240,247,.1);border-radius:12px;overflow:hidden;display:flex;flex-direction:column}
.c img{width:100%;aspect-ratio:1;object-fit:contain;background:#fff;padding:10px}
.b{padding:12px;display:flex;flex-direction:column;flex:1}.t{font-size:14px;font-weight:600;margin-bottom:6px}
.m{font-size:11px;color:#B5ABC0;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
.p{color:#2C7A57;font-weight:700;margin-bottom:8px}.d{font-size:12px;color:#B5ABC0;flex:1;margin-bottom:10px}
a{display:block;text-align:center;background:#FF3D96;color:#2A0A18;padding:8px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px}
input{width:100%;padding:12px;margin-bottom:18px;border-radius:999px;border:1px solid rgba(244,240,247,.2);background:#1E1927;color:#F4F0F7;font-size:15px}</style>
<h1>${out.length} pet products across ${new Set(out.map(o=>o.advertiser)).size} advertisers</h1>
<input id="q" placeholder="Filter by name, brand or advertiser..." oninput="f()">
<div class="g" id="g">${out.map(p=>`<div class="c" data-s="${esc((p.title+' '+(p.brand||'')+' '+p.advertiser).toLowerCase())}">
${p.image?`<img loading="lazy" src="${esc(p.image)}" alt="">`:''}<div class="b">
<div class="m">${esc(p.advertiser)}</div><div class="t">${esc(p.title)}</div>
${p.price?`<div class="p">${esc(p.salePrice||p.price)}</div>`:''}
<div class="d">${esc(p.description.slice(0,160))}</div>
<a href="${esc(p.clickUrl||p.link)}" target="_blank" rel="nofollow noopener sponsored">Open product</a></div></div>`).join('')}</div>
<script>function f(){const v=q.value.toLowerCase();for(const c of g.children)c.style.display=c.dataset.s.includes(v)?'':'none'}</script>`);

console.log(`\n${out.length} pet products -> cj-products.json + cj-products.html`);
