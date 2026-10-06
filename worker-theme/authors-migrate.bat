@echo off
rem  Phase 2 - creates the authors table, links posts to it, and seeds Vicky G.
rem
rem  TAKE A BACKUP FIRST:
rem    npx wrangler d1 export petgotopro --remote --output=backup-before-authors.sql
rem
rem  The SQL here was tested against real SQLite 3.45 before it was written out:
rem  seeded correctly, idempotent on a second run, and a post reassigned to
rem  another author is not dragged back. A local wrangler run would not add much
rem  on top of that, because the local D1 has no posts table to alter.
rem
rem  Uses --command, not --file: the import endpoint rejects OAuth tokens, while
rem  --command goes through the query endpoint deploys already use.
rem
rem  No percent signs anywhere - cmd pairs them up and eats what lies between.
rem  The middle dot in the credit and award lines is written as char(183) rather
rem  than literally, because cmd mangles characters outside its codepage. The
rem  pipes in the || concatenation are safe: cmd treats them literally inside
rem  double quotes.
rem
rem  Every npx line is prefixed with "call". npx is itself a batch file, and one
rem  batch file invoking another without "call" hands over control for good.
rem
rem  Statement 3 is the only one that is not re-runnable: SQLite has no
rem  ADD COLUMN IF NOT EXISTS, so it errors with "duplicate column name" on a
rem  second run. That error is harmless and means it is already applied.
cd /d "C:\Users\Xvick\OneDrive\Documents\petgotopro-website"

echo.
echo === 1/6  authors table ===
call npx wrangler d1 execute petgotopro --remote --command "CREATE TABLE IF NOT EXISTS authors (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, title TEXT NOT NULL DEFAULT '', credit_line TEXT NOT NULL DEFAULT '', short_bio TEXT NOT NULL DEFAULT '', long_bio_html TEXT NOT NULL DEFAULT '', photo_media_id INTEGER, award_line TEXT NOT NULL DEFAULT '', profile_path TEXT NOT NULL DEFAULT '', active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"

echo.
echo === 2/6  authors index ===
call npx wrangler d1 execute petgotopro --remote --command "CREATE INDEX IF NOT EXISTS idx_authors_active ON authors(active, name)"

echo.
echo === 3/6  posts.author_id  (errors harmlessly if already applied) ===
call npx wrangler d1 execute petgotopro --remote --command "ALTER TABLE posts ADD COLUMN author_id INTEGER REFERENCES authors(id)"

echo.
echo === 4/6  posts author index ===
call npx wrangler d1 execute petgotopro --remote --command "CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id)"

echo.
echo === 5/6  seed Vicky G. ===
call npx wrangler d1 execute petgotopro --remote --command "INSERT OR IGNORE INTO authors (slug, name, title, credit_line, short_bio, award_line, profile_path, active, created_at, updated_at) VALUES ('vicky-g', 'Vicky G.', 'Former Store General Manager with 12+ years at a national pet retailer', '12+ years in pet retail ' || char(183) || ' Former Store General Manager', 'Vicky has managed eight stores for a national pet retailer and helped thousands of owners set up tanks, habitats, and diets that actually work. She writes the same honest, practical advice she gives customers in the store.', '2022 award winner ' || char(183) || ' Recognized for top store performance', '/about-us', 1, datetime('now'), datetime('now'))"

echo.
echo === 6/6  every existing post becomes hers ===
call npx wrangler d1 execute petgotopro --remote --command "UPDATE posts SET author_id = (SELECT id FROM authors WHERE slug = 'vicky-g') WHERE author_id IS NULL"

echo.
echo === check ===
call npx wrangler d1 execute petgotopro --remote --command "SELECT a.id, a.slug, a.name, a.profile_path, length(a.credit_line) AS credit_len, (SELECT count(*) FROM posts WHERE author_id = a.id) AS posts_assigned FROM authors a"

echo.
echo === done ===
pause
