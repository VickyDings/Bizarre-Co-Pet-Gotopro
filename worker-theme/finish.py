# -*- coding: utf-8 -*-
"""Second pass on the legacy posts: US English, the download cards that were
missing, and paw dividers between movements. No .product block is converted —
it is a richer component than .pgp-prod (rank ribbon, ASIN, pros and cons,
international note) and the current theme still styles it in full, so swapping
it would throw information away."""
import json, re, io, os

WORDS = {
 'colour':'color','colours':'colors','coloured':'colored','colouring':'coloring',
 'behaviour':'behavior','behaviours':'behaviors','favourite':'favorite',
 'neighbour':'neighbor','odour':'odor','flavour':'flavor',
 'recognise':'recognize','recognised':'recognized','realise':'realize','realised':'realized',
 'organise':'organize','analyse':'analyze','analysed':'analyzed','normalise':'normalize',
 'centre':'center','centres':'centers','metre':'meter','metres':'meters',
 'litre':'liter','litres':'liters','fibre':'fiber','fibres':'fibers',
 'grey':'gray','moult':'molt','moulting':'molting','mould':'mold','moulds':'molds','mouldy':'moldy',
 'draught':'draft','draughts':'drafts','faeces':'feces','faecal':'fecal',
 'labelled':'labeled','labelling':'labeling','practise':'practice',
 'licence':'license','defence':'defense','offence':'offense',
 'aluminium':'aluminum','whilst':'while','amongst':'among','learnt':'learned',
 'burnt':'burned','spelt':'spelled','autumn':'fall','cupboard':'cabinet','cupboards':'cabinets',
 'speciality':'specialty','catalogue':'catalog','programme':'program','sceptical':'skeptical',
 'cosy':'cozy','rubbish':'trash','travelling':'traveling','cancelled':'canceled',
 'modelling':'modeling','marvellous':'marvelous','apologise':'apologize','paralyse':'paralyze',
}
# "jumper" in the spider post is the common name for a jumping spider, not a sweater
SKIP = {11: {'jumper', 'jumpers'}}

def to_us(html, pid):
    skip = SKIP.get(pid, set())
    def swap(m):
        w = m.group(0)
        if w.lower() in skip: return w
        r = WORDS[w.lower()]
        return r.capitalize() if w[0].isupper() else r
    # never touch anything inside a tag, a url or a style block
    parts = re.split(r'(<style[\s\S]*?</style>|<[^>]+>)', html)
    for i in range(0, len(parts), 2):
        parts[i] = re.sub(r'\b(' + '|'.join(sorted(WORDS, key=len, reverse=True)) + r')\b',
                          swap, parts[i], flags=re.I)
    return ''.join(parts)

def card(key, alt, title, blurb):
    return ('<div class="download-card">\n'
            '  <div class="dl-thumb"><img src="/img/%s" alt="%s" class="no-zoom"></div>\n'
            '  <div class="dl-body">\n'
            '    <span class="dl-tag">Free download</span>\n'
            '    <h3>%s</h3>\n'
            '    <p>%s</p>\n'
            '    <a class="dl-btn" href="/download/%s">⬇️ Download free</a>\n'
            '    <span class="dl-note">Free for everyone — print it, pin it, share it. '
            'No sign-up, no email needed.</span>\n'
            '  </div>\n</div>\n\n' % (key, alt, title, blurb, key))

CARDS = {
 4: [('Supplements: The Non-Negotiable Bit',
      card('reptile-mbd-guide.jpg', 'Metabolic bone disease guide',
           'Metabolic Bone Disease — Catch It Early',
           'What MBD is, the calcium and D3 math behind it, the early signs owners miss, '
           'and the dusting schedule that prevents it — one printable page.')),
     ('\U0001f6d2 The Complete Leopard Gecko Shopping List',
      card('leopard-gecko-care-sheet.jpg', 'Leopard Gecko Care Sheet',
           'Leopard Gecko Quick Care Sheet',
           'Tank size, the full temperature gradient, substrate, the feeder and supplement '
           'schedule, and the signs that mean call an exotics vet — one printable page.'))],
 7: [('__LAST__',
      card('nitrogen-cycle-diagram.jpg', 'Nitrogen cycle diagram',
           'The Nitrogen Cycle, Diagrammed',
           'Ammonia to nitrite to nitrate — what feeds each stage, what a healthy reading '
           'looks like and how long it takes, on one page for above the tank.'))],
}

def add_cards(html, pid):
    n = 0
    for anchor, block in CARDS.get(pid, []):
        if anchor == '__LAST__':
            hs = list(re.finditer(r'<h2[^>]*>', html))
            if hs:
                html = html[:hs[-1].start()] + block + html[hs[-1].start():]; n += 1
            continue
        m = re.search(r'<h2[^>]*>(?:(?!</h2>).)*' + re.escape(anchor[:26]) + r'(?:(?!</h2>).)*</h2>', html)
        if m:
            end = m.end()
            nxt = re.search(r'<h2[^>]*>', html[end:])
            at = end + (nxt.start() if nxt else 0) if nxt else len(html)
            html = html[:at] + block + html[at:]; n += 1
    return html, n

DIV = '<div class="paw-divider"></div>\n\n'
def add_dividers(html):
    if 'paw-divider' in html: return html, 0
    hs = [m.start() for m in re.finditer(r'<h2[^>]*>', html)]
    picks = hs[3::4]                      # one every fourth heading, never the first three
    for at in reversed(picks):
        html = html[:at] + DIV + html[at:]
    return html, len(picks)

rows = json.loads(io.open('posts-export.json', encoding='utf-8').read())[0]['results']
os.makedirs('final', exist_ok=True)
print('%-4s %-42s %s' % ('id', 'slug', 'changes'))
print('-' * 96)
for r in rows:
    if r['id'] in (15, 16): continue
    p = 'restyled/%02d-%s.html' % (r['id'], r['slug'])
    h = io.open(p, encoding='utf-8').read() if os.path.exists(p) else r['body_html']
    before = h
    h2 = to_us(h, r['id'])
    uk = sum(1 for a, b in zip(re.findall(r'\w+', h), re.findall(r'\w+', h2)) if a != b)
    h3, nc = add_cards(h2, r['id'])
    h4, nd = add_dividers(h3)
    notes = []
    if uk: notes.append('%d spellings to US' % uk)
    if nc: notes.append('%d download card(s) added' % nc)
    if nd: notes.append('%d paw dividers' % nd)
    if h4 != before or os.path.exists(p):
        io.open('final/%02d-%s.html' % (r['id'], r['slug']), 'w', encoding='utf-8').write(h4)
    print('%-4s %-42s %s' % ('#%d' % r['id'], r['slug'][:42], ', '.join(notes) or 'colour only'))
