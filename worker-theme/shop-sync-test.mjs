// Runs syncFromPrintify against a realistic mock Printify response, with a
// fake D1 that records every statement. Proves the parsing — cents, option
// ids, per-variant images, disabled variants — without the live API.
import fs from 'fs';
// shop.js is server-side and is not kept in the public repo, so find it
// wherever this is being run from: an explicit path wins, then the usual spots.
const CANDIDATES = [
  process.argv[2],
  'shop.js', 'src/shop.js', '../src/shop.js', '../../src/shop.js',
].filter(Boolean);
const shopPath = CANDIDATES.find(f => { try { return fs.statSync(f).isFile(); } catch { return false; } });
if (!shopPath) {
  console.error('Could not find shop.js. Pass its path:\n  node shop-sync-test.mjs path\\to\\src\\shop.js\n\nTried: ' + CANDIDATES.join(', '));
  process.exit(1);
}
console.log('testing ' + shopPath + '\n');
const src = fs.readFileSync(shopPath, 'utf8');

// Stub the module's imports so it can load standalone
fs.mkdirSync('mock', { recursive: true });
fs.writeFileSync('shop-sync-test-mocks/hono.js', 'export class Hono{use(){}get(){}post(){}route(){}}');
fs.writeFileSync('shop-sync-test-mocks/shop.mjs', src
  .replace("from 'hono'", "from './hono.js'")
  .replace("from './util.js'", "from './util.js'"));

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

const mod = await import('./shop-sync-test-mocks/shop.mjs');
const r = await mod.syncFromPrintify({ PRINTIFY_TOKEN: 'x' }, db, { cacheImages: true });
console.log('sync returned:', JSON.stringify(r));

const find = (re) => writes.filter(([sql]) => re.test(sql));
const prod = find(/INSERT INTO shop_products/)[0];
const vars = find(/INSERT INTO shop_variants/);
console.log('\n--- product row ---');
console.log('  remote_id   ', prod[1][0]);
console.log('  slug        ', prod[1][1]);
console.log('  name        ', prod[1][2]);
console.log('  description ', JSON.stringify(prod[1][3]).slice(0, 40));
console.log('  thumb_url   ', prod[1][4], '   <- should be b.png, the is_default one');
console.log('  base_cost   ', prod[1][5], '  <- cheapest cost in dollars (1109c = 11.09)');
console.log('  retail      ', prod[1][6], '  <- cheapest price in dollars (2900c = 29)');
console.log('\n--- variant rows (disabled one must be absent) ---');
for (const [, b] of vars) {
  console.log(`  id=${b[1]} name=${String(b[4]).padEnd(18)} size=${String(b[5]).padEnd(3)} color=${String(b[6]).padEnd(14)} hex=${String(b[7]).padEnd(8)} cost=${b[9]} price=${b[10]} avail=${b[12]}`);
  console.log(`      img=${b[11]}`);
}
console.log('\n--- assertions ---');
const ok = (label, cond) => console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${label}`);
ok('disabled variant excluded', vars.length === 3);
ok('cents converted to dollars', prod[1][5] === 11.09 && prod[1][6] === 29);
ok('size resolved from option id', vars.map(v => v[1][5]).join(',') === 'S,M,L');
ok('color resolved from option id', vars[0][1][6] === 'Black' && vars[2][1][6] === 'Heather Grey');
ok('color hex carried through', vars[0][1][7] === '#000000');
ok('default image used as thumbnail', prod[1][4] === 'https://images.printify.com/b.png');
ok('per-variant image matched by variant_ids', vars[0][1][11] === 'https://images.printify.com/a.png' && vars[2][1][11] === 'https://images.printify.com/b.png');
ok('out-of-stock flagged', vars[1][1][12] === 'out_of_stock' && vars[0][1][12] === 'in_stock');
ok('remote ids stored as strings', typeof prod[1][0] === 'string' && typeof vars[0][1][1] === 'string');
ok('blueprint / provider captured', vars[0][1][2] === 5 && vars[0][1][3] === 29);

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
