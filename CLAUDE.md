# Bizarre Co / Pet GoToPro

Static marketing + content site. No build step, no framework, no package manager —
plain HTML, one shared stylesheet, one shared JS file. Open any `.html` in a browser
and it works.

```
index.html  collectibles.html  pets.html  about.html  contact.html
css/styles.css      shared design system for the whole site
css/blog.css        care-guide / blog layer (loaded AFTER styles.css)
js/main.js          nav, header scroll, cart, animations, smooth scroll
js/blog.js          reading progress, TOC scrollspy, FAQ, checklist, post filter
blog/index.html             care-guide hub
blog/<slug>.html            one file per guide
```

---

# Pet care guide house style

**Every new blog post follows this. It is the format of `blog/axolotl-care-guide.html` —
copy that file as the starting point rather than building from scratch.**

Live reference: <https://pet-gotopro.com/blog/guinea-pig-nutrition-guide>

## Who we write for

Absolute beginners who have not bought the animal yet, or bought it last week and are
worried. Assume zero prior knowledge, never talk down. The reader should be able to set
the animal up correctly having read only this page.

## Voice

- Direct and warm. Second person. Short sentences. Contractions are fine.
- **Lead with the thing that kills the animal.** Every species has one or two — say so
  early and repeat it. (Axolotls: warm water and gravel.)
- Give the number, not the vibe: "60–68°F", not "cool water". Always dual units
  (°F/°C, in/cm, gal/L where useful).
- Be honest about trade-offs and price. Say when something is optional. Say when a
  popular product is a bad idea.
- No hype, no "amazing", no fake urgency, no invented statistics.
- Never fabricate third-party review counts or ratings. Product star ratings are
  **our own editorial score**, labelled "Our score".
- Flag anything that needs a vet. Tell readers to verify local law themselves.

## Required section order

Numbered `<h2>` sections, each with a `.section-lede` one-liner underneath:

1. **<Species> at a Glance** — `.quickfacts` panel + a one-sentence-version callout
2. **What Exactly Is a \<Species\>?** — biology, temperament, notable facts, morphs/varieties
3. **Legality & Where to Buy** — restrictions, green flags / red flags `.dos-donts`
4. **Habitat & Setup** — labelled cross-section diagram + numbered `.steps` legend, sizing, substrate and temperature tables
5. **Water Quality / Environment** — parameter table, plus the "safe for X, lethal for this species" danger callout
6. **Diet & Feeding** — food tier-list table, feeding-schedule-by-age table, technique
7. **Health: Signs, Problems & First Aid** — healthy vs stressed figures, troubleshooting table, treatment protocols
8. **Daily, Weekly & Monthly Care** — maintenance table, handling, growth timeline
9. **What It Actually Costs** — three `.budget-card`s + startup breakdown table
10. **Our Recommended Products** — the money section, see below
11. **Beginner Mistakes to Avoid** — ~10 `.steps` with an ✕ marker
12. **FAQ** — 10–12 questions, mirrored into FAQPage JSON-LD

Then, outside the numbered sections: `.takeaways` → `.author-box` → `.sources`,
then `.related` post grid, newsletter, shared footer.

## The product section

This is why the post exists. Three sub-sections, in this order, each with an `<h3>`:

- **Best \<Species\> Food** (`#picks-food`)
- **Best Supplements & Water Care** (`#picks-supp`)
- **Best Supplies & Habitat Gear** (`#picks-supplies`)

Preceded by `.product-section-nav` jump chips. Followed by a "products to leave on the
shelf" danger callout and the `.checklist` shopping list.

Every sub-section opens with **one `.pick.pick-featured` Editor's Choice** (wide, two-column)
then 4–11 standard `.pick` cards. Aim for ~20+ products total.

Each `.pick` card carries, in order: ribbon → SVG illustration → category → name →
our score → **"why we recommend it" paragraph (3–5 sentences, real reasoning)** →
3–4 `.pick-specs` rows → price range → CTA.

Ribbon classes: `ribbon-best` (gold, Editor's Choice), `ribbon-staple` (purple),
`ribbon-value` (green), `ribbon-vet` (teal, essentials/health).

### Affiliate links — the rule

CTAs point at a **retailer search URL**, never a specific product URL, so a link can
never go dead. Every one is marked:

```html
<a href="https://www.amazon.com/s?k=seachem+prime+water+conditioner"
   class="btn btn-primary btn-sm" target="_blank"
   rel="nofollow sponsored noopener" data-affiliate="pending">
   <i class="fas fa-cart-shopping"></i> Check Price</a>
```

To monetise: `grep -rn 'data-affiliate' blog/`, swap each `href` for the tagged URL,
set the attribute to `"live"`. Keep `rel="nofollow sponsored noopener"`.

The `.affiliate-bar` disclosure sits directly under the hero on every post that has
product links. It is not optional.

## Illustrations

**All artwork is inline SVG. Never hotlink an external image, never use stock photos
of specific products.** Reasons: nothing can 404, no licensing questions, no pretending
an illustration is a photo of a named product, and it renders offline.

Each guide carries a `<symbol>` sprite immediately after `<body>` (two `<svg width="0"
height="0">` blocks: editorial figures, then products). Reuse it by copying from
`blog/axolotl-care-guide.html` — the product symbols (`#p-tank`, `#p-conditioner`,
`#p-testkit`, `#p-sand`, `#p-hide`, `#p-tongs`, `#p-siphon`, `#p-light`, `#p-plants`,
`#p-pellets`, `#p-frozen`, `#p-salt`, `#p-leaves`, `#p-minerals`, `#p-bacteria`,
`#p-worms`, `#p-pouch`, `#p-gel`, `#p-chiller`, `#p-sponge`, `#p-canister`,
`#p-thermometer`, `#p-tub`) are species-agnostic and shared.

Per-species figures to draw fresh: a hero animal, a labelled habitat cross-section, a
recolourable mini silhouette for the morph/variety row, and a healthy-vs-stressed pair.
Product illustrations: 200×160 viewBox, flat style, item centred, brand palette,
soft ellipse shadow at `cy≈146`.

## Design system

Do not introduce new colours or fonts. Everything comes from `css/styles.css` tokens:

| | |
|---|---|
| Primary | `--primary` `#6C2BD9`, `--primary-light` `#8B5CF6`, `--primary-dark` `#5521B5` |
| Accent / Go Pro | `--gold` `#F59E0B` |
| Blog semantics | `--sage` `#0E9F6E` good · `--rose` `#E02424` danger · `--aqua` `#0694A2` info |
| Headings | Playfair Display (`--font-display`) on `h1`, `.prose h2`, `.bc-value` |
| Body / UI | Poppins (`--font-primary`) |
| Icons | Font Awesome 6.5.1 |

Blog components in `css/blog.css`: `.blog-hero` `.affiliate-bar` `.article-layout`
`.toc` / `.toc-mobile` `.prose` `.quickfacts` `.callout` (`-tip -warning -danger -info -pro`)
`.table-wrap`/`.data-table`/`.pill` `.dos-donts` `.steps` `.pick`/`.pick-featured`
`.budget-card` `.checklist` `.faq-item` `.takeaways` `.author-box` `.sources`
`.post-card` `.featured-post` `.filter-chip`.

### Layout gotchas

- Single-column grid tracks must be `minmax(0, 1fr)`, never `1fr` — plain `1fr` lets
  wide tables blow the column past the viewport on phones.
- `.prose` needs `min-width: 0` for the same reason.
- Wide tables always go inside `.table-wrap` (`overflow-x: auto`).
- `html { overflow-x: hidden }` is load-bearing: the off-canvas mobile menu sits at
  `right: -100%`.

## Required per page

- `<title>`, meta description, keywords, author, canonical, OG + Twitter tags
- JSON-LD `@graph` with **Article + BreadcrumbList + FAQPage** (FAQ entries must match
  the visible accordion text)
- `.read-progress` div as the first element in `<body>`
- Breadcrumb: Home › Care Guides › \<Guide\>
- Sidebar `.toc` **and** the `.toc-mobile` `<details>` duplicate — keep both lists in sync
- `../js/main.js` then `../js/blog.js` at the end of `<body>`
- Add the post to `blog/index.html`: the `.post-grid` (with `data-tags`), and promote it
  to `.featured-post` if it's the newest. Add a matching `.filter-chip` if it needs a new category.
- Cross-link 2–3 sibling guides in the `.related` grid.

## Before publishing

```bash
# structure, anchors, symbols, links
python3 - <<'EOF'
import re,html.parser,json,os
f='blog/<slug>.html'; s=open(f).read()
json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',s,re.S).group(1))
syms=set(re.findall(r'<symbol id="([^"]+)"',s)); uses=set(re.findall(r'<use href="#([^"]+)"',s))
ids=set(re.findall(r'\sid="([^"]+)"',s)); frag=set(re.findall(r'href="#([^"]+)"',s))
print('missing symbols',uses-syms,'| broken anchors',frag-ids-syms)
EOF
```

Then eyeball it at 1440px **and 390px**. Check: no horizontal scroll, TOC scrollspy
highlights, FAQ opens, checklist persists across reload, every CTA opens in a new tab.
