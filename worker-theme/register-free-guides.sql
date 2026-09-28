-- Registers the three printable sheets as free guides.
--
-- Cloudflare rejects --file with an authentication error on OAuth logins, so
-- prefer register-guides.bat, which sends the same statements with --command.
-- This file is kept as the readable reference.
--
-- The media id is looked up from the media library by filename and the link to
-- the article from the posts table by title, so there is nothing to find by hand.
-- Safe to run again; a sheet not yet uploaded is skipped rather than erroring.

INSERT OR REPLACE INTO guides (file,title,category,blurb,related,media_id,sort) SELECT 'budgie-care-sheet','Budgie Quick Care Sheet','Birds','Cage size for one bird up to an aviary, climate and sleep, the full diet split, sexing at a glance, and the signs that mean call a vet today.',COALESCE((SELECT '/blog/' || slug FROM posts WHERE instr(lower(title),'budgie') AND status='published' ORDER BY id DESC LIMIT 1),''),id,10 FROM media WHERE instr(lower(filename),'budgie-quick-care-sheet') ORDER BY id DESC LIMIT 1;

INSERT OR REPLACE INTO guides (file,title,category,blurb,related,media_id,sort) SELECT 'budgie-breeding-sheet','Budgie Breeding and Supplement Sheet','Birds','Nest box specification, the clutch timeline day by day, the supplement schedule that keeps a laying hen out of egg binding, and the emergency signs.',COALESCE((SELECT '/blog/' || slug FROM posts WHERE instr(lower(title),'budgie') AND status='published' ORDER BY id DESC LIMIT 1),''),id,20 FROM media WHERE instr(lower(filename),'budgie-breeding-quick-sheet') ORDER BY id DESC LIMIT 1;

INSERT OR REPLACE INTO guides (file,title,category,blurb,related,media_id,sort) SELECT 'dog-grooming-sheet','Dog Grooming Coat Type Sheet','Dogs','All eight coat types with the right brush, how often to brush, how often to bathe, which shampoo, the clipper blade lengths and the never-do list.',COALESCE((SELECT '/blog/' || slug FROM posts WHERE instr(lower(title),'grooming') AND status='published' ORDER BY id DESC LIMIT 1),''),id,30 FROM media WHERE instr(lower(filename),'dog-grooming-quick-sheet') ORDER BY id DESC LIMIT 1;

SELECT sort, file, media_id, related FROM guides ORDER BY sort;
