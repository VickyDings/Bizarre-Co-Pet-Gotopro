"""Builds a browsable HTML catalog from cj-pet-products.json.

Usage: python3 -I make_catalog.py <products.json> <out.html> [CJ_WEBSITE_ID]

CJ's product feed hands back the merchant's own URL, which earns nothing. The
tracked form is the automated deep link
  https://www.anrdoezrs.net/links/<WEBSITE_ID>/type/dlg/<destination>
so passing the website ID (PID) rewrites every link in one pass.
"""
import json, sys, html, collections, urllib.parse as up

SRC, OUT = sys.argv[1], sys.argv[2]
PID = sys.argv[3] if len(sys.argv) > 3 else None
d = json.load(open(SRC))

def track(url):
    if not PID: return url
    return f"https://www.anrdoezrs.net/links/{PID}/type/dlg/{up.quote(url, safe='')}"

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

banner = ('' if PID else
  '<p class="warn">⚠️ Links below are the raw merchant URLs from the feed — they '
  'pay nothing. Re-run with your CJ Website ID to wrap all of them as tracked '
  'deep links.</p>')

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
          f'<a class="go" href="{html.escape(track(x["link"]))}" target="_blank" '
          f'rel="nofollow noopener sponsored">View product</a>{tags}</div>')
    parts.append('</div></section>')

parts.append('</div></body></html>')
open(OUT, 'w').write('\n'.join(parts))
print(f"wrote {OUT}  ({len(open(OUT).read())//1024} KB, {len(d)} products, "
      f"{len(groups)} groups, links {'TRACKED' if PID else 'UNTRACKED'})")
