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
const API   = 'https://ads.api.cj.com/query';

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

async function gql(query) {
  const r = await fetch(API, { method:'POST',
    headers:{ Authorization:`Bearer ${TOKEN}`, 'Content-Type':'application/json' },
    body: JSON.stringify({ query }) });
  const t = await r.text();
  let j; try { j = JSON.parse(t); } catch { throw new Error(`HTTP ${r.status}: ${t.slice(0,300)}`); }
  if (j.errors) throw new Error(j.errors.map(e=>e.message).join(' | '));
  return j.data;
}
const unwrap = t => { while (t && !t.name) t = t.ofType; return t?.name; };

// --- learn the real shape of products(...) before asking for anything ---
console.log('Reading the schema...');
const qf = (await gql(`{ __schema { queryType { fields { name type { name kind ofType { name kind ofType { name kind } } } } } } }`))
  .__schema.queryType.fields.find(f => f.name === 'products');
const resultTypeName = unwrap(qf.type);

const resultType = (await gql(`{ __type(name:"${resultTypeName}") { fields { name type { name kind ofType { name kind ofType { name kind } } } } } }`)).__type;
const listField = resultType.fields.find(f => /resultList|results|edges|items|nodes/i.test(f.name)) || resultType.fields.find(f => unwrap(f.type) && f.type.kind === 'LIST');
const itemTypeName = unwrap(listField.type);

const itemType = (await gql(`{ __type(name:"${itemTypeName}") { fields { name type { kind name ofType { kind name ofType { kind name } } } } } }`)).__type;
const have = new Map(itemType.fields.map(f => [f.name, f]));
console.log(`products -> ${resultTypeName}.${listField.name} -> ${itemTypeName} (${itemType.fields.length} fields)`);

// Pick the fields we want, but only the ones that exist on this schema.
const WANT_SCALAR = ['id','title','description','link','imageLink','brand','availability',
  'advertiserName','advertiserId','productType','currency','gtin','mpn','condition','adId'];
const WANT_OBJECT = { price:['amount','currency'], salePrice:['amount','currency'],
  googleProductCategory:['name'], shipping:['price'], };

const sel = [];
for (const n of WANT_SCALAR) if (have.has(n)) sel.push(n);
for (const [n, subs] of Object.entries(WANT_OBJECT)) {
  const f = have.get(n); if (!f) continue;
  const tn = unwrap(f.type);
  const sub = (await gql(`{ __type(name:"${tn}") { fields { name } } }`)).__type;
  if (!sub?.fields) { sel.push(n); continue; }
  const ok = subs.filter(s => sub.fields.some(x => x.name === s));
  sel.push(ok.length ? `${n} { ${ok.join(' ')} }` : n);
}
// --- CJ's own tracked link, if this schema offers one -----------------------
// A hand-built https://www.anrdoezrs.net/links/<pid>/type/dlg/<url> wrapper
// gives ERR_TOO_MANY_REDIRECTS, so take the link CJ generates instead of
// constructing one. Field and argument names are read, not assumed.
let linkSel = '', linkField = null, linkUrlKeys = [];
{
  const withArgs = (await gql(`{ __type(name:"${itemTypeName}") { fields { name args { name } type { kind name ofType { kind name ofType { kind name } } } } } }`)).__type;
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

const num = v => (v && typeof v === 'object') ? [v.amount, v.currency].filter(Boolean).join(' ') : v;
const out = [], seen = new Set();

for (const [pid, name] of Object.entries(PARTNERS)) {
  let offset = 0, kept = 0, total = 0, scanned = 0;
  try {
    for (;;) {
      const q = `{ products(companyId:"${CID}", partnerIds:["${pid}"], limit:1000, offset:${offset}) {
        ${hasTotal ? 'totalCount' : ''} ${listField.name} { ${sel.join(' ')} } } }`;
      const node = (await gql(q)).products;
      const list = node[listField.name] || [];
      if (hasTotal) total = node.totalCount ?? 0;
      if (!list.length) break;
      scanned += list.length;
      for (const p of list) {
        const hay = [p.title, p.description, p.productType, p.googleProductCategory?.name, p.brand].filter(Boolean).join(' ');
        if (!ALL_PET.has(pid) && !rx.test(hay)) continue;
        const key = p.link || p.id; if (seen.has(key)) continue; seen.add(key);
        out.push({ advertiser:name, advertiserId:pid, title:p.title,
          description:(p.description||'').replace(/\s+/g,' ').trim().slice(0,600),
          price:num(p.price)||null, salePrice:num(p.salePrice)||null,
          brand:p.brand||null, availability:p.availability||null,
          category:p.googleProductCategory?.name||p.productType||null,
          image:p.imageLink||null, link:p.link,
          clickUrl: (linkField && p[linkField])
            ? (linkUrlKeys.map(k => p[linkField][k]).find(Boolean) || null) : null });
        kept++;
      }
      offset += list.length;
      if (list.length < 1000 || (hasTotal && offset >= total)) break;
    }
    console.log(`${name.padEnd(22)} ${String(kept).padStart(5)} pet  (of ${scanned} scanned)`);
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
