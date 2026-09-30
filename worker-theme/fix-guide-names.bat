@echo off
rem  Adds the .png extension to the three new guide keys, so the file a visitor
rem  downloads is named petgotopro-budgie-care-sheet.png rather than having no
rem  extension at all. The download filename is built from this key.
rem  Run it by typing:  fix-guide-names
cd /d "C:\Users\Xvick\OneDrive\Documents\petgotopro-website"
echo.
echo === adding .png to the three new guides ===
call npx wrangler d1 execute petgotopro --remote --command "UPDATE guides SET file = file || '.png' WHERE file IN ('budgie-care-sheet','budgie-breeding-sheet','dog-grooming-sheet')"
echo.
echo === all guides now ===
call npx wrangler d1 execute petgotopro --remote --command "SELECT sort, file, media_id FROM guides ORDER BY sort"
echo.
echo Done.
pause
