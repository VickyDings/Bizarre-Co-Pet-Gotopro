-- Register the three printable sheets as free guides.
--
-- Run from the project folder with:
--   npx wrangler d1 execute petgotopro --remote --file=register-free-guides.sql
--
-- The media id is looked up from the media library by filename, and the link to
-- the full article is looked up from the posts table by title, so there are no
-- numbers to find by hand. Safe to run again — it replaces rather than duplicates.
-- If a sheet has not been uploaded yet, its row is simply skipped.

INSERT OR REPLACE INTO guides (file, title, category, blurb, related, media_id, sort)
SELECT 'budgie-care-sheet',
       'Budgie Quick Care Sheet',
       'Birds',
       'Cage size for one bird up to an aviary, climate and sleep, the full diet split, sexing at a glance, and the signs that mean call a vet today.',
       COALESCE((SELECT '/blog/' || slug FROM posts WHERE title LIKE '%udgie%' AND title NOT LIKE '%reeding%' AND status = 'published' ORDER BY id DESC LIMIT 1), ''),
       id, 10
FROM media WHERE filename LIKE 'budgie-quick-care-sheet%' ORDER BY id DESC LIMIT 1;

INSERT OR REPLACE INTO guides (file, title, category, blurb, related, media_id, sort)
SELECT 'budgie-breeding-sheet',
       'Budgie Breeding & Supplement Sheet',
       'Birds',
       'Nest box specification, the clutch timeline day by day, the supplement schedule that keeps a laying hen out of egg binding, and the emergency signs.',
       COALESCE((SELECT '/blog/' || slug FROM posts WHERE title LIKE '%udgie%' AND status = 'published' ORDER BY id DESC LIMIT 1), ''),
       id, 20
FROM media WHERE filename LIKE 'budgie-breeding-quick-sheet%' ORDER BY id DESC LIMIT 1;

INSERT OR REPLACE INTO guides (file, title, category, blurb, related, media_id, sort)
SELECT 'dog-grooming-sheet',
       'Dog Grooming Coat Type Sheet',
       'Dogs',
       'All eight coat types with the right brush, how often to brush, how often to bathe, which shampoo, the clipper blade lengths and the never-do list.',
       COALESCE((SELECT '/blog/' || slug FROM posts WHERE title LIKE '%rooming%' AND status = 'published' ORDER BY id DESC LIMIT 1), ''),
       id, 30
FROM media WHERE filename LIKE 'dog-grooming-quick-sheet%' ORDER BY id DESC LIMIT 1;

-- Show what landed
SELECT file, title, media_id, related FROM guides ORDER BY sort;
