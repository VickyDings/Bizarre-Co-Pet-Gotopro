#!/usr/bin/env node
// Node port of classify.py, so the whole pipeline runs where the data is.
// The catalogues are far too big to move: FYE alone has 329,657 products.
//   node tools/cj/classify.mjs cj-products.json pet-products.json
// Kept deliberately line-for-line with classify.py; the two are checked against
// each other for identical output.
import fs from 'fs';

const [SRC, OUT] = process.argv.slice(2);
if (!SRC || !OUT) { console.error('usage: node classify.mjs <in.json> <out.json>'); process.exit(1); }
const d = JSON.parse(fs.readFileSync(SRC, 'utf8'));

const s = v => v == null ? '' : Array.isArray(v) ? v.map(String).join(' | ') : String(v);

const RAW_PAWS = '7127091';
const NOT_PET = /pet[- ]friendly|kid and pet|safe for (kids|pets)|cat licensed|caterpillar|tortoise(shell)? (glasses|frame)|blue light blocking/i;
const JUNK = /\barea rug\b|fireplace|wallpaper|\bcurtain|medicine cabinet|\bwalker\b|blocking glasses|funko|vinyl figure|ride[- ]on|chia pet|ace ventura|pet detective|all-region|blu-?ray|\bdvd\b|\bvhs\b|soundtrack|\bcd\b/i;
const PET_WORD = /\b(dog|dogs|puppy|puppies|cat|cats|kitten|pet|pets|bird|birds|reptile|aquarium|aquatic|hamster|gerbil|rabbit|bunny|guinea pig|ferret|chinchilla|parrot|cockatiel|budgie|parakeet|gecko|tortoise|turtle|chicken|hen|poultry|horse|equine|canine|feline)\b/i;
const PET_THING = /\b(toy|toys|bed|beds|cage|cages|crate|kennel|hutch|coop|habitat|enclosure|terrarium|vivarium|aquarium|tank|leash|lead|collar|harness|muzzle|treat|treats|chew|chews|food|kibble|feed|feeder|bowl|waterer|litter|bedding|hay|substrate|grooming|brush|clipper|shampoo|carrier|stroller|playpen|\bpen\b|gate|ramp|stairs|scratching|perch|nesting|supplement|dewormer|flea|tick|collar|tag|harness|muzzle|waste|poop|heat(ing)? (lamp|mat|pad)|\buvb\b|filter|thermostat|hammock|tunnel|wheel|burrow|nest|aviary|run|fence|house|mat|pad|blanket|towel)\b/i;
const APPAREL = 'costumes?|outfits?|hoodies?|sweaters?|jumpers?|jackets?|coats?|shirts?|bandanas?|scarves|scarfs?|capes?|tutus?|dresses|boots?|booties|hats?|caps?|bowties?|bow ties?|wigs?|pyjamas|pajamas|onesies?';
const PET_APPAREL = new RegExp(`\\b(pet|dog|cat|puppy|kitten|doggie|kitty)s?[\\s-]+(${APPAREL})\\b`, 'i');
const BOOK_TOPIC = /\bcare|training|train|guide|handbook|manual|breed|breeds|grooming|health|nutrition|feeding|veterinar|owner|raising|keeping|behaviou?r|first aid|encyclopedia|complete\b/i;

/* The schema lost googleProductCategory in Oct 2026, which had been the
   strongest signal. catalogName / itemListName / customLabel0-4 are what is
   left that might carry category text, so they stand in for it. */
const catOf = p => s(p.category) || s(p.catalogName) || s(p.itemListName) || s(p.labels);

function classify(p) {
  const title = s(p.title), cat = catOf(p);
  if (JUNK.test(title) || NOT_PET.test(title)) return null;
  if (cat.startsWith('Animals & Pet Supplies')) return 'category';
  if (p.advertiserId === RAW_PAWS) return 'advertiser';
  if (PET_WORD.test(title)) {
    if (cat.startsWith('Media > Books')) return BOOK_TOPIC.test(title) ? 'book' : null;
    return (PET_THING.test(title) || PET_APPAREL.test(title)) ? 'title' : null;
  }
  return null;
}

const SPECIES = [
  ['Costumes',   new RegExp(`\\b(pet|dog|cat|puppy|kitten)s?[\\s-]+(${APPAREL})\\b`, 'i')],
  ['Poultry',    /chicken|\bhen\b|\bhens\b|poultry|coop|rooster|duck house/i],
  ['Reptiles',   /reptile|gecko|\bsnake\b|python|\bboa\b|bearded dragon|tortoise|terrarium|vivarium|basking|\buvb\b/i],
  ['Aquatics',   /aquarium|fish tank|fishbowl|\bbetta\b|\bshrimp\b|aquatic/i],
  ['Small Pets', /hamster|gerbil|guinea pig|\brabbit|bunny|ferret|chinchilla|hedgehog|small animal|\bhay\b/i],
  ['Birds',      /\bbird|parrot|cockatiel|budgie|parakeet|aviary|canary|finch/i],
  ['Horses',     /\bhorse|equine|\bpony\b/i],
  ['Cats',       /\bcat\b|\bcats\b|kitten|feline|litter box|catnip|scratching post|cat tree|cat tower/i],
  ['Dogs',       /\bdog|puppy|puppies|canine|kennel|leash|harness/i],
];
const AUDIENCE = [
  ['Dogs',       /for [\w\s,&-]*\b(dogs?|puppies|puppy)\b/i],
  ['Cats',       /for [\w\s,&-]*\b(cats?|kittens?)\b/i],
  ['Small Pets', /for [\w\s,&-]*\b(rabbits?|guinea pigs?|hamsters?|ferrets?|chinchillas?|small animals?)\b/i],
  ['Birds',      /for [\w\s,&-]*\b(birds?|parrots?|parakeets?|budgies|finches|cockatiels?)\b/i],
  ['Reptiles',   /for [\w\s,&-]*\b(reptiles?|geckos?|snakes?|tortoises?|turtles?|lizards?)\b/i],
  ['Poultry',    /for [\w\s,&-]*\b(chickens?|hens?|ducks?|poultry)\b/i],
];
const THING = '(treats?|food|chews?|toys?|beds?|litter|collars?|leash(es)?|harness(es)?|bowls?|cages?|hutch(es)?|crates?|kennels?|habitats?|carriers?|feeders?|supplements?|shampoos?|brush(es)?|gates?|ramps?|houses?|coops?)';
const OWNER = [
  ['Dogs',       new RegExp(`\\b(dog|dogs|puppy|puppies)\\s+${THING}`, 'i')],
  ['Cats',       new RegExp(`\\b(cat|cats|kitten|kittens)\\s+${THING}`, 'i')],
  ['Small Pets', new RegExp(`\\b(rabbit|rabbits|hamster|hamsters|guinea pig|guinea pigs|ferret|ferrets|chinchilla|chinchillas|small animal)\\s+${THING}`, 'i')],
  ['Birds',      new RegExp(`\\b(bird|birds|parrot|parrots|parakeet|parakeets|cockatiel|cockatiels)\\s+${THING}`, 'i')],
  ['Reptiles',   new RegExp(`\\b(reptile|reptiles|gecko|geckos|snake|snakes|tortoise|tortoises|turtle|turtles)\\s+${THING}`, 'i')],
  ['Poultry',    new RegExp(`\\b(chicken|chickens|hen|hens|duck|ducks|poultry)\\s+(coops?|runs?|houses?|feeders?|nesting)`, 'i')],
];

function species(p, why) {
  if (why === 'book') return ['Books', ['Books']];
  const title = s(p.title), hay = s(p.title) + ' || ' + catOf(p);
  const aud = AUDIENCE.filter(([, rx]) => rx.test(title)).map(([n]) => n);
  if (aud.length) return [aud[0], aud];
  if (PET_APPAREL.test(title)) return ['Costumes', ['Costumes']];
  const own = OWNER.filter(([, rx]) => rx.test(title)).map(([n]) => n);
  if (own.length) return [own[0], own];
  for (const [name, rx] of SPECIES) if (rx.test(hay)) return [name, [name]];
  return ['General pet', ['General pet']];
}

const norm = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 70);

const seen = new Set(), out = [];
for (const p of d) {
  const why = classify(p);
  if (!why) continue;
  const k = p.advertiserId + '\u0000' + norm(s(p.title));
  if (seen.has(k)) continue;
  seen.add(k);
  const [primary, serves] = species(p, why);
  out.push({ species: primary, serves, matched: why,
    advertiser: p.advertiser, advertiserId: p.advertiserId,
    title: s(p.title), brand: s(p.brand),
    price: s(p.price), salePrice: s(p.salePrice),
    availability: s(p.availability), category: catOf(p),
    image: s(p.image), link: s(p.link), clickUrl: s(p.clickUrl),
    description: s(p.description).slice(0, 600) });
}

const cmp = (a, b) => a < b ? -1 : a > b ? 1 : 0;
out.sort((a, b) => cmp(a.species, b.species) || cmp(a.advertiser, b.advertiser) || cmp(a.title, b.title));
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));

const tally = (arr, f) => arr.reduce((m, x) => (m[f(x)] = (m[f(x)] || 0) + 1, m), {});
console.log(`${out.length} pet products  (from ${d.length} raw)`);
console.log('matched by:', tally(out, x => x.matched));
const tracked = out.filter(x => x.clickUrl).length;
console.log(`with a CJ tracked clickUrl: ${tracked}/${out.length}\n`);
for (const [sp, n] of Object.entries(tally(out, x => x.species)).sort((a, b) => b[1] - a[1])) {
  const also = out.filter(x => x.serves.includes(sp) && x.species !== sp).length;
  const adv = Object.entries(tally(out.filter(x => x.species === sp), x => x.advertiser))
    .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([a, c]) => `${a} (${c})`).join(', ');
  console.log(`  ${sp.padEnd(13)}${String(n).padStart(5)}${(also ? ` (+${also} shared)` : '').padEnd(14)}${adv}`);
}
