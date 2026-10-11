# Writing a guide — the process, and how to do it alongside other sessions

For a Claude Code session asked to write a pet-gotopro guide or post. Two
parts: how a guide actually gets built, and the file discipline that lets
several sessions work at once without standing on each other.

**Read this and `guide-template.html` before writing a word.**

---

# Part 1 — Building a guide

## 0. Pick the slug first. Everything is named after it.

```
SLUG = indoor-cat-setup-guide
```

The slug is the lock. Every file you create is prefixed with it, and that
prefix is what stops two sessions colliding. Choose it before anything else
and do not change it afterwards.

## 1. Do not duplicate a live guide

Guides already published cannot be rewritten. pet-gotopro.com is unreachable
from the sandbox, so **ask the owner** what is live before writing. Rewriting
a published guide wastes the whole session.

## 2. Read the template

`docs/reference/guide-template.html` is the canonical layout, derived from the
two guides the owner confirmed as house style. It is 26 numbered steps with the
hard rules at the top. Match it. `CLAUDE.md` restates the rules; the template
is the shape.

## 3. Get the products

The CJ catalog is the product source. **It lives on the owner's machine**, not
in this repo — `data/cj/pet-products.json` here is an old snapshot and says so.

Ask the owner to export the buckets you need:

```
node inspect.mjs pet-products.json --json costumes.json Costumes
```

A single bucket is small enough to hand over; the full catalog is not.

Then pick products that **match the advice**, not the price list. If the guide
says a cape suits arthritic dogs because it has no leg holes, the cape goes in
the cards. A card that does not illustrate a point in the body text is filler.

## 4. Generate the product HTML — never transcribe a URL

CJ links are 150+ characters. Copying them by hand will eventually corrupt one
and nobody will notice. Write a short script that reads the exported JSON and
emits the `.pgp-prod` blocks and `.kit-item` rows, then splice the output in.
`drafts/sheet-source/` has a worked example.

Use the row's `clickUrl` — CJ's own link — in preference to building one.
Constructed links have been wrong before: UntilGone's feed uses ad id
`15291557` while its storefront link uses `15292997`.

## 5. Photos

Editorial photos are Unsplash, via the Unsplash tools, in the
`images.unsplash.com/photo-…?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400`
form. Three is the usual count: hero, one in-body, one closing. Product card
images come from the feed instead.

## 6. Write it

6,000–7,500 words, to the template, in the house voice. The sections that make
a guide worth reading are the ones with a number in them — the enclosure size,
the box count, the chest girth — and the ones that tell a reader not to buy
something.

## 7. Validate

```
python3 -I docs/reference/check-guide.py drafts/<slug>.cms.html
```

Must print `ALL CHECKS PASS`. If a check fails for a reason that is genuinely
correct in your guide, fix the validator **and say so**, rather than leaving a
failing check — but be sure first. Two validator rules were wrong and both were
only found by a guide failing them legitimately ("greyhound" is not a British
spelling; CJ guides name the merchant in the CTA, not Amazon).

## 8. Render it against the live theme

Passing the validator is not the same as looking right. Build a preview with
the owner's real `theme.js`, in the real DOM shape:

```html
<article class="article"><div class="prose">…fragment…</div></article>
```

Screenshot at **390px** and check `document.documentElement.scrollWidth` equals
`innerWidth`. One unwrapped `table.compare` forces a 390px phone to 664px, and
that shipped live once.

## 9. Printables

Two per guide. `drafts/sheet-source/` builds them from JSON in the house sheet
layout — dark header, two-column card grid, numbered rules panel, green strip,
footer with logo and QR. Name them with the slug prefix.

Free guides are **images, not PDFs**, and the thumbnail is the download — there
is no separate thumbnail file and no `.dl-btn`.

## 10. Hand over

Three files beside the guide:

| File | What it is |
|---|---|
| `drafts/<slug>.cms.html` | the paste-ready fragment |
| `drafts/<slug>.todo.txt` | what the owner still has to do, and any decision you made for them |
| `drafts/<slug>.guides.sql` | registers the printables, media ids left blank |

The todo is not a formality. It is where you record the calls you made, the
things you could not verify, and anything you got wrong earlier in the session.

---

# Part 2 — Not colliding with other sessions

Several sessions may be writing guides at once. Collisions come from four
places: git, shared repo files, the live Worker source, and the database.

## Rule 1 — one guide, one branch

```
git checkout -b claude/guide-<slug>
```

Never share a branch with another guide. Rebase before pushing:

```
git fetch origin && git rebase origin/<default-branch>
```

## Rule 2 — you own only what carries your slug

**Yours, exclusively:**

```
drafts/<slug>.cms.html
drafts/<slug>.todo.txt
drafts/<slug>.guides.sql
drafts/<slug>-*.png
drafts/sheet-source/<slug>-*.json
```

Prefix the printables with the slug too. `care-sheet.png` is a collision
waiting to happen; `indoor-cat-care-sheet.png` is not. (The two existing guides
predate this rule — their printables are specific enough to be unique, so they
were left alone rather than renamed and breaking their SQL.)

**Shared — do not edit without saying so in your commit message and telling
the owner:**

```
CLAUDE.md
docs/reference/guide-template.html
docs/reference/check-guide.py
docs/reference/writing-a-guide.md
tools/cj/*
data/cj/*
```

If you must change a shared file, make it a **separate commit** that touches
nothing else, so it rebases cleanly and can be reverted on its own.

**Never touch:**

```
live-posts/          captured copies of what is live
petgotopro-live/     the stale remains of an old snapshot
```

## Rule 3 — the live Worker source is not in this repo

`admin.js`, `public.js`, `theme.js`, `util.js`, `shop.js`, `index.js` and
`ai.js` live only on the owner's machine. The copies that used to be here went
stale and caused two incidents, including one where a pasted file broke their
build.

To change the live site: **ask for the current file**, edit that, send it back.
Never work from memory, never from this repo, and never commit those files —
the repo is public.

Only one session should hold a given source file at a time. If another session
is already editing `theme.js`, wait.

## Rule 4 — the database is last-write-wins

Posts live in Cloudflare D1, pasted through the admin. Two sessions cannot
edit the same post; the second paste silently wins.

- One guide = one new post. Never edit a post another session is working on.
- `guides` table `sort` values collide. Pick a high unused number and tell the
  owner it may need adjusting rather than assuming a free slot.
- Media ids are only known after upload, so leave them as
  `<FIT_MEDIA_ID>`-style placeholders in your SQL. Never guess one.

## Rule 5 — write down what you could not verify

The sandbox cannot reach pet-gotopro.com, cj.com, or any product image CDN. So
you cannot confirm a live guide's existence, a CJ click, or that an image
loads. Say so in the todo. A later session reading "verified" when nothing was
verified is worse than no note at all.

---

## The five mistakes that cost the most time

1. **Working from this repo's copy of the live site.** It was stale by 400+
   lines. Ask for the file.
2. **Transcribing affiliate URLs by hand.** Generate them.
3. **Trusting counts over titles.** Twenty albums by the band *American
   Aquarium* and twenty aquarium filters look identical in a tally. Always
   print a sample.
4. **A word that satisfies two tests at once.** `aquarium` was in both the
   animal list and the equipment list, so one word passed as both.
5. **Claiming something was verified when the sandbox could not reach it.**
