import html, json, sys

CSS = """
:root{--ink:#15111C;--soft:#514860;--cream:#FBFAFD;--deep:#F1EDF7;
--amber:#FF3D96;--amber2:#C42A6E;--clay:#C63B52;--forest:#2C7A57;--line:#E5E0EE}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1500px;background:var(--cream);
font-family:'Liberation Serif','DejaVu Serif',Georgia,serif;color:var(--ink)}
.head{background:linear-gradient(160deg,#241C31 0%,#15111C 60%);
padding:52px 70px 46px;text-align:center;border-bottom:7px solid var(--amber)}
.eyebrow{color:var(--amber);font-size:21px;letter-spacing:.32em;font-weight:700;
text-transform:uppercase;margin-bottom:20px}
h1{color:#fff;font-size:62px;line-height:1.08;font-weight:700}
h1 .hl{color:var(--amber);display:block}
.sub{color:#C9BFD6;font-size:25px;font-style:italic;margin-top:22px}
.body{padding:46px 56px 10px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-bottom:28px}
.card{background:#fff;border:1px solid var(--line);border-radius:16px;
padding:28px 32px 30px;box-shadow:0 2px 5px rgba(21,17,28,.05)}
.card h2{font-size:30px;margin-bottom:18px;display:flex;align-items:center;gap:12px}
.card h2 .em{font-family:'Noto Color Emoji';font-size:27px}
.row{display:flex;justify-content:space-between;align-items:baseline;gap:14px;
padding:9px 0;border-bottom:1px dotted #C9C1D6;font-size:22px}
.row:last-child{border-bottom:0}
.row .k{color:var(--soft)}
.row .v{font-weight:700;text-align:right}
ul{list-style:none}
li{font-size:22px;padding:8px 0 8px 24px;position:relative;line-height:1.4}
li:before{content:"•";position:absolute;left:4px;color:var(--amber);font-size:24px}
.warn li:before{color:var(--clay)}
/* Checklist rows: a real empty box to tick with a pen, since the whole point
   of the sheet is that it gets printed. */
.chk li{padding-left:44px;padding-top:10px;padding-bottom:10px}
.chk li:before{content:"";left:0;top:13px;width:25px;height:25px;border:2.5px solid var(--amber2);
border-radius:6px;background:#fff}
.chk li .sm{display:block;color:var(--soft);font-size:19px;line-height:1.35;margin-top:3px}
.rules{background:linear-gradient(160deg,#241C31 0%,#15111C 70%);
border-radius:18px;padding:36px 42px;margin-bottom:26px}
.rules h2{color:#fff;font-size:33px;margin-bottom:22px}
.rules h2 .hl{color:var(--amber)}
.rule{display:flex;gap:18px;align-items:flex-start;margin-bottom:17px}
.rule:last-child{margin-bottom:0}
.n{flex:0 0 38px;height:38px;border-radius:999px;background:var(--amber);
color:#2A0A18;font-weight:700;font-size:21px;display:flex;align-items:center;
justify-content:center;margin-top:2px}
.rule p{color:#E8E2EF;font-size:22px;line-height:1.45}
.rule b{color:#fff}
.strip{background:#ECF7F1;border-left:9px solid var(--forest);border-radius:0 14px 14px 0;
padding:26px 34px;margin-bottom:40px}
.strip h3{color:var(--forest);font-size:28px;margin-bottom:12px}
.ticks{display:flex;flex-wrap:wrap;gap:12px 34px;font-size:21px}
.foot{background:linear-gradient(160deg,#241C31 0%,#15111C 70%);padding:40px 60px;
display:flex;align-items:center;gap:30px;border-top:7px solid var(--amber)}
.foot img.logo{width:118px;height:118px;border-radius:20px;background:#fff}
.ft{flex:1}
.ft .nm{color:#fff;font-size:38px;font-weight:700}
.ft .tag{color:var(--amber);font-size:22px;font-style:italic;margin:4px 0 6px}
.ft .url{color:#B5ABC0;font-size:21px}
.pill{display:inline-block;background:var(--amber);color:#2A0A18;font-weight:700;
font-size:19px;letter-spacing:.09em;padding:11px 26px;border-radius:999px;margin-top:14px}
.qr{text-align:center}
.qr img{width:150px;height:150px;border-radius:14px;background:#fff;padding:7px}
.qr span{display:block;color:#B5ABC0;font-size:16px;letter-spacing:.14em;margin-top:9px;
font-weight:700;line-height:1.4}
"""

def card(c):
    h = f'<div class="card"><h2><span class="em">{c["emoji"]}</span>{html.escape(c["title"])}</h2>'
    if c.get("rows"):
        h += ''.join(f'<div class="row"><span class="k">{html.escape(k)}</span>'
                     f'<span class="v">{html.escape(v)}</span></div>' for k, v in c["rows"])
    if c.get("list"):
        cls = ' class="warn"' if c.get("warn") else ''
        h += f'<ul{cls}>' + ''.join(f'<li>{html.escape(x)}</li>' for x in c["list"]) + '</ul>'
    if c.get("checks"):
        items = ''.join(
            f'<li>{html.escape(x[0])}<span class="sm">{html.escape(x[1])}</span></li>'
            if isinstance(x, list) else f'<li>{html.escape(x)}</li>'
            for x in c["checks"])
        h += f'<ul class="chk">{items}</ul>'
    return h + '</div>'

def build(d):
    cards = ''.join(
        f'<div class="grid">{card(d["cards"][i])}{card(d["cards"][i+1])}</div>'
        for i in range(0, len(d["cards"]), 2))
    rules = ''.join(
        f'<div class="rule"><div class="n">{i+1}</div><p><b>{html.escape(b)}</b> {html.escape(r)}</p></div>'
        for i, (b, r) in enumerate(d["rules"]))
    ticks = ''.join(f'<span>&#10003; {html.escape(t)}</span>' for t in d["ticks"])
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="head">
  <div class="eyebrow">{html.escape(d["eyebrow"])}</div>
  <h1>{html.escape(d["t1"])}<span class="hl">{html.escape(d["t2"])}</span></h1>
  <div class="sub">{html.escape(d["sub"])}</div>
</div>
<div class="body">
  {cards}
  <div class="rules"><h2>{html.escape(d["rules_pre"])} <span class="hl">{html.escape(d["rules_hl"])}</span> {html.escape(d["rules_post"])}</h2>{rules}</div>
  <div class="strip"><h3>{html.escape(d["strip_h"])}</h3><div class="ticks">{ticks}</div></div>
</div>
<div class="foot">
  <img class="logo" src="logo-360.png" alt="">
  <div class="ft">
    <div class="nm">Pet-GoToPro</div>
    <div class="tag">Get trusted information from the Pet Pros</div>
    <div class="url">pet-gotopro.com</div>
    <div class="pill">FREE GUIDE &middot; SHARE FREELY</div>
  </div>
  <div class="qr"><img src="qr-branded.png" alt=""><span>SCAN FOR MORE<br>FREE GUIDES</span></div>
</div>
</body></html>"""

if __name__ == '__main__':
    d = json.load(open(sys.argv[1]))
    open(sys.argv[2], 'w').write(build(d))
    print('wrote', sys.argv[2])
