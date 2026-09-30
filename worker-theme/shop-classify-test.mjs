import fs from 'fs';
const CANDIDATES = [process.argv[2], 'shop.js', 'src/shop.js', '../src/shop.js', '../../src/shop.js'].filter(Boolean);
const shopPath = CANDIDATES.find(f => { try { return fs.statSync(f).isFile(); } catch { return false; } });
if (!shopPath) { console.error('Could not find shop.js. Pass its path.\nTried: ' + CANDIDATES.join(', ')); process.exit(1); }
fs.mkdirSync('shop-sync-test-mocks', { recursive: true });
// rebuild the mock from the live source so this never tests a stale copy
fs.writeFileSync('shop-sync-test-mocks/shop.mjs', fs.readFileSync(shopPath,'utf8').replace("from 'hono'", "from './hono.js'"));
const m = await import('./shop-sync-test-mocks/shop.mjs?v=' + Date.now());
const CASES = [
  ['Cat Yoga Instructor Black Cat Tote Bag | Funny Cat Canvas Tote', 'Cats', 'Tote Bag'],
  ['Leopard Gecko Dad Unisex Tee', 'Reptiles', 'T-Shirt'],
  ['Bearded Dragon Mom Hoodie', 'Reptiles', 'Hoodie'],
  ['Guinea Pig Lover Coffee Mug', 'Small Pets', 'Mug'],
  ['Jumping Spider Enthusiast Sticker Pack', 'Invertebrates', 'Sticker'],
  ['Budgie Parakeet Owner Enamel Mug', 'Birds', 'Mug'],
  ['Axolotl Appreciation Society Sweatshirt', 'Aquatics', 'Sweatshirt'],
  ['Betta Fish Keeper Water Bottle', 'Aquatics', 'Water Bottle'],
  ['Corgi Butt Dog Bandana', 'Dogs', 'Bandana'],
  ['Pet-GoToPro Logo Snapback Hat', 'General', 'Hat'],
  ['Hermit Crab Squad Tank Top', 'Invertebrates', 'Tank Top'],
  ['Ball Python Noodle Poster Print', 'Reptiles', 'Poster'],
  ['Rescue Mom Dog Bed', 'Dogs', 'Pet Bed'],
  ['Tabby Cat Phone Case', 'Cats', 'Phone Case'],
  ['Just a Girl Who Loves Her Rabbit Blanket', 'Small Pets', 'Blanket'],
];
let pass = 0;
console.log(`${'title'.padEnd(56)}${'animal'.padEnd(16)}${'item'.padEnd(14)}`);
console.log('-'.repeat(92));
for (const [title, wantA, wantI] of CASES) {
  const a = m.guessAnimal(title, []), i = m.guessItemType(title, []);
  const ok = a === wantA && i === wantI;
  if (ok) pass++;
  console.log(`${(ok?'  ':'X ')}${title.slice(0,54).padEnd(54)}${a.padEnd(16)}${i.padEnd(14)}${ok?'':`  want ${wantA} / ${wantI}`}`);
}
console.log(`\n${pass}/${CASES.length} classified as expected`);
