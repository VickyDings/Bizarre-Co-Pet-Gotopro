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
const m = await import('./' + MOCKS + '/shop.mjs?v=' + Date.now());
const handler = m.shopAdminRoutes.handlers['POST /shop/bulk'];
if (!handler) { console.error('route not registered'); process.exit(1); }

// products the fake database holds
const PRODUCTS = [
  { id: 1, base_cost: 9.67 },
  { id: 2, base_cost: 12.50 },
  { id: 3, base_cost: 0 },      // never synced a cost — must be skipped, not zeroed
];

function makeDb() {
  const updates = [];
  const stmt = (sql) => ({
    sql, _b: [],
    bind(...a){ this._b = a; return this; },
    // D1 reports the rows the UPDATE matched. A stub that always says 1 is
    // unrealistic enough to hide a miscount in the message the owner reads,
    // so this counts the bound ids that actually exist, like SQLite would.
    async run(){
      updates.push([sql, this._b]);
      const ids = PRODUCTS.map(p => p.id);
      return { meta: { changes: this._b.filter(x => typeof x === 'number' && ids.includes(x)).length } };
    },
    async first(){ return null; },
    async all(){
      if (/SELECT id, base_cost/.test(sql)) return { results: PRODUCTS.filter(p => this._b.includes(p.id)) };
      return { results: [] };
    },
  });
  return { db: { prepare: stmt, batch: async (b) => { for (const s of b) await s.run(); } }, updates };
}

async function run(body) {
  const { db, updates } = makeDb();
  let redirect = '';
  await handler({ env: { DB: db }, req: { parseBody: async () => body },
                  redirect: (u) => { redirect = u; return u; } });
  return { updates, redirect: decodeURIComponent(redirect) };
}

const price = (updates, id) => {
  const u = updates.find(([sql, b]) => /price_override=\?/.test(sql) && b[b.length-1] === id);
  return u ? u[1][0] : undefined;
};
let pass = 0, fail = 0;
const ok = (label, cond, extra='') => { cond ? pass++ : fail++; console.log(`  ${cond?'PASS':'FAIL'}  ${label}${cond?'':'   '+extra}`); };

console.log('--- price rules ---');
let r = await run({ ids: ['1','2','3'], price_mode: 'multiply', price_value: '2.5', price_round: 'exact' });
ok('multiply exact: 9.67 x 2.5 = 24.18', price(r.updates,1) === 24.18, `got ${price(r.updates,1)}`);
ok('multiply exact: 12.50 x 2.5 = 31.25', price(r.updates,2) === 31.25, `got ${price(r.updates,2)}`);
ok('zero-cost product skipped, not set to $0', price(r.updates,3) === undefined, `got ${price(r.updates,3)}`);
ok('skip is reported to the owner', /1 skipped/.test(r.redirect), r.redirect);

r = await run({ ids: ['1'], price_mode: 'multiply', price_value: '2.5', price_round: '99' });
ok('round .99: 24.175 -> 24.99', price(r.updates,1) === 24.99, `got ${price(r.updates,1)}`);
r = await run({ ids: ['2'], price_mode: 'multiply', price_value: '2', price_round: '99' });
ok('round .99 when already whole: 25.00 -> 25.99', price(r.updates,2) === 25.99, `got ${price(r.updates,2)}`);
r = await run({ ids: ['1'], price_mode: 'multiply', price_value: '2.5', price_round: '00' });
ok('round .00: 24.175 -> 25', price(r.updates,1) === 25, `got ${price(r.updates,1)}`);
r = await run({ ids: ['1'], price_mode: 'add', price_value: '15', price_round: 'exact' });
ok('add: 9.67 + 15 = 24.67', price(r.updates,1) === 24.67, `got ${price(r.updates,1)}`);
r = await run({ ids: ['1','2'], price_mode: 'set', price_value: '19.5', price_round: 'exact' });
ok('set: one statement, flat 19.5', r.updates.some(([sql,b]) => /price_override=\?/.test(sql) && b[0] === 19.5));
r = await run({ ids: ['1','2'], price_mode: 'clear' });
ok('clear: nulls the override', r.updates.some(([sql]) => /price_override=NULL/.test(sql)));

console.log('\n--- categories and status ---');
r = await run({ ids: ['1','2'], animal: 'Reptiles', item_type: 'Mug', status: 'published' });
const flat = r.updates.find(([sql]) => /animal=\?/.test(sql));
ok('sets animal, type and status in one statement', !!flat && flat[1].slice(0,3).join(',') === 'Reptiles,Mug,published', JSON.stringify(flat && flat[1]));
ok('scoped to the ids given', !!flat && flat[1].slice(-2).join(',') === '1,2');

console.log('\n--- the count in the confirmation ---');
r = await run({ ids: ['1','2','3'], status: 'published' });
ok('publishing three reports three', /Updated 3 products/.test(r.redirect), r.redirect);
r = await run({ ids: ['1'], status: 'draft' });
ok('one is singular, not "1 products"', /Updated 1 product \(/.test(r.redirect), r.redirect);
r = await run({ ids: ['1','2'], status: 'published', animal: 'Cats' });
ok('names every field it changed', /animal . Cats, status . published/.test(r.redirect), r.redirect);

console.log('\n--- validation ---');
r = await run({ ids: [], animal: 'Cats' });
ok('nothing selected is refused', /Nothing was selected/.test(r.redirect));
r = await run({ ids: ['1'] });
ok('no action chosen is refused', /at least one thing/.test(r.redirect));
r = await run({ ids: ['1'], price_mode: 'multiply', price_value: '' });
ok('a price rule with no number is refused', /needs a number/.test(r.redirect));
r = await run({ ids: ['1'], animal: '<script>' });
ok('an animal not on the list is ignored', !r.updates.some(([sql]) => /animal=\?/.test(sql)));
r = await run({ ids: '7', animal: 'Cats' });
ok('a single checkbox (string, not array) still works', r.updates.some(([,b]) => b.includes(7)));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
