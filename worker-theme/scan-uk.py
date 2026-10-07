# -*- coding: utf-8 -*-
"""Flag British English in anything a visitor can read.

Run it over post bodies, page copy and care-sheet sources before handing work
over.  Care sheets especially: that text gets rendered into a PNG, and a
Britishism baked into an image cannot be corrected without a re-render.

    python3 scan-uk.py updated/*.html post-*.html care-sheet-template.html

Three families are checked, in rough order of how much trouble each has caused:

  1. LEXICAL  - different WORDS, not different spellings.  "cotton bud" is
     spelled correctly and still reads as British.  It reached a printed care
     sheet before anyone noticed.
  2. ISE      - the -ise/-isation/-yse shape, as a RULE with an exception list,
     rather than a hand-written list of words.  Hand-listing is what let
     "fertiliser" ship twice: it was simply never named.
  3. SPELLING - the remaining one-off spelling pairs that fit no pattern.

Plus a check for mid-word capitals, which catch a case-preserving replacement
that went wrong: "fertiliser" once became "fertiliZer" and went live that way.

Exit status is 1 if anything was flagged, so it can gate a build.
"""
import io, re, sys, collections

# --- 1. different words ----------------------------------------------------
LEXICAL = {
    'cotton bud': 'cotton swab', 'cotton buds': 'cotton swabs',
    'cling film': 'plastic wrap', 'washing-up liquid': 'dish soap',
    'washing up liquid': 'dish soap', 'kitchen roll': 'paper towel',
    'tea towel': 'dish towel', 'bin liner': 'trash bag', 'bin bag': 'trash bag',
    'nappy': 'diaper', 'nappies': 'diapers', 'chemist': 'pharmacy',
    'lorry': 'truck', 'hob': 'stovetop', 'cooker': 'stove',
    'tumble dryer': 'dryer', 'hoover': 'vacuum', 'hoovering': 'vacuuming',
    'hoovered': 'vacuumed', 'sellotape': 'tape', 'biro': 'pen',
    'car park': 'parking lot', 'skirting board': 'baseboard',
    'skirting boards': 'baseboards', 'cupboard': 'cabinet',
    'cupboards': 'cabinets', 'wardrobe': 'closet',
    'aluminium foil': 'aluminum foil', 'tinfoil': 'aluminum foil',
    'courgette': 'zucchini', 'aubergine': 'eggplant', 'coriander': 'cilantro',
    'swede': 'rutabaga', 'spring onion': 'green onion',
    'spring onions': 'green onions', 'sweetcorn': 'corn',
    'porridge oats': 'rolled oats', 'blitz': 'pulse',
    'full stop': 'period', 'fortnight': 'two weeks', 'maths': 'math',
    'motorway': 'highway', 'pram': 'stroller', 'trainers': 'sneakers',
    'wellies': 'rain boots', 'autumn': 'fall', 'whinge': 'complain',
    'gone off their food': 'stopped eating', 'gone off its food': 'stopped eating',
    'straight away': 'right away', 'at the weekend': 'on the weekend',
    'in hospital': 'in the hospital', 'different to': 'different from',
    'have a go': 'give it a try', 'one off': 'one-time',
    'best before': 'best by', 'use-by': 'expiration',
}

# --- 2. the -ise / -isation / -yse shape, as a rule ------------------------
# Words that genuinely end -ise in US English too.  Anything matching the
# shape and NOT in here is flagged.
KEEP_ISE = set("""
advertise advise appraise apprise arise braise bruise chaise chastise
circumcise comprise compromise concise cruise demise despise devise disguise
enterprise excise exercise expertise franchise guise improvise incise liaise
likewise malaise mayonnaise merchandise mortise noise otherwise paradise
poise porpoise praise precise premise promise raise reprise revise rise
supervise surmise surprise televise tortoise treatise valise wise anise
clockwise counterclockwise crosswise lengthwise
""".split())
ISE_SHAPE = re.compile(r'\b[a-z]{2,}(?:is|ys)(?:e|es|ed|ing|er|ers|ation|ations)\b', re.I)

# --- 3. one-off spellings --------------------------------------------------
SPELLING = [
    r'\bcolour\w*', r'\bbehaviour\w*', r'\bfavourite\w*', r'\bodour\w*',
    r'\bflavour\w*', r'\bneighbour\w*', r'\bhonour\w*', r'\bhumour\w*',
    r'\bcentre\w*', r'\w*metre\w*', r'\blitre\w*', r'\bfibre\w*',
    r'\bgrey\b', r'\bgreyish\b', r'\bpractis\w*', r'\blicence\b',
    r'\bdefence\b', r'\boffence\b', r'\btravell\w*', r'\bcancell\w*',
    r'\blabell\w*', r'\bmodell\w*', r'\bmarvellous\b', r'\bjewellery\b',
    r'\baluminium\b', r'\bdraught\w*', r'\bmould\w*', r'\bplough\w*',
    r'\bstorey\w*', r'\btyre\w*', r'\bkerb\w*', r'\bprogramme\b', r'\bprogrammes\b', r'\bsceptic\w*', r'\bcatalogue\w*', r'\bamongst\b', r'\bwhilst\b',
    r'\blearnt\b', r'\bspelt\b', r'\bburnt\b', r'\bdreamt\b', r'\bleapt\b',
    r'\bsmelt\b', r'\bspoilt\b', r'\bfulfil\b', r'\bfulfilment\b',
    r'\binstalment\b', r'\bskilful\b', r'\bwilful\b', r'\bspeciality\w*',
    r'\bsulphur\w*', r'\boestrog\w*', r'\bpaediatric\w*', r'\bfoetus\w*',
    r'\banaemi\w*', r'\bdiarrhoea\b', r'\boesophag\w*', r'\bhaemorrhag\w*',
    r'\bcaesarean\b', r'\banaesthe\w*', r'\bfaec\w*', r'\bmoult\w*',
    r'\bcosy\b', r'\bpyjama\w*', r'\bpostcode\b', r'\bcheque\b',
]
# British doubles a final L before a suffix when the last syllable is
# unstressed - travelling, signalling, cruellest.  US English does not.
# Listing the stems is safer than a shape rule, because plenty of words
# legitimately carry LL in both (calling, selling, controlling, fulfilling).
DOUBLE_L_STEMS = """
travel cancel label model signal total marvel quarrel tunnel counsel level
fuel duel revel jewel cruel initial pencil unravel channel funnel panel
parcel rival shovel snivel spiral stencil swivel trowel gruel libel medal
pedal pummel refuel remodel shrivel squirrel tassel towel trammel weasel
dial dishevel enamel equal grovel kennel nickel bevel chisel cudgel marshal
ravel tinsel victual
""".split()
SPELLING.append(r'\b(?:' + '|'.join(DOUBLE_L_STEMS) +
                r')l(?:ed|ing|er|ers|est|ery|or|ors)\b')

SPELLING_PAT = re.compile('|'.join(SPELLING), re.I)

# --- exceptions ------------------------------------------------------------
# Correct as they stand, in this site's subject matter.
#   greyhound  - a breed and the comb's trade name, not a color
#   Jumper     - the jumping spider, not a sweater
#   HOB        - hang-on-back filter, not a stovetop
#   pavement   - correct US English for a paved surface
#   pepper/tap water/garden/post/plaster/torch/rocket/holiday/jab/mince -
#     ordinary US English in a pet context; listing them only creates noise
KEEP_AS_IS = {'greyhound', 'greyhounds', 'jumper', 'jumpers', 'hob',
              'pavement', 'pepper', 'garden', 'post', 'plaster', 'torch',
              'rocket', 'holiday', 'jab', 'jabs', 'mince', 'swede',
              'frise'}
# Some words are only British on their own. "Cooker" means a stove and is a
# real hit; "slow cooker", "pressure cooker" and "rice cooker" are the ordinary
# US names for those appliances, and the cockatiel guide's PTFE list names all
# three. A whole-word exception would hide the real one, so these are matched
# with the word in front of them.
PHRASE_OK = {'cooker': ('slow', 'pressure', 'rice', 'egg', 'multi')}

def phrase_allows(text, m):
    """True when the word in front of this match makes it correct US English."""
    prev = PHRASE_OK.get(m.group(0).lower())
    if not prev:
        return False
    before = text[max(0, m.start() - 24):m.start()].rstrip('- ')
    return before.lower().endswith(prev)

MIDCAP = re.compile(r'\b[a-z]+[A-Z][a-zA-Z]*\b')
MIDCAP_OK = {'pH', 'pHs', 'mL', 'dKH', 'dGH', 'kH', 'gH', 'iPettie',
             'PetSafe', 'PetFusion', 'YouTube', 'ZooMed', 'ExoTerra',
             # CJ feed field names, quoted verbatim when reporting a fault to
             # an advertiser. Renaming them to look like prose would make the
             # report wrong.
             'imageLink', 'additionalImageLink', 'shoppingProducts',
             'clickUrl', 'linkCode', 'cjsku',
             # tooling and API names quoted in notes and handoffs
             'deviceScaleFactor', 'aspectRatio', 'objectFit', 'maxWidth',
             'minHeight', 'getBoundingClientRect', 'naturalWidth'}

LEXICAL_PAT = re.compile(
    r'\b(' + '|'.join(re.escape(k) for k in
                      sorted(LEXICAL, key=len, reverse=True)
                      if k not in KEEP_AS_IS) + r')\b', re.I)


def visible_text(raw):
    """Everything a visitor reads, and nothing a browser executes."""
    # HTML comments first. The tag strip below is "<[^>]*>", which stops at the
    # first ">" inside a comment, so a note mentioning <style> or a > character
    # leaks the rest of itself into the body text - that is how the parakeet
    # guide's paste-instructions comment reported applyAmazonTag as a mid-word
    # capital. A comment is not something a visitor reads, so it goes entirely.
    raw = re.sub(r'(?s)<!--.*?-->', ' ', raw)
    raw = re.sub(r'(?is)<script\b.*?</script>', ' ', raw)
    raw = re.sub(r'(?is)<style\b.*?</style>', ' ', raw)
    # alt, title and aria-label are all read out to somebody, so they count
    # as visitor-readable. aria-label was missed at first because the pattern
    # anchored on alt= and aria-LABEL= does not contain it.
    alt = ' '.join(m.group(1) for m in
                   re.finditer(r'(?:alt|title|aria-label|placeholder)="([^"]*)"',
                               raw))
    body = re.sub(r'(?s)<[^>]*>', ' ', raw)
    body = re.sub(r'&[a-zA-Z#0-9]+;', ' ', body)
    return body + ' \n ' + alt


def check(text):
    hits = collections.Counter()
    for m in LEXICAL_PAT.finditer(text):
        w = m.group(0)
        if w.lower() in KEEP_AS_IS or phrase_allows(text, m):
            continue
        hits['[word]  %s → %s' % (w, LEXICAL[w.lower()])] += 1
    for m in ISE_SHAPE.finditer(text):
        w = m.group(0)
        if w.lower() in KEEP_AS_IS:
            continue
        stem = re.sub(r'(?:s|d|ing|r|rs|ation|ations)$', '', w.lower())
        if not stem.endswith(('ise', 'yse')):
            stem += 'e'
        if stem in KEEP_ISE or any(stem.endswith(k) for k in KEEP_ISE
                                   if len(k) >= 5):
            continue
        hits['[-ise]  %s' % w] += 1
    for m in SPELLING_PAT.finditer(text):
        w = m.group(0)
        if w.lower() in KEEP_AS_IS:
            continue
        hits['[spell] %s' % w] += 1
    for w in MIDCAP.findall(text):
        if w not in MIDCAP_OK:
            hits['[case]  %s' % w] += 1
    return hits


def main(paths):
    dirty = 0
    for path in paths:
        hits = check(visible_text(io.open(path, encoding='utf-8').read()))
        name = path.split('/')[-1]
        if not hits:
            print('  clean   %s' % name)
            continue
        dirty += 1
        print('\n=== %s' % name)
        for w, n in sorted(hits.items(), key=lambda kv: (-kv[1], kv[0].lower())):
            print('    %-44s %d' % (w, n))
    print('\n%d of %d file(s) need attention' % (dirty, len(paths)))
    return 1 if dirty else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
