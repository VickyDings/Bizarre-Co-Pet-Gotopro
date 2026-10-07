@echo off
rem  Registers the Tiki Cat line chooser as a free guide.
rem
rem  Run it AFTER uploading tiki-cat-line-chooser.png through the admin media
rem  library, otherwise there is nothing for it to point at and it skips.
rem
rem  Uses --command, not --file: the import endpoint rejects OAuth tokens with
rem  an authentication error, while --command goes through the query endpoint
rem  that deploys already use.
rem
rem  The guide key keeps its .png. The saved filename is built from the key, and
rem  without an extension the downloaded file will not open on a double-click.
rem
rem  Every npx line is prefixed with "call". npx is itself a batch file, and one
rem  batch file invoking another without "call" hands over control for good, so
rem  without it this script would stop dead after the first command.
cd /d "C:\Users\Xvick\OneDrive\Documents\petgotopro-website"
echo.
echo === registering the Tiki Cat line chooser ===
call npx wrangler d1 execute petgotopro --remote --command "INSERT OR REPLACE INTO guides (file,title,category,blurb,related,media_id,sort) SELECT 'tiki-cat-line-chooser.png','Tiki Cat Line Chooser and Feeding Sheet','Cats','Every Tiki Cat line decoded, what a can is worth in calories, how many cans a day by cat weight, what it really costs a month, and the one label line that says meal or treat.',COALESCE((SELECT '/blog/' || slug FROM posts WHERE instr(lower(title),'tiki') AND status='published' ORDER BY id DESC LIMIT 1),''),id,40 FROM media WHERE instr(lower(filename),'tiki-cat-line-chooser') ORDER BY id DESC LIMIT 1"
echo.
echo === what is registered now ===
call npx wrangler d1 execute petgotopro --remote --command "SELECT sort, file, media_id, related FROM guides ORDER BY sort"
echo.
echo Done. Now visit pet-gotopro.com/free-guides
pause
