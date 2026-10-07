@echo off
rem  Registers the three printable sheets as free guides.
rem  Put this file in the project folder and run it by typing:  register-guides
rem
rem  Uses --command rather than --file: the file import endpoint rejects OAuth
rem  tokens with an authentication error, while --command goes through the query
rem  endpoint that deploys already use.
rem
rem  Safe to run again. A sheet that has not been uploaded yet is skipped.
rem
rem  Every npx line is prefixed with "call". npx is itself a batch file, and one
rem  batch file invoking another without "call" hands over control for good, so
rem  without it this script would stop dead after the first command.
cd /d "C:\Users\Xvick\OneDrive\Documents\petgotopro-website"
echo.
echo === 1 of 3: budgie care sheet ===
call npx wrangler d1 execute petgotopro --remote --command "INSERT OR REPLACE INTO guides (file,title,category,blurb,related,media_id,sort) SELECT 'budgie-care-sheet','Budgie Quick Care Sheet','Birds','Cage size for one bird up to an aviary, climate and sleep, the full diet split, sexing at a glance, and the signs that mean call a vet today.',COALESCE((SELECT '/blog/' || slug FROM posts WHERE instr(lower(title),'budgie') AND status='published' ORDER BY id DESC LIMIT 1),''),id,10 FROM media WHERE instr(lower(filename),'budgie-quick-care-sheet') ORDER BY id DESC LIMIT 1"
echo.
echo === 2 of 3: budgie breeding sheet ===
call npx wrangler d1 execute petgotopro --remote --command "INSERT OR REPLACE INTO guides (file,title,category,blurb,related,media_id,sort) SELECT 'budgie-breeding-sheet','Budgie Breeding and Supplement Sheet','Birds','Nest box specification, the clutch timeline day by day, the supplement schedule that keeps a laying hen out of egg binding, and the emergency signs.',COALESCE((SELECT '/blog/' || slug FROM posts WHERE instr(lower(title),'budgie') AND status='published' ORDER BY id DESC LIMIT 1),''),id,20 FROM media WHERE instr(lower(filename),'budgie-breeding-quick-sheet') ORDER BY id DESC LIMIT 1"
echo.
echo === 3 of 3: dog grooming sheet ===
call npx wrangler d1 execute petgotopro --remote --command "INSERT OR REPLACE INTO guides (file,title,category,blurb,related,media_id,sort) SELECT 'dog-grooming-sheet','Dog Grooming Coat Type Sheet','Dogs','All eight coat types with the right brush, how often to brush, how often to bathe, which shampoo, the clipper blade lengths and the never-do list.',COALESCE((SELECT '/blog/' || slug FROM posts WHERE instr(lower(title),'grooming') AND status='published' ORDER BY id DESC LIMIT 1),''),id,30 FROM media WHERE instr(lower(filename),'dog-grooming-quick-sheet') ORDER BY id DESC LIMIT 1"
echo.
echo === what is registered now ===
call npx wrangler d1 execute petgotopro --remote --command "SELECT sort, file, media_id, related FROM guides ORDER BY sort"
echo.
echo Done. Now visit pet-gotopro.com/free-guides
pause
