@echo off
rem  Registers the dog chew safety sheet as a free guide.
rem
rem  Run it AFTER publishing the post AND uploading the PNG through the admin
rem  media library. If the picture is not there yet the statement matches
rem  nothing and skips, so it is safe to run early and safe to re-run.
rem
rem  The post title must contain the word "chew" -- that is how the sheet finds
rem  its article to link back to.
rem
rem  The key keeps its .png extension because that is what the article's /img/
rem  and /download/ URLs use. The admin editor may store the upload as a .jpg
rem  if that came out smaller; it does not matter here, because the match is on
rem  instr(filename,'dog-chew-safety-sheet') and serveGuide builds the saved
rem  filename from the stored mime rather than from this key.
rem
rem  Uses --command, not --file: the import endpoint rejects OAuth tokens.
rem  No percent signs anywhere; cmd.exe eats what lies between a pair of them,
rem  which is why this uses instr() rather than LIKE.
rem  Every npx line is prefixed with "call" or the script stops after the first.

cd /d "C:\Users\Xvick\OneDrive\Documents\petgotopro-website"

echo.
echo === registering the dog chew safety sheet ===
call npx wrangler d1 execute petgotopro --remote --command "INSERT OR REPLACE INTO guides (file,title,category,blurb,related,media_id,sort) SELECT 'dog-chew-safety-sheet.png','Dog Chew Safety Quick Sheet','Dogs','Every chew sorted into safe, risky and never, with the thumbnail test, the size rule, the calorie numbers and the signs of obstruction that mean call the vet today.',COALESCE((SELECT '/blog/' || slug FROM posts WHERE instr(lower(title),'chew') AND status='published' ORDER BY id DESC LIMIT 1),''),id,54 FROM media WHERE instr(lower(filename),'dog-chew-safety-sheet') ORDER BY id DESC LIMIT 1"

echo.
echo === guides now registered ===
call npx wrangler d1 execute petgotopro --remote --command "SELECT sort, file, media_id FROM guides ORDER BY sort"

echo.
echo If the chew sheet is missing, upload its PNG in the admin media library
echo first, then run this again.
pause
