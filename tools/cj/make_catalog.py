"""Builds a browsable HTML catalog from cj-pet-products.json.

Usage: python3 -I make_catalog.py <products.json> <out.html>

Each product links to its `clickUrl` — the tracked link CJ generates, requested
per product by fetch.mjs via the schema's linkCode(pid:) field.

Do not hand-build the wrapper. The documented-looking form
  https://www.anrdoezrs.net/links/<PID>/type/dlg/<destination>
was tried and returns ERR_TOO_MANY_REDIRECTS, encoded or raw. A product without
a clickUrl falls back to the plain merchant URL, which earns nothing, so the page
counts those and warns.
"""
import json, sys, re, html, collections, urllib.parse as up

SRC, OUT = sys.argv[1], sys.argv[2]
d = json.load(open(SRC))

# CJ tracking PID for pet-gotopro.com, read off a link CJ generated. It is NOT
# the Website ID shown under Account — that one produces links that never track.
PID = '100786792'

# Per-advertiser link ID, the second number in a CJ click-PID-AID link. Absent
# from the product feed, so each one is read off a link generated in CJ's UI.
AIDS = {
    '5360120': '13998414',   # Aosom.com
    '6446547': '15513660',   # FYE — recorded, but FYE has no pet products left
    '129899':  '13599892',   # Books-A-Million
    '6185946': '15292997',   # UntilGone
    '7127091': '17234724',   # Raw Paws Pet Food
}

def sku_of(x):
    """cjsku is optional, but it is what makes CJ's reports show which product
    earned rather than just which advertiser. Each merchant hides it somewhere
    different in the URL, so the rule is per-advertiser and returns None when
    there is nothing reliable to take."""
    adv, link = x['advertiserId'], x['link']
    if adv == '5360120':                       # Aosom: ...~D10-056.html
        m = re.search(r'~([A-Za-z0-9-]+)\.html', link)
        return m.group(1) if m else None
    if adv == '6446547':                       # FYE: ..._aec-cen583029-2 -> CEN583029.2
        m = re.search(r'_aec-([a-z0-9-]+)', link)
        if not m: return None                  # the _pid- form carries no SKU
        return re.sub(r'-(\d+)$', r'.\1', m.group(1)).upper()
    if adv == '129899':                        # Books-A-Million: /p/Title/Author/<isbn>
        m = re.search(r'/([0-9A-Za-z]{10,14})/?(?:\?|$)', link)
        return m.group(1) if m else None
    if adv == '6185946':                       # UntilGone: ...?sku=SKU10368659
        m = re.search(r'[?&]sku=([^&]+)', link)
        return m.group(1) if m else None
    return None

def track(x):
    if x.get('clickUrl'):                      # CJ's own link, always preferred
        return x['clickUrl']
    aid = AIDS.get(x['advertiserId'])
    if not aid:
        return x['link']                       # untracked, counted and warned about
    u = f"https://www.tkqlhce.com/click-{PID}-{aid}?url={up.quote(x['link'], safe='')}"
    sku = sku_of(x)
    return u + (f"&cjsku={up.quote(sku)}" if sku else '')

def is_tracked(x):
    return bool(x.get('clickUrl') or AIDS.get(x['advertiserId']))

untracked = sum(1 for x in d if not is_tracked(x))

ORDER = ['Dogs', 'Cats', 'Small Pets', 'Birds', 'Reptiles', 'Aquatics',
         'Poultry', 'Horses', 'General pet', 'Books']
EMOJI = {'Dogs': '🐕', 'Cats': '🐈', 'Small Pets': '🐹', 'Birds': '🦜',
         'Reptiles': '🦎', 'Aquatics': '🐠', 'Poultry': '🐔', 'Horses': '🐴',
         'General pet': '🐾', 'Books': '📚'}

def money(x):
    sale, reg = x['salePrice'], x['price']
    if sale and sale != reg:
        return f"<b>{html.escape(sale)}</b> <s>{html.escape(reg)}</s>"
    return f"<b>{html.escape(reg or sale or '—')}</b>"

groups = collections.OrderedDict()
for sp in ORDER:
    rows = [x for x in d if x['species'] == sp]
    if rows: groups[sp] = rows

missing = sorted({x['advertiser'] for x in d if not is_tracked(x)})
banner = ('' if not untracked else
  f'<p class="warn">⚠️ {untracked} of {len(d)} products are not tracked yet and '
  'earn nothing — they fall back to the plain merchant URL. Still needed: a link '
  'ID (AID) for ' + ', '.join(missing) + '.</p>')

parts = [f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CJ Pet Catalog</title><style>
:root{{--ink:#15111C;--ink-soft:#514860;--cream:#FBFAFD;--amber:#FF3D96;
--amber-deep:#C42A6E;--forest:#2C7A57;--line:#E5E0EE;--page:#15111C}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--page);color:var(--ink);
font:15px/1.55 Manrope,system-ui,-apple-system,Segoe UI,sans-serif}}
.wrap{{max-width:1240px;margin:0 auto;padding:28px 16px 60px}}
h1{{font-family:Georgia,serif;font-weight:400;color:#F4F0F7;margin:0 0 4px;font-size:30px}}
.sub{{color:#B5ABC0;margin:0 0 20px}}
.warn{{background:#3A1020;border:1px solid var(--amber-deep);color:#FFD8E8;
padding:11px 14px;border-radius:10px;margin:0 0 20px}}
nav{{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 26px}}
nav a{{background:#292234;color:#F4F0F7;text-decoration:none;padding:7px 14px;
border-radius:999px;font-size:13px;font-weight:600;border:1px solid #3A3348}}
nav a:hover{{background:var(--amber);color:#2A0A18}}
section{{background:var(--cream);border-radius:14px;padding:20px;margin:0 0 22px}}
h2{{font-family:Georgia,serif;font-weight:400;font-size:23px;margin:0 0 2px}}
.cnt{{color:var(--ink-soft);font-size:13px;margin:0 0 16px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}}
.card{{border:1px solid var(--line);border-radius:12px;padding:11px;background:#fff;
display:flex;flex-direction:column;min-width:0;overflow-wrap:anywhere}}
.card img{{width:100%;height:150px;object-fit:contain;background:#F1EDF7;
border-radius:8px;margin:0 0 9px}}
.adv{{font-size:11px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;
color:var(--amber-deep);margin:0 0 3px}}
.nm{{font-size:13px;font-weight:600;line-height:1.35;margin:0 0 7px;flex:1}}
.pr{{color:var(--forest);font-size:15px;margin:0 0 9px}}
.pr s{{color:var(--ink-soft);font-weight:400;font-size:12px}}
.card a.go{{display:block;text-align:center;background:var(--amber);color:#2A0A18;
text-decoration:none;font-weight:700;font-size:13px;padding:9px;border-radius:999px}}
.tags{{font-size:11px;color:var(--ink-soft);margin:6px 0 0}}
@media(max-width:600px){{.grid{{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}}
.card img{{height:110px}}}}
</style></head><body><div class="wrap">
<h1>CJ pet catalog</h1>
<p class="sub">{len(d)} products · 5 advertisers · generated for pet-gotopro.com</p>
{banner}<nav>""" ]
for sp, rows in groups.items():
    parts.append(f'<a href="#{up.quote(sp)}">{EMOJI[sp]} {html.escape(sp)} ({len(rows)})</a>')
parts.append('</nav>')

for sp, rows in groups.items():
    shared = [x for x in d if sp in x['serves'] and x['species'] != sp]
    extra = f' · {len(shared)} more also suit {sp.lower()}' if shared else ''
    parts.append(f'<section id="{up.quote(sp)}"><h2>{EMOJI[sp]} {html.escape(sp)}</h2>'
                 f'<p class="cnt">{len(rows)} products{extra}</p><div class="grid">')
    for x in rows:
        img = (f'<img src="{html.escape(x["image"])}" alt="" loading="lazy">'
               if x['image'] else '<img alt="">')
        also = [t for t in x['serves'] if t != sp]
        tags = f'<p class="tags">also: {html.escape(", ".join(also))}</p>' if also else ''
        parts.append(
          f'<div class="card">{img}<p class="adv">{html.escape(x["advertiser"])}</p>'
          f'<p class="nm">{html.escape(x["title"][:110])}</p>'
          f'<p class="pr">{money(x)}</p>'
          f'<a class="go" href="{html.escape(track(x))}" target="_blank" '
          f'rel="nofollow noopener sponsored">View product</a>{tags}</div>')
    parts.append('</div></section>')

parts.append('</div></body></html>')
open(OUT, 'w').write('\n'.join(parts))
print(f"wrote {OUT}  ({len(open(OUT).read())//1024} KB, {len(d)} products, "
      f"{len(groups)} groups, {len(d)-untracked} tracked / {untracked} untracked)")
