// ——— Pet-GoToPro CMS — Cloudflare Worker entry ———
import { Hono } from 'hono';
import { publicRoutes, notFound } from './public.js';
import { adminRoutes } from './admin.js';
import { shopRoutes, shopAdminRoutes } from './shop.js';

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`,
  `CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, description TEXT DEFAULT '', keywords TEXT DEFAULT '', category TEXT DEFAULT 'General', hero_image TEXT DEFAULT '', body_html TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'draft', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, published_at TEXT)`,
  `CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status, published_at)`,
  `CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category)`,
  `CREATE TABLE IF NOT EXISTS pages (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, description TEXT DEFAULT '', body_html TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'published', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS menu_items (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT NOT NULL, url TEXT NOT NULL, sort INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS media (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT NOT NULL, mime TEXT NOT NULL, data BLOB NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, expires_at INTEGER NOT NULL)`,
  // Remembers renamed slugs so old links (and Google's index) keep working via a 301 redirect
  `CREATE TABLE IF NOT EXISTS slug_history (old_slug TEXT NOT NULL, kind TEXT NOT NULL, new_slug TEXT NOT NULL, changed_at TEXT NOT NULL, PRIMARY KEY (old_slug, kind))`,
  // Free downloadable guides — images live in the media table so the Worker bundle stays small
  `CREATE TABLE IF NOT EXISTS guides (id INTEGER PRIMARY KEY AUTOINCREMENT, file TEXT UNIQUE NOT NULL, title TEXT NOT NULL, category TEXT DEFAULT '', blurb TEXT DEFAULT '', related TEXT DEFAULT '', media_id INTEGER NOT NULL, sort INTEGER DEFAULT 0)`,
];

let migrated = false;
async function ensureSchema(db) {
  if (migrated) return;
  await db.batch(SCHEMA.map(s => db.prepare(s)));
  migrated = true;
}

const app = new Hono();

app.use('*', async (c, next) => {
  await ensureSchema(c.env.DB);
  await next();
});

// Shop routes mount first: publicRoutes ends with a catch-all '/:slug' that
// would otherwise swallow /shop, and adminRoutes has its own '*' auth gate.
app.route('/admin', shopAdminRoutes);
app.route('/admin', adminRoutes);
app.route('/', shopRoutes);
app.route('/', publicRoutes);
app.notFound((c) => notFound(c));

export default app;
