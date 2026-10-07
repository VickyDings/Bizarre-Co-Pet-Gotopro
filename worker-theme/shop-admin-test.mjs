// Exercises the admin-only routes: delete (with its ignore list), restore,
// and categorizing products that came in before the classifier existed.
import fs from 'fs';

// shop.js is server-side and is not kept in the public repo, so find it
// wherever this is run from: an explicit path wins, then the usual spots.
const CANDIDATES = [process.argv[2], 'shop.js', 'src/shop.js', '../src/shop.js', '../../src/shop.js']
  .filter(Boolean);
const shopPath = CANDIDATES.find(f => { try { return fs.statSync(f).isFile(); } catch { return false; } });
if (!shopPath) {
  console.error('Could not find shop.js. Pass its path.\nTried: ' + CANDIDATES.join(', '));
  process.exit(1);
}
const MOCKS = 'shop-sync-test-mocks';
fs.mkdirSync(MOCKS, { recursive: true });
fs.writeFileSync(MOCKS + '/shop.mjs',
  fs.readFileSync(shopPath, 'utf8').replace("from 'hono'", "from './hono.js'"));
const m = await import('./' + MOCKS + '/shop.mjs?v=' + Date.now());
const H = m.shopAdminRoutes.handlers;
let pass=0, fail=0;
const ok=(l,c,x='')=>{c?pass++:fail++;console.log(`  ${c?'PASS':'FAIL'}  ${l}${c?'':'   '+x}`)};

function db(rows){
  const w=[];
  const stmt=(sql)=>({sql,_b:[],bind(...a){this._b=a;return this;},
    async run(){w.push([sql,this._b]);return{meta:{changes:1}}},
    async first(){ return /COUNT/.test(sql) ? {n:rows.length} : null },
    async all(){
      if (/FROM shop_ignored/.test(sql)) return {results:[]};
      if (/SELECT id, remote_id, name/.test(sql)) return {results: rows.filter(r=>this._b.includes(r.id))};
      if (/COALESCE\(animal/.test(sql)) return {results: rows};
      return {results:[]};
    }});
  return {api:{prepare:stmt,batch:async b=>{for(const s of b)await s.run()}}, w};
}
async function call(route, body, rows){
  const {api,w}=db(rows||[]); let red='';
  await H[route]({env:{DB:api}, req:{parseBody:async()=>body}, redirect:u=>{red=u}});
  return {w, redirect: decodeURIComponent(red)};
}

console.log('--- delete ---');
let r = await call('POST /shop/delete', {ids:['5','6']},
  [{id:5,remote_id:'abc',name:'Guinea Pig Mug'},{id:6,remote_id:'def',name:'Guinea Pig Mug'}]);
ok('records both remote ids so the sync cannot restore them',
   r.w.filter(([q])=>/INSERT OR REPLACE INTO shop_ignored/.test(q)).length === 2);
ok('deletes variants, images and the product for each',
   ['shop_variants','shop_images','shop_products'].every(t =>
     r.w.filter(([q])=>new RegExp('DELETE FROM '+t).test(q)).length === 2));
ok('says how many and that they will not return', /Deleted 2 products.*not come back/.test(r.redirect), r.redirect);
r = await call('POST /shop/delete', {ids:[]}, []);
ok('nothing selected is refused', /Nothing was selected/.test(r.redirect));

console.log('\n--- restore ---');
r = await call('POST /shop/restore', {}, []);
ok('clears the ignore list', r.w.some(([q])=>/DELETE FROM shop_ignored/.test(q)));

console.log('\n--- categorize the blanks ---');
const REAL = [
  {id:1,name:'Axolotl-y Obsessed Mug | 11oz Cute Axolotl Coffee Mug',animal:'',item_type:''},
  {id:2,name:'Axolotl-y Obsessed T-Shirt | Cute Pastel Axolotl Tee',animal:'',item_type:''},
  {id:3,name:'Axolotl-y Obsessed Tote Bag | Cute Axolotl Canvas Tote',animal:'',item_type:''},
  {id:4,name:'Better In Pairs Guinea Pig Mug | 11oz Cute Guinea Pig Coffee Mug',animal:'',item_type:''},
  {id:5,name:'Cat Yoga Instructor Black Cat Tote Bag | Funny Cat Canvas Tote',animal:'Cats',item_type:''},
];
r = await call('POST /shop/classify', {}, REAL);
const got = {};
r.w.filter(([q])=>/UPDATE shop_products SET animal/.test(q)).forEach(([,b])=>{ got[b[3]]=[b[0],b[1]]; });
console.log('  real titles from the live admin:');
for (const p of REAL) console.log(`    #${p.id} ${String(got[p.id]).padEnd(22)} ${p.name.slice(0,52)}`);
ok('axolotl mug  -> Aquatics / Mug',       String(got[1]) === 'Aquatics,Mug');
ok('axolotl tee  -> Aquatics / T-Shirt',   String(got[2]) === 'Aquatics,T-Shirt');
ok('axolotl tote -> Aquatics / Tote Bag',  String(got[3]) === 'Aquatics,Tote Bag');
ok('guinea pig   -> Small Pets / Mug',     String(got[4]) === 'Small Pets,Mug');
ok('an animal already set is NOT overwritten', got[5][0] === 'Cats', String(got[5]));
ok('but its blank item type still gets filled', got[5][1] === 'Tote Bag', String(got[5]));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
