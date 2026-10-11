#!/usr/bin/env node
// Prints a sample of titles per bucket so junk can be spotted and the
// classifier tightened. Output is small enough to paste into a chat.
//   node tools/cj/inspect.mjs pet-products.json [perBucket]
//   node tools/cj/inspect.mjs pet-products.json 6 Aquatics Costumes
//   node tools/cj/inspect.mjs pet-products.json --json costumes.json Costumes
// writes just those buckets to a file, small enough to hand to someone else.
import fs from 'fs';
let argv = process.argv.slice(2);
let JSON_OUT = null;
const j = argv.indexOf('--json');
if (j !== -1) { JSON_OUT = argv[j + 1]; argv = argv.filter((_, i) => i !== j && i !== j + 1); }
const [SRC, nArg, ...only] = argv;
if (!SRC) { console.error('usage: node inspect.mjs <pet-products.json> [--json out.json] [perBucket] [species...]'); process.exit(1); }
const N = Number(nArg) || 5;
const d = JSON.parse(fs.readFileSync(SRC, 'utf8'));

if (JSON_OUT) {
  const rows = only.length ? d.filter(x => only.includes(x.species)) : d;
  fs.writeFileSync(JSON_OUT, JSON.stringify(rows, null, 1));
  console.log(`wrote ${JSON_OUT} — ${rows.length} products`
    + (only.length ? ` from ${only.join(', ')}` : '')
    + `, ${Math.round(fs.statSync(JSON_OUT).size / 1024)} KB`);
  process.exit(0);
}

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
