# Pet GoToPro — blog guides

**Read `docs/reference/post-template.html` before writing a post.** It carries the
real markup, copied from the live guinea pig nutrition guide.

## ⚠️ THE LIVE SITE IS A CLOUDFLARE WORKERS APP — NOT IN ANY GITHUB REPO

Confirmed from the owner's guide (Sept 2026). pet-gotopro.com runs a
**self-hosted publishing platform on Cloudflare**:

- **Cloudflare Workers** — deployed with `npx wrangler deploy`, configured by
  `wrangler.jsonc`
- **Cloudflare D1** database (`schema.sql`) — **posts live in the database, not
  in files.** This is why no guide exists in any repo.
- **Custom admin at `/admin`**, password-protected, with a visual editor plus an
  HTML view, media library (`/media/NN`), Word `.docx` import, page and menu
  editing, and logo/tagline/Amazon-tag settings
- **Cloudflare Workers AI** for the SEO assistant and blog-idea suggestions
- Project layout: `src/` (public site, admin, AI tools), `assets/`, `seed/`,
  `wrangler.jsonc`, `schema.sql`
- Free tier: 100k visits/day, 5 GB database, ~100–200 AI calls/day

**To change anything about the site itself** — theme CSS, page layouts, the admin
editor toolbar — you need that project. The owner's guide says: upload the zip or
point Claude at the project, then redeploy with `npx wrangler deploy`.

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

Warm, natural, earthy. **Not** the purple/gold of the Bizarre Co static repo.
Declared in every post's shop block; reuse these exact values anywhere you write
inline CSS.

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#1a1410` | headings, near-black brown |
| `--ink-soft` | `#3d322a` | body copy |
| `--ink-mute` | `#6f6055` | captions, sub-labels, disclaimers |
| `--cream` | `#faf6ef` | page/section background |
| `--cream-deep` | `#f3ead9` | alternate background |
| `--paper` | `#ffffff` | cards |
| `--amber` | `#c8822b` | badges, accents |
| `--amber-deep` | `#a86618` | buttons |
| `--forest` | `#3d5c3a` | prices, the "our pick" badge, positive signals |
| `--line` | `#e8dcc4` | warm borders and rules |

## Sections and column layouts

`docs/reference/section-layouts.css` goes in the theme once; then any post can use
these. `.pgp-section` uses `display:flow-root`, which is what stops an image
dropped between two sections being absorbed into the previous one.

- `.pgp-section` (+ `--cream` `--tint` `--paper` `--rule`) — an independent band
- `.pgp-grid` + `--2` `--3` `--4` `--wide-left` `--wide-right` `--rows`, plus
  `--even` to make cards end level. All collapse to one column below 760px.
- `.pgp-cell` — holds an image, text, or a product card
- `.pgp-prod` — compact product card that works inside a column
- `.pgp-cap` — caption under a cell image

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

## Structure

1. `<h2>` hook — the thing that goes wrong, stated plainly
2. `<h3>` expanding it, then a paragraph on why the internet gets it wrong
3. `.quick-facts` panel
4. Emoji-prefixed `<h2>` sections — 🌾 🥗 🌶️ ⚖️ 🚫 🔍 💊 📅 🔄 🚑
5. **A myth-correction section** — two or three `.vet-tip` boxes naming specific
   wrong advice found online and correcting it with a source
6. Product shop block, grouped by category, each with a "why this brand" intro
7. Emergency/before-you-need-it section where the species warrants one
8. Sample day table
9. `.funfact`
10. Free printable + `.download-card`
11. `details.faq-item` FAQ
12. `.vet-tip` cross-link to a sibling guide
13. `<h2>The Bottom Line</h2>` — the guide compressed to a few numbers

## Voice

- Direct, warm, second person. Short sentences. British-leaning register.
- **Lead with what kills or harms the animal**, and give the number, not the vibe.
- Cite named authorities (PDSA, vet sources) when correcting a myth.
- Be explicit that a supplement is not a treatment and a symptom is not a diagnosis.
- Never invent review counts or ratings.
- Say when a popular product is a bad idea, and why.

## Affiliate links

**Amazon Associates store ID: `petgo2pro-20`.** Live posts use **amzn.to SiteStripe
short links** (e.g. `https://amzn.to/4xYwjTx`), not search URLs. Claude cannot
generate these — write a tagged Amazon search URL as a working placeholder and
flag it for the owner to replace with the SiteStripe link.

Every product card carries, in order: badge → image → name → price range →
`*Price starts from and is subject to change` → reasoning → `cta-btn` →
the OneLink availability note.

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
