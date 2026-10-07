// Authors on the public side — 59 assertions against the real public.js, with
// no database and no network. Run it from worker-theme/ after any change to the
// byline, the author card, the author pages, the Article JSON-LD or the sitemap:
//
//   PGP_SRC=C:\Users\Xvick\...\petgotopro-website\src node authors-public-test.mjs
//
// public.js is server-side and not in this repo, so the path comes from PGP_SRC,
// then ./pgp_assets/src, then ../src — the same search layout-check.mjs uses.
import fs from 'fs';
import path from 'path';
import { register } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const CANDIDATES = [
  process.env.PGP_SRC && path.join(process.env.PGP_SRC, 'public.js'),
  path.join(DIR, 'pgp_assets/src/public.js'),
  path.join(DIR, '../src/public.js'),
].filter(Boolean);
const publicPath = CANDIDATES.find(f => fs.existsSync(f));
if (!publicPath) {
  console.error('Cannot find public.js. Looked in:');
  CANDIDATES.forEach(f => console.error('  ' + f));
  console.error('\nSet PGP_SRC to the folder holding public.js.');
  process.exit(1);
}

// public.js reaches theme.js and the Workers-only .bin asset imports. Node has
// no idea what those are, so they resolve to an empty array instead -- the real
// file is still the one under test.
register('data:text/javascript,' + encodeURIComponent(`
  export async function resolve(s, c, next) {
    if (s.endsWith('.bin')) return { url: 'data:text/javascript,export default new Uint8Array(0)', shortCircuit: true };
    return next(s, c);
  }`), import.meta.url);

const { publicRoutes } = await import(pathToFileURL(publicPath).href);

const settings = [
  ['site_name','Pet-GoToPro'], ['tagline','Get trusted information from the Pet Pros'],
  ['site_url','https://pet-gotopro.com'], ['footer_disclosure','As an Amazon Associate...'],
  ['amazon_tag','petgo2pro-20'],
].map(([key,value]) => ({ key, value }));

// The real seeded row, read back from the live database in Phase 2/3.
const vicky = {
  id: 1, slug: 'vicky-g', name: 'Vicky G.',
  title: 'Former Store General Manager with 12+ years at a national pet retailer',
  credit_line: '12+ years in pet retail · Former Store General Manager',
  short_bio: 'Vicky has managed eight stores for a national pet retailer and helped thousands of owners set up tanks, habitats, and diets that actually work. She writes the same honest, practical advice she gives customers in the store.',
  long_bio_html: '<p>Vicky spent twelve years in pet retail, the last eight of them running stores.</p><p>She writes the advice she gave over the counter.</p>',
  photo_media_id: 949,
  award_line: '2022 award winner · Recognized for top store performance',
  profile_path: '/about-us', active: 1,
  created_at: '2026-10-06T00:00:00Z', updated_at: '2026-10-06T00:00:00Z',
};

function mkPost(over = {}) {
  return {
    id: 1, slug: 'hamster-care-guide', title: 'Best Hamster Setup', category: 'Small Pets',
    description: 'How to care for your hamster.',
    body_html: '<p>' + 'word '.repeat(400) + '</p><p>Buy it on <a href="https://www.amazon.com/s?k=hamster+cage">Amazon</a>.</p>',
    hero_image: '/media/888', status: 'published', author_id: 1,
    published_at: '2026-09-30T10:00:00Z', created_at: '2026-09-30T10:00:00Z',
    updated_at: '2026-10-01T10:00:00Z', keywords: 'hamster, cage',
    ...over,
  };
}

function mkDb({ post = mkPost(), author = vicky, posts = [] } = {}) {
  return { prepare(sql) { return {
    bind() { return this; },
    async all() {
      if (sql.includes('FROM settings'))   return { results: settings };
      if (sql.includes('FROM menu_items')) return { results: [{label:'Home',url:'/'},{label:'Blog',url:'/blog'}] };
      if (sql.includes('FROM posts'))      return { results: posts };
      if (sql.includes('FROM authors'))    return { results: author ? [author] : [] };
      if (sql.includes('FROM pages'))      return { results: [] };
      return { results: [] };
    },
    async first() {
      if (sql.includes('FROM posts'))   return post;
      if (sql.includes('FROM authors')) return author;
      return null;
    },
    async run() { return { success: true }; },
  }; } };
}

async function get(url, db) {
  const res = await publicRoutes.request(url, { redirect: 'manual' }, { DB: db });
  return { status: res.status, loc: res.headers.get('location'), html: await res.text() };
}

let pass = 0, fail = 0;
function check(name, cond, extra = '') {
  if (cond) { pass++; console.log('PASS  ' + name); }
  else { fail++; console.log('FAIL  ' + name + (extra ? '  -> ' + extra : '')); }
}

// ——— 1. A post by Vicky ———
const post1 = await get('http://pet-gotopro.com/blog/hamster-care-guide', mkDb());
check('post renders', post1.status === 200, 'status ' + post1.status);

const byline = (post1.html.match(/<div class="byline">[\s\S]*?<\/div>/) || [''])[0];
console.log('\n--- byline ---\n' + byline.replace(/\n\s+/g, '\n  ') + '\n');
check('byline links the author', byline.includes('<a href="/about-us">Vicky G.</a>'));
check('byline uses profile_path, not /author/', !byline.includes('/author/vicky-g'));
check('byline carries the desk', byline.includes('Small Pets Desk'));
check('byline has no credit_line when a desk exists', !byline.includes('12+ years in pet retail'));
check('byline keeps Updated', /Updated\s+\w/.test(byline));
check('byline keeps min read', /\d+ min read/.test(byline));
check('old team byline gone', !post1.html.includes('By The Pet-GoToPro Team'));

const card = (post1.html.match(/<aside class="pgp-au au-card">[\s\S]*?<\/aside>/) || [''])[0];
check('author card present', card.length > 0);
check('card: Written by eyebrow', card.includes('>Written by<'));
check('card: name', card.includes('Vicky G.'));
check('card: title', card.includes('Former Store General Manager with 12+'));
check('card: short bio', card.includes('managed eight stores'));
check('card: award chip', card.includes('2022 award winner'));
check('card: first-name button', card.includes('Meet Vicky &rarr;'));
check('card: no surname in button', !/Meet Vicky G\./.test(card));
check('card: photo from media id', card.includes('src="/media/949"'));
check('card: exactly one on the page', (post1.html.match(/pgp-au au-card/g) || []).length === 1);

const cardIdx = post1.html.indexOf('pgp-au au-card');
const lastShare = post1.html.lastIndexOf('Found this useful');
check('card sits before the closing share bar', cardIdx > 0 && cardIdx < lastShare);
check('card sits after the prose', cardIdx > post1.html.indexOf('class="prose"'));

const ld = JSON.parse((post1.html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s) || [,'{}'])[1]);
console.log('--- Article JSON-LD author / publisher ---');
console.log(JSON.stringify({ author: ld.author, publisher: ld.publisher }, null, 2) + '\n');
check('JSON-LD author is a Person', ld.author['@type'] === 'Person');
check('JSON-LD author name', ld.author.name === 'Vicky G.');
check('JSON-LD author url is absolute + override', ld.author.url === 'https://pet-gotopro.com/about-us');
check('JSON-LD author has jobTitle', !!ld.author.jobTitle);
check('JSON-LD publisher still Organization', ld.publisher['@type'] === 'Organization');
check('JSON-LD publisher keeps legalName', ld.publisher.legalName === 'Bizarre Collections LLC');

// ——— 2. Desk mapping, every category ———
console.log('--- desk per category ---');
for (const [cat, want] of [
  ['Dogs','Companion Desk'], ['Cats','Companion Desk'], ['Small Pets','Small Pets Desk'],
  ['Birds','Bird Room Desk'], ['Reptiles','Reptile & Amphibian Desk'],
  ['Aquatics','Aquatics Desk'], ['Invertebrates','Bug & Shrimp Desk'],
]) {
  const r = await get('http://pet-gotopro.com/blog/x', mkDb({ post: mkPost({ category: cat }) }));
  const b = (r.html.match(/<div class="byline">[\s\S]*?<\/div>/) || [''])[0];
  // & is escaped in HTML output
  const esc = want.replace(/&/g, '&amp;');
  check(`  ${cat} -> ${want}`, b.includes(esc), b.replace(/\s+/g,' ').slice(0,160));
}
const gen = await get('http://pet-gotopro.com/blog/x', mkDb({ post: mkPost({ category: 'General' }) }));
const genB = (gen.html.match(/<div class="byline">[\s\S]*?<\/div>/) || [''])[0];
check('  General -> falls back to credit_line', genB.includes('12+ years in pet retail'));

// ——— 3. No author assigned ———
const orphan = await get('http://pet-gotopro.com/blog/x', mkDb({ post: mkPost({ author_id: null }), author: null }));
check('unassigned post still renders', orphan.status === 200);
check('unassigned post keeps the team byline', orphan.html.includes('By The Pet-GoToPro Team'));
check('unassigned post renders no card', !orphan.html.includes('pgp-au au-card'));
const oLd = JSON.parse((orphan.html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s) || [,'{}'])[1]);
check('unassigned post author stays Organization', oLd.author['@type'] === 'Organization');

// ——— 4. Dedupe: a card already pasted in the body ———
const dup = await get('http://pet-gotopro.com/blog/x', mkDb({
  post: mkPost({ body_html: '<p>Hi</p><aside class="pgp-au au-card">pasted</aside>' }),
}));
check('pasted card is not doubled', (dup.html.match(/pgp-au au-card/g) || []).length === 1);
check('pasted card is the one kept', dup.html.includes('>pasted</aside>'));

// ——— 5. /author/:slug ———
const red = await get('http://pet-gotopro.com/author/vicky-g', mkDb());
check('author with profile_path 301s', red.status === 301, 'status ' + red.status);
check('  ...to /about-us', red.loc === '/about-us', String(red.loc));

const noOverride = { ...vicky, profile_path: '' };
const pageDb = mkDb({ author: noOverride, posts: [mkPost(), mkPost({ id: 2, slug: 'b', title: 'Second Post' })] });
const page = await get('http://pet-gotopro.com/author/vicky-g', pageDb);
check('author page without override renders', page.status === 200, 'status ' + page.status);
check('author page uses the page variant', page.html.includes('pgp-au pgp-au--page'));
check('author page h1 is the name', /<h1 class="pgp-au-name">Vicky G\.<\/h1>/.test(page.html));
check('author page shows the long bio', page.html.includes('twelve years in pet retail'));
check('author page shows the award chip', page.html.includes('2022 award winner'));
// 'pgp-au-btn' is in the stylesheet on every page, so the test has to look at
// the markup: the author page's own card renders no Meet button.
const pageCard = (page.html.match(/<aside class="pgp-au pgp-au--page au-card">[\s\S]*?<\/aside>/) || [''])[0];
check('author page card found', pageCard.length > 0);
check('author page has no Meet button', !/Meet /.test(pageCard) && !/class="pgp-au-btn"/.test(pageCard));
check('author page lists their posts', page.html.includes('Second Post'));
check('author page counts them', page.html.includes('2 articles'));
check('author page canonical is itself', page.html.includes('href="https://pet-gotopro.com/author/vicky-g"'));
const pLd = JSON.parse((page.html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s) || [,'{}'])[1]);
check('author page is a ProfilePage', pLd['@type'] === 'ProfilePage');
check('author page mainEntity is a Person', pLd.mainEntity['@type'] === 'Person');
check('author page og:image is the headshot', page.html.includes('content="https://pet-gotopro.com/media/949"'));

const inactive = await get('http://pet-gotopro.com/author/x', mkDb({ author: { ...noOverride, active: 0 } }));
check('inactive author 404s', inactive.status === 404, 'status ' + inactive.status);
const missing = await get('http://pet-gotopro.com/author/nobody', mkDb({ author: null }));
check('unknown author 404s', missing.status === 404, 'status ' + missing.status);

// ——— 6. Sitemap ———
const sm = await get('http://pet-gotopro.com/sitemap-content.xml', mkDb({ author: null, posts: [mkPost()] }));
check('sitemap renders', sm.status === 200);
const smWith = await get('http://pet-gotopro.com/sitemap-content.xml', mkDb({ author: noOverride, posts: [mkPost()] }));
check('sitemap lists an author with no override', smWith.html.includes('/author/vicky-g</loc>'));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
