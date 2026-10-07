# Pet-Go'to'Pro — handoff for a new chat

Upload this file at the start of a new session, or paste it in. If the new chat is
opened on the **Bizarre-Co-Pet-Gotopro** repo, `CLAUDE.md` loads by itself and holds
the full house style — this file is the part that is newer than most of it, plus
where things stand today.

**Date of this handoff: 7 October 2026. Branch: `claude/pet-website-design-krh19l`.**

---

## 1. The thing that changed

Shopping lists used to be `.kit-item` rows. **They are now a three-across grid of
product cards**, because a row had nowhere to put a product photo and a reader is
likelier to click a link with the product beside it.

All six guides are converted — chew, cockatiel, Tiki, shrimp, hermit crab, saltwater.
**Nothing new should use `.kit-item` for a shopping list.**

## 2. The two card components

There are only two, and their photo wells are now identical: a square white well,
14px padding, image bounded not stretched (`width:auto`), never cropped.

### A. `.pgp-prod` — use this for almost everything

Section 7 (the product row) and section 14 (the full shopping list) both use it.
Copy this cell verbatim and change the content:

```html
<div class="pgp-cell">
  <div class="pgp-prod">
    <div class="pgp-prod-img"><span class="pgp-cell-ph">Drop your product photo here</span></div>
    <h4>1. Plain-English item name</h4>
    <p>Why it is on the list. Two or three sentences.</p>
    <p class="price">From $8.99</p>
    <p class="pricenote"><em>Exact Product Name &middot; *Price starts from and is subject to change</em></p>
    <a class="cta-btn" href="AMAZON_SEARCH_URL" target="_blank" rel="nofollow noopener sponsored">Check price</a>
  </div>
</div>
```

Wrapped in:

```html
<div class="pgp-section">
  <h3 class="pgp-sec-title">The full shopping list</h3>
  <p>One line saying where the essentials stop.</p>
  <div class="pgp-grid pgp-grid--3">
    ...cells...
  </div>
</div>
```

Rules that matter:

- **Number every item, 1 to n, right through.** Do not number the essentials and
  leave the rest bare — merged into one grid that reads as items the author forgot.
- The `<h4>` is the plain-English name. The **exact product name goes on the
  `.pricenote` line**, so the list still reads as a checklist and the thing being
  bought is still named.
- Nine items make three clean rows. Eleven run 3-3-3-2, which is fine — **do not pad
  a list to reach a multiple of three.**
- No price anywhere? Ship the card with **no price line at all** rather than an
  invented range. The button does that job. Button label in a grid cell is
  **"Check price"** — "Check price on Amazon" wraps to two lines at that width.
- Leave the well holding `.pgp-cell-ph`. It is a drop target in the editor and
  invisible to readers.

### B. `.product` — only for a ranked review

Ten-item "best of" pieces with a #1–#10 ribbon, a Best For badge and Pros/Cons.
Tiki and Stella & Chewy's are the only two. **Do not reach for it for a new guide.**

## 3. Building a new guide

`CLAUDE.md` has the full section order (17 blocks) and the house style. The short
version of what gets forgotten:

- **6,000–7,500 words.** A 3,500-word guide reads thin in this layout.
- **Four or more `.funfact` boxes**, spread through, each genuinely surprising.
- **A downloadable care sheet** — habitat, necessities, diet. Build from
  `care-sheet-template.html`, render 1000px wide at deviceScaleFactor 2, **tall
  viewport first, then measure, then clip.**
- **Ten or more photos** through the article body, never inside a product card.
- `rel="nofollow noopener sponsored"` on every affiliate anchor.
- A `.disclosure` **before the first link**, not only at the foot.
- Amazon **search** URLs, never a guessed ASIN.

## 4. Before handing anything over

From `worker-theme/`:

```
PGP_SRC=C:\Users\Xvick\OneDrive\Documents\petgotopro-website\src node layout-check.mjs
python scan-uk.py post-your-new-guide.html
```

`layout-check` renders every post at 900px and 390px. It now also fills empty photo
wells with a stand-in image and flags text squeezed below 150px per line.
**Known limit:** it was not shown to catch the live hermit crab squeeze, so it is one
net, not a guarantee. Four pre-existing findings are expected and are not yours.

`scan-uk.py` must say **0 of N need attention** before anything ships.

## 5. Where it stands today

**Done and live:** all 18 care sheets registered, the download buttons work, all six
shopping lists converted, the review card and shopping list wells matched.

**With the owner:**

| | |
|---|---|
| Ten Tiki product photos | post 17, wells ready |
| Publish the chew guide | slug `dog-chew-safety-guide`, category Dogs |
| Paste shrimp / hermit crab / saltwater | bodies are in the repo |
| Raw Paws reply | email sent 7 Oct about two feed faults |

**Open, small:** a product title squeezed to 130px at 900px in
`updated/01-slow-feeder-bowls-for-dogs.html`.

## 6. Four gotchas that bite in the first hour

1. **A `theme.js` from a cloud session is a whole-file replacement, not a patch.**
   Saving one over a newer `src/theme.js` silently deletes everything added in
   between. Ask for the current `src/` and diff before editing.
2. **A backtick anywhere inside `PUBLIC_CSS`, `SECTION_CSS` or `IMAGE_CSS` — including
   inside a CSS comment — takes the whole site down.** Run `node --check` after any
   edit to theme.js.
3. **`admin.js` imports `IMAGE_CSS` and `SECTION_CSS`, never `PUBLIC_CSS`.** That
   decides whether a rule is visible in the editor, on the live page, or both.
4. **A narrow column is not a narrow window.** Cards sit two and three up in grids, so
   a `@media` breakpoint measures the wrong thing. Use `@container`. This has now
   caused the same bug twice.

## 7. Standing instructions

- **US English in every word a visitor can read**, including alt text and care sheets.
- **No invented authors.** One real person, Vicky G.
- **Never name the owner's employer or the award** — "a national pet retailer" and
  "a company award for top store performance".
- Prices are always a **range** plus the subject-to-change line. Never a fixed price.
- The repo is **public**. `admin.js`, `util.js`, `public.js`, `shop.js`, `checkout.js`,
  `paypal.js`, `index.js` and `ai.js` are deliberately withheld — send them as files,
  never commit them.
