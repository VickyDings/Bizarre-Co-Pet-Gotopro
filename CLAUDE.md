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

`scan-uk.py` in the scratchpad greps a draft for the whole list — run it before
handing anything over. This applies to the care-sheet HTML too, since that text ends
up baked into a PNG where it cannot be corrected later without a re-render.

### Required in every guide

1. **Fun facts** — at least four `.funfact` boxes spread through the article, not
   clumped at the end. Each one must teach something genuinely surprising.
2. **A downloadable quick care sheet** covering **habitat, necessities and diet**,
   linked from a `.download-card`. Built from `worker-theme/care-sheet-template.html`,
   rendered at 1000px wide × deviceScaleFactor 2, then auto-trimmed. A second sheet is
   worth it when a guide has a big standalone topic (breeding, for instance).

   Write both the thumbnail `src` and the button `href` as `/media/SOMETHING_MEDIA_ID`.
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

**Never put an editorial photo inside a product card.** The `.pgp-prod-img` well is
where the owner's real product shot goes, so a nice stock photo parked there is
guaranteed to be overwritten and lost. Leave the well holding the standard
`.pgp-cell-ph` placeholder — the public CSS hides an empty well, and the editor shows
it as an obvious drop target. Good photos belong in the article body, where they
stay. Aim for **ten or more** through a guide: an `.img-full .img-frame` with an
italic caption between blocks always fits, and `.img-md .img-left/right` works beside
two or more paragraphs of running prose.

### Images

Unsplash, via the MCP connector. In the published post use the plain form:

```
https://images.unsplash.com/photo-XXXXXXXX?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080
```

Those load fine for real visitors. They do **not** load inside this sandbox — the egress
proxy blocks the host. To preview locally, swap to
`https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-XXXXXXXX`, which is
reachable, or curl them down to local files first. Never ship a photo of the wrong
species because the right one was not available — leave the image out instead.

Floated images (`.img-left` / `.img-right`) must not sit directly above a table or any
full-width block. The theme now forces those blocks to `clear:both`, so a float placed
there just leaves a gap — put the photo beside running prose instead.

### Before handing a guide over

Render it against the real `theme.js` in headless Chromium and check, at 900px and at
390px: no horizontal scroll, nothing overflowing the column, no full-width block
overlapping a floated photo, and every image resolving.

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
