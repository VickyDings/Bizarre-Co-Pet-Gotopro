// Float-collision / overflow check, run against the working HTML files in the
// repo rather than a database export, so it can be re-run after an edit.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import fs from 'fs';
import path from 'path';
const { chromium } = pw;
const T = await import('./pgp_assets/src/theme.js');
const DIR = '/home/user/Bizarre-Co-Pet-Gotopro/worker-theme';
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
  fs.writeFileSync('cmp/_f2.html', `<!doctype html><html><head><meta charset="utf-8"><style>${T.PUBLIC_CSS}${T.IMAGE_CSS}${T.SECTION_CSS}
    body{margin:0}.article{max-width:760px;margin:0 auto;padding:30px 24px;background:#fff}</style></head>
    <body><div class="article prose">${body}</div></body></html>`);
  const found = [];
  for (const w of widths) {
    const p = await b.newPage({ viewport: { width: w, height: 1100 } });
    await p.goto('file:///tmp/claude-0/-home-user-Bizarre-Co-Pet-Gotopro/015a960f-e28a-52d5-8da3-70cb0d65b3a7/scratchpad/cmp/_f2.html', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(160);
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
      return [...new Set(out)];
    });
    await p.close();
    bad.forEach(x => found.push(`${w}px: ${x}`));
  }
  tot += found.length;
  console.log('%s %s', path.basename(file).slice(0, 46).padEnd(48), found.length ? found.join('; ') : 'clean');
}
console.log('\n%d layout problems', tot);
await b.close();
