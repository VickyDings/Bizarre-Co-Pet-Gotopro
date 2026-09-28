# Handoff prompt — running Claude Code locally on the PC

This session runs in a cloud container and cannot see `C:\Users\Xvick\Downloads`.
A Claude Code session started **on the PC** can. Use this to pick the work up
there.

## Setting it up, once

Open a terminal (PowerShell or Command Prompt) and install Claude Code:

```
npm install -g @anthropic-ai/claude-code
```

Then start it **in the website folder**, so it can see the source and the repo:

```
cd C:\Users\Xvick\OneDrive\Documents\petgotopro-website
claude
```

Claude Code reads files in the folder it is started in and below. To let it
reach the Downloads folder too, either move the images into the project folder
first, or tell it the full path and approve the read when it asks.

## What a local session can and cannot do

**Can:** read the image files, identify which product each one shows, rename
them to match the card order, resize or convert them, edit the post HTML, run
`scan-uk.py` and `layout-check.mjs`, and run `npx wrangler deploy`.

**Cannot:** upload images into the media library. The `media` table holds binary
blobs in D1, and `wrangler d1 execute --file` fails on an OAuth login (see the
wrangler gotcha in CLAUDE.md). Uploading stays a drag-and-drop in the admin.

## The prompt to paste

> I run pet-gotopro.com, a Cloudflare Worker (Hono + D1). The source is in
> `src\` in this folder and deploys with `npx wrangler deploy`.
>
> **Read `CLAUDE.md` first** — it has the house style rules, and they matter.
> The repo is on the branch `claude/pet-website-design-krh19l`; if it is not
> checked out here, clone `VickyDings/Bizarre-Co-Pet-Gotopro` somewhere and read
> `CLAUDE.md` and `worker-theme/` from it.
>
> I have a Tiki Cat review ready to publish: `worker-theme/post-tiki-cat-review.html`,
> with `post-tiki-cat-review.README.md` beside it explaining the admin fields.
> It has **ten product cards**, each with an empty well reading "Drop your
> product photo here".
>
> I have Tiki Cat product images somewhere in my Downloads folder. Please:
>
> 1. Find them — look in `C:\Users\Xvick\Downloads` and any subfolder with
>    "tiki" in the name.
> 2. Look at each image and tell me which product it shows — line, recipe and
>    can or pouch size are all printed on the packaging.
> 3. Match them to the ten cards, which are, in order: After Dark Chicken &
>    Duck · Born Carnivore Chicken & Egg (dry) · Luau Succulent Chicken ·
>    Velvet Mousse variety · Silver variety · Baby Chicken & Egg · Friends Tuna
>    & Pumpkin Mousse · Grill variety · Luau Lean Gelée · Stix.
> 4. Copy the matched ones into a new folder `tiki-upload\`, renamed
>    `01-after-dark.webp`, `02-born-carnivore.webp` and so on, so I can upload
>    them in one go and drop them into the cards in order.
> 5. Tell me which cards have no image, so I know what is still missing.
>
> **Do not paste the images into the article body or base64 them into the HTML.**
> Product shots belong in the card wells, uploaded through the admin editor —
> that is the only place they survive the article being re-pasted later.
> CLAUDE.md explains why.
>
> Afterwards, run `python worker-theme\scan-uk.py worker-theme\post-tiki-cat-review.html`
> and confirm it is clean.

## Still true either way

Whichever session does it, the upload is: admin → media library → upload the
`tiki-upload\` folder → open the post → click each card's well → 🖼️ Image button
→ pick the matching file.

And the care sheet is separate: upload `tiki-cat-line-chooser.png`, then run
`register-tiki-guide.bat` to put it on `/free-guides`.
