import re, sys
h = open(sys.argv[1], encoding='utf-8').read()
Q = '"'
bad = 0
def chk(label, ok, detail=''):
    global bad
    print(f"  {'PASS' if ok else 'FAIL'}  {label}" + (f"  -- {detail}" if detail else ''))
    if not ok: bad += 1

print("=== template compliance ===")
chk("SEO comment block, all 6 keys", all(k in h for k in
    ['SEO TITLE:','META DESCRIPTION:','SLUG:','CATEGORY:','FOCUS KEYWORD:','SECONDARY KEYWORDS:']))
chk("opens with <p>, not a heading", h[h.index('-->')+3:].lstrip().startswith('<p>'))
chk("house opener phrase present", 'setup we would give a friend' in h)
e = re.findall(r'<h2>([^<]*)</h2>', h)
emoji_h2 = [x for x in e if re.search(r'[\U0001F300-\U0001FAFF☀-➿]', x)]
chk("no emoji on any <h2>", not emoji_h2, f"{len(e)} h2 headings; offenders={emoji_h2}")
chk("no 'The Bottom Line'", 'Bottom Line' not in h)
sec_h3 = h.count('<h3 class=' + Q + 'pgp-sec-title' + Q)
chk("pgp-sec-title is h3", '<h2 class=' + Q + 'pgp-sec-title' + Q not in h and sec_h3 > 0, f"{sec_h3} used")
tables = len(re.findall(r'<table class="compare"', h))
wrapped = len(re.findall(r'<div class="table-wrap">\s*<table class="compare"', h))
chk("every compare table wrapped", tables == wrapped, f"{wrapped}/{tables}")
full = h.count('class=' + Q + 'img-full img-frame' + Q)
chk("full-width imgs use img-full img-frame, no pgp-img", full >= 2 and 'pgp-img img-full img-frame' not in h, f"{full} images")
chk("editorial photos are Unsplash", h.count('images.unsplash.com') >= 3, f"{h.count('images.unsplash.com')} photos")
chk("house caption style", h.count('text-align:center;font-size:13px;color:#6E6480;font-style:italic;margin-top:-10px') >= 3)
ml = h.count('<ol class=' + Q + 'method-list' + Q + '>')
chk("ol.method-list used", ml >= 2, f"{ml} lists")
chk("CTA is 'Check price on Amazon'", 'Check price on Amazon' in h and 'Shop on Amazon' not in h)
chk("links use link.amazon, no search URLs", h.count('https://link.amazon/') > 0 and 'amazon.com/s?k=' not in h, f"{h.count('https://link.amazon/')} links")
prods = h.count('class=' + Q + 'pgp-prod' + Q)
chk("product note wording on every card", h.count('Link opens your local Amazon store where available.') == prods, f"{prods} cards")
chk("two download cards", h.count('class=' + Q + 'download-card' + Q) == 2)
paws = h.count('class=' + Q + 'paw-divider' + Q)
chk("paw dividers", paws >= 3, f"{paws}")
chk("one callout", h.count('class=' + Q + 'callout' + Q) == 1)
chk("two kit-sections", h.count('class=' + Q + 'kit-section' + Q) == 2)
kit_items = len(re.findall(r'class="kit-item', h))
chk("kit anchors read 'See options ->'", h.count('See options →') == kit_items, f"{kit_items} items")
ffc = h.count('class=' + Q + 'funfact' + Q)
chk("4-5 funfacts, plain label", 4 <= ffc <= 5 and h.count('<span class="ff-label">Fun fact</span>') == ffc, f"{ffc} boxes")
chk("10 FAQs", h.count('class=' + Q + 'faq-item' + Q) == 10)
chk("ends on .disclosure", h.rstrip().rfind('class="disclosure"') > h.rstrip().rfind('faq-item'))
chk("gear intl-note present", 'We only suggest gear we would use ourselves' in h)

print("\n=== voice / spelling ===")
brit = [w for w in ['mould','colour','behaviour','fertiliser','favourable','grey','litre','metre','practise','recognise'] if re.search(r'\b' + w, h, re.I)]
chk("American spelling", not brit, f"British forms: {brit}")
strongs = len(re.findall(r'<strong>', h))
ff = re.findall(r'<div class="funfact">.*?</div>', h, re.S)
in_ff = sum(x.count('<strong>') for x in ff)
chk("<strong> only in funfacts", strongs == in_ff, f"{strongs} total, {in_ff} in funfacts")

print(f"\n{'ALL CHECKS PASS' if not bad else str(bad) + ' PROBLEM(S)'}")
sys.exit(1 if bad else 0)
