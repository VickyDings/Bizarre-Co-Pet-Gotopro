@echo off
rem  Runs every outstanding guides-table repair in one pass, so there is no
rem  order to remember and nothing to run twice.
rem
rem  It replaces having to run fix-guide-names.bat, register-new-guides.bat,
rem  register-cockatiel-guide.bat and register-dog-chew-guide.bat separately.
rem  Those still work; this is the same statements, in the order that matters.
rem
rem  Safe to re-run. Every INSERT is OR REPLACE and selects its media_id from
rem  the media table, so a sheet whose PNG is not uploaded yet matches nothing
rem  and is skipped rather than written as a broken row. Re-run it after each
rem  upload and the rows fill in.
rem
rem  The extension fix runs FIRST. Registering on top of a key that is still
rem  missing its .png would leave two rows for the same sheet.
rem
rem  Uses --command, not --file: the import endpoint rejects OAuth tokens.
rem  No percent signs anywhere; cmd.exe eats what lies between a pair of them,
rem  which is why these use instr() rather than LIKE.
rem  Every npx line is prefixed with "call" or the script stops after the first.

cd /d "C:\Users\Xvick\OneDrive\Documents\petgotopro-website"

echo.
echo === adding the missing .png extensions ===
call npx wrangler d1 execute petgotopro --remote --command "UPDATE guides SET file = file || '.png' WHERE file IN ('budgie-care-sheet','budgie-breeding-sheet','dog-grooming-sheet')"

echo.
echo === shrimp care sheet ===
call npx wrangler d1 execute petgotopro --remote --command "INSERT OR REPLACE INTO guides (file,title,category,blurb,related,media_id,sort) SELECT 'shrimp-care-sheet.png','Freshwater Shrimp Quick Care Sheet','Invertebrates','Habitat, equipment and diet on one page, with water parameters for both Neocaridina and Caridina, the copper list, the feeding schedule and how to tell a shed shell from a dead shrimp.',COALESCE((SELECT '/blog/' || slug FROM posts WHERE instr(lower(title),'shrimp') AND status='published' ORDER BY id DESC LIMIT 1),''),id,50 FROM media WHERE instr(lower(filename),'shrimp-care-sheet') ORDER BY id DESC LIMIT 1"

echo.
echo === hermit crab care sheet ===
call npx wrangler d1 execute petgotopro --remote --command "INSERT OR REPLACE INTO guides (file,title,category,blurb,related,media_id,sort) SELECT 'hermit-crab-care-sheet.png','Land Hermit Crab Quick Care Sheet','Invertebrates','Habitat, equipment and diet on one page, with the humidity and temperature targets, the substrate recipe, both water dishes, and the molting rules that decide whether a crab reaches its third year or its third month.',COALESCE((SELECT '/blog/' || slug FROM posts WHERE instr(lower(title),'hermit') AND status='published' ORDER BY id DESC LIMIT 1),''),id,51 FROM media WHERE instr(lower(filename),'hermit-crab-care-sheet') ORDER BY id DESC LIMIT 1"

echo.
echo === saltwater care sheet ===
call npx wrangler d1 execute petgotopro --remote --command "INSERT OR REPLACE INTO guides (file,title,category,blurb,related,media_id,sort) SELECT 'saltwater-care-sheet.png','Saltwater Setup Quick Sheet','Aquatics','Every parameter with its target and test frequency, the week-by-week setup timeline, the stocking order, the maintenance routine and the four ways a first marine tank usually fails.',COALESCE((SELECT '/blog/' || slug FROM posts WHERE instr(lower(title),'saltwater') AND status='published' ORDER BY id DESC LIMIT 1),''),id,52 FROM media WHERE instr(lower(filename),'saltwater-care-sheet') ORDER BY id DESC LIMIT 1"

echo.
echo === cockatiel care sheet ===
call npx wrangler d1 execute petgotopro --remote --command "INSERT OR REPLACE INTO guides (file,title,category,blurb,related,media_id,sort) SELECT 'cockatiel-care-sheet.png','Cockatiel Quick Care Sheet','Birds','Habitat, necessities and diet on one page, with the cage and bar-spacing numbers, the diet split, the toxic foods list, the four rules that prevent almost every problem and the signs that mean call a vet today.',COALESCE((SELECT '/blog/' || slug FROM posts WHERE instr(lower(title),'cockatiel') AND status='published' ORDER BY id DESC LIMIT 1),''),id,53 FROM media WHERE instr(lower(filename),'cockatiel-care-sheet') ORDER BY id DESC LIMIT 1"

echo.
echo === dog chew safety sheet ===
call npx wrangler d1 execute petgotopro --remote --command "INSERT OR REPLACE INTO guides (file,title,category,blurb,related,media_id,sort) SELECT 'dog-chew-safety-sheet.png','Dog Chew Safety Quick Sheet','Dogs','Every chew sorted into safe, risky and never, with the thumbnail test, the size rule, the calorie numbers and the signs of obstruction that mean call the vet today.',COALESCE((SELECT '/blog/' || slug FROM posts WHERE instr(lower(title),'chew') AND status='published' ORDER BY id DESC LIMIT 1),''),id,54 FROM media WHERE instr(lower(filename),'dog-chew-safety-sheet') ORDER BY id DESC LIMIT 1"

echo.
echo ================= WHERE EVERY GUIDE STANDS =================
call npx wrangler d1 execute petgotopro --remote --command "SELECT g.sort, g.file, CASE WHEN g.media_id IS NULL THEN 'NO MEDIA - upload the PNG' ELSE 'ok' END AS state FROM guides g ORDER BY g.sort"

echo.
echo ================= STILL NOT REGISTERED =================
echo (anything listed here needs its PNG uploaded in the admin media library,
echo  then run this script again)
call npx wrangler d1 execute petgotopro --remote --command "SELECT 'not registered: ' || x.k FROM (SELECT 'shrimp-care-sheet' AS k UNION ALL SELECT 'hermit-crab-care-sheet' UNION ALL SELECT 'saltwater-care-sheet' UNION ALL SELECT 'cockatiel-care-sheet' UNION ALL SELECT 'dog-chew-safety-sheet') x WHERE NOT EXISTS (SELECT 1 FROM guides g WHERE instr(g.file, x.k))"

echo.
pause
