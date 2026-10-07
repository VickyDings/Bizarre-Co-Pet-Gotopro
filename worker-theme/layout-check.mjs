// Float-collision / overflow check, run against the working HTML files in the
// repo rather than a database export, so it can be re-run after an edit.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const { chromium } = pw;
const DIR = path.dirname(fileURLToPath(import.meta.url));

// theme.js imports util.js, which is server-side and deliberately not in this
// public repo, so the pair has to be found wherever the full src happens to be.
// This used to be one hardcoded path and it broke the moment anyone ran the
// checker from anywhere else -- which, since CLAUDE.md says to run it after
// every edit, meant a stack trace instead of a check.
const THEME_CANDIDATES = [
  process.env.PGP_SRC && path.join(process.env.PGP_SRC, 'theme.js'),
  path.join(DIR, 'pgp_assets/src/theme.js'),
  path.join(DIR, '../src/theme.js'),
  path.join(DIR, '../../src/theme.js'),
].filter(Boolean);
const themePath = THEME_CANDIDATES.find(f => fs.existsSync(f));
if (!themePath) {
  console.error('Cannot find a theme.js with its util.js beside it. Looked in:');
  THEME_CANDIDATES.forEach(f => console.error('  ' + f));
  console.error('\nSet PGP_SRC to the folder holding theme.js and util.js, e.g.');
  console.error('  PGP_SRC=C:\\Users\\Xvick\\...\\petgotopro-website\\src node layout-check.mjs');
  process.exit(1);
}
const T = await import(pathToFileURL(themePath).href);

// Scratch file for the render. Built under the OS temp dir and referenced
// through the same variable the browser is pointed at, so the write and the
// read can no longer disagree about where it is.
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'pgp-layout-'));
const SCRATCH = path.join(TMP, 'check.html');
// Everything in updated/, plus every post-*.html beside it. Globbed rather
// than listed, so a new post is checked without anyone remembering to add it.
const files = [
  ...fs.readdirSync(path.join(DIR, 'updated')).filter(f => f.endsWith('.html'))
       .map(f => path.join(DIR, 'updated', f)),
  ...fs.readdirSync(DIR).filter(f => /^post-.*\.html$/.test(f))
       .map(f => path.join(DIR, f)),
];
const widths = [900, 390];
const b = await chromium.launch();
let tot = 0;
for (const file of files) {
  const body = fs.readFileSync(file, 'utf8')
    .replace(/src="\/(?:media|img)\/[^"]*"/g, 'src="../imgs/photo.jpg"')
    .replace(/src="https?:\/\/[^"]*"/g, 'src="../imgs/photo.jpg"');
  fs.writeFileSync(SCRATCH, `<!doctype html><html><head><meta charset="utf-8"><style>${T.PUBLIC_CSS}${T.IMAGE_CSS}${T.SECTION_CSS}
    body{margin:0}.article{max-width:760px;margin:0 auto;padding:30px 24px;background:#fff}</style></head>
    <body><div class="article prose">${body}</div></body></html>`);
  const found = [];
  for (const w of widths) {
    const p = await b.newPage({ viewport: { width: w, height: 1100 } });
    await p.goto(pathToFileURL(SCRATCH).href, { waitUntil: 'domcontentloaded' });

    // Put a stand-in photo in every empty product well before measuring.
    // Without this the check can never see the bug it exists for: the post
    // files in this repo have empty wells, an empty well is display:none, and
    // a collapsed well floats nothing. The owner's live pages have photos in.
    // "Render a component with its content actually in before trusting it"
    // applies to the checker as much as to the eye.
    await p.evaluate(() => {
      const stand = 'data:image/svg+xml;base64,' + btoa(
        '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">' +
        '<rect width="800" height="800" fill="#ddd"/></svg>');
      for (const well of document.querySelectorAll('.product-image-wrap, .pgp-prod-img')) {
        if (well.querySelector('img')) continue;
        const im = document.createElement('img');
        im.src = stand; im.alt = '';
        well.innerHTML = '';
        well.appendChild(im);
      }
    });
    await p.waitForTimeout(260);
    const bad = await p.evaluate(() => {
      const out = [];
      const floats = [...document.querySelectorAll('.img-left,.img-right,[style*="float"]')];
      const blocks = [...document.querySelectorAll('.table-wrap,table,.quick-facts,.pros-cons,.kit-section,.kit-item,.download-card,.callout,.method-list,.pgp-section,.vet-warning,.vet-tip,.funfact,.product')];
      for (const el of blocks) { const q = el.getBoundingClientRect();
        for (const fl of floats) { const s = fl.getBoundingClientRect();
          if (el.contains(fl) || fl.contains(el)) continue;
          if (q.top < s.bottom - 3 && q.bottom > s.top + 3 && q.left < s.right - 3 && q.right > s.left + 3)
            out.push('float over .' + String(el.className).split(' ')[0]); } }
      document.querySelectorAll('.article *').forEach(el => { const q = el.getBoundingClientRect();
        if (q.width > 0 && (q.right > innerWidth + 2 || q.left < -2) && !el.closest('.table-wrap,.pgp-ig-frame,[style*="overflow-x"]'))
          out.push('.' + (String(el.className).split(' ')[0] || el.tagName) + ' escapes column'); });
      if (document.documentElement.scrollWidth > innerWidth + 2) out.push('horizontal PAGE scroll');

      // Text squeezed into an unreadably narrow column inside a card. This is
      // the one that got away: a 240px photo floated in a 346px card left about
      // 76px for the text and it went live on the hermit crab page as one word
      // per line. Nothing above sees it, because a block beside a float keeps
      // its FULL width - only its line boxes shorten - so getBoundingClientRect
      // reports the whole card and the text never escapes the column either.
      // A Range reports one rect per rendered line, which is what to measure.
      const MIN_LINE = 150;
      for (const card of document.querySelectorAll('.product, .pgp-prod, .kit-item')) {
        // Walk TEXT NODES, not elements. The body copy in a .product card is a
        // bare text node sitting directly in .product-content with no <p>
        // around it, so a 'p, li, h4' selector finds nothing at all and the
        // check silently passes - which is exactly what it did at first.
        const walk = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walk.nextNode())) {
          // 25, not 60. The float breaks the TITLE before it reaches the body
          // copy - a 240px photo is only 240px tall, so the first block or two
          // beside it take the squeeze and the paragraph below runs full width.
          // "Digital Hygrometer and Thermometer" is 34 characters, so a 60 floor
          // skipped the very thing that went live broken. Anything that still
          // fits on one line is dropped by the two-line rule below instead.
          if (node.textContent.trim().length < 25) continue;
          // A ribbon rank, a button label and a price pill are labels, not
          // reading text. They are MEANT to be short and they wrap happily; the
          // ribbon in particular is a two-part header whose left half is always
          // narrow on a phone. Flagging them buried the one finding that mattered
          // under eight that did not.
          if (node.parentElement.closest('.product-ribbon, .cta-btn, .dl-btn, .price, .pricenote, .product-price, .kit-check')) continue;
          const r = document.createRange();
          r.selectNodeContents(node);
          const lines = [...r.getClientRects()].filter(x => x.width > 0 && x.height > 0);
          if (lines.length < 2) continue;              // one line, nothing to judge
          const widest = Math.max(...lines.map(x => x.width));
          if (widest < MIN_LINE) {
            out.push('text squeezed to ' + Math.round(widest) + 'px in .' +
                     (String(card.className).split(' ')[0] || card.tagName) +
                     ' - "' + node.textContent.trim().slice(0, 32) + '..."');
            break;                                     // one report per card is enough
          }
        }
      }
      return [...new Set(out)];
    });
    await p.close();
    bad.forEach(x => found.push(`${w}px: ${x}`));
  }
  tot += found.length;
  console.log('%s %s', path.basename(file).slice(0, 46).padEnd(48), found.length ? found.join('; ') : 'clean');
}
console.log('\n%d layout problems', tot);
console.log('theme: %s', themePath);
await b.close();
fs.rmSync(TMP, { recursive: true, force: true });
