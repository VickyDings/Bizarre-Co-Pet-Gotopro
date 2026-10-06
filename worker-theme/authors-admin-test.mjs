// Authors admin — 31 assertions against the real admin.js, no database and no
// network. Run it from worker-theme/ after any change to the authors pages or
// the post editor:
//
//   PGP_SRC=C:\Users\Xvick\...\petgotopro-website\src node authors-admin-test.mjs
//
// admin.js is server-side and not in this repo, so the path comes from PGP_SRC,
// then ./pgp_assets/src, then ../src — the same search layout-check.mjs uses.
import fs from 'fs';
import path from 'path';
import { register } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const CANDIDATES = [
  process.env.PGP_SRC && path.join(process.env.PGP_SRC, 'admin.js'),
  path.join(DIR, 'pgp_assets/src/admin.js'),
  path.join(DIR, '../src/admin.js'),
].filter(Boolean);
const adminPath = CANDIDATES.find(f => fs.existsSync(f));
if (!adminPath) {
  console.error('Cannot find admin.js. Looked in:');
  CANDIDATES.forEach(f => console.error('  ' + f));
  console.error('\nSet PGP_SRC to the folder holding admin.js.');
  process.exit(1);
}

// admin.js reaches theme.js, which reaches the Workers-only .bin asset imports.
// Node has no idea what those are, so they resolve to an empty array instead —
// the real file is still the one under test.
register('data:text/javascript,' + encodeURIComponent(`
  export async function resolve(s, c, next) {
    if (s.endsWith('.bin')) return { url: 'data:text/javascript,export default new Uint8Array(0)', shortCircuit: true };
    return next(s, c);
  }`), import.meta.url);

const { adminRoutes } = await import(pathToFileURL(adminPath).href);

const TOKEN = 'a'.repeat(64);
const H = { Cookie: `pgp_session=${TOKEN}` };
let fail = 0;
const ok = (l, c, x = '') => { console.log((c ? '  PASS  ' : '  FAIL  ') + l + (c ? '' : '  ' + x)); if (!c) fail++; };

/* ——— the authors pages ——— */
{
  const authors = [{
    id: 1, slug: 'vicky-g', name: 'Vicky G.', title: 'Former Store General Manager',
    credit_line: '12+ years in pet retail \u00b7 Former Store General Manager',
    short_bio: 'Bio.', long_bio_html: '<p>Longer.</p>', photo_media_id: 42,
    award_line: '2022 award winner', profile_path: '/about-us', active: 1,
  }];
  let inserted = null, updated = null;
  const db = { prepare(sql) { const s = { _b: [],
    bind(...a) { s._b = a; return s; },
    async all() {
      if (sql.includes('FROM settings')) return { results: [{ key: 'password_hash', value: 'x' }] };
      if (sql.includes('FROM authors'))  return { results: authors.map(a => ({ ...a, posts: 26 })) };
      return { results: [] };
    },
    async first() {
      if (sql.includes('FROM sessions')) return { token: TOKEN, expires_at: Date.now() + 1e7 };
      if (sql.startsWith('SELECT * FROM authors WHERE id=')) return authors[0];
      if (sql.includes('count(*) AS n FROM posts')) return { n: 26 };
      if (sql.includes('SELECT id FROM authors WHERE slug=')) return null;
      return null;
    },
    async run() {
      if (sql.includes('INSERT INTO authors')) inserted = s._b;
      if (sql.startsWith('UPDATE authors'))    updated  = s._b;
      return { meta: { last_row_id: 7 } };
    } }; return s; } };
  const env = { DB: db };
  const get = async p => {
    const r = await adminRoutes.request('http://pet-gotopro.com' + p, { headers: H }, env);
    return { status: r.status, html: await r.text() };
  };

  console.log('\n— the authors pages —');
  const list = await get('/authors');
  ok('list renders', list.status === 200);
  ok('shows the author', list.html.includes('Vicky G.'));
  ok('shows the post count', list.html.includes('>26<'));
  ok('shows the photo', list.html.includes('/media/42'));
  ok('shows the resolved profile path', list.html.includes('/about-us'));
  ok('nav highlights Authors', list.html.includes('class="nav active" href="/admin/authors"'));
  // No delete, by design: a retired author still has to render on old posts.
  ok('offers no delete control',
     !/<button[^>]*>[^<]*delete|href="[^"]*delete/i.test(list.html));

  const neu = await get('/authors/new');
  ok('/new renders', neu.status === 200 && neu.html.includes('New author'));
  ok('/new is not caught by /:id', /name="id" value=""/.test(neu.html));
  ok('/new starts active', /name="active" value="1" checked/.test(neu.html.replace(/\s+/g, ' ')));

  const edit = await get('/authors/1');
  ok('/1 renders the edit form', edit.status === 200 && edit.html.includes('Edit author'));
  ok('pre-fills the credit line', edit.html.includes('12+ years in pet retail'));
  ok('pre-fills profile_path', edit.html.includes('value="/about-us"'));
  ok('shows the current photo', edit.html.includes('src="/media/42"'));
  ok('carries photo_media_id', edit.html.includes('id="f_photo_id" value="42"'));

  const post = (body) => adminRoutes.request('http://pet-gotopro.com/authors/save', {
    method: 'POST', headers: { ...H, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString() }, env);

  const saved = await post({ id: '', name: 'Test Person', slug: '', title: 'T', credit_line: 'C',
    short_bio: 'S', long_bio_html: '<p>L</p>', award_line: 'A', profile_path: 'about-us',
    photo_media_id: '9', active: '1' });
  ok('save redirects', saved.status === 302);
  ok('slug derived from the name', inserted && inserted[0] === 'test-person', inserted && inserted[0]);
  ok('missing leading slash added', inserted && inserted[8] === '/about-us', inserted && inserted[8]);
  ok('photo stored as a number', inserted && inserted[6] === 9);
  ok('active stored as 1', inserted && inserted[9] === 1);

  await post({ id: '1', name: 'Vicky G.', slug: 'vicky-g' });
  ok('unticking active stores 0', updated && updated[9] === 0);
  ok('empty photo stores null', updated && updated[6] === null);

  const noName = await post({ id: '', name: '   ' });
  ok('a nameless author is refused', noName.status === 302 && !/INSERT/.test(String(inserted && inserted[1])) && inserted[1] === 'Test Person');
}

/* ——— the author dropdown on the post editor ——— */
{
  const authors = [
    { id: 1, slug: 'vicky-g', name: 'Vicky G.', credit_line: '12+ years in pet retail', active: 1 },
    { id: 2, slug: 'sam-r',   name: 'Sam R.',   credit_line: 'Aquatics',               active: 1 },
  ];
  const post = { id: 5, slug: 'x', title: 'X', category: 'Dogs', description: '', keywords: '',
    hero_image: '', body_html: '', status: 'draft', author_id: 2 };
  const db = { prepare(sql) { const s = { bind() { return s; },
    async all() {
      if (sql.includes('FROM settings')) return { results: [{ key: 'password_hash', value: 'x' }] };
      if (sql.includes('FROM authors'))  return { results: authors };
      return { results: [] };
    },
    async first() {
      if (sql.includes('FROM sessions')) return { token: TOKEN, expires_at: Date.now() + 1e7 };
      if (sql.includes('FROM posts'))    return post;
      return null;
    },
    async run() { return { meta: { last_row_id: 1 } }; } }; return s; } };
  const env = { DB: db };
  const get = async p => (await adminRoutes.request('http://pet-gotopro.com' + p, { headers: H }, env)).text();

  console.log('\n— the post editor —');
  const neu = await get('/posts/new');
  ok('has an author select', neu.includes('name="author_id"'));
  ok('lists every active author', neu.includes('Vicky G.') && neu.includes('Sam R.'));
  ok('shows the credit line beside the name', neu.includes('Vicky G. — 12+ years in pet retail'));
  ok('a new post defaults to Vicky', /<option value="1" selected>Vicky G\./.test(neu));
  ok('nobody else is pre-selected', !/<option value="2" selected>/.test(neu));
  ok('offers "no author"', neu.includes('— no author —'));
  ok('links through to the authors admin', neu.includes('href="/admin/authors"'));

  const edit = await get('/posts/5');
  ok('editing keeps the saved author', /<option value="2" selected>Sam R\./.test(edit));
  ok('editing does not re-default', !/<option value="1" selected>/.test(edit));
}

console.log(fail ? `\n${fail} FAILED` : '\nAll assertions passed.');
process.exit(fail ? 1 : 0);
