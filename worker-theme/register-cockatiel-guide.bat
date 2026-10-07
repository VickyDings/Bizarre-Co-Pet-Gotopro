@echo off
rem  Registers the cockatiel care sheet as a free guide.
rem
rem  Run it AFTER publishing the post AND uploading the PNG through the admin
rem  media library. If the picture is not there yet the statement matches
rem  nothing and skips, so it is safe to run early and safe to re-run.
rem
rem  The post title must contain the word "cockatiel" -- that is how the sheet
rem  finds its article to link back to.
rem
rem  Uses --command, not --file: the import endpoint rejects OAuth tokens.
rem  No percent signs anywhere; cmd.exe eats what lies between a pair of them,
rem  which is why this uses instr() rather than LIKE.
rem  Every npx line is prefixed with "call" or the script stops after the first.

cd /d "C:\Users\Xvick\OneDrive\Documents\petgotopro-website"

echo.
echo === registering the cockatiel care sheet ===
call npx wrangler d1 execute petgotopro --remote --command "INSERT OR REPLACE INTO guides (file,title,category,blurb,related,media_id,sort) SELECT 'cockatiel-care-sheet.png','Cockatiel Quick Care Sheet','Birds','Habitat, necessities and diet on one page, with the cage and bar-spacing numbers, the diet split, the toxic foods list, the four rules that prevent almost every problem and the signs that mean call a vet today.',COALESCE((SELECT '/blog/' || slug FROM posts WHERE instr(lower(title),'cockatiel') AND status='published' ORDER BY id DESC LIMIT 1),''),id,53 FROM media WHERE instr(lower(filename),'cockatiel-care-sheet') ORDER BY id DESC LIMIT 1"

echo.
echo === guides now registered ===
call npx wrangler d1 execute petgotopro --remote --command "SELECT sort, file, media_id FROM guides ORDER BY sort"

echo.
echo If the cockatiel sheet is missing, upload its PNG in the admin media
echo library first, then run this again.
pause
