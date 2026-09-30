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
console.log(`\n${pass}/${CASES.length} classified as expected`);
