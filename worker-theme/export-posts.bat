@echo off
rem  Exports every blog post and page so they can be restyled.
rem  Run it by typing:  export-posts
rem  Leaves two files in this folder: posts-export.json and pages-export.json
cd /d "C:\Users\Xvick\OneDrive\Documents\petgotopro-website"
echo.
echo === what you have ===
call npx wrangler d1 execute petgotopro --remote --command "SELECT id, status, category, slug, length(body_html) AS chars, title FROM posts ORDER BY id"
echo.
call npx wrangler d1 execute petgotopro --remote --command "SELECT id, status, slug, length(body_html) AS chars, title FROM pages ORDER BY id"
echo.
echo === exporting full post bodies ===
call npx wrangler d1 execute petgotopro --remote --json --command "SELECT id, slug, title, description, keywords, category, hero_image, status, body_html FROM posts ORDER BY id" > posts-export.json
echo === exporting full page bodies ===
call npx wrangler d1 execute petgotopro --remote --json --command "SELECT id, slug, title, description, status, body_html FROM pages ORDER BY id" > pages-export.json
echo.
dir posts-export.json pages-export.json
echo.
echo Done. Send Claude posts-export.json and pages-export.json
pause
