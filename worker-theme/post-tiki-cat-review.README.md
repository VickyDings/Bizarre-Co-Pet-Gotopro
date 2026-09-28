# Blog post — Tiki Cat Review

Paste `post-tiki-cat-review.html` into **Blog Posts → New → `</>` HTML**, then
fill the fields below.

| Field | Value |
|---|---|
| **Title** | Tiki Cat Review 2026: Every Line Decoded, and What It Really Costs to Feed |
| **Slug** | `tiki-cat-review` |
| **Category** | Cats |
| **Description** | An honest Tiki Cat review: all eight lines explained, the calorie arithmetic that decides whether you can afford it, which products are meals and which are treats, and the ten worth buying. |
| **Keywords** | tiki cat review, tiki cat food, tiki cat after dark, tiki cat luau, is tiki cat good, tiki cat calories per can, best tiki cat flavor, tiki cat vs, tiki cat complete and balanced |
| **Hero image** | Upload one of your own product shots, or the cat-and-bowl photo already at the top of the article |

## Before you publish

**1. The ten product photos.** Each product card has an empty well that reads
*"Drop your product photo here"*. Put the cursor in the well and use the editor's
🖼️ Image button. Photos belong **in the wells** — do not paste them into the
article body instead, and do not send them to me: the wells are the one place a
product shot survives a future re-paste of the article.

The ten, in order: After Dark Chicken &amp; Duck · Born Carnivore Chicken &amp;
Egg · Luau Succulent Chicken · Velvet Mousse Variety · Silver Variety · Baby
Chicken &amp; Egg · Friends Tuna &amp; Pumpkin Mousse · Grill Variety · Luau Lean
Gelée · Stix.

**2. The care sheet.** Upload `tiki-cat-line-chooser.png` (2000 × 3216) through
the media library, then run `register-tiki-guide.bat`. That puts it on
`/free-guides` and makes the download card in the article work. The card already
points at the permanent names `/img/tiki-cat-line-chooser.png` and
`/download/tiki-cat-line-chooser.png`, so it will not break the next time the
article body is replaced.

## What is checked

- US English, `scan-uk.py` clean, including alt text
- 7,521 words · 8 fun facts · 10 product cards · 10 FAQ entries
- 14 photos in the article body, **none** inside a product well
- Every Amazon link is a search URL with `tag=petgo2pro-20` — no guessed ASINs
- `layout-check.mjs` clean at 900px and 390px
- No `<style>` block, no second `<h1>`, HTML well formed

## Facts worth knowing before you edit

- Tiki was acquired by **General Mills in November 2024** (reported at $1.45bn).
  Same owner as Blue Buffalo. The article says so, and says why it matters.
- **Stix are a treat**, labeled for intermittent or supplemental feeding only.
  Every other wet line is complete and balanced. That distinction is the safety
  point of the whole article — please do not soften it.
- Made in **Thailand**; **no recalls** in the brand's history.
- Prices and formulations move. Everything is given as a range with the
  *price starts from* line, so it ages gracefully, but re-check before a push.
