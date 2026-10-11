import json, re, collections, sys, html
SRC, OUT = sys.argv[1], sys.argv[2]
d = json.load(open(SRC))

def s(v):
    if v is None: return ''
    if isinstance(v, list): return ' | '.join(str(x) for x in v)
    return str(v)

RAW_PAWS = '7127091'
# phrases that mean "suitable for homes with pets", not "a pet product"
NOT_PET = re.compile(r'pet[- ]friendly|kid and pet|safe for (kids|pets)|cat licensed|caterpillar'
                     r'|tortoise(shell)? (glasses|frame)|blue light blocking', re.I)
# things that are decor/apparel wearing a pet word
JUNK = re.compile(r'\barea rug\b|fireplace|wallpaper|\bcurtain|medicine cabinet|\bwalker\b'
                  r'|blocking glasses|funko|vinyl figure'
                  r'|ride[- ]on|chia pet|ace ventura|pet detective|all-region|blu-?ray'
                  r'|\bdvd\b|\bvhs\b|soundtrack|\bcd\b', re.I)
PET_WORD = re.compile(r'\b(dog|dogs|puppy|puppies|cat|cats|kitten|pet|pets|bird|birds|reptile'
                      r'|aquarium|aquatic|hamster|gerbil|rabbit|bunny|guinea pig|ferret|chinchilla'
                      r'|parrot|cockatiel|budgie|parakeet|gecko|tortoise|turtle|chicken|hen|poultry'
                      r'|horse|equine|canine|feline)\b', re.I)

# An animal word alone is not enough. FYE sells Doja Cat, Pet Shop Boys, Stray
# Cats and Pet Sematary; 49 of its 50 "pet products" were records and films. So
# a title match also has to name a thing an animal actually uses.
PET_THING = re.compile(r'\b(toy|toys|bed|beds|cage|cages|crate|kennel|hutch|coop|habitat'
                       r'|enclosure|terrarium|vivarium|aquarium|tank|leash|lead|collar|harness'
                       r'|muzzle|treat|treats|chew|chews|food|kibble|feed|feeder|bowl|waterer'
                       r'|litter|bedding|hay|substrate|grooming|brush|clipper|shampoo|carrier'
                       r'|stroller|playpen|\bpen\b|gate|ramp|stairs|scratching|perch|nesting'
                       r'|supplement|dewormer|flea|tick|collar|tag|harness|muzzle|waste|poop'
                       r'|heat(ing)? (lamp|mat|pad)|\buvb\b|filter|thermostat|hammock|tunnel'
                       r'|wheel|burrow|nest|aviary|run|fence|house|mat|pad|blanket|towel)\b', re.I)

# Apparel needs the animal word ADJACENT, or every band T-shirt with an animal
# in its name walks in. "Beetlejuice Pet Costume" yes, "Cat Power - T-Shirt" no.
APPAREL = (r'costumes?|outfits?|hoodies?|sweaters?|jumpers?|jackets?|coats?|shirts?'
           r'|bandanas?|scarves|scarfs?|capes?|tutus?|dresses|boots?|booties'
           r'|hats?|caps?|bowties?|bow ties?|wigs?|pyjamas|pajamas|onesies?')
PET_APPAREL = re.compile(r'\b(pet|dog|cat|puppy|kitten|doggie|kitty)s?[\s-]+(' + APPAREL + r')\b', re.I)

# Pet-care books are worth having; a manga with a cat in the title is not.
BOOK_TOPIC = re.compile(r'\bcare|training|train|guide|handbook|manual|breed|breeds|grooming'
                        r'|health|nutrition|feeding|veterinar|owner|raising|keeping|behaviou?r'
                        r'|first aid|encyclopedia|complete\b', re.I)

def cat_of(p):
    """The schema lost googleProductCategory in Oct 2026, which had been the
    strongest signal. catalogName / itemListName / customLabel0-4 are what is
    left that might carry category text, so they stand in for it."""
    return (s(p.get('category')) or s(p.get('catalogName'))
            or s(p.get('itemListName')) or s(p.get('labels')))

def classify(p):
    title, cat = s(p['title']), cat_of(p)
    if JUNK.search(title) or NOT_PET.search(title): return None
    if cat.startswith('Animals & Pet Supplies'): return 'category'
    if p['advertiserId'] == RAW_PAWS: return 'advertiser'
    if PET_WORD.search(title):
        if cat.startswith('Media > Books'):
            return 'book' if BOOK_TOPIC.search(title) else None
        return 'title' if (PET_THING.search(title) or PET_APPAREL.search(title)) else None
    return None

# order matters: first match wins, so the specific patterns come first
SPECIES = [
    ('Costumes',   r'\b(pet|dog|cat|puppy|kitten)s?[\s-]+(' + APPAREL + r')\b'),
    ('Poultry',    r'chicken|\bhen\b|\bhens\b|poultry|coop|rooster|duck house'),
    ('Reptiles',   r'reptile|gecko|\bsnake\b|python|\bboa\b|bearded dragon|tortoise|terrarium|vivarium|basking|\buvb\b'),
    ('Aquatics',   r'aquarium|fish tank|fishbowl|\bbetta\b|\bshrimp\b|aquatic'),
    ('Small Pets', r'hamster|gerbil|guinea pig|\brabbit|bunny|ferret|chinchilla|hedgehog|small animal|\bhay\b'),
    ('Birds',      r'\bbird|parrot|cockatiel|budgie|parakeet|aviary|canary|finch'),
    ('Horses',     r'\bhorse|equine|\bpony\b'),
    ('Cats',       r'\bcat\b|\bcats\b|kitten|feline|litter box|catnip|scratching post|cat tree|cat tower'),
    ('Dogs',       r'\bdog|puppy|puppies|canine|kennel|leash|harness'),
]
SPECIES = [(n, re.compile(r, re.I)) for n, r in SPECIES]

AUDIENCE = [
    ('Dogs',       r'for [\w\s,&-]*\b(dogs?|puppies|puppy)\b'),
    ('Cats',       r'for [\w\s,&-]*\b(cats?|kittens?)\b'),
    ('Small Pets', r'for [\w\s,&-]*\b(rabbits?|guinea pigs?|hamsters?|ferrets?|chinchillas?|small animals?)\b'),
    ('Birds',      r'for [\w\s,&-]*\b(birds?|parrots?|parakeets?|budgies|finches|cockatiels?)\b'),
    ('Reptiles',   r'for [\w\s,&-]*\b(reptiles?|geckos?|snakes?|tortoises?|turtles?|lizards?)\b'),
    ('Poultry',    r'for [\w\s,&-]*\b(chickens?|hens?|ducks?|poultry)\b'),
]
AUDIENCE = [(n, re.compile(r, re.I)) for n, r in AUDIENCE]

# "Chicken Breast Cat Treats" is cat food. An "<animal> <thing>" phrase names
# who the product is for just as plainly as "for Cats" does, and it has to beat
# the keyword pass for the same reason: chicken is an ingredient here, not a
# customer.
THING = (r'(treats?|food|chews?|toys?|beds?|litter|collars?|leash(es)?|harness(es)?'
         r'|bowls?|cages?|hutch(es)?|crates?|kennels?|habitats?|carriers?|feeders?'
         r'|supplements?|shampoos?|brush(es)?|gates?|ramps?|houses?|coops?)')
OWNER = [
    ('Dogs',       r'\b(dog|dogs|puppy|puppies)\s+' + THING),
    ('Cats',       r'\b(cat|cats|kitten|kittens)\s+' + THING),
    ('Small Pets', r'\b(rabbit|rabbits|hamster|hamsters|guinea pig|guinea pigs|ferret|ferrets'
                   r'|chinchilla|chinchillas|small animal)\s+' + THING),
    ('Birds',      r'\b(bird|birds|parrot|parrots|parakeet|parakeets|cockatiel|cockatiels)\s+' + THING),
    ('Reptiles',   r'\b(reptile|reptiles|gecko|geckos|snake|snakes|tortoise|tortoises|turtle|turtles)\s+' + THING),
    ('Poultry',    r'\b(chicken|chickens|hen|hens|duck|ducks|poultry)\s+(coops?|runs?|houses?|feeders?|nesting)'),
]
OWNER = [(n, re.compile(r, re.I)) for n, r in OWNER]

def species(p, why):
    """Returns (primary, [every species this product serves]).

    A trailing audience phrase is authoritative: 'Chicken Necks for Dogs' is dog
    food, not poultry gear, so the audience pass runs before the keyword pass."""
    if why == 'book': return 'Books', ['Books']
    title, hay = s(p['title']), s(p['title']) + ' || ' + cat_of(p)
    aud = [n for n, rx in AUDIENCE if rx.search(title)]
    if aud: return aud[0], aud
    if PET_APPAREL.search(title): return 'Costumes', ['Costumes']
    own = [n for n, rx in OWNER if rx.search(title)]
    if own: return own[0], own
    for name, rx in SPECIES:
        if rx.search(hay): return name, [name]
    return 'General pet', ['General pet']

def norm(t): return re.sub(r'[^a-z0-9]+', '', t.lower())[:70]

seen, out = set(), []
for p in d:
    why = classify(p)
    if not why: continue
    k = (p['advertiserId'], norm(s(p['title'])))
    if k in seen: continue
    seen.add(k)
    primary, serves = species(p, why)
    out.append({'species': primary, 'serves': serves, 'matched': why,
                'advertiser': p['advertiser'], 'advertiserId': p['advertiserId'],
                'title': s(p['title']), 'brand': s(p.get('brand')),
                'price': s(p.get('price')), 'salePrice': s(p.get('salePrice')),
                'availability': s(p.get('availability')), 'category': cat_of(p),
                'image': s(p.get('image')), 'link': s(p.get('link')),
                'clickUrl': s(p.get('clickUrl')),
                'description': s(p.get('description'))[:600]})

out.sort(key=lambda x: (x['species'], x['advertiser'], x['title']))
json.dump(out, open(OUT, 'w'), indent=1)

print(f"{len(out)} pet products  (from {len(d)} raw)")
print(f"matched by: {dict(collections.Counter(x['matched'] for x in out))}")
tracked = sum(1 for x in out if x['clickUrl'])
print(f"with a CJ tracked clickUrl: {tracked}/{len(out)}"
      + ("  <-- re-run fetch.mjs with CJ_PID set" if tracked < len(out) else "") + "\n")
for sp, n in collections.Counter(x['species'] for x in out).most_common():
    also = sum(1 for x in out if sp in x['serves'] and x['species'] != sp)
    adv = collections.Counter(x['advertiser'] for x in out if x['species'] == sp).most_common(3)
    extra = f" (+{also} shared)" if also else ""
    print(f"  {sp:<13}{n:>5}{extra:<14}{', '.join(f'{a} ({c})' for a, c in adv)}")
