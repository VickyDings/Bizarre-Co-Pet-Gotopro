// Runs syncFromPrintify against a realistic mock Printify response, with a
// fake D1 that records every statement. Proves the parsing — cents, option
// ids, per-variant images, disabled variants — without the live API.
import fs from 'fs';

// shop.js is server-side and is not kept in the public repo, so find it
// wherever this is run from: an explicit path wins, then the usual spots.
const CANDIDATES = [process.argv[2], 'shop.js', 'src/shop.js', '../src/shop.js', '../../src/shop.js']
  .filter(Boolean);
const shopPath = CANDIDATES.find(f => { try { return fs.statSync(f).isFile(); } catch { return false; } });
if (!shopPath) {
  console.error('Could not find shop.js. Pass its path:\n  node ' + process.argv[1].split(/[\\/]/).pop() +
    ' path\\to\\src\\shop.js\n\nTried: ' + CANDIDATES.join(', '));
  process.exit(1);
}
const MOCKS = 'shop-sync-test-mocks';
fs.mkdirSync(MOCKS, { recursive: true });
// Rebuilt from the live source every run, so a test never passes against a
// stale copy of the file it is supposed to be checking.
fs.writeFileSync(MOCKS + '/shop.mjs',
  fs.readFileSync(shopPath, 'utf8').replace("from 'hono'", "from './hono.js'"));


const PRODUCT = {
  id: '5d39b159e7c48c000728c89f',
  title: 'Pet-GoToPro Paw Tee',
  description: '<p>Soft cotton tee.</p>',
  blueprint_id: 5, print_provider_id: 29, visible: true,
  options: [
    { name: 'Colors', type: 'color', values: [
      { id: 521, title: 'Black', colors: ['#000000'] },
      { id: 522, title: 'Heather Grey', colors: ['#9e9e9e'] } ] },
    { name: 'Sizes', type: 'size', values: [
      { id: 14, title: 'S' }, { id: 15, title: 'M' }, { id: 16, title: 'L' } ] },
  ],
  variants: [
    { id: 12345, sku: 'PGP-BLK-S', cost: 1109, price: 2900, title: 'Black / S', is_enabled: true,  is_available: true,  options: [521, 14] },
    { id: 12346, sku: 'PGP-BLK-M', cost: 1109, price: 2900, title: 'Black / M', is_enabled: true,  is_available: false, options: [521, 15] },
    { id: 12347, sku: 'PGP-GRY-L', cost: 1250, price: 3200, title: 'Heather Grey / L', is_enabled: true, is_available: true, options: [522, 16] },
    { id: 12348, sku: 'PGP-OFF',   cost: 1109, price: 2900, title: 'Disabled one',     is_enabled: false, is_available: true, options: [521, 16] },
  ],
  images: [
    { src: 'https://images.printify.com/a.png', variant_ids: [12345, 12346], position: 'front', is_default: false },
    { src: 'https://images.printify.com/b.png', variant_ids: [12347],        position: 'front', is_default: true  },
  ],
};

globalThis.fetch = async (url) => {
  const u = String(url);
  const json = (o) => ({ ok:true, status:200, headers:{get:()=>'application/json'},
                         text: async()=>JSON.stringify(o), json: async()=>o,
                         arrayBuffer: async()=>new ArrayBuffer(8) });
  if (u.endsWith('/shops.json')) return json([{ id: 99, title: 'Pet-GoToPro', sales_channel: 'api' }]);
  if (u.includes('/products.json')) return json({ current_page:1, last_page:1, total:1, data:[PRODUCT] });
  return { ok:true, status:200, headers:{get:()=>'image/png'}, arrayBuffer: async()=>new ArrayBuffer(64) };
};

const writes = [];
const mkStmt = (sql) => ({
  sql, _b: [],
  bind(...a) { this._b = a; return this; },
  async run() { writes.push([sql, this._b]); return { meta: { last_row_id: 1 } }; },
  async first() {
    if (/PRAGMA table_info/.test(sql)) return null;
    return null;               // nothing pre-existing: exercise the insert path
  },
  async all() { return { results: [] }; },
});
const db = { prepare: mkStmt, batch: async () => [] };

const mod = await import('./' + MOCKS + '/shop.mjs');
const r = await mod.syncFromPrintify({ PRINTIFY_TOKEN: 'x' }, db, { cacheImages: true });
console.log('sync returned:', JSON.stringify(r));

// Resolve a binding by COLUMN NAME rather than position. Asserting on
// indices meant that adding a column to the INSERT broke assertions about
// columns that had not changed, which is noise pretending to be a failure.
function cols(sql) {
  const m = sql.match(/INSERT INTO \w+\s*\(([^)]*)\)/i);
  return m ? m[1].split(',').map(x => x.trim()) : [];
}
const val = ([sql, binds], name) => {
  const i = cols(sql).indexOf(name);
  if (i < 0) throw new Error(`no column "${name}" in: ${sql.slice(0, 80)}`);
  return binds[i];
};
const find = (re) => writes.filter(([sql]) => re.test(sql));
const prod = find(/INSERT INTO shop_products/)[0];
const vars = find(/INSERT INTO shop_variants/);
console.log('\n--- product row ---');
for (const k of ['remote_id','slug','name','animal','item_type','thumb_url','base_cost','retail_price'])
  console.log(`  ${k.padEnd(14)} ${JSON.stringify(val(prod, k)).slice(0, 60)}`);
console.log('\n--- variant rows (disabled one must be absent) ---');
for (const v of vars) {
  const g = k => val(v, k);
  console.log(`  id=${g('remote_variant_id')} name=${String(g('name')).padEnd(18)} size=${String(g('size')).padEnd(3)} color=${String(g('color')).padEnd(14)} cost=${g('base_cost')} price=${g('retail_price')} avail=${g('availability')}`);
  console.log(`      img=${g('image_url')}`);
}
console.log('\n--- assertions ---');
const ok = (label, cond) => console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${label}`);
ok('disabled variant excluded', vars.length === 3);
ok('cents converted to dollars', val(prod,'base_cost') === 11.09 && val(prod,'retail_price') === 29);
ok('size resolved from option id', vars.map(v => val(v,'size')).join(',') === 'S,M,L');
ok('color resolved from option id', val(vars[0],'color') === 'Black' && val(vars[2],'color') === 'Heather Grey');
ok('color hex carried through', val(vars[0],'color_code') === '#000000');
ok('default image used as thumbnail', val(prod,'thumb_url') === 'https://images.printify.com/b.png');
ok('per-variant image matched by variant_ids', val(vars[0],'image_url') === 'https://images.printify.com/a.png' && val(vars[2],'image_url') === 'https://images.printify.com/b.png');
ok('out-of-stock flagged', val(vars[1],'availability') === 'out_of_stock' && val(vars[0],'availability') === 'in_stock');
ok('remote ids stored as strings', typeof val(prod,'remote_id') === 'string' && typeof val(vars[0],'remote_variant_id') === 'string');
ok('blueprint / provider captured', val(vars[0],'blueprint_id') === 5 && val(vars[0],'print_provider_id') === 29);
ok('animal guessed from the title', val(prod,'animal') === 'General');
ok('item type guessed from the title', val(prod,'item_type') === 'T-Shirt');

const retire = find(/UPDATE shop_products SET status='draft'/);
ok('missing products retired to draft', retire.length === 1);
ok('retire scoped to the ids we actually saw', retire.length === 1 && retire[0][1].slice(1).join(',') === '5d39b159e7c48c000728c89f');

// and the safety case: an empty provider response must NOT unpublish the shop
writes.length = 0;
globalThis.fetch = async (url) => {
  const json = o => ({ ok:true, status:200, headers:{get:()=>'application/json'}, text: async()=>JSON.stringify(o) });
  if (String(url).endsWith('/shops.json')) return json([{ id: 99, title: 'x' }]);
  return json({ current_page:1, last_page:1, total:0, data:[] });
};
const empty = await mod.syncFromPrintify({ PRINTIFY_TOKEN:'x' }, db, { cacheImages:false });
ok('empty response retires nothing', empty.products === 0 && empty.retired === 0
   && writes.filter(([q]) => /status='draft'/.test(q)).length === 0);
