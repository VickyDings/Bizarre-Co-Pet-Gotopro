#!/usr/bin/env node
// Prints a sample of titles per bucket so junk can be spotted and the
// classifier tightened. Output is small enough to paste into a chat.
//   node tools/cj/inspect.mjs pet-products.json [perBucket]
//   node tools/cj/inspect.mjs pet-products.json 6 Aquatics Costumes
import fs from 'fs';
const [SRC, nArg, ...only] = process.argv.slice(2);
if (!SRC) { console.error('usage: node inspect.mjs <pet-products.json> [perBucket] [species...]'); process.exit(1); }
const N = Number(nArg) || 5;
const d = JSON.parse(fs.readFileSync(SRC, 'utf8'));

const bySpecies = {};
for (const x of d) (bySpecies[x.species] ||= []).push(x);

for (const [sp, rows] of Object.entries(bySpecies).sort((a, b) => b[1].length - a[1].length)) {
  if (only.length && !only.includes(sp)) continue;
  console.log(`\n=== ${sp}  (${rows.length}) ===`);
  // group by advertiser so a single bad source stands out
  const byAdv = {};
  for (const x of rows) (byAdv[x.advertiser] ||= []).push(x);
  for (const [adv, list] of Object.entries(byAdv).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  -- ${adv} (${list.length})`);
    for (const x of list.slice(0, N))
      console.log(`     ${(x.salePrice || x.price || '?').padEnd(12)}${x.title.slice(0, 66)}`);
  }
}
