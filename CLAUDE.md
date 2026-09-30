# Pet GoToPro — blog guides

**Read `docs/reference/guide-template.html` before writing a post.** It is the
canonical layout, derived from the two guides the owner confirmed in Sept 2026 as
the house style: **ball-python-care-guide** and **hamster-care-guide**. Match it.
(`docs/reference/post-template.html` is the older guinea-pig-era markup — still
accurate for the component classes, superseded on structure.)

## The live site now lives in this repo, under `petgotopro-live/`

pet-gotopro.com runs a **self-hosted publishing platform on Cloudflare**. The
owner uploaded the project in Sept 2026 and it is now committed here — it is not
on GitHub anywhere else, so this is the only copy under version control.

**Deploy from `petgotopro-live/` with `npx wrangler deploy`.** Nothing you change
in that folder reaches visitors until someone runs that command.

- **Cloudflare Workers** — deployed with `npx wrangler deploy`, configured by
  `wrangler.jsonc`
- **Cloudflare D1** database (`schema.sql`) — **posts live in the database, not
  in files.** This is why no guide exists in any repo.
- **Custom admin at `/admin`**, password-protected, with a visual editor plus an
  HTML view, media library (`/media/NN`), Word `.docx` import, page and menu
  editing, and logo/tagline/Amazon-tag settings
- **Cloudflare Workers AI** for the SEO assistant and blog-idea suggestions
- Free tier: 100k visits/day, 5 GB database, ~100–200 AI calls/day

### Where things are in `petgotopro-live/`

| File | What it holds |
|---|---|
| `src/index.js` | Worker entry, route mounting, **and the real schema** — `SCHEMA[]` runs on every request, so it is authoritative, not `schema.sql` |
| `src/theme.js` | `IMAGE_CSS`, `SECTION_CSS`, `PUBLIC_CSS`, and `layout()` — all public styling |
| `src/admin.js` | The whole `/admin` app: auth, post editor, page editor, media, menus, settings |
| `src/public.js` | Public routes, `CATEGORIES`, guides, 404 |
| `src/ai.js` | Workers AI — SEO suggestions and topic ideas |
| `src/util.js` | esc/slugify/auth/sessions/`applyAmazonTag` |
| `seed/` | One-off SQL and HTML used to load existing posts |

`IMAGE_CSS` and `SECTION_CSS` are imported by **both** `PUBLIC_CSS` and
`ADMIN_CSS`, so the editor renders those components exactly as visitors see them.
Put anything that must look identical in both places in one of those two.

**Never write a backtick inside these template literals** — not even in a CSS
comment. It closes the string early and silently truncates the stylesheet; the
symptom is media queries going missing so columns stop collapsing on phones.
`node check-templates.mjs` catches it.

When adding an editor-only rule, **match the public sheet's specificity**. An
`#editor a.cta-btn` rule outranks the theme's own `.pgp-prod .cta-btn`, so the
editor silently stops being a true preview.

Note: `schema.sql` is a **stale copy** — it is missing `slug_history` and
`guides`, both of which `src/index.js` creates. Trust `index.js`.

**Posts are added through the admin**, by pasting HTML into the `</>` view. That
is why the paste-ready fragment format is the right deliverable for content.

## Dead end: `VickyDings/Pet-GotoPro` (Astro + Decap, NOT live)

**This repo does NOT serve pet-gotopro.com.** It is an older Astro + Decap +
Netlify build, last pushed May 2026, with different URLs (`/guides/{pet}/{slug}`
vs the live `/blog/{slug}`) and none of the live theme's classes. Verified: a
guide merged to its `main` produced a 404 on the live domain. Do not use it as a
reference for the live site. Clone read-only with
`git clone https://github.com/VickyDings/pet-gotopro`, or attach it with
`add_repo(access:"push")` to make changes.

- **Astro 5**, static, deployed on **Netlify**
- **Decap CMS** at `/admin`, git-gateway backend on branch `main`
- **The only stylesheet is `src/styles/global.css`** — theme CSS goes there
- Decap media uploads land in `public/uploads/`, referenced as `/uploads/...`

There are **two ways a guide gets published**, and they behave very differently:

1. **Decap collection** — Markdown + YAML frontmatter in
   `src/content/guides/<pet>/<slug>.md`. Products and FAQs are *structured
   frontmatter fields* (title, badge, image, description, affiliateUrl or asin,
   priceNote), rendered by the Astro layout. The body field is prose markdown
   only — the config explicitly says don't repeat products or FAQs in it.
2. **Standalone HTML** — a hand-built page at
   `public/guides/<pet>/<slug>/index.html`, registered in
   `src/data/standaloneArticles.js` so the hub and category pages can list it.
   This bypasses Decap entirely, which is how full design control is possible.

**The guinea pig nutrition guide is route 2.** That is why it is raw HTML with
its own `<style>` block and `/media/NN` images rather than frontmatter fields.
Route 2 is the format to deliver in for design-heavy guides.

Note the local clone is a May 2026 snapshot and the live site has moved on — the
`quick-facts` / `vet-tip` / `pgp-img` classes and the `/media/NN` convention are
newer than anything in it. Re-clone before relying on file contents.

## Known issues in the Pet-GotoPro repo (as of the May 2026 snapshot)

- **`netfily.toml` is misspelled** — Netlify only reads `netlify.toml`, so the
  whole file is ignored: the `/admin` redirect, the config.yml content-type
  header, the functions directory and the admin no-cache headers are all
  inactive. Renaming the file is a one-line fix.
- **`src/content/guides/cats` is a 1-byte file where a directory should be**, so
  cat guides cannot be created in the Decap collection.
- **Affiliate tag mismatch** — `public/admin/config.yml` auto-builds ASIN links
  with `bizco057-20`, but the store ID in use is `petgo2pro-20`.

## How posts were being written before this was known

A post is hand-written HTML pasted into the editor:

1. Upload photos in **Admin → Media**. Each one shows a number.
2. Open the post → click the **`</>` HTML button**.
3. Paste the HTML, swapping every `src="/media/00"` for the real number.
4. Hit **Update without switching back to the visual editor** — the visual editor
   strips the custom markup.

So the deliverable for a new guide is a **paste-ready HTML fragment**: no
`<!doctype>`, no `<head>`, no `<body>`, no `<link>` to stylesheets. The theme
already styles every class listed below.

**Images are the owner's own photos, placed via `/media/NN`.** Do not generate
inline SVG illustrations or any other AI artwork for posts — they were tried and
rejected. Instead leave `src="/media/00"` placeholders with alt text describing
the photo that belongs there, and list them at the end so the owner knows what to
upload.

**Never write a guide that duplicates one already live.** Check the site first.
Guinea pig nutrition is already published and is the reference post — do not
rewrite it.

## Colour theme — keep this identical across the whole site

**Rebranded Sept 2026: warm brown/amber → dark plum + magenta.** The site now
sits on a dark plum ground with long-form articles on a light "paper" sheet.
Token *roles* were kept, so `--ink` is still the dark value and `--cream` still
the light one — only the hues moved. `ADMIN_CSS` in `admin.js` mirrors this
`:root` so the dashboard and editor match.

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#15111C` | headings, near-black plum |
| `--ink-soft` | `#514860` | body copy |
| `--cream` | `#FBFAFD` | page/article sheet background |
| `--cream-deep` | `#F1EDF7` | alternate background |
| `--amber` | `#FF3D96` | accents and buttons (magenta, despite the name) |
| `--amber-deep` | `#C42A6E` | links, hover, eyebrows |
| `--clay` | `#C63B52` | warnings |
| `--forest` | `#2C7A57` | prices, the "our pick" badge, positive signals |
| `--line` | `#E5E0EE` | borders and rules |
| `--page` / `--page-2` / `--page-3` | `#15111C` `#1E1927` `#292234` | the dark shell behind the paper |
| `--on-dark` / `--on-dark-dim` | `#F4F0F7` `#B5ABC0` | text on the dark ground |

Buttons are pills (`border-radius:999px`) with `#2A0A18` text on magenta.

**Fonts:** `Instrument Serif` for headings, `Manrope` for body and UI,
`Quicksand` for the wordmark. Instrument Serif ships **one weight** — the theme
pins serif headings to `font-weight:400` because synthesised bold goes muddy.

## Sections and column layouts — now a button in the editor

`SECTION_CSS` in `petgotopro-live/src/theme.js` ships these to the live site and
the admin editor. `.pgp-section` uses `display:flow-root`, which is what stops an
image dropped between two sections being absorbed into the previous one.

**The editor has a `▦ Section` toolbar button** (post editor and page editor). It
opens a picker: shape (1/2/3/4 columns, wide-left, wide-right, 1-col-2-rows,
1-col-3-rows) × contents (text, photos, photo+text, product cards) × background
(none, cream, warm, white card, top rule, dark) + an optional heading.

Click inside a section afterwards and a floating **“This box”** toolbar appears:
add a heading, text, an image (uploads straight into that box) or a product card;
add another box; even the widths; cycle the background; insert a plain line above
or below; move the whole section up or down; delete it. Sections never nest —
inserting while the caret is inside one places the new section after it.

**Boxes drag and resize.** Each box shows a `⠿` grip at its top-left: drag it to
reorder boxes, including into a different section. Drag a box's right edge to
change the column split. Widths are written to a **`--pgp-cols` custom property**
on the grid, never to an inline `grid-template-columns` — an inline value would
outrank the phone media queries and stop the columns collapsing. Moving a box
between grids clears both grids' widths, since the track count no longer matches.

**Undo/Redo** (`↶ ↷`, Ctrl+Z / Ctrl+Y, 60 steps) covers all of it. Every direct
DOM edit calls `pushUndo()` first; typing is grouped into 700ms bursts.
`sanitizeHtml()` is the single place that strips the editing-only classes
(`pgp-selected`, `pgp-sec-active`, `pgp-cell-active`, `pgp-dragging`,
`pgp-drop-before/after`, `pgp-resizing`) — used by both the undo history and the
save handlers, so none of them can reach the database.

`.pgp-cell-ph` is the image placeholder. It is `display:none` on the public site,
and the caption and product photo well collapse with it, so a box you forget to
fill leaves nothing behind for visitors.

- `.pgp-section` (+ `--cream` `--tint` `--paper` `--rule`) — an independent band
- `.pgp-grid` + `--2` `--3` `--4` `--wide-left` `--wide-right` `--rows`, plus
  `--even` to make cards end level. All collapse to one column below 760px.
- `.pgp-cell` — holds an image, text, or a product card
- `.pgp-prod` — compact product card that works inside a column
  (`.pgp-prod-badge` / `-img` / `-body` / `-name` / `-price` / `-disc` / `-why` / `-note`)
- `.pgp-cap` — caption under a cell image
- `.pgp-sec-title` / `.pgp-sec-sub` — section heading and standfirst

Grid tracks are `minmax(0, 1fr)`, never plain `1fr` — plain `1fr` lets a wide
table push the column past the viewport on phones.

Paste-ready blocks for every combination: `docs/reference/section-layouts.html`.

## Components (theme-styled — use these class names exactly)

- `.quick-facts` > `h3` + `.qf-grid` > `.qf-item` > `.qf-label` + `.qf-value`
- `.vet-tip` > `h4` (💚 emoji) — guidance, technique, myth corrections
- `.vet-warning` > `h4` (⚠️ emoji) — toxic foods, hard nevers, emergencies
- `.funfact` > `.ff-label` (🎉) + `p`
- `.table-wrap` > `table.compare` > `thead`/`tbody`
- `details.faq-item` > `summary` + `p` — native accordion, **no JavaScript**
- `.pgp-figure` + `.pgp-img`, sizes `img-sm|md|lg|full`, align `img-left|right|center`,
  extras `img-frame`, `no-zoom`
- `.download-card` > `.dl-thumb` + `.dl-body` > `.dl-tag` `.dl-btn` `.dl-note`
- Product cards: scoped `<style>` + `#xxshop` wrapper > `.gp-card` > `.gp-badge`
  (`.pick` = green) / `.gp-img` / `.gp-name` / `.gp-price` / `.gp-disc` / `.gp-onelink`
- CTA links use `class="cta-btn"` (theme-styled), **not** `.gp-btn`

## Structure — follow `docs/reference/guide-template.html`

In order. Items marked *optional* appeared in one reference guide but not both.

1. `<!-- SEO ... -->` comment block: `SEO TITLE`, `META DESCRIPTION`, `SLUG`,
   `CATEGORY`, `FOCUS KEYWORD`, `SECONDARY KEYWORDS`
2. **Two opening `<p>` paragraphs — no heading above them.** First: how the
   animal is sold, then the turn to what goes wrong. Second: *"This guide is the
   setup we would give a friend"* plus a roadmap of specifics
3. Hero image (Unsplash) + centered italic caption paragraph
4. `.quick-facts`, `h3` = species emoji + "<Species> at a glance", 10–12 items
5. "Before you bring one home" — the commitment, sourcing, legality
6. *Optional* cost table: Cost / Typical range (US) / Notes
7. Enclosure sizing table: **Bare minimum / What to actually buy / Why**
8. `.pgp-section--cream` with `h3.pgp-sec-title` "Three rules that decide the
   enclosure", `pgp-grid--2`
9. `h3` "Where the enclosure goes"
10. The husbandry sections — heat, humidity, lighting, diet — tables and
    `.vet-warning` / `.vet-tip`
11. `ol.method-list` for the layer-by-layer build
12. Product cards in `.pgp-section--tint`, sub = "Prices move constantly — these
    are typical ranges, not quotes."
13. Feeding chart **by weight, not age**, then `ol.method-list` for technique
14. `h3` + `.download-card` (care sheet) + `.paw-divider`
15. "The care routine: daily, weekly and ..." table
16. One `.callout` pull quote, attr "What every … vet wishes owners knew"
17. "Health: what to watch, and what is an emergency" — `pgp-grid--2` with
    `h3` 💚 healthy / ⚠️ call a vet
18. `h3` + `.download-card` (setup checklist) + `.paw-divider`
19. "The full shopping list" — two `.kit-section`s: "The essentials"
    (`.kit-item essential`, check `✓`) and "Worth adding" (`.kit-item optional`,
    check `+`). Anchor is a bare `<a>`, no class, text "See options →"
20. *Optional* `.vet-warning` "Products to leave on the shelf"
21. `p.intl-note` — "We only suggest gear we would use ourselves. Prices are
    indicative and change constantly — always check the current listing."
22. `.paw-divider`, a final Unsplash photo + caption
23. "More fun facts to win an argument with" — **4–5 separate `.funfact` boxes**,
    label is plain `Fun fact` with no emoji
24. "Frequently asked questions" — **10** `details.faq-item`, multi-line
25. *Optional* `.vet-tip` cross-link to sibling guides
26. `.disclosure` — always last, always the exact house wording

### Hard rules

- **No `<h2>`/`<h3>` hook at the top.** Two paragraphs, straight in.
- **`<h2>` headings carry no emoji.** Sentence case, often "Topic: the payoff".
  Emoji appear only in `.quick-facts h3`, `.vet-tip`/`.vet-warning h4`, the
  healthy/call-a-vet `h3`s, and a cross-link `h4`.
- **`.pgp-sec-title` is an `h3`,** never an `h2`.
- **There is no "The Bottom Line" section.** The guide ends FAQ → (cross-link) →
  `.disclosure`.
- **Use `<b>`, not `<strong>`,** in body copy. `<strong>` only inside `.funfact`.
- **Every `table.compare` goes inside `.table-wrap`.** One unwrapped table forces
  the whole page to 664px on a 390px phone — this shipped as a live bug once.

## Images

- **Editorial photos are Unsplash URLs**, not `/media/NN`. Search with the
  Unsplash tools and use the `images.unsplash.com/photo-…` form with
  `?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400`.
- Hero and full-width: `class="img-full img-frame"` — **no `pgp-img`, no
  `img-center`**. In-body: `class="img-md img-right img-frame"` or `img-left`.
- A hero or closing photo is followed by a caption paragraph with this exact
  inline style, and the caption should teach something rather than describe the
  picture:
  `<p style="text-align:center;font-size:13px;color:#6E6480;font-style:italic;margin-top:-10px">`
- **`/media/NN` is only for product card images and download-card thumbnails.**
  Product card images carry `alt=""`.

## Voice

- Direct, warm, second person, **first person plural for the publisher** — "the
  setup we would give a friend", "the most common mistake we see", "we recommend".
- **American spelling and units**: color, behavior, mold, gray, fecal. Fahrenheit
  first, metric in parentheses where useful.
- Short sentences. Lead with what kills or harms the animal, and give the number.
- Positions the author as a 12-year pet industry professional.
- Say when a popular product is a bad idea, and why. Never invent review counts.
- Be explicit that a supplement is not a treatment and a symptom is not a diagnosis.

## Affiliate links

**Amazon Associates store ID: `petgo2pro-20`.**

The two reference guides use **`https://link.amazon/XXXXXXXXX`** OneLink short
links with `rel="noopener"` — not `amzn.to`, not tagged search URLs. Claude cannot
generate them, so write `https://link.amazon/XXXXXXXXX` as the placeholder and
list every one for the owner to fill in.

Product cards, in order: badge → image (`/media/NN`, `alt=""`) → name → price
range → `*Price starts from and is subject to change` → reasoning → `cta-btn`
reading **"Check price on Amazon"** → note reading **"Link opens your local
Amazon store where available."**

Shopping-list items end with a bare `<a>` (no class) reading **"See options →"**.

Product **names are generic** — "Dimming or proportional thermostat", not a brand.
Brands are named in the reasoning text instead.

Two card shapes exist. The full-width `.product` card (or the `#xxshop` scoped
`.gp-card`) is right for a one-per-row shop. **In a column layout use `.pgp-prod`**,
which is themed, needs no scoped `<style>`, and ends level with its neighbours.
Its OneLink note is short — put the full country list once in the shop intro
instead of repeating it in every narrow column.

Brand strategy: pick one trusted brand per species where possible (Oxbow for
small animals) and say plainly why.

---

# The static repo

This repo is a separate **Bizarre Co** static site — plain HTML, no build step,
purple `#6C2BD9` / gold `#F59E0B` palette, its own design system in
`css/styles.css` and `css/blog.css`. It is **not** what serves pet-gotopro.com.

```
index.html  collectibles.html  pets.html  about.html  contact.html
css/styles.css  css/blog.css   js/main.js  js/blog.js
blog/index.html  blog/<slug>.html
sitemap.xml  robots.txt  blog/feed.xml  netlify.toml
docs/reference/    the real pet-gotopro house style
```

Guides in it (`axolotl-care-guide`, `bearded-dragon-care-guide`) were written in
the Bizarre Co style with inline SVG illustrations, before the real pet-gotopro
style was known. Their **research and copy are sound**; their wrapper and artwork
are not what pet-gotopro uses.

`drafts/*.cms.html` holds paste-ready pet-gotopro versions — fragments, house
style, `/media/00` image placeholders. That is the format to deliver in.
