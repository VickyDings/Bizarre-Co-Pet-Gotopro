-- 0001-authors.sql — the authors table, the posts.author_id link, and Vicky G.
--
-- Safe to re-run. Every statement is either IF NOT EXISTS, an INSERT OR IGNORE,
-- or an UPDATE with a guard, so running it twice changes nothing the second time.
--
-- The one statement that is NOT re-runnable in plain SQL is the ALTER on posts:
-- SQLite has no ADD COLUMN IF NOT EXISTS. index.js carries a guarded version
-- that checks PRAGMA table_info first, the same way shop.js guards its own
-- column additions, so a fresh environment heals itself on boot and this file
-- only has to run once against an existing database.

-- ——— 1. the table ———
CREATE TABLE IF NOT EXISTS authors (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  title           TEXT NOT NULL DEFAULT '',
  credit_line     TEXT NOT NULL DEFAULT '',
  short_bio       TEXT NOT NULL DEFAULT '',
  long_bio_html   TEXT NOT NULL DEFAULT '',
  photo_media_id  INTEGER,
  award_line      TEXT NOT NULL DEFAULT '',
  -- Set this when the author already has a hand-built page. /author/<slug>
  -- then 301s there instead of rendering its own. Empty means "no override".
  profile_path    TEXT NOT NULL DEFAULT '',
  -- No delete, ever: a retired author still has to render on their old posts.
  -- This hides them from the pickers instead.
  active          INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_authors_active ON authors(active, name);

-- ——— 2. the link from posts ———
-- Nullable on purpose: a post with no author still has to render, falling back
-- to the site name the way it did before this table existed.
ALTER TABLE posts ADD COLUMN author_id INTEGER REFERENCES authors(id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);

-- ——— 3. the first author ———
-- char(183) is the middle dot. Written that way rather than literally because
-- these statements are sent through cmd.exe, which mangles characters outside
-- its codepage; char() is plain ASCII and arrives intact.
INSERT OR IGNORE INTO authors
  (slug, name, title, credit_line, short_bio, award_line, profile_path, active, created_at, updated_at)
VALUES (
  'vicky-g',
  'Vicky G.',
  'Former Store General Manager with 12+ years at a national pet retailer',
  '12+ years in pet retail ' || char(183) || ' Former Store General Manager',
  'Vicky has managed eight stores for a national pet retailer and helped thousands of owners set up tanks, habitats, and diets that actually work. She writes the same honest, practical advice she gives customers in the store.',
  '2022 award winner ' || char(183) || ' Recognized for top store performance',
  '/about-us',
  1,
  datetime('now'),
  datetime('now')
);

-- ——— 4. every existing post becomes hers ———
-- Only fills blanks, so a post reassigned later is never dragged back.
UPDATE posts
SET author_id = (SELECT id FROM authors WHERE slug = 'vicky-g')
WHERE author_id IS NULL;
