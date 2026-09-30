@echo off
rem  Registers the three new care sheets as free guides.
rem
rem  Run it AFTER uploading each PNG through the admin media library. A line
rem  whose image is not there yet simply matches nothing and skips, so it is
rem  safe to run early and safe to re-run.
rem
rem  Uses --command, not --file: the import endpoint rejects OAuth tokens with
rem  an authentication error, while --command goes through the query endpoint
rem  that deploys already use.
rem
rem  No percent signs anywhere. cmd.exe pairs them up and eats what lies
rem  between, which is why these use instr() rather than LIKE.
rem
rem  The guide key keeps its .png. The saved filename is built from the key, and
rem  without an extension the downloaded file will not open on a double-click.
rem
rem  Every npx line is prefixed with "call". npx is itself a batch file, and one
rem  batch file invoking another without "call" hands over control for good, so
rem  without it this script would stop dead after the first command.
cd /d "C:\Users\Xvick\OneDrive\Documents\petgotopro-website"

echo.
echo === registering the freshwater shrimp care sheet ===
call npx wrangler d1 execute petgotopro --remote --command "INSERT OR REPLACE INTO guides (file,title,category,blurb,related,media_id,sort) SELECT 'shrimp-care-sheet.png','Freshwater Shrimp Quick Care Sheet','Invertebrates','Habitat, equipment and diet on one page, with water parameters for both Neocaridina and Caridina, the copper list, the feeding schedule and how to tell a shed shell from a dead shrimp.',COALESCE((SELECT '/blog/' || slug FROM posts WHERE instr(lower(title),'shrimp') AND status='published' ORDER BY id DESC LIMIT 1),''),id,50 FROM media WHERE instr(lower(filename),'shrimp-care-sheet') ORDER BY id DESC LIMIT 1"

echo.
echo === done ===
echo If a sheet did not register, upload its PNG in the admin media library first.
pause
