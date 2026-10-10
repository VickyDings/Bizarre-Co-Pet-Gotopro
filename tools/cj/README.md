# CJ Affiliate pet-product pipeline

Turns the CJ product feed into a filtered, de-duplicated pet catalog we can build
guides from. Three steps, each a separate file so one can be re-run alone.

```
fetch.mjs  ->  cj.json  ->  classify.py  ->  data/cj/pet-products.json
                                          -> make_catalog.py -> data/cj/catalog.html
```

## 1. Fetch (needs your CJ credentials, so it runs on your machine)

```
set CJ_TOKEN=your_personal_access_token
set CJ_CID=your_cj_company_id
node tools/cj/fetch.mjs
```

Writes `cj.json`. **That raw feed is deliberately not committed** — it is ~1.8 MB,
it goes stale within days, and this repo is public. Re-fetch instead of storing it.

Advertisers currently pulled (Beckett excluded, per the owner):
Aosom.com, Raw Paws Pet Food, UntilGone, Books-A-Million, 2nd & Charles, FYE.

## 2. Classify

```
python3 -I tools/cj/classify.py cj.json data/cj/pet-products.json
```

1,687 raw products -> **940 pet products**. Four signals, in confidence order:

| Signal | Count | What it is |
|---|---|---|
| `category` | 518 | Google product category starts `Animals & Pet Supplies` |
| `advertiser` | 165 | Raw Paws Pet Food — every line is pet food |
| `book` | 136 | `Media > Books` with a pet word in the title |
| `title` | 121 | pet word in the title, no usable category |

### Why the obvious filter does not work

Matching "pet" anywhere in the description admits an **electric fireplace**
("safe for kids, pets, and the elderly"). Matching the title admits **area rugs**
("Kid and Pet Friendly"). So `NOT_PET` drops the suitability phrasings and `JUNK`
drops decor, apparel, DVDs and CDs that merely carry a pet word.

### Why species routing runs audience-first

Raw Paws sells `Chicken Necks for Dogs`. A plain keyword pass files that under
poultry. The `AUDIENCE` pass reads the trailing "for <species>" phrase first,
which is authoritative, and only then falls back to keywords.

A product can serve more than one species. `species` is the primary bucket;
`serves` lists all of them, so a "for Dogs & Cats" treat appears in both guides.

Variants are collapsed on `(advertiserId, normalized title)` — Aosom lists the
same cage in six colors.

## 3. Build the browsable catalog

```
python3 -I tools/cj/make_catalog.py data/cj/pet-products.json data/cj/catalog.html
```

Open `data/cj/catalog.html` to browse all 940 grouped by species.

## 4. Tracked links

The feed returns the merchant's own URL (`www.aosom.com/item/...`), which pays no
commission. The tracked form is CJ's automated deep link:

```
https://www.anrdoezrs.net/links/5930903/type/dlg/<url-encoded destination>
```

`5930903` is the **CJ Website ID (PID)** for pet-gotopro.com — not the company
ID, which is a different number and stays out of this repo. The PID is safe here
because it appears in every affiliate link on the live site anyway. The API does
not return it; it is read off CJ -> Account -> Websites.

Pass it as the third argument and all 940 links are rewritten:

```
python3 -I tools/cj/make_catalog.py data/cj/pet-products.json data/cj/catalog.html 5930903
```

Without it the catalog falls back to raw URLs and prints a warning banner.

### Unverified: encoded vs raw destination, per advertiser

CJ accepts the destination appended either URL-encoded or plain. We encode,
because most of these URLs carry query strings (`?sku=`, `?variant=`,
`?utm_source=cj`) whose `?` and `&` would otherwise be read as the wrapper's own
parameters. **This has not been click-tested.** Separately, `type/dlg` only
deep-links for advertisers who have enabled automated deep linking — for the
others it lands on the homepage and a per-product link from CJ's link search is
needed instead.

`data/cj/link-test.html` pins this down: both forms plus an untracked control for
each of the five advertisers, with the steps to read the result. Worth doing once
before any of these links ship in a guide.

Links are written `rel="nofollow noopener sponsored"`.

## Note on the two affiliate programs

These are **CJ** links and are separate from the Amazon Associates store ID
`petgo2pro-20` used elsewhere on the site. A guide can carry both.
