# Blog post — Parakeet (Budgie) Care Guide & Cage Setup

Paste `post-parakeet-care-guide.html` into **Blog Posts → New → raw HTML body**,
then fill the fields below.

| Field | Value |
|---|---|
| **Title** | Parakeet Care Guide: Cage Setup, Diet and the Mistakes That Shorten Lives |
| **Slug** | `parakeet-care-guide-cage-setup` |
| **Category** | Birds |
| **Description** | Vet-informed parakeet care: correct cage size and bar spacing, why an all-seed diet kills budgies early, the household fumes that are fatal within minutes, and a two-week taming plan. |
| **Keywords** | parakeet care guide, budgie care, parakeet cage setup, parakeet cage size, budgie bar spacing, what to feed a parakeet, how long do parakeets live, taming a budgie |
| **Fun facts** | 8, numbered, in the house style |
| **Care sheet** | `parakeet-quick-care-sheet.png` — upload and swap the media id |
| **Hero image** | `https://images.unsplash.com/photo-1470662061953-318cd8c6c152?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=1600&h=900` |

## The downloadable care sheet

`parakeet-quick-care-sheet.png` (2000 × 2836) is ready to upload.

1. **Admin → Media → Upload** the PNG, and note the media id it returns.
2. In the post body, replace all **three** occurrences of
   `PARAKEET_SHEET_MEDIA_ID` with that number. They are the inline figure,
   the download-card thumbnail, and the download button.
3. Optionally add it to **Free Guides** as well — the `guides` table takes a
   `media_id`, so it will appear on that page alongside the gecko and cat
   sheets.

`care-sheet-template.html` is the source. Re-render it in a browser to get
the sheet in the real brand fonts (this PNG fell back to system fonts because
Google Fonts is unreachable from the build container), and reuse it as the
template for every future species — swap the header text and the six cards.

## Notes

- **No `<style>` block and no `:root`.** Built entirely from the theme's own
  component classes, so it cannot fight the site palette.
- **Do not add an affiliate disclosure.** `public.js` detects "amazon." in the
  body and inserts one automatically, and `applyAmazonTag()` appends your
  associate tag to every Amazon link at render time — so the links here are
  deliberately plain, untagged search URLs.
- Amazon links point at **search results, not specific ASINs**, so they cannot
  rot when a product goes out of stock. Swap in specific products once you know
  which ones you want to stand behind.
- Photos are Unsplash CDN URLs, credited in each figure caption:
  Dalton Touchberry, imagoloco, William Warby, Guillaume Coué.

## Internal links worth adding after publishing

- From the Birds category page to this guide
- From this guide to a future "budgie diet conversion" post
- From the Free Guides page, if you make a printable version
