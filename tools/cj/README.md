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
| `title` | 12 | animal word **and** a pet-thing word, no usable category |
| `book` | 9 | `Media > Books`, animal word **and** a care/training word |

### Why the obvious filter does not work

Matching "pet" anywhere in the description admits an **electric fireplace**
("safe for kids, pets, and the elderly"). Matching the title admits **area rugs**
("Kid and Pet Friendly"). So `NOT_PET` drops the suitability phrasings and `JUNK`
drops decor, apparel, DVDs and CDs that merely carry a pet word.

An animal word on its own is still not enough. FYE is an entertainment retailer:
49 of the 50 products it first matched were Doja Cat, Pet Shop Boys, Stray Cats,
Pet Sematary and Slaughter Beach Dog. The survivor is a rope dog toy. So a title
match now also needs a `PET_THING` word — something an animal actually uses —
and a book match needs a `BOOK_TOPIC` word, which keeps *Complete Cat Care
Manual* and drops cat manga.

That took the catalog from 940 to 704. Everything removed was checked: the only
non-duplicate losses were a kids' excavator, a garden fountain, a rocking horse
and a novel by an author named Cat Adams.

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

## 4. Tracked links — ask CJ, do not build them

**Do not hand-build the wrapper.** This form looks right and is widely repeated:

```
https://www.anrdoezrs.net/links/<PID>/type/dlg/<destination>
```

It was tried with the real Website ID, both URL-encoded and raw, and returns
`ERR_TOO_MANY_REDIRECTS`. The documented programmatic form is
`anrdoezrs.net/click-<PID>-<AID>?url=...`, which needs a per-advertiser link ID
(AID) the product feed never returns.

So `fetch.mjs` asks CJ for the link instead. The product schema exposes
`linkCode(pid:)` returning a `clickUrl`, which is CJ's own correctly-formed
tracked link for that exact product. The script introspects the field and
argument names rather than assuming them, and skips the field with a warning if
a schema does not have it.

```
set CJ_TOKEN=your_personal_access_token
set CJ_CID=your_cj_company_id
set CJ_PID=5930903
node tools/cj/fetch.mjs
```

`100786792` is the **CJ tracking PID**. Read it off any link CJ generates, which
has the shape `click-<PID>-<AID>`. Three different numbers are in play and only
this one belongs in a link:

| Number | What it is | Where it comes from |
|---|---|---|
| `6386969` | company ID | pairs with the API token — kept out of this repo |
| `5930903` | Website ID under Account | **not** the tracking PID; links built with it fail |
| `100786792` | tracking PID | the first number in a CJ-generated `click-PID-AID` link |

The PID is fine in this public repo because it appears in every affiliate link on
the live site anyway.

The second number, the **AID**, is a per-advertiser link ID — `13998414` is
Aosom.com. It is not in the product feed, which is the whole reason links cannot
be constructed from feed data alone. A full manual link looks like:

```
https://www.tkqlhce.com/click-100786792-13998414?url=<encoded>&cjsku=D10-056
```

CJ rotates the redirect domain (`tkqlhce.com`, `dpbolvw.net`, `anrdoezrs.net`,
`jdoqocy.com`, `kqzyfj.com`); they are equivalent.

### Collecting AIDs by hand

One AID per advertiser is enough for every product that advertiser sells, so in
practice this is five copy-pastes, not 940. In CJ: open the advertiser, go to
Links, pick any link, copy the generated code, and read the second number out of
`click-<PID>-<AID>`. They go in the `AIDS` map in `make_catalog.py`.

| Advertiser | ID | AID | SKU lives in | Products |
|---|---|---|---|---|
| Aosom.com | 5360120 | `13998414` | `~D10-056.html` | 436 |
| Raw Paws Pet Food | 7127091 | `17234724` | not in the URL | 165 |
| UntilGone | 6185946 | `15292997` | `?sku=` | 92 |
| Books-A-Million | 129899 | `13599892` | last path segment | 10 |
| FYE | 6446547 | `15513660` | `_aec-cen583029-2` | 1 |

All five collected, so **704 of 704 products are tracked** and the API route is
no longer needed. Raw Paws puts no SKU in its URLs, so its links carry no
`cjsku` — CJ will report earnings against the advertiser rather than the
product. Everything still works; the reporting is just coarser.

CJ rotates the redirect domain and the owner's three links came back on three
different ones, so `make_catalog.py` picks `tkqlhce.com` for all of them. They
are interchangeable.

`cjsku` is optional but worth setting, because it is what makes CJ's reports
show which product earned. Aosom puts the SKU in the URL as `~D10-056.html`, so
`make_catalog.py` lifts it from there; other advertisers may need their own rule
or none at all.

Asking the API for `clickUrl` gets all five at once, and remains the better
route for any advertiser added later.

The run prints how many products came back with a `clickUrl`. `classify.py` and
`make_catalog.py` carry it through, and a product without one falls back to the
plain merchant URL and is counted in a warning banner on the catalog page.

Links are written `rel="nofollow noopener sponsored"`.

### Still unverified

Nobody has clicked a `clickUrl` yet. Two things to confirm on the first run:
that it lands on the right product page rather than the advertiser's homepage,
and that the click shows up in CJ -> Reports -> Clicks within the hour. Deep
linking also has to be enabled per advertiser, so check one product from each of
the five before any of these links ship in a guide.

## Note on the two affiliate programs

These are **CJ** links and are separate from the Amazon Associates store ID
`petgo2pro-20` used elsewhere on the site. A guide can carry both.
