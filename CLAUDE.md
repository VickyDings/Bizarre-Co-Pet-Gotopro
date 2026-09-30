# Pet-Go'to'Pro — working notes

The live site is a **Cloudflare Worker** (Hono + D1 + Workers AI), not this repo's
static HTML. Source lives on the owner's machine at
`C:\Users\Xvick\OneDrive\Documents\petgotopro-website\src\` and deploys with
`npx wrangler deploy`. `worker-theme/` here holds the pieces we have worked on.

## House style for guides

Every species/topic guide follows the same layout. It is built from the classes
already defined in `theme.js` (`PUBLIC_CSS` + `IMAGE_CSS` + `SECTION_CSS`) — never
invent new CSS in a post, and never put a `<style>` block in post body HTML (that is
what broke the cat calculator page: a page-level `:root` override killed the header).

### Language

**US English, always, in every word a visitor can read** — posts, care sheets, page
copy, alt text, captions. color not colour, gray not grey, center not centre, molt
not moult, mold not mould, feces not faeces, drafts not draughts, fall not autumn,
toss not bin, cabinet not cupboard, baseboards not skirting boards, sweater not
jumper, labeled not labelled, recognize/realize/analyze with a z. "Bathe" is the
verb, "a bath" the noun. Keep **greyhound comb** as-is: it is the tool's trade name
and a breed, not a color.

It is not only spelling. **Different words count too**: cotton swab not cotton bud,
two weeks not fortnight, period not full stop, cilantro not coriander, zucchini not
courgette, rolled oats not porridge oats, pulse not blitz, right away not straight
away, stopped eating not gone off their food, vacuuming not hoovering, centerpiece
not centrepiece, molding not moulding. These pass a spellcheck and still read as
British.

`scan-uk.py` in `worker-theme/` checks a draft for all of it — run it before handing
anything over. It now covers three families rather than a hand-written word list:

- the `-ise / -isation / -yse` shape as a **rule**, with an exception list for the
  words that genuinely keep `-ise` in US English (advertise, surprise, compromise,
  franchise, exercise...). Hand-listing these is what let `fertiliser` ship twice —
  it was simply never named. `analysis`, `realistic`, `paralysis` and `specialist`
  are correct US English and are not flagged.
- the lexical list above.
- **mid-word capitals**, which catch a case-preserving replacement that went wrong.
  `fertiliser` once became `fertiliZer` that way and went live.

Two false positives worth knowing: **HOB** is a hang-on-back filter, not a stovetop,
and **pavement** is correct US English for a paved surface. Keep **greyhound comb**
and **Jumper** (the jumping spider) as they are.

This applies to the care-sheet HTML too, since that text ends up baked into a PNG
where it cannot be corrected later without a re-render — the dog grooming sheet had
to be re-rendered for exactly this: it read "Bath a dog you have not brushed out"
and "Push a cotton bud into the ear canal". Sheet sources live beside the template
(`grooming-sheet-source.html`); scan the source, not just the post.

### Required in every guide

1. **Fun facts** — at least four `.funfact` boxes spread through the article, not
   clumped at the end. Each one must teach something genuinely surprising.
2. **A downloadable quick care sheet** covering **habitat, necessities and diet**,
   linked from a `.download-card`. Built from `worker-theme/care-sheet-template.html`,
   rendered at 1000px wide × deviceScaleFactor 2, then auto-trimmed. A second sheet is
   worth it when a guide has a big standalone topic (breeding, for instance).

   **Link the sheet through the guides table, not a media id.** Register it once
   (see `worker-theme/register-guides.bat`) and the card points at permanent names:

   ```html
   <div class="dl-thumb"><img src="/img/budgie-care-sheet.png" ...></div>
   <a class="dl-btn" href="/download/budgie-care-sheet.png">
   ```

   A `/media/<id>` link is wiped every time a revised post body is pasted over the
   old one, which cost the owner their uploads twice. A name survives that. It also
   puts the sheet on `/free-guides`, which is where the QR code printed on every
   sheet points, and `/download/` sends a real `Content-Disposition: attachment` so
   no `download` attribute is needed on the anchor. **Keep the `.png` on the guide
   key** — the saved filename is built from it, and without an extension the file
   will not open on double-click.

   Existing keys: `budgie-care-sheet.png`, `budgie-breeding-sheet.png`,
   `dog-grooming-sheet.png`, `shrimp-care-sheet.png`, `hermit-crab-care-sheet.png`,
   `saltwater-care-sheet.png`, plus nine older `.jpg` guides.
   `register-new-guides.bat` holds the last three and is safe to re-run — a sheet
   whose PNG is not uploaded yet matches nothing and skips.

   **Lay the page out at its final height before measuring it.** The renderer
   used to compute the content box, then resize the viewport, then screenshot
   with the box it measured first. Resizing reflowed the page, so the clip
   coordinates were stale and the footer was pulled up into the header. Set the
   tall viewport, then measure, then clip.

   One false alarm worth knowing: a faint logo and tagline appear over the header
   when a finished sheet is viewed downscaled. Sampling the pixels at full
   resolution finds nothing there but the header gradient. It is an artifact of
   the preview, not of the file — check the pixels before re-rendering.

   For a sheet not yet registered, write the thumbnail `src` and button `href` as
   `/media/SOMETHING_MEDIA_ID`.
   `wireDownloadCards()` in `util.js` runs on every public post render and copies the
   thumbnail's src onto the button whenever the button still holds a `MEDIA_ID`
   placeholder — so the owner uploads the picture into the card with the editor's
   🖼️ Image button and the download link wires itself. It never overwrites an href
   that points somewhere real, and it pairs the nth button with the nth card, so two
   sheets in one post stay straight. The admin editor does not run this transform, so
   in the editor the button still shows the placeholder — check the live page.

### The section order that works

| Order | Block | Class |
|---|---|---|
| 1 | Opening 2 paragraphs — name the reader's real problem | plain `<p>` |
| 2 | Hero photo + italic caption | `.img-full .img-frame` |
| 3 | At-a-glance stats | `.quick-facts` + `.qf-grid` / `.qf-item` |
| 4 | Sizing/spec table — the headline reference | `.table-wrap` + `table.compare` |
| 5 | Two-up explainer | `.pgp-section--cream` + `.pgp-grid--2` |
| 6 | The thing that kills them | `.vet-warning` |
| 7 | Product row, 2 or 3 across | `.pgp-section` + `.pgp-grid--2/3` + `.pgp-prod` |
| 8 | Do / don't | `.pros-cons` with `.pros` and `.cons` |
| 9 | Download card | `.download-card` |
| 10 | Step-by-step process | `<ol class="method-list">` |
| 11 | Good news counterpart | `.vet-tip` |
| 12 | Healthy vs call-a-vet, side by side | `.pgp-section--cream` + `.pgp-grid--2` |
| 13 | Pull quote | `.callout` |
| 14 | Full shopping list | `.kit-section` + `.kit-item.essential` / `.kit-item.optional` |
| 15 | More fun facts | `.funfact` ×4 |
| 16 | FAQ, written at the questions people actually search | `<details class="faq-item">` |
| 17 | Affiliate + not-a-vet disclosure | `.disclosure` |

Break the article up with `<div class="paw-divider"></div>` between major movements.

### Length and depth

6,000–7,500 words. A 3,500-word guide reads thin next to this layout. Answer the
questions the owner actually gets asked — for budgies that was cage size vs number of
birds, sexing, breeding, and breeding supplements. Ask what those are for a new topic.

### Product cards

Use `.pgp-prod` inside a `.pgp-grid` cell. Link with an Amazon **search** URL, not a
guessed ASIN, so it never 404s:

```
https://www.amazon.com/s?k=SEARCH+TERMS&tag=petgo2pro-20
```

`applyAmazonTag()` in the worker appends the tag anyway, and `public.js` auto-inserts
the affiliate disclosure on any page matching `/amazon\./i`. Always give a price
*range* plus the `*Price starts from and is subject to change` line — never a fixed price.

**Hiding a grid item does not remove its track.** `.product-body` is a
`240px 1fr` grid. Taking the empty image well out with `display:none` left the
240px column behind, so the text rendered in the narrow one with 394px of dead
space beside it — a card crushed to a third of its width. `.product-body` now
drops to a single column when there is no `img` in the well. Check what happens
to the *siblings* whenever something is hidden inside a grid or flex parent;
hiding it cleanly is only half the test.

**A product card only looks like the Stella & Chewy's one when it has a photo
in the well.** Same component, same CSS — the two-column layout is the image
column plus the content column. With no photo it is a clean full-width card,
which is correct but different. If the owner asks why a new review looks
unlike an old one, this is almost always why.

**An unfilled well must collapse, not print its own instructions.** The Tiki
review shipped ten wells reading *"Drop your product photo here"* with nothing
hiding them — that text would have gone out to every visitor. `.pgp-prod-img`
already had `:not(:has(img)){display:none}`; `.product-image-wrap` now does too,
and the rule sits in the **public-only** part of `PUBLIC_CSS` so the editor still
shows the well as a drop target. Any new card component needs the same pair:
a visible target in the editor, nothing at all on the page.

**Never put an editorial photo inside a product card.** The `.pgp-prod-img` well is
where the owner's real product shot goes, so a nice stock photo parked there is
guaranteed to be overwritten and lost. Leave the well holding the standard
`.pgp-cell-ph` placeholder — the public CSS hides an empty well, and the editor shows
it as an obvious drop target. Good photos belong in the article body, where they
stay. Aim for **ten or more** through a guide: an `.img-full .img-frame` with an
italic caption between blocks always fits, and `.img-md .img-left/right` works beside
two or more paragraphs of running prose.

### Images

Unsplash, via the MCP connector. **Read each result's own description before
using it** — the search term is not a guarantee, and three guides in a row turned
up a wrong-species result that a quick glance would have shipped. An aquarium
search returned an anubias plant; a "cherry shrimp" search returned a Blood Red
Fire Shrimp, which is marine and no relation to a Neocaridina; two "hermit crab"
results were marine animals photographed underwater and in a tide pool, not the
land species the guide was about; and a "clownfish anemone" search returned a hot
air balloon. The description field usually names the species outright, and the
`alt` line stored beside each photo id in `PET_CATEGORIES` exists so this can be
re-checked later without loading anything.

In the published post use the plain form:

```
https://images.unsplash.com/photo-XXXXXXXX?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080
```

Those load fine for real visitors. They do **not** load inside this sandbox — the egress
proxy blocks the host. To preview locally, swap to
`https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-XXXXXXXX`, which is
reachable, or curl them down to local files first. Never ship a photo of the wrong
species because the right one was not available — leave the image out instead.

Floated images (`.img-left` / `.img-right`) must not sit directly above a table or any
full-width block. The theme forces those blocks to `clear:both` — `.table-wrap`,
`.quick-facts`, `.pros-cons`, `.kit-section`, `.kit-item`, `.method-list`,
`.download-card`, `.callout`, `.funfact`, `.vet-warning`, `.vet-tip`, `.product`,
`.pgp-section` — so a float placed there just leaves a gap. Put the photo beside
running prose instead.

**`clear` does not escape a flex parent.** A `.product` inside a `.kit-item` could not
clear a float that was a sibling of the `.kit-section`, because `.kit-item` is
`display:flex` and starts its own formatting context. The clear has to go on the
outermost element that is a sibling of the float — which is why `.kit-item` carries it
rather than only the things inside it. Check for this whenever a new full-width block
is nested inside a flex container.

### Before handing a guide over

`worker-theme/layout-check.mjs` renders every post against the real `theme.js` in
headless Chromium at 900px and 390px and reports float collisions, content escaping
the column and horizontal page scroll. Run it after any edit to a post or to the
theme; it reads the working files, so it does not need a database export.

It needs a `theme.js` with `util.js` beside it, which the public repo does not
have. It looks in `$PGP_SRC`, then `pgp_assets/src/`, then `../src/`, and says so
plainly if it finds none — it used to be one hardcoded path containing a session
id, so it broke with a stack trace every time it was run from anywhere else:

```
PGP_SRC=C:\Users\Xvick\...\petgotopro-website\src node layout-check.mjs
```

One thing it deliberately does not flag: `.pgp-ig-frame` and `.table-wrap` are
**meant** to scroll sideways on a phone. A detailed cross-section diagram squeezed
to 350px is unreadable, so the infographic holds its SVG at `min-width` and shows a
swipe hint instead. Do not "fix" that with a `width:100%` rule.

### Never paste a preview file into the editor

Posts 10 and 11 each had an entire preview document sitting in the post body:
`<meta charset>`, a `<title>… — PREVIEW</title>`, a Google Fonts `<link>`, a
`.pv-*` stylesheet ending in `body{background:#FBFAFD}`, and then a **second `<h1>`**
and category line that the theme already renders above the post. Two H1s on a page
is an SEO fault, and a `body{}` rule inside a post body is the same bug that broke
the cat calculator.

Paste the article only — everything inside `<div class="prose">`, not the file that
wraps it. `layout-check.mjs` does not catch this; grep a draft for `PREVIEW`,
`pv-wrap`, `fonts.googleapis` and a `body{` / `:root{` selector before it goes in.

## Sharing

`shareBar()` in `theme.js` renders the row of share buttons. Everything is a plain
anchor built on the server, so it works with JavaScript off and loads **nothing from
a third party** — no widget script, no cookie, no tracking pixel, and so nothing to
disclose in a consent banner. Only Copy link and the native sheet need JS, and both
degrade to nothing.

```js
shareBar({ url, title, description, image, compact, label })
```

`url` and `image` **must be absolute**. Every network fetches them from its own
servers, so a `/media/12` path resolves against facebook.com and 404s. Build them
from `siteUrl(c, settings)`.

Where they are: two on a blog post (compact under the byline, full after the
article), one at the foot of a custom page, one per card plus one for the page on
`/free-guides`, and one on a shop product.

**`icons` and `only` exist because a narrow column is not a narrow window.** The
`@media (max-width:520px)` rule that drops the text labels keys off the viewport,
which is no help inside a 280px grid card on a 1200px screen. Unchecked, the full
row stacked **four deep and 208px tall** inside a guide card — taller than the
Download button the card exists for. So a guide card asks for
`only: ['pin','fb','copy'], icons: true` and a shop product for `icons: true`, and
both come out one row and 59px. Measure any new placement in a real render; the
numbers are not obvious from the markup.

**Pinterest matters more than the rest for this site** — pet content is what
Pinterest is for. It is the only button given the image, and article photos get a
hover "Save" button as well. That button is **one `position:fixed` element that
follows the hovered image**, not a wrapper around each one: wrapping would put a
floated `.img-left` inside an inline-block and the float would stop working. It
stops the click reaching the lightbox with `stopPropagation()`, and it never appears
on a touch device.

It sizes images off `getBoundingClientRect()`, not `naturalWidth` — `naturalWidth`
reads 0 until the file has downloaded, so sizing off it loses the button on any
image the reader reaches first.

On a phone with its own share sheet (`navigator.share` and `pointer:coarse`), the
five network pills are hidden and the OS sheet replaces them — it offers every app
the reader actually has. Pinterest stays, because the sheet cannot hand it an image.
With only three buttons left there is room for words, so Copy and Share get their
labels back — a bare link or share glyph is vaguer than a Pinterest logo. A bar that
asked for `icons` keeps its icons even then: an explicit option should not be
quietly overridden.

**Test the phone case through `layout()`, not a hand-built page.** The share script
lives in `layout()`, so a test page assembled from `PUBLIC_CSS` and `shareBar()`
alone has no JavaScript at all — it can check CSS and nothing else, and it will
happily report that the native-sheet behavior "works" when it never ran.

### The share preview card

`layout()` emits `og:*`, `twitter:*` and `article:*`. Pass `ogImage` (absolute),
`ogImageAlt`, and for a post an `article: { published, modified, section, tags }`.
Without `og:image` a shared link is a bare blue rectangle, which is most of why a
link gets ignored — it is worth more than the buttons.

Facebook caches what it first scrapes. After changing a title or image, re-scrape at
`developers.facebook.com/tools/debug/`, or the old card persists for weeks.

## The homepage and the header

### One list of animals, in util.js

`PET_CATEGORIES` lives in **`util.js`**, not `public.js`. Three places need it and
they have to agree: the blog's category pages and chips, the header's Pets
dropdown, and the homepage tiles. It cannot live in `public.js` because
`theme.js` needs it and `theme.js` importing `public.js` is a cycle —
`public.js` already imports `theme.js`.

`public.js` re-exports it under the old name:

```js
export const CATEGORIES = PET_CATEGORIES;
```

so `admin.js`, which does `import { CATEGORIES } from './public.js'` for the post
editor's category picker, keeps working with no change at all.

**`theme.js` now imports from `util.js` by name, so the two deploy together.**
Copying a new `theme.js` over an old `util.js` does not degrade gracefully — the
worker fails to start with *does not provide an export named PET_CATEGORIES*, and
the whole site is down. Ship `theme.js`, `util.js` and `public.js` as a set.

Each entry carries `key`, `emoji`, `photo` (an Unsplash id) and `alt`. The `alt`
is **documentation, not markup**: the tile prints its own name, so the photo
ships with an empty alt rather than making a screen reader hear "Dogs" twice.
What the line is for is checking a photo id still shows the species it claims
without loading it — the one image mistake that matters here.

`unsplashUrl(id, w)` builds the URL at the size actually wanted. Tiles ask for
400px, the hero for 1600px. Eight photos at full size would be megabytes on the
page visitors see first.

### The hero is three layers

Section gradient, then `<img class="hero-photo">`, then `.hero-scrim`, then
`.hero-inner` holding the words. The photo is a **real `img`, not a CSS
background**, so it can carry `fetchpriority="high"` and width/height — it is the
largest thing on the page and therefore what Google times the load against, and
a `background-image` can be neither prioritised nor sized. The scrim is its own
element so the section's gradient stays reachable underneath as the fallback for
a photo that never arrives.

Measured contrast over the actual composited pixels: the h1 runs **9.4:1 at the
photo's brightest point**, the standfirst 6.9:1. AA wants 4.5.

### Photo tiles

`.cat-tile--photo` is the same tile with a picture behind it. The photo is a real
child and the scrim is the **pseudo-element, in that order on purpose**: a
pseudo-element paints after every real child, so the scrim covers the photo
without either needing a negative z-index. The words take `z-index:1`.

Two things worth keeping:

- The colour rules are written `.cat-tile.cat-tile--photo`, three classes deep,
  because the plum pass later in the same stylesheet sets a colour on
  `.cat-tile` and `.cat-tile .name`. Two classes and later beats two classes and
  earlier, so the photo tile's white text would have lost the tie. Three classes
  wins whatever the order, which means nobody can break it by reordering the file.
- **No emoji on a tile that has a photo.** The photo is the icon; the emoji became
  a sticker on the animal's face, and the mismatches showed — the scorpion glyph
  was sitting on a photo of a jumping spider. The element stays in the markup for
  a category with no photo yet, and the dropdown keeps its emoji throughout.

The grid is `minmax(210px,1fr)`, not 160px. There are **seven** categories: at
160px the row fits six and strands Invertebrates alone on the next line, which
reads as a mistake. At 210px it breaks 4 and 3, which reads as a decision.

### The nav

The owner's `menu_items` stay the flat top-level row. The theme adds a **Pets**
dropdown it fills from `PET_CATEGORIES`, which also means every page now links to
every category — the homepage tiles alone were not doing that.

`menu_items` is `(id, label, url, sort)` with no parent column, and `admin.js`
rewrites the whole table on save, so owner-defined nesting would be a migration
plus an admin rebuild. Building the one dropdown that was actually needed from a
list that already exists needs neither.

**Two rules keep it working with scripting off:**

- The dropdown opens on `:hover` **and** `:focus-within`. The order matters —
  `focus-within` makes the panel visible before Tab moves into it, because a
  `visibility:hidden` link cannot take focus.
- The collapsing phone panel is armed only by a `.has-js` class, set by a one-line
  script **in the `<head>`**. In the head and not with the scripts at the foot of
  the page, or the phone menu shows fully expanded for a frame and then snaps
  shut. With no JS the nav is the plain wrapping row it always was, rather than a
  hamburger that does nothing.

Phone nav went from 84px to **44px**; tapping Menu opens a 380px panel,
`aria-expanded` tracks both the toggle and the dropdown, and Escape returns focus
to the button it came from.

## Gotcha: visibility:hidden still reports its overflow

The Pets panel is `position:absolute` and opened with `visibility:hidden` →
`visible`. Anchored `left:0` it ran 26px past the right edge of a 1280px window
and put a **horizontal scrollbar on every page of the site** — while still
closed, because `visibility:hidden` hides an element without taking it out of the
scrollable overflow its containing block reports. `display:none` would not have
done this; `visibility` alone does.

It is anchored `right:0` now, which is correct anyway for a nav sitting hard
against the right of the header.

The same panel at 390px stuck out 111px whenever JavaScript had not run, because
the mobile rule that makes it `position:static` was behind `.has-js`. **The rule
that stops it overflowing must not be behind the flag** — only the collapsing is.
Check a new overlay at both widths *and* with scripting off.

## The shop runs on Printify

`shop.js` syncs the catalog from **Printify**, not Printful. It moved in
September 2026. The differences that actually bite:

| | Printful | Printify |
|---|---|---|
| ids | integers | **strings** |
| money | decimal strings | **integer cents** |
| list call | products only | products **with** variants, options and images |
| base cost | separate catalog call | `variant.cost`, inline |
| size / colour | on the catalog variant | **option value ids**, resolved against `product.options[].values[]` |
| scope | one store per token | every call needs a **shop id** |
| headers | Authorization | Authorization **and a User-Agent**, which Workers do not send by default |

Secrets: `PRINTIFY_TOKEN` is required. `PRINTIFY_SHOP_ID` is optional and pins
which shop to sync — without it the first shop from `/v1/shops.json` is used,
which is right for a one-shop account and wrong for anybody else.

**`cents()` exists for a reason.** Printify money is integer cents everywhere.
2900 landing in a dollars column is a $2,900 t-shirt, so nothing raw goes near
a price field.

**A sync retires what it did not see.** Any published product whose `remote_id`
is missing from the response drops back to draft — that is what stopped the old
Printful catalog sitting on the live shop after the switch. It is skipped
entirely when the response is empty, because an empty list is far more likely to
be a wrong shop id than a genuinely empty store, and unpublishing everything
over a typo would be a bad afternoon.

**The column rename is a migration, not a schema change.** `CREATE TABLE IF NOT
EXISTS` will not touch a table that already exists, so `printful_id` becomes
`remote_id` through `ALTER TABLE ... RENAME COLUMN`, guarded on the column being
present. It is safe to re-run, and the owner's price overrides and published
flags survive it.

### When a sync returns nothing

Open **`/admin/shop/probe`** first. It shows whether the token works, which
shops the token can see, the first product exactly as Printify sent it, and what
the sync would have pulled out of it. A field Printify has renamed shows up
there as an empty column instead of as a silent empty catalog.

### Search and filters

Both shop pages filter on the same three things — a text search across name and
description, an **animal**, and an **item type** — and both go through
`shopFilterSql()` so "search" cannot come to mean two different things.

It is a plain `GET` form. No JavaScript, so the URLs are shareable and
`/shop?animal=Reptiles` is a real page, and a filtered view points its canonical
back at `/shop` rather than competing with it. Only values that appear in
`SHOP_ANIMALS` / `SHOP_ITEM_TYPES` are accepted, on the way in and on save —
they end up in a WHERE clause.

The animal list is **the same one the blog uses**, so "Reptiles" means the same
word on both sides of the site.

**Printify cannot tell you which animal a design is about.** It knows the
blueprint is a tote bag; the fact that it is a *cat* tote bag exists only in the
title and tags. So `guessAnimal()` and `guessItemType()` classify on first
insert, and a later sync never touches them — by then the owner may have
corrected one in the admin. Rules are longest-phrase-first, so "bearded dragon"
beats "dragon" and "guinea pig" is never read as a pig.

The public dropdowns only offer values that have published products behind them.
An empty category in a dropdown is a dead end the visitor has to back out of.

**`flex-grow` grows the wrong way once a row stacks.** The filter bar as a
column gave the search field `flex:1 1 220px` in a vertical container, which put
150px of empty white under it and made the bar 469px tall on a phone — over half
the screen before a single product. On a phone it is a grid instead: search
spans, the two selects sit side by side, the button spans. 240px.

### Editing many products at once

The admin list has a checkbox per row and a bulk bar underneath: set animal,
item type, status, or a price rule across everything ticked. Fields left on
*leave alone* are not touched, so one pass can retag a category without
disturbing prices.

Price rules are **base cost × n**, **base cost + n**, **set all to n**, and
**clear the override**, with optional rounding up to .99 or to a whole dollar.
Multiply and add are worked out per row because each product has its own cost;
set and clear are a single statement.

**A product with no base cost is skipped, not multiplied.** The sync does not
always get a cost, and `0 × 2.5` is a free t-shirt. Those rows are left alone
and counted in the confirmation so the number is never silently wrong.

**A checkbox list needs `parseBody({ all: true })`.** Hono keeps only the last
value for a repeated field name otherwise, so ticking forty products would edit
exactly one and look like the feature was broken. The handler also accepts a
bare string, which is what a single ticked box sends.

Everything posted is checked against `SHOP_ANIMALS` / `SHOP_ITEM_TYPES` and the
known price modes before it reaches SQL.

### Duplicates, deleting, and the ignore list

Printify happily holds the same design twice, and the shop had sixty products
in it before anyone noticed. A title that appears more than once is flagged
**duplicate** in the admin list, with a banner counting them.

**Deleting only removes the local row — the product is still in Printify.**
Without something else, the very next sync would put it straight back. So a
delete also writes the `remote_id` into `shop_ignored`, and the sync skips
anything in that table and reports how many it skipped. *Restore all* empties
the table; the rows are gone, so they come back on the following sync rather
than being undeleted.

Cached images are deliberately **not** removed with the product. The owner may
have used one in a post, and nothing here can tell.

### Column header menus

Tick some rows, then click **Animal**, **Item type** or **Status** in the table
header and pick a value. Setting one field through a menu clears the others
first, so clicking "Cats" cannot also carry a price rule somebody set earlier
in the bulk bar.

The menu is `position:fixed`. `table.list` is `overflow:hidden` for its rounded
corners, which would clip a menu inside a `th` down to nothing.

The bulk bar below the table stays: it is the no-JavaScript path, and price
rules are too fiddly for a small menu.

### Categorizing what synced before the classifier

Anything imported before `animal` / `item_type` existed came in blank, which
was 59 products. The banner offers **Categorize them**, which runs the same
guesser over rows where either field is empty. It only fills blanks, so a
category the owner has corrected is never overwritten — and the two fields are
independent, so a product with the animal set still gets its item type filled.

### Testing it without the API

Three suites in `worker-theme/`, none of which need a token or touch the
network. Each takes the path to your `src/shop.js`, since that file is not in
this repo:

| | |
|---|---|
| `shop-sync-test.mjs` | 15 — cents conversion, option resolution, per-variant images, disabled variants, the retire step, the empty-response guard |
| `shop-bulk-test.mjs` | 20 — every price rule and rounding mode, the zero-cost skip, the count in the confirmation, validation, and a single checkbox arriving as a string |
| `shop-classify-test.mjs` | 15 titles through the animal and item-type guesser |
| `shop-admin-test.mjs` | 11 — delete and its ignore list, restore, and categorizing blanks, using real titles from the live admin |

They rebuild their mock from the live source on every run, so a suite can never
pass against a stale copy of the file it is meant to be checking. Two of them
used to overwrite a shared mock on startup and quietly break each other, which
is why the bootstrap is now identical in all three. Run it from `worker-theme/` after any change
to the sync:

```
node shop-sync-test.mjs
```

It needs no token and makes no network calls. Thirteen assertions; all should
say PASS.

## Gotcha: a backtick in theme.js breaks the whole worker

`PUBLIC_CSS`, `SECTION_CSS` and `IMAGE_CSS` are template literals, so a single
backtick anywhere inside them — including inside a `/* CSS comment */` — closes the
string early and the file stops parsing. Writing ``icons:true`` in a comment took
the entire site down until `node --check` caught it.

Comments in there use plain quotes and no backticks. After any edit to theme.js:

```
node --check theme.js     # rename to .mjs first, or copy it
```

A quick structural check too — the PUBLIC_CSS block should contain exactly two
unescaped backticks, its own open and close.

## Gotcha: wrangler on Windows

`--file` cannot reach D1 on an OAuth login — the import endpoint answers
`Authentication error [code: 10000]` however broad the token. Send statements with
`--command` instead; that is the query endpoint deploys already use.

Statements typed at a `cmd.exe` prompt must avoid `%` entirely (cmd pairs `%...%`
up and eats what lies between, so `LIKE 'budgie%'` silently mangles) and `&`. Use
`instr(lower(x),'y')` rather than `LIKE`, and `instr()` alone as a truth test so no
`>` is needed either.

In a `.bat`, every `npx` line needs `call` in front. `npx` is itself a batch file,
and cmd hands control to a called batch file without returning — without `call` the
script dies silently after the first command.

## Gotcha: two route groups share the /admin prefix

`index.js` mounts `shopAdminRoutes` and then `adminRoutes`, both at `/admin`. Hono
runs the first group's `use('*')` middleware on **every** `/admin/*` request, so an
auth gate there also guards `/admin/login` — and redirecting the login page to
itself is an infinite loop the browser reports as `ERR_TOO_MANY_REDIRECTS`.

Both gates must exempt the open paths:

```js
const path = new URL(c.req.url).pathname;
if (path === '/admin/login' || path === '/admin/setup') return next();
```

`adminRoutes` always had it; `shopAdminRoutes` did not, which locked the owner out
of their own admin the first time a session expired. Anything else mounted at
`/admin` later needs the same exemption. Test it logged **out** — with a valid
session cookie the gate passes and the bug stays invisible.

## Restyling the older posts

The owner chose a mixed approach for the nine or so posts written before the
plum retheme:

- **Care guides get the full treatment** — gecko, guinea pig ×2, aquarium
  nitrogen cycle, fish compatibility. Rewritten to the section order above,
  6,000–7,500 words, with a printable sheet each.
- **Reviews and shorter pieces are restructured only** — cat water fountains,
  Stella and Chewy's. Their existing sentences are kept and reorganised into the
  house blocks; nothing is padded to hit a word count.

**Every image `src` and link `href` already in a post is carried across exactly
as it is.** Those point at media the owner uploaded and affiliate links that
already earn — losing one is worse than an ugly layout.

The theme already colours everything, so a post only looks "old" where it fights
the theme: inline `style="color:…"` / `background:` attributes, or a `<style>`
block in the body. `analyze-export.py` flags those per post, along with which
house blocks each post already has and its word count, so the work can be sized
before any of it is rewritten.

`export-posts.bat` pulls the bodies out of D1; there is no way to read the live
database from this environment.
