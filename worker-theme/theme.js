// ——— Public site theme: shared CSS + layout ———
import { esc, PET_CATEGORIES } from './util.js';

// Image sizing / alignment / frame classes — shared by the public site AND the admin editor
// so what you see while editing is what visitors get.
export const IMAGE_CSS = `
.pgp-img{max-width:100%;height:auto}
.img-sm{width:30%}
.img-md{width:50%}
.img-lg{width:75%}
.img-full{width:100%}
.img-center{display:block;margin-left:auto;margin-right:auto;float:none}
.img-left{float:left;margin:6px 26px 16px 0;clear:left}
.img-right{float:right;margin:6px 0 16px 26px;clear:right}
.img-frame{border:8px solid #fff;box-shadow:0 4px 18px rgba(21,17,28,.18);border-radius:6px;background:#fff}
.img-frame-warm{border:8px solid #F1EDF7;box-shadow:0 4px 18px rgba(21,17,28,.14);border-radius:6px;outline:1px solid #E5E0EE;outline-offset:-8px}
figure.pgp-figure{margin:26px 0}
figure.pgp-figure.img-left{float:left;margin:6px 26px 16px 0;clear:left}
figure.pgp-figure.img-right{float:right;margin:6px 0 16px 26px;clear:right}
figure.pgp-figure.img-center{margin-left:auto;margin-right:auto;float:none}
figure.pgp-figure img{width:100%;margin:0}
figure.pgp-figure figcaption{font-size:13.5px;color:#514860;font-style:italic;text-align:center;margin-top:9px;line-height:1.5}
.clearfix-row{clear:both}
@media(max-width:640px){
  .img-sm,.img-md,.img-lg,.img-left,.img-right,figure.pgp-figure.img-left,figure.pgp-figure.img-right{width:100%;float:none;margin-left:0;margin-right:0}
}
`;

// Section / column layouts — shared by the public site AND the admin editor.
// `display:flow-root` is the important bit: it gives every section its own
// block formatting context, so a floated image inside one section can never
// bleed into the next one. That is what makes an inserted section behave as an
// independent band instead of being absorbed by the block above it.
export const SECTION_CSS = `
.pgp-section{display:flow-root;clear:both;margin:34px 0;border-radius:12px}
.pgp-section>*:first-child{margin-top:0}
.pgp-section>*:last-child{margin-bottom:0}
.pgp-section--cream{background:#FBFAFD;padding:26px 28px}
.pgp-section--tint{background:#F1EDF7;padding:26px 28px}
.pgp-section--paper{background:#fff;border:1px solid #E5E0EE;padding:26px 28px;box-shadow:0 2px 10px rgba(21,17,28,.06)}
.pgp-section--rule{border-top:1px solid #E5E0EE;padding-top:28px;border-radius:0}
.pgp-section--ink{background:#15111C;color:#FBFAFD;padding:28px 30px}
.pgp-section--ink h2,.pgp-section--ink h3,.pgp-section--ink h4{color:#fff}
.pgp-section--ink p,.pgp-section--ink li{color:#C0B6CE}

/* These are scoped through .pgp-section on purpose. PUBLIC_CSS defines
   .prose h2 / h3 / p / img later in the sheet, and at equal specificity the
   later rule wins — so a bare .pgp-sec-title would be overruled inside an
   article and pick up a 48px heading margin it should not have. Two classes
   beat one class plus an element. */
.pgp-section .pgp-sec-title{font-family:'Instrument Serif',Georgia,serif;font-size:22px;font-weight:700;margin:0 0 4px;line-height:1.25}
.pgp-section .pgp-sec-sub{font-size:14.5px;color:#6E6480;margin:0 0 18px;line-height:1.55}

/* Grid tracks are minmax(0,1fr), never plain 1fr — plain 1fr resolves to
   min-content and lets a wide table or product card push the column past the
   viewport on phones. */
.pgp-grid{display:grid;gap:24px;align-items:start}
.pgp-grid>*{min-width:0}
/* Column widths are read from --pgp-cols so a dragged-to-size layout can be
   stored as a custom property rather than an inline grid-template-columns.
   An inline style would outrank the phone media queries below and stop the
   columns collapsing; a custom property leaves those rules in charge. */
.pgp-grid--2{grid-template-columns:var(--pgp-cols,repeat(2,minmax(0,1fr)))}
.pgp-grid--3{grid-template-columns:var(--pgp-cols,repeat(3,minmax(0,1fr)))}
.pgp-grid--4{grid-template-columns:var(--pgp-cols,repeat(4,minmax(0,1fr)))}
.pgp-grid--wide-left{grid-template-columns:var(--pgp-cols,minmax(0,2fr) minmax(0,1fr))}
.pgp-grid--wide-right{grid-template-columns:var(--pgp-cols,minmax(0,1fr) minmax(0,2fr))}
.pgp-grid--rows{grid-template-columns:minmax(0,1fr);gap:18px}
.pgp-grid--even{align-items:stretch}
/* Product cards should always end level, whether or not --even was asked for */
.pgp-grid:has(.pgp-prod){align-items:stretch}
.pgp-grid--even>.pgp-cell{display:flex;flex-direction:column}
.pgp-grid--tight{gap:14px}

.pgp-cell{min-width:0}
.pgp-cell>*:first-child{margin-top:0}
.pgp-cell>*:last-child{margin-bottom:0}
.pgp-section .pgp-cell img,.pgp-grid .pgp-cell img{max-width:100%;height:auto;display:block;border-radius:10px;margin:0;box-shadow:none}
.pgp-section .pgp-cell h3,.pgp-grid .pgp-cell h3{font-family:'Instrument Serif',Georgia,serif;font-size:19px;margin:0 0 8px;line-height:1.3}
.pgp-section .pgp-cell h4,.pgp-grid .pgp-cell h4{font-family:'Instrument Serif',Georgia,serif;font-size:16px;margin:0 0 6px}
.pgp-section .pgp-cell p,.pgp-grid .pgp-cell p{font-size:15.5px;line-height:1.65;margin:0 0 12px}
.pgp-section .pgp-cell p:last-child,.pgp-grid .pgp-cell p:last-child{margin-bottom:0}
.pgp-section .pgp-cell ul,.pgp-grid .pgp-cell ul{margin:0 0 12px 22px}
.pgp-section .pgp-cell li,.pgp-grid .pgp-cell li{font-size:15.5px;line-height:1.6;margin-bottom:7px}
/* This half of the stylesheet is the half the ADMIN EDITOR loads - admin.js
   imports IMAGE_CSS and SECTION_CSS and never PUBLIC_CSS. So an unfilled photo
   well is dressed as a drop target here, and the rule that hides it from a
   reader lives in the public-only block instead. It used to be the other way
   round by accident: ".pgp-cell-ph{display:none}" sat in this shared half with
   a comment saying placeholders "only show in the admin editor", which they
   never did - the owner had no target to click on a .pgp-prod card at all. */
.pgp-cell-ph{display:flex;width:100%;height:100%;align-items:center;justify-content:center;
  text-align:center;color:var(--amber);font-size:13px;font-style:italic;padding:14px;
  border:2px dashed #E5E0EE;border-radius:8px;line-height:1.45}
.pgp-cell:not(:has(img))>.pgp-cap{display:none}
/* An EMPTY well is a short strip, not a square. The well is aspect-ratio:1 so a
   filled one stays square, but a guide with a nine-card shopping list would
   otherwise show the owner twelve empty squares to scroll past in the editor.
   Two classes deep again, for the same reason as the collapse rule - the base
   ".pgp-prod .pgp-prod-img" would win a one-class override. */
.pgp-prod .pgp-prod-img:not(:has(img)){aspect-ratio:auto;min-height:96px;padding:10px}
.pgp-section .pgp-cap,.pgp-grid .pgp-cap{display:block;font-size:13px;color:#6E6480;font-style:italic;text-align:center;margin-top:9px;line-height:1.5}

/* Compact product card — the full .product card is too wide for a column */
.pgp-cell:has(>.pgp-prod){display:flex;flex-direction:column}
.pgp-cell>.pgp-prod{flex:1 1 auto;min-height:0}
.pgp-prod{background:#fff;border:1px solid #E5E0EE;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(21,17,28,.06);display:flex;flex-direction:column;height:auto}
.pgp-prod .pgp-prod-badge{background:#15111C;color:#FBFAFD;font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:8px 14px;text-align:center}
.pgp-prod .pgp-prod-badge.pick{background:#2C7A57}
/* Retail packshots are boxes and bottles photographed on white. object-fit
   contain on a white well shows the whole product; cover would crop the
   label off. NOTE: no backticks in here — this string is a template literal. */
.pgp-prod .pgp-prod-img{aspect-ratio:1;background:#fff;border-bottom:1px solid #E5E0EE;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:14px}
.pgp-prod .pgp-prod-img img{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;border-radius:0;margin:0}
.pgp-prod .pgp-prod-body{padding:16px 18px;display:flex;flex-direction:column;flex:1}
.pgp-prod .pgp-prod-name{font-family:'Instrument Serif',Georgia,serif;font-size:17px;font-weight:700;line-height:1.3;margin:0 0 6px;color:#15111C}
.pgp-prod .pgp-prod-price{font-size:18px;font-weight:700;color:#2C7A57;margin:0 0 2px}
.pgp-prod .pgp-prod-disc{font-size:11px;color:#6E6480;font-style:italic;margin:0 0 10px;line-height:1.4}
.pgp-prod .pgp-prod-why{font-size:14px;color:#514860;line-height:1.55;margin:0 0 14px;flex:1}
.pgp-prod .cta-btn{width:100%;text-align:center;padding:10px 14px;font-size:14px}
/* Buttons line up across a row of product cards. .pgp-grid is align-items:start,
   so each cell is its own natural height and the CTAs came out at three
   different heights in a three-across row. Scoped with :has so only a grid that
   actually holds product cards stretches - the two-up explainer sections keep
   their start alignment. The card is already a flex column, so the button only
   needs margin-top:auto to sit on the floor of it. */
.pgp-grid:has(.pgp-prod){align-items:stretch}
.pgp-prod .cta-btn{margin-top:auto}
.pgp-prod .pgp-prod-note{font-size:11px;color:#6E6480;font-style:italic;margin:9px 0 0;line-height:1.45}

/* Three and four columns get too narrow to read well before the phone
   breakpoint, so they drop to two on the way down. */
@media(max-width:980px){
  .pgp-grid--3,.pgp-grid--4{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:760px){
  .pgp-grid--2,.pgp-grid--3,.pgp-grid--4,.pgp-grid--wide-left,.pgp-grid--wide-right{grid-template-columns:minmax(0,1fr)}
  .pgp-grid{gap:20px}
  .pgp-section--cream,.pgp-section--tint,.pgp-section--paper,.pgp-section--ink{padding:20px 18px}
}
`;

export const PUBLIC_CSS = IMAGE_CSS + SECTION_CSS + `
:root {
  /* Token ROLES are unchanged from the warm theme — --ink is still the dark
     value, --cream still the light one — so every existing rule keeps working.
     Only the hues move: brown/amber out, plum/magenta in. */
  --ink:#15111C; --ink-soft:#514860; --cream:#FBFAFD; --cream-deep:#F1EDF7;
  --amber:#FF3D96; --amber-deep:#C42A6E; --clay:#C63B52; --forest:#2C7A57; --moss:#4E9E76;
  --line:#E5E0EE; --line-soft:#F0ECF6;
  --shadow-soft:0 2px 10px rgba(21,17,28,.07); --shadow-med:0 8px 24px rgba(21,17,28,.11);

  /* The dark shell the page sits on */
  --page:#15111C; --page-2:#1E1927; --page-3:#292234;
  --on-dark:#F4F0F7; --on-dark-dim:#B5ABC0; --on-dark-faint:#8B8098;
  --hair:rgba(244,240,247,.10);
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Manrope',ui-sans-serif,system-ui,'Segoe UI',sans-serif;background:var(--cream);color:var(--ink);line-height:1.7;font-size:17px;-webkit-font-smoothing:antialiased}
img{max-width:100%;height:auto;display:block}
a{color:var(--amber-deep)}

/* Header */
.brand-bar{background:var(--ink);color:var(--cream);padding:14px 0;border-bottom:3px solid var(--amber)}
.brand-bar-inner{max-width:1100px;margin:0 auto;padding:0 24px;display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.brand-link{display:flex;align-items:center;gap:14px;text-decoration:none;color:var(--cream)}
.brand-logo{width:52px;height:52px;border-radius:12px;background:var(--cream);padding:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;overflow:hidden}
.brand-logo img{width:100%;height:100%;object-fit:contain}
.brand-name{font-family:'Instrument Serif',Georgia,serif;font-size:22px;font-weight:700;letter-spacing:-.01em}
.brand-tag{font-size:12px;color:var(--amber);font-style:italic;margin-top:2px}
.site-nav{margin-left:auto;display:flex;gap:4px;flex-wrap:wrap;align-items:center}
.site-nav a{color:var(--cream);text-decoration:none;font-size:14px;font-weight:600;padding:8px 12px;border-radius:6px;letter-spacing:.03em}
.site-nav a:hover{background:rgba(255,61,150,.22);color:#fff}
.nav-links{display:flex;gap:4px;flex-wrap:wrap;align-items:center}

/* Navigation: a row of links on a desktop, one button on a phone.

   The row is the owner's own menu items plus a Pets dropdown the theme fills
   from the shared category list. Listing every animal flat would be a
   fifteen-item nav wrapping three rows deep, which is what "tidy it up" meant.

   Two things keep it working with scripting off. The dropdown opens on hover
   AND on focus-within, so a keyboard reaches it with no JS at all -- and note
   the order matters: focus-within makes the panel visible before Tab moves
   into it, because a visibility:hidden link cannot take focus. And the
   collapsing phone panel is only armed once the has-js class is on the html
   element, so with no JS the nav stays the plain visible row it always was
   rather than a button that does nothing. */
.nav-toggle{display:none;align-items:center;gap:9px;background:transparent;color:var(--cream);
  border:1px solid rgba(244,240,247,.26);border-radius:9px;padding:9px 15px;font:inherit;
  font-size:14px;font-weight:600;letter-spacing:.03em;cursor:pointer}
.nav-toggle:hover{background:rgba(255,61,150,.22);border-color:var(--amber)}
.nav-bars{display:block;position:relative;width:16px;height:12px;flex-shrink:0}
.nav-bars::before,.nav-bars::after,.nav-bars i{content:'';position:absolute;left:0;right:0;
  height:2px;background:currentColor;border-radius:2px}
.nav-bars::before{top:0}
.nav-bars i{top:5px}
.nav-bars::after{bottom:0}

.nav-drop{position:relative}
.nav-drop-btn{display:flex;align-items:center;gap:6px;background:transparent;color:var(--cream);
  border:0;border-radius:6px;padding:8px 12px;font:inherit;font-size:14px;font-weight:600;
  letter-spacing:.03em;cursor:pointer}
.nav-drop-btn:hover{background:rgba(255,61,150,.22);color:#fff}
.nav-drop-btn .caret{font-size:10px;line-height:1;transition:transform .18s}
/* Anchored by its right edge, not its left. The nav sits hard against the
   right of the header (margin-left:auto), so a panel opening rightwards from
   the button ran 26px past the viewport and put a horizontal scrollbar on
   every page of the site -- and it did it while still closed, because
   visibility:hidden hides an element without taking it out of the scrollable
   overflow its containing block reports. */
.nav-drop-menu{position:absolute;top:calc(100% + 9px);right:0;z-index:60;min-width:212px;
  background:var(--page-2);border:1px solid var(--hair);border-radius:12px;padding:8px;
  box-shadow:0 18px 44px rgba(0,0,0,.46);display:grid;gap:2px;
  opacity:0;visibility:hidden;transform:translateY(-6px);
  transition:opacity .16s,transform .16s,visibility .16s}
.nav-drop:hover .nav-drop-menu,.nav-drop:focus-within .nav-drop-menu,
.nav-drop.open .nav-drop-menu{opacity:1;visibility:visible;transform:none}
.nav-drop:hover .nav-drop-btn .caret,.nav-drop.open .nav-drop-btn .caret{transform:rotate(180deg)}
.site-nav .nav-drop-menu a{display:flex;align-items:center;gap:11px;padding:9px 12px;
  border-radius:8px;font-size:14px;white-space:nowrap;color:var(--on-dark)}
.site-nav .nav-drop-menu a:hover{background:rgba(255,61,150,.22);color:#fff}
.nav-drop-menu .d-emoji{width:22px;flex-shrink:0;font-size:17px;line-height:1;text-align:center}

/* Hero */
/* Hero. Three layers: the section paints a gradient, the photo covers it, the
   scrim darkens the photo, and the words sit on top.

   The photo is a real img and not a CSS background so it can carry
   fetchpriority and width/height -- it is the biggest thing on the page and so
   the one Google times the load against, and a background-image cannot be
   prioritised or sized. The scrim is its own element rather than a gradient on
   the section because the section's gradient has to stay reachable underneath
   as the fallback for a photo that never arrives. */
.home-hero{position:relative;background:linear-gradient(135deg,#2A2140 0%,var(--ink) 100%);color:var(--cream);padding:64px 24px;text-align:center}
.home-hero--photo{overflow:hidden}
.hero-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 38%}
.hero-scrim{position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(24,15,38,.90) 0%,rgba(24,15,38,.72) 46%,rgba(24,15,38,.89) 100%)}
.hero-inner{position:relative;max-width:820px;margin:0 auto}
.home-hero h1{font-family:'Instrument Serif',Georgia,serif;font-size:clamp(30px,5vw,46px);line-height:1.15;max-width:760px;margin:0 auto 16px}
.home-hero p{font-size:18px;font-style:italic;color:#C0B6CE;max-width:620px;margin:0 auto}
.home-hero .hero-cta{display:inline-block;margin-top:26px;background:var(--amber);color:#fff;padding:13px 30px;border-radius:6px;text-decoration:none;font-weight:700}
.home-hero .hero-cta:hover{background:var(--amber-deep)}

/* Layout */
.container{max-width:1100px;margin:0 auto;padding:0 24px}
.section-title{font-family:'Instrument Serif',Georgia,serif;font-size:28px;font-weight:700;margin:52px 0 8px}
.section-sub{color:var(--ink-soft);font-size:15px;margin-bottom:24px}
/* The first heading under the hero sat a full 52px down, which reads as a gap
   rather than as breathing room. Later headings keep the 52px: they are
   separating one movement of the page from the next and need it. */
.home-hero + .container > .section-title:first-child{margin-top:26px}

/* Category tiles */
/* 210px, not 160px, because there are seven categories: at 160px the row fits
   six and leaves Invertebrates stranded on a line of its own, which reads as a
   mistake. At 210px the grid breaks 4 and 3, which reads as a decision -- and
   the tiles are half as wide again, which a photo tile wants. */
.cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px;margin:20px 0 10px}
.cat-tile{background:#fff;border:1px solid var(--line);border-radius:10px;padding:20px 16px;text-align:center;text-decoration:none;color:var(--ink);box-shadow:var(--shadow-soft);transition:box-shadow .15s,transform .15s}
.cat-tile:hover{box-shadow:var(--shadow-med);transform:translateY(-2px)}
.cat-tile .emoji{font-size:30px;margin-bottom:8px}
.cat-tile .name{font-family:'Instrument Serif',Georgia,serif;font-weight:700;font-size:16px}

/* A tile with a photo behind it. Same tile, picture added.

   The photo is a real child and the scrim is the pseudo-element, in that
   order on purpose: a pseudo-element paints after every real child, so the
   scrim covers the photo without either one needing a negative z-index. The
   words then take z-index 1 and clear both.

   The colour rules are written as .cat-tile.cat-tile--photo rather than
   .cat-tile--photo because the plum pass further down this same stylesheet
   sets a colour on .cat-tile and on .cat-tile .name. Those are two classes
   deep and come later, so they would win a tie. Three classes wins whatever
   the order, which means these rules cannot be broken by someone reordering
   the file later. */
.cat-tile--photo{position:relative;overflow:hidden;isolation:isolate;border:0;padding:0;
  min-height:150px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;
  padding:0 12px 15px;border-radius:14px}
.cat-tile--photo .cat-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
  transition:transform .5s ease}
.cat-tile--photo::after{content:'';position:absolute;inset:0;
  background:linear-gradient(to top,rgba(16,8,26,.88) 0%,rgba(16,8,26,.40) 56%,rgba(16,8,26,.28) 100%)}
.cat-tile--photo .emoji,.cat-tile--photo .name{position:relative;z-index:1}
/* No emoji on a tile that has a photo. The photo is the icon, so the emoji
   became a sticker sitting on the animal's face -- and the mismatches showed:
   the scorpion glyph was sitting on a photo of a jumping spider. The element
   stays in the markup because a category with no photo yet still needs it, and
   the dropdown, which has no photos at all, keeps its emoji throughout. */
.cat-tile--photo .emoji{display:none}
.cat-tile.cat-tile--photo{color:#fff}
.cat-tile.cat-tile--photo .name{color:#fff;font-size:17px;text-shadow:0 2px 10px rgba(0,0,0,.62)}
.cat-tile--photo:hover .cat-photo{transform:scale(1.07)}
@media (prefers-reduced-motion:reduce){
  .cat-tile--photo .cat-photo{transition:none}
  .cat-tile--photo:hover .cat-photo{transform:none}
}

/* Post cards */
.post-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:20px;margin:20px 0 60px}
.post-card{background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden;box-shadow:var(--shadow-soft);display:flex;flex-direction:column;transition:box-shadow .15s,transform .15s}
.post-card:hover{box-shadow:var(--shadow-med);transform:translateY(-2px)}
.post-card .thumb{aspect-ratio:16/9;background:var(--cream-deep);display:flex;align-items:center;justify-content:center;overflow:hidden}
.post-card .thumb img{width:100%;height:100%;object-fit:cover}
.post-card .thumb .ph{font-size:40px;opacity:.4}
.post-card .card-body{padding:18px 20px 20px;display:flex;flex-direction:column;flex:1}
.post-card .card-cat{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--amber-deep);margin-bottom:8px}
.post-card h3{font-family:'Instrument Serif',Georgia,serif;font-size:19px;line-height:1.3;margin-bottom:8px}
.post-card h3 a{color:var(--ink);text-decoration:none}
.post-card h3 a:hover{color:var(--amber-deep)}
.post-card .card-ex{font-size:14px;color:var(--ink-soft);flex:1}
.post-card .card-meta{font-size:12px;color:var(--ink-soft);margin-top:12px;padding-top:12px;border-top:1px solid var(--line-soft)}

/* Article */
.breadcrumb{max-width:820px;margin:0 auto;padding:20px 24px 0;font-size:13px;color:var(--ink-soft);letter-spacing:.03em;text-transform:uppercase}
.breadcrumb a{color:var(--amber-deep);text-decoration:none}
.article{max-width:820px;margin:0 auto;padding:32px 24px 80px}
.eyebrow{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--amber-deep);background:var(--cream-deep);padding:6px 14px;border-radius:4px;margin-bottom:20px}
.article h1{font-family:'Instrument Serif',Georgia,serif;font-size:clamp(32px,5vw,46px);line-height:1.12;font-weight:700;letter-spacing:-.015em;margin-bottom:20px}
.deck{font-size:19px;color:var(--ink-soft);font-style:italic;max-width:680px;margin-bottom:28px}
.byline{display:flex;align-items:center;gap:14px;font-size:14px;color:var(--ink-soft);padding-bottom:24px;border-bottom:1px solid var(--line);margin-bottom:32px;flex-wrap:wrap}
.byline-dot{width:4px;height:4px;border-radius:50%;background:var(--amber)}
.byline a{text-underline-offset:3px}
.disclosure{background:var(--cream-deep);border-left:3px solid var(--amber);padding:14px 20px;font-size:14px;color:var(--ink-soft);margin:0 0 32px;border-radius:0 4px 4px 0}
.hero-img{border-radius:12px;overflow:hidden;margin-bottom:32px;box-shadow:var(--shadow-med)}

/* Author card. Rendered at the foot of every article and again, larger, at the
   head of an author page. The two share everything but their size, so the page
   variant is a modifier rather than a second component.

   The img resets exist because a card pasted into a post body would land inside
   .prose, where .prose img adds a 10px radius, a 24px margin and a shadow --
   all three wrong on a photo that is already a circle inside a ring. */
.pgp-au{clear:both;background:#fff;border:1px solid var(--line);border-left:4px solid var(--amber);border-radius:0 12px 12px 0;box-shadow:var(--shadow-soft);padding:26px 28px;margin:36px 0;display:grid;grid-template-columns:104px 1fr;gap:26px;align-items:start}
.pgp-au-photo{width:104px;height:104px;border-radius:50%;overflow:hidden;border:3px solid var(--amber);background:var(--cream-deep);display:flex;align-items:center;justify-content:center;font-size:40px;line-height:1}
.pgp-au-photo img{width:100%;height:100%;object-fit:cover;display:block;margin:0;border-radius:0;box-shadow:none}
.pgp-au-eyebrow{font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--amber-deep);margin-bottom:7px}
.pgp-au-name{font-family:'Instrument Serif',Georgia,serif;font-size:27px;font-weight:400;letter-spacing:-.01em;line-height:1.15;margin:0 0 5px;color:var(--ink)}
.pgp-au-name a{color:var(--ink);text-decoration:none}
.pgp-au-name a:hover{color:var(--amber-deep)}
.pgp-au-title{font-size:14px;color:var(--ink-soft);margin:0 0 11px;line-height:1.45}
.pgp-au-bio{font-size:15px;color:var(--ink-soft);margin:0 0 14px;line-height:1.6;max-width:62ch}
.pgp-au-chip{display:inline-block;background:var(--cream-deep);color:var(--amber-deep);font-size:12px;font-weight:700;letter-spacing:.03em;padding:6px 14px;border-radius:999px;margin:0 0 14px}
.pgp-au-btn{display:inline-block;background:var(--amber);color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:11px 24px;border-radius:999px;transition:background .15s}
.pgp-au-btn:hover{background:var(--amber-deep);color:#fff}

/* Author page header: no left accent (nothing to run alongside at the top of a
   page), a bigger photo, and the long bio in place of the short one. */
.pgp-au--page{border-left:1px solid var(--line);border-radius:12px;grid-template-columns:150px 1fr;padding:32px;margin:32px 0 8px}
.pgp-au--page .pgp-au-photo{width:150px;height:150px;font-size:56px}
.pgp-au--page .pgp-au-name{font-size:clamp(30px,4.4vw,40px)}
.pgp-au--page .pgp-au-bio{font-size:16px;max-width:68ch}
.pgp-au--page .pgp-au-bio p{margin:0 0 14px}
.pgp-au--page .pgp-au-bio p:last-child{margin-bottom:0}

/* Stacking point is 560px, not the 520px the share bar uses: at 104px of photo
   plus 26px of gap the bio hits about 22 characters a line before that, which
   is a column of single words. */
@media (max-width:560px){
  .pgp-au,.pgp-au--page{grid-template-columns:1fr;gap:16px;padding:22px 20px}
  .pgp-au-photo,.pgp-au--page .pgp-au-photo{margin:0 auto}
  .pgp-au--page .pgp-au-photo{width:112px;height:112px;font-size:42px}
}

/* Prose */
.prose p{margin-bottom:20px}
.prose h2{font-family:'Instrument Serif',Georgia,serif;font-size:30px;font-weight:700;letter-spacing:-.01em;margin:48px 0 20px;line-height:1.2}
.prose h3{font-family:'Instrument Serif',Georgia,serif;font-size:22px;font-weight:700;margin:32px 0 12px}
.prose ul,.prose ol{margin:0 0 20px 26px}
.prose li{margin-bottom:8px}
.prose img{border-radius:10px;margin:24px 0;box-shadow:var(--shadow-soft)}
.prose blockquote{border-left:3px solid var(--amber);padding:8px 22px;font-style:italic;color:var(--ink-soft);margin:24px 0;background:var(--cream-deep);border-radius:0 8px 8px 0}
.prose table{width:100%;border-collapse:collapse;background:#fff;font-size:14px;margin:24px 0}
.prose table th{background:var(--ink);color:var(--cream);padding:12px;text-align:left;font-size:12px;letter-spacing:.08em;text-transform:uppercase}
.prose table td{padding:12px;border-bottom:1px solid var(--line);vertical-align:top}
.prose table tr:nth-child(even){background:var(--cream)}

/* Paw divider */
.paw-divider{display:flex;justify-content:center;align-items:center;gap:18px;margin:50px 0;opacity:.5}
.paw-divider svg{width:22px;height:22px;fill:var(--amber)}
/* The infographic block. Its own diagram sizing is deliberate — on a phone
   the SVG is held at min-width and the frame scrolls sideways, the same
   bargain .table-wrap makes, because a squeezed cross-section is unreadable.
   Do not add a width rule for it here. It only needs to clear floats. */
.pgp-ig{clear:both}

/* ——— Sharing ———————————————————————————————————————————————
   Plain links, no third-party widgets. Network buttons load no script,
   set no cookie and cannot track a reader, so they cost nothing in speed
   and raise no consent question. Copy-link and the native sheet are the
   only ones that need JS, and both degrade to nothing if it fails. */
.share-bar{clear:both;margin:34px 0;padding:20px 22px;background:var(--cream-deep);
  border:1px solid var(--line);border-radius:14px}
.share-bar--compact{margin:18px 0 26px;padding:12px 14px;background:transparent;border:0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);border-radius:0}
.share-label{display:block;font-family:'Quicksand',sans-serif;font-weight:700;font-size:12.5px;
  letter-spacing:.11em;text-transform:uppercase;color:var(--plum);margin:0 0 12px}
.share-bar--compact .share-label{display:inline-block;margin:0 12px 0 0;vertical-align:middle;font-size:11.5px}
.share-btns{display:flex;flex-wrap:wrap;gap:7px}
.share-bar--compact .share-btns{display:inline-flex;vertical-align:middle}
.sh{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;
  border:1px solid var(--line);background:#fff;color:var(--ink-soft);cursor:pointer;
  font-family:'Manrope',system-ui,sans-serif;font-size:13.5px;font-weight:600;line-height:1;
  text-decoration:none;transition:transform .12s ease,box-shadow .12s ease,color .12s ease,border-color .12s ease}
.sh svg{width:15px;height:15px;fill:currentColor;flex:none}
.sh:hover{transform:translateY(-1px);box-shadow:var(--shadow-soft);text-decoration:none}
.sh-pin:hover{color:#BD081C;border-color:#BD081C}
.sh-fb:hover{color:#1877F2;border-color:#1877F2}
.sh-x:hover{color:#000;border-color:#000}
.sh-wa:hover{color:#25D366;border-color:#1EA952}
.sh-rd:hover{color:#FF4500;border-color:#FF4500}
.sh-em:hover,.sh-copy:hover,.sh-native:hover{color:var(--plum);border-color:var(--plum)}
.sh-copy.done{color:var(--sage-deep);border-color:var(--sage-deep)}
.sh[hidden]{display:none}
/* Icons-only, for a narrow column. The @media rule below keys off the
   VIEWPORT, which is no help inside a 280px grid card on a wide screen —
   the card is narrow while the window is not. This is set per bar instead. */
.share-bar--icons .sh{padding:8px 9px;gap:0}
.share-bar--icons .sh .sh-t{display:none}
.share-bar--icons .share-btns{gap:6px}
/* A phone with its own share sheet does not need five network pills: the sheet
   offers every app the reader actually has, including ones not listed here.
   Pinterest stays because the sheet cannot hand it the image to pin. The class
   is added by script, so with JS off every button remains. */
.share-bar--native .sh-fb,.share-bar--native .sh-x,.share-bar--native .sh-wa,
.share-bar--native .sh-rd,.share-bar--native .sh-em{display:none}
.share-bar--native .sh-native .sh-t,.share-bar--native .sh-copy .sh-t{display:inline}
/* ...unless the bar was explicitly asked for icons. A bare link or share
   glyph is vaguer than a Pinterest logo, so in native mode those two get
   their words back - but icons:true is the author saying there is no room,
   and an explicit option should not be quietly overridden. */
.share-bar--icons.share-bar--native .sh .sh-t{display:none}
/* the label collapses on a narrow screen so the row stays one line of icons */
@media (max-width:520px){
  .sh{padding:9px 10px}
  .sh .sh-t{display:none}
  .share-bar--compact .share-label{display:block;margin:0 0 9px}
}
/* Save-to-Pinterest on article images. Pet content lives on Pinterest, and a
   reader already looking at the photo is the one most likely to pin it.
   It is ONE position:fixed button that follows the hovered image, rather than
   a wrapper around each one — wrapping would put a floated .img-left inside an
   inline-block and the float would stop working. Touch devices never see it. */
.pin-save{position:fixed;z-index:60;display:none;align-items:center;gap:6px;
  padding:7px 12px;border:0;border-radius:999px;background:#BD081C;color:#fff;cursor:pointer;
  font-family:'Manrope',system-ui,sans-serif;font-size:12.5px;font-weight:700;line-height:1;
  box-shadow:0 2px 10px rgba(0,0,0,.28)}
.pin-save svg{width:13px;height:13px;fill:#fff}
.pin-save.on{display:inline-flex}
.pin-save:hover{background:#8C0615}
@media (hover:none){.pin-save{display:none!important}}

/* Product cards (for review posts) */
.product{background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden;margin:28px 0;clear:both;box-shadow:var(--shadow-soft)}
.product:hover{box-shadow:var(--shadow-med)}
.product-ribbon{display:flex;align-items:center;justify-content:space-between;padding:12px 22px;background:var(--ink);color:var(--cream);font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:600}
.product-ribbon .star{color:var(--amber)}
/* The photo FLOATS, it does not take a grid column. As a two-column grid the
   image track was 240px tall against a content column running 750px, so a
   review card with a real photo in it had around 500px of dead white down its
   left side and was 40 percent TALLER than the same card with no photo -
   the text had to squeeze into 398px. Nobody had seen that: twenty cards
   across the Tiki and Stella and Chewy's reviews and not one of them has ever
   had a photo in the well, so the two-column layout had only ever been looked
   at empty. Floated, the title and opening paragraphs sit beside the photo and
   the rest flows underneath at full width. .pros-cons already carries
   clear:both from the theme, so the lists drop below the photo on their own. */
.product-body{display:block;padding:26px}
.product-body::after{content:"";display:table;clear:both}
/* Hiding the empty well takes it out of the grid, but the 240px track stays,
   so the text landed in the narrow column with 394px of dead space beside it.
   No photo means one column, full width. */
.product-body:not(:has(.product-image-wrap img)){grid-template-columns:1fr}
/* An unfilled well collapses on the public site, the same way .pgp-prod-img
   does. The placeholder inside it is an instruction to whoever is editing -
   drop your product photo here - and a visitor must never read that. This
   rule sits in the public-only block, so the editor still shows the well as
   a drop target while a reader never sees an empty square or the text. */
.product-image-wrap:not(:has(img)){display:none}
/* The same pair for the .pgp-prod well, and it has to be written twice over.
   The base rule is ".pgp-prod .pgp-prod-img{...display:flex}" - two classes -
   so the one-class form at (0,1,1) loses the cascade and every unfilled well
   paints a blank white square. Check the specificity, not just that a collapse
   rule exists. The .product-image-wrap line above is fine on one class only
   because its own base rule is one class too. */
.pgp-prod-img:not(:has(img)),.pgp-prod .pgp-prod-img:not(:has(img)){display:none}
.product-image-wrap{float:left;width:240px;margin:0 24px 18px 0;aspect-ratio:1;background:var(--cream-deep);border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center}
@media(max-width:620px){.product-image-wrap{float:none;width:100%;margin:0 0 18px}}
.product-image-wrap img{width:100%;height:100%;object-fit:cover}
.product-image-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--amber);font-size:13px;text-align:center;padding:16px;font-style:italic}
.product-content h2.product-title,.product-content .product-title{font-family:'Instrument Serif',Georgia,serif;font-size:24px;line-height:1.25;margin:0 0 8px}
.product-price{display:flex;align-items:baseline;gap:10px;margin-bottom:14px}
.product-price .dollar{font-family:'Instrument Serif',Georgia,serif;font-size:26px;font-weight:700;color:var(--clay)}
.product-price .disclaimer{font-size:12px;color:var(--ink-soft);font-style:italic}
.best-for{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--forest);background:#E9F3EC;padding:5px 11px;border-radius:4px;margin-bottom:14px}
.product-desc{font-size:15px;color:var(--ink-soft);margin-bottom:16px;line-height:1.65}
.product-desc p{margin-bottom:12px}
.pros-cons{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:14px 0 18px;clear:both;font-size:14px}
.pros,.cons{padding:14px;border-radius:6px}
.pros{background:#E9F5EE;border-left:3px solid var(--moss)}
.cons{background:#FDEEF0;border-left:3px solid var(--clay)}
.pros-cons h4{font-family:'Instrument Serif',Georgia,serif;font-size:13px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;font-weight:700}
.pros h4{color:var(--forest)}.cons h4{color:var(--clay)}
.pros ul,.cons ul{list-style:none;padding:0;margin:0}
.pros li,.cons li{padding-left:18px;position:relative;margin-bottom:5px;line-height:1.45}
.pros li::before{content:'✓';position:absolute;left:0;color:var(--moss);font-weight:700}
.cons li::before{content:'✕';position:absolute;left:0;color:var(--clay);font-weight:700}
.cta-btn{display:inline-block;background:var(--amber);color:#fff;padding:13px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:15px;font-family:'Manrope',ui-sans-serif,system-ui,'Segoe UI',sans-serif;transition:background .15s,filter .15s}
.cta-btn:hover{background:var(--amber-deep)}
.cta-btn::after{content:' →'}
/* Button colour variants */
.cta-green{background:#2C7A57}.cta-green:hover{background:#23624A}
.cta-teal{background:#1f6f6b}.cta-teal:hover{background:#175653}
.cta-blue{background:#2b5f8a}.cta-blue:hover{background:#1f486a}
.cta-purple{background:#5B3CC4}.cta-purple:hover{background:#462F9C}
.cta-pink{background:#C43D74}.cta-pink:hover{background:#9E2F5C}
.cta-clay{background:#C63B52}.cta-clay:hover{background:#9E3040}
.cta-ink{background:#15111C}.cta-ink:hover{background:#514860}
/* Custom colours set inline still get a hover response */
.cta-btn[style*="background"]:hover{filter:brightness(1.12)}
.intl-note{font-size:12px;color:var(--ink-soft);margin-top:10px;font-style:italic}
.callout{background:linear-gradient(135deg,#2A2140 0%,var(--ink) 100%);color:var(--cream);padding:36px 32px;border-radius:12px;margin:48px 0;clear:both;position:relative;overflow:hidden}
.callout::before{content:'“';position:absolute;top:-20px;left:20px;font-size:160px;font-family:'Instrument Serif',Georgia,serif;color:var(--amber);opacity:.25;line-height:1}
.callout-body{position:relative;font-family:'Instrument Serif',Georgia,serif;font-size:22px;line-height:1.45;font-style:italic;font-weight:500}
.callout-attr{font-style:normal;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--amber);margin-top:16px;display:block}
details.faq-item{border-bottom:1px solid var(--line);padding:18px 0}
details.faq-item summary{cursor:pointer;font-family:'Instrument Serif',Georgia,serif;font-size:19px;font-weight:700;list-style:none;position:relative;padding-right:36px}
details.faq-item summary::-webkit-details-marker{display:none}
details.faq-item summary::after{content:'+';position:absolute;right:0;top:50%;transform:translateY(-50%);font-size:28px;color:var(--amber)}
details.faq-item[open] summary::after{content:'−'}
details.faq-item[open] summary{margin-bottom:12px}
details.faq-item p{color:var(--ink-soft);font-size:16px;line-height:1.7}
.table-wrap{overflow-x:auto;clear:both;margin:28px 0;border-radius:10px;border:1px solid var(--line);box-shadow:var(--shadow-soft)}
table.compare{width:100%;border-collapse:collapse;background:#fff;font-size:14px;min-width:640px;margin:0}
table.compare th{background:var(--ink);color:var(--cream);padding:14px 12px;text-align:left;font-weight:600;font-size:12px;letter-spacing:.08em;text-transform:uppercase}
table.compare td{padding:14px 12px;border-bottom:1px solid var(--line);vertical-align:top}
table.compare tr:nth-child(even){background:var(--cream)}
.filter-panel{background:#fff;border:1px solid var(--line);border-radius:10px;padding:22px;margin:32px 0;box-shadow:var(--shadow-soft)}
.filter-panel-title{font-family:'Instrument Serif',Georgia,serif;font-size:18px;font-weight:700;margin-bottom:6px}
.filter-panel-sub{font-size:14px;color:var(--ink-soft);margin-bottom:18px}
.filter-group{margin-bottom:16px}
.filter-group-label{display:block;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft);margin-bottom:10px}
.chip-row{display:flex;flex-wrap:wrap;gap:8px}
.chip{font-family:inherit;font-size:13px;padding:8px 14px;background:var(--cream);border:1px solid var(--line);border-radius:20px;cursor:pointer;color:var(--ink-soft);font-weight:500}
.chip:hover{border-color:var(--amber);color:var(--amber-deep)}
.chip.active{background:var(--ink);color:var(--cream);border-color:var(--ink)}
.filter-count{font-size:13px;color:var(--ink-soft);padding:10px 16px;background:var(--cream-deep);border-radius:6px;display:inline-block;margin:12px 0 8px}

/* Fun fact box */
.funfact{background:linear-gradient(135deg,#F7F2FC 0%,var(--cream-deep) 100%);border:1px solid var(--line);border-left:5px solid var(--amber);border-radius:0 12px 12px 0;padding:18px 24px;margin:28px 0;clear:both;position:relative}
.funfact .ff-label{display:block;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--amber-deep);margin-bottom:6px}
.funfact p{margin:0;font-size:16px;color:var(--ink-soft);line-height:1.6}
.funfact p strong{color:var(--ink)}

/* Vet warning box */
.vet-warning{background:#FDEEF0;border:1px solid #F4CFD6;border-left:5px solid var(--clay);border-radius:0 12px 12px 0;padding:20px 24px;margin:28px 0;clear:both}
.vet-warning h4{font-family:'Instrument Serif',Georgia,serif;font-size:18px;color:var(--clay);margin-bottom:8px}
.vet-warning p{margin-bottom:8px;font-size:15.5px;color:var(--ink-soft)}
.vet-warning p:last-child{margin-bottom:0}

/* Vet tip / positive box */
.vet-tip{background:#E9F5EE;border:1px solid #CFE6D8;border-left:5px solid var(--moss);border-radius:0 12px 12px 0;padding:20px 24px;margin:28px 0;clear:both}
.vet-tip h4{font-family:'Instrument Serif',Georgia,serif;font-size:18px;color:var(--forest);margin-bottom:8px}
.vet-tip p{margin-bottom:8px;font-size:15.5px;color:var(--ink-soft)}
.vet-tip p:last-child{margin-bottom:0}

/* Quick facts / at-a-glance card */
.quick-facts{background:#fff;border:1px solid var(--line);border-radius:12px;padding:24px 26px;margin:32px 0;clear:both;box-shadow:var(--shadow-soft)}
.quick-facts h3{font-family:'Instrument Serif',Georgia,serif;font-size:20px;margin-bottom:16px}
.qf-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}
.qf-item{background:var(--cream);border-radius:8px;padding:12px 14px}
.qf-item .qf-label{display:block;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--amber-deep);margin-bottom:3px}
.qf-item .qf-value{font-size:15px;color:var(--ink);line-height:1.4}

/* Shopping checklist */
.kit-section{margin:24px 0;clear:both}
.kit-section h3{font-family:'Instrument Serif',Georgia,serif;font-size:20px;margin:28px 0 6px}
.kit-section .kit-note{font-size:14px;color:var(--ink-soft);font-style:italic;margin-bottom:14px}
.kit-item{display:flex;gap:14px;align-items:flex-start;clear:both;background:#fff;border:1px solid var(--line);border-radius:10px;padding:16px 18px;margin-bottom:10px;box-shadow:var(--shadow-soft)}
.kit-item .kit-check{flex-shrink:0;width:26px;height:26px;border-radius:6px;border:2px solid var(--amber);color:var(--amber);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;margin-top:2px}
.kit-item .kit-body{flex:1}
.kit-item .kit-name{font-weight:700;font-size:16px;color:var(--ink);display:block;margin-bottom:3px}
.kit-item .kit-why{font-size:14.5px;color:var(--ink-soft);line-height:1.55}
.kit-item .kit-price{display:inline-block;font-size:12px;font-weight:700;color:var(--clay);background:var(--cream-deep);padding:3px 10px;border-radius:20px;margin-top:6px;margin-right:8px}
.kit-item .kit-link{display:inline-block;font-size:13px;font-weight:700;color:var(--amber-deep);text-decoration:none;margin-top:6px}
.kit-item .kit-link:hover{text-decoration:underline}
.kit-item.essential .kit-check{border-color:var(--clay);color:var(--clay)}
.kit-item.optional{opacity:.94}
.kit-item.optional .kit-check{border-color:var(--moss);color:var(--moss)}

/* Compatibility matrix */
table.compat{width:auto;border-collapse:collapse;background:#fff;font-size:13px;margin:0}
table.compat th,table.compat td{border:1px solid var(--line)}
table.compat thead th{background:var(--ink);color:var(--cream);padding:8px 4px;font-size:11px;font-weight:700;text-align:center;position:sticky;top:0;z-index:2}
table.compat th.rn{width:26px;text-align:center;background:var(--ink);color:var(--cream);font-size:11px;padding:6px 2px;position:sticky;left:0;z-index:3}
table.compat th.rl{text-align:left;padding:7px 12px;font-weight:600;font-size:13px;white-space:nowrap;background:var(--cream-deep);color:var(--ink);position:sticky;left:26px;z-index:3;min-width:190px}
table.compat th.cx{min-width:26px}
table.compat td.m{text-align:center;padding:7px 4px;font-weight:700;font-size:14px;min-width:26px}
table.compat td.y{background:#E4F3EA;color:#2C7A57}
table.compat td.c{background:#FDF0DC;color:#C42A6E}
table.compat td.n{background:#FCE4E6;color:#C63B52}
table.compat td.s{background:var(--ink);color:var(--amber)}
table.compat tbody tr:hover td.m{filter:brightness(.95)}
.compat-legend{display:flex;gap:18px;flex-wrap:wrap;margin:14px 0 4px;font-size:14px;align-items:center}
.compat-legend span{display:flex;align-items:center;gap:7px;color:var(--ink-soft)}
.compat-legend b{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:6px;font-size:14px;border:1px solid var(--line)}
.compat-legend .y{background:#E4F3EA;color:#2C7A57}
.compat-legend .c{background:#FDF0DC;color:#C42A6E}
.compat-legend .n{background:#FCE4E6;color:#C63B52}
.compat-legend .s{background:var(--ink);color:var(--amber)}
.scroll-hint{font-size:12.5px;color:var(--ink-soft);font-style:italic;margin:0 0 8px}

/* Species profile cards */
.fish-card{background:#fff;border:1px solid var(--line);border-left:6px solid var(--amber);border-radius:0 12px 12px 0;padding:18px 22px;margin-bottom:14px;box-shadow:var(--shadow-soft)}
.fish-card.peaceful{border-left-color:var(--moss)}
.fish-card.caution{border-left-color:var(--amber)}
.fish-card.expert{border-left-color:var(--clay)}
.fish-card h3{font-family:'Instrument Serif',Georgia,serif;font-size:20px;margin-bottom:3px}
.fish-card .latin{font-size:13px;color:var(--ink-soft);font-style:italic;margin-bottom:10px}
.fish-spec{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:11px}
.fish-spec span{font-size:12px;background:var(--cream);border:1px solid var(--line);border-radius:20px;padding:4px 11px;color:var(--ink-soft)}
.fish-spec span b{color:var(--ink)}
.fish-card p{font-size:15px;color:var(--ink-soft);line-height:1.6;margin-bottom:9px}
.fish-card p:last-child{margin-bottom:0}
.fish-card .goes-with{font-size:14px;color:var(--forest)}
.fish-card .avoid{font-size:14px;color:var(--clay)}

/* Review hub cards */
.review-card{display:flex;gap:20px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:22px 24px;margin-bottom:16px;box-shadow:var(--shadow-soft);flex-wrap:wrap;transition:box-shadow .15s,transform .15s}
.review-card:hover{box-shadow:var(--shadow-med);transform:translateY(-2px)}
.review-card .rc-score{flex-shrink:0;width:76px;height:76px;border-radius:14px;background:linear-gradient(135deg,#2A2140,var(--ink));color:var(--cream);display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1}
.review-card .rc-score .n{font-family:'Instrument Serif',Georgia,serif;font-size:26px;font-weight:700;color:var(--amber)}
.review-card .rc-score .l{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#B0A6C0;margin-top:4px}
.review-card .rc-body{flex:1;min-width:240px}
.review-card .rc-cat{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--amber-deep);margin-bottom:5px}
.review-card h3{font-family:'Instrument Serif',Georgia,serif;font-size:21px;margin-bottom:6px;line-height:1.25}
.review-card h3 a{color:var(--ink);text-decoration:none}
.review-card h3 a:hover{color:var(--amber-deep)}
.review-card p{font-size:15px;color:var(--ink-soft);line-height:1.6;margin-bottom:10px}
.review-card .rc-tags{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px}
.review-card .rc-tags span{font-size:12px;background:var(--cream);border:1px solid var(--line);border-radius:20px;padding:4px 11px;color:var(--ink-soft)}
.review-card .rc-btn{display:inline-block;background:var(--amber);color:#fff;padding:10px 22px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px}
.review-card .rc-btn:hover{background:var(--amber-deep)}
.review-card.soon{opacity:.85;border-style:dashed}
.review-card.soon .rc-score{background:var(--cream-deep)}
.review-card.soon .rc-score .n{color:var(--amber-deep);font-size:30px}
.review-card.soon .rc-score .l{color:var(--ink-soft)}

/* Numbered method list */
.method-list{counter-reset:m;list-style:none;margin:20px 0 0 0;clear:both}
.method-list li{counter-increment:m;position:relative;padding-left:52px;margin-bottom:18px;font-size:15.5px;color:var(--ink-soft);line-height:1.6}
.method-list li::before{content:counter(m);position:absolute;left:0;top:-2px;width:34px;height:34px;border-radius:50%;background:var(--amber);color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Instrument Serif',Georgia,serif;font-weight:700;font-size:17px}
.method-list li b{color:var(--ink)}

/* Free download card */
.download-card{display:flex;gap:22px;align-items:center;clear:both;background:linear-gradient(135deg,#2A2140 0%,var(--ink) 100%);color:var(--cream);border-radius:14px;padding:24px 28px;margin:36px 0;box-shadow:var(--shadow-med);flex-wrap:wrap}
.download-card .dl-thumb{flex-shrink:0;width:92px;border-radius:8px;overflow:hidden;background:#fff;box-shadow:0 4px 14px rgba(0,0,0,.3)}
.download-card .dl-thumb img{width:100%;display:block;float:none;margin:0;border-radius:0;box-shadow:none}
.download-card .dl-body{flex:1;min-width:220px}
.download-card .dl-tag{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink);background:var(--amber);padding:4px 11px;border-radius:20px;margin-bottom:9px}
.download-card h3{font-family:'Instrument Serif',Georgia,serif;font-size:22px;color:#fff;margin-bottom:6px;line-height:1.25}
.download-card p{font-size:15px;color:#C0B6CE;margin:0 0 14px;line-height:1.55}
.download-card .dl-btn{display:inline-block;background:var(--amber);color:#fff;padding:12px 26px;border-radius:6px;text-decoration:none;font-weight:700;font-size:15px;font-family:'Manrope',ui-sans-serif,system-ui,'Segoe UI',sans-serif}
.download-card .dl-btn:hover{background:var(--amber-deep)}
.download-card .dl-note{display:block;font-size:12.5px;color:#9C93AC;margin-top:9px;font-style:italic}

/* Free guides page grid */
.guide-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:22px;margin:26px 0 50px}
.guide-card{background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden;box-shadow:var(--shadow-soft);display:flex;flex-direction:column}
.guide-card:hover{box-shadow:var(--shadow-med)}
.guide-card .g-preview{background:var(--cream-deep);padding:16px;text-align:center}
.guide-card .g-preview img{width:100%;max-height:280px;object-fit:cover;object-position:top;border-radius:6px;box-shadow:0 3px 12px rgba(21,17,28,.14);margin:0}
.guide-card .g-body{padding:18px 20px 20px;display:flex;flex-direction:column;flex:1}
.guide-card .g-cat{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--amber-deep);margin-bottom:6px}
.guide-card h3{font-family:'Instrument Serif',Georgia,serif;font-size:19px;margin-bottom:7px;line-height:1.3}
.guide-card p{font-size:14px;color:var(--ink-soft);flex:1;margin-bottom:14px}
.guide-card .g-btn{display:inline-block;text-align:center;background:var(--amber);color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px}
.guide-card .g-btn:hover{background:var(--amber-deep)}

/* Lightbox — click any article image to expand */
.prose img:not(.no-zoom){cursor:zoom-in}
#pgp-lightbox{position:fixed;inset:0;background:rgba(13,10,20,.95);z-index:9999;display:none;align-items:center;justify-content:center;padding:28px;flex-direction:column;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
#pgp-lightbox.open{display:flex}
#pgp-lightbox img{max-width:96vw;max-height:84vh;border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,.6);cursor:zoom-out;margin:0;object-fit:contain}
#pgp-lightbox img.zoomed{max-width:none;max-height:none;cursor:grab}
#pgp-lb-bar{display:flex;gap:10px;align-items:center;margin-top:18px;flex-wrap:wrap;justify-content:center}
#pgp-lb-bar a,#pgp-lb-bar button{background:rgba(244,240,247,.12);color:var(--cream);border:1px solid rgba(244,240,247,.3);padding:9px 18px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;font-family:'Manrope',ui-sans-serif,system-ui,'Segoe UI',sans-serif}
#pgp-lb-bar a:hover,#pgp-lb-bar button:hover{background:var(--amber);border-color:var(--amber);color:#fff}
#pgp-lb-close{position:absolute;top:18px;right:22px;background:none;border:none;color:var(--cream);font-size:38px;line-height:1;cursor:pointer;opacity:.75;padding:6px 12px}
#pgp-lb-close:hover{opacity:1}
#pgp-lb-cap{color:#C0B6CE;font-size:14px;font-style:italic;margin-top:12px;text-align:center;max-width:700px}

/* Footer */
/* Affiliate-tracking consent. The site loaded no third-party JavaScript at all
   before Impact, so this is the first thing on it that sets a tracking cookie —
   Decline genuinely blocks the script rather than only hiding the notice. */
#pgp-consent{position:fixed;left:12px;right:12px;bottom:12px;z-index:90;max-width:720px;margin:0 auto;
  background:var(--page-3);border:1px solid var(--hair);border-radius:14px;padding:15px 18px;
  box-shadow:0 12px 34px rgba(8,4,16,.5);display:none;gap:14px;align-items:center;flex-wrap:wrap;color:var(--on-dark)}
#pgp-consent.on{display:flex}
#pgp-consent p{font-size:13.5px;color:var(--on-dark-dim);margin:0;flex:1;min-width:230px;line-height:1.55}
#pgp-consent a{color:var(--amber)}
#pgp-consent .cbtns{display:flex;gap:9px;flex-shrink:0}
#pgp-consent button{font-family:inherit;font-size:14px;font-weight:700;padding:10px 18px;border-radius:999px;
  cursor:pointer;border:1px solid var(--hair);background:transparent;color:var(--on-dark);min-height:42px}
#pgp-consent button.yes{background:var(--amber);border-color:var(--amber);color:#15111C}
#pgp-consent button:hover{border-color:var(--amber)}
/* Keep the back-to-top button clear of the notice while it is showing. */
body.consent-open #to-top{bottom:112px}
@media(max-width:560px){#pgp-consent .cbtns{width:100%}#pgp-consent button{flex:1}
  body.consent-open #to-top{bottom:150px}}
/* Back to top. The guides run 6,000-7,500 words and the shop grid is long, so
   on a phone the way back is a lot of swiping. Hidden until there is something
   to scroll back over; honours reduced-motion. */
#to-top{position:fixed;right:16px;bottom:16px;z-index:70;width:46px;height:46px;border:none;
  border-radius:50%;background:var(--amber);color:#15111C;font-size:20px;line-height:1;cursor:pointer;
  box-shadow:0 6px 20px rgba(21,17,28,.45);display:grid;place-items:center;padding:0;font-family:inherit;
  opacity:0;visibility:hidden;transform:translateY(10px);transition:opacity .2s,transform .2s,visibility .2s}
#to-top.on{opacity:1;visibility:visible;transform:none}
#to-top:hover{background:#fff}
#to-top:focus-visible{outline:3px solid #fff;outline-offset:2px}
@media(prefers-reduced-motion:reduce){#to-top{transition:none}}
/* Shop promo band. The collage is a background image and the wording is live
   text, so it scales on a phone and Google can read the heading - a banner with
   its title baked into the pixels throws both of those away. */
.shop-band{position:relative;display:block;overflow:hidden;border-radius:16px;margin:46px 0;
  min-height:236px;text-decoration:none;background:var(--page-2);box-shadow:var(--shadow-med)}
.shop-band img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:0;border-radius:0}
.shop-band::after{content:'';position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,
  rgba(21,17,28,.94) 0%,rgba(21,17,28,.88) 36%,rgba(21,17,28,.50) 68%,rgba(21,17,28,.10) 100%)}
.sb-in{position:relative;z-index:2;padding:32px 36px;max-width:610px;display:flex;
  flex-direction:column;align-items:flex-start;gap:10px}
.sb-kicker{font-size:11.5px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--amber)}
.sb-title{font-family:'Instrument Serif',Georgia,serif;font-weight:400;font-size:clamp(26px,3.6vw,40px);
  line-height:1.08;color:#fff;margin:0}
.sb-sub{font-size:15px;color:var(--on-dark-dim);max-width:430px}
.sb-cta{margin-top:5px;background:var(--amber);color:#15111C;font-weight:800;font-size:15px;
  padding:12px 26px;border-radius:999px;display:inline-block}
.shop-band:hover .sb-cta{background:#fff}
@media(max-width:720px){
  /* Portrait has no room for text beside the products, so the scrim turns
     vertical and the collage shows as a strip above the wording. */
  .shop-band{min-height:0;border-radius:14px;margin:30px 0}
  .shop-band::after{background:linear-gradient(180deg,rgba(21,17,28,.55) 0%,rgba(21,17,28,.90) 54%,rgba(21,17,28,.97) 100%)}
  .sb-in{padding:96px 20px 24px;max-width:none}
  /* A portrait slice through the middle of the collage lands on the dog bowl,
     which does not say "merchandise". 72% puts the cat mug in the strip. */
  .shop-band img{object-position:72% center}
  .sb-sub{display:none}
}
footer.site-footer{background:var(--ink);color:var(--cream);padding:48px 24px;margin-top:80px;text-align:center}
footer .foot-logo{width:44px;height:44px;border-radius:10px;background:var(--cream);padding:4px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;overflow:hidden}
footer .foot-logo img{width:100%;height:100%;object-fit:contain}
footer .foot-name{font-family:'Instrument Serif',Georgia,serif;font-size:20px;font-weight:700}
footer .foot-tag{color:var(--amber);font-style:italic;font-size:14px;margin-top:4px}
footer .foot-nav{margin-top:18px;display:flex;gap:18px;justify-content:center;flex-wrap:wrap}
footer .foot-nav a{color:#B0A6C0;font-size:13px;text-decoration:none}
footer .foot-nav a:hover{color:var(--cream)}
/* Secondary footer rows: every pet category, and the legal pages a shop
   needs findable. Both are plain links - a footer is a list, not a dropdown. */
footer .foot-sub{margin-top:11px;gap:7px 15px;font-size:12px;align-items:center}
footer .foot-sub a{color:#9A90AC;font-size:12px}
footer .foot-sub a:hover{color:var(--cream)}
footer .foot-lead{color:#6F6680;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;font-weight:700}
footer .foot-disclosure{max-width:680px;margin:24px auto 0;padding-top:24px;border-top:1px solid #514860;font-size:13px;color:#B0A6C0;line-height:1.6}
footer .foot-copy{margin-top:20px;font-size:12px;color:#857B96}

/* ============================================================
   DARK SHELL / PAPER PAGE
   The site sits on a plum ground; long-form articles keep a light
   reading sheet. Rules below only re-ground the chrome and the
   listing surfaces — everything inside .article is untouched and
   still renders dark-on-light exactly as it always did.
   ============================================================ */
body{background:var(--page);color:var(--on-dark)}

/* Instrument Serif ships one weight. Synthesised bold goes muddy, so every
   serif heading is pinned to 400 and takes its emphasis from size instead. */
.brand-name,.foot-name,.section-title,.home-hero h1,.article h1,
.prose h2,.prose h3,.post-card h3,.cat-tile .name,.product-title,
.product-content h2.product-title,.callout-body,.review-card h3,.guide-card h3,
.quick-facts h3,.kit-section h3,.fish-card h3,.filter-panel-title,
.download-card h3,.pgp-section .pgp-sec-title,.pgp-section .pgp-cell h3,
.pgp-grid .pgp-cell h3,details.faq-item summary,.product-price .dollar,
.review-card .rc-score .n{font-weight:400}
/* Small uppercase labels read better in the sans than a display serif */
.pros-cons h4,.vet-warning h4,.vet-tip h4,.pgp-section .pgp-cell h4,
.pgp-grid .pgp-cell h4{font-family:'Manrope',ui-sans-serif,system-ui,sans-serif;font-weight:700}

/* Wordmark matches the logo's rounded geometric lettering */
.brand-name,.foot-name{font-family:'Quicksand','Trebuchet MS',sans-serif;font-weight:700;letter-spacing:-.01em}
.brand-tag,.foot-tag{font-style:normal;letter-spacing:.02em;color:var(--on-dark-dim)}

/* Chrome — the header paints its own ground rather than inheriting the body's.
   Page content is author-editable and can carry its own <style>, so relying on
   the body background here would let a pasted stylesheet turn the nav invisible. */
.brand-bar{background:var(--page);border-bottom:1px solid var(--hair)}
.brand-bar .brand-name,.brand-bar .site-nav a{color:var(--on-dark)}
.brand-bar .brand-tag{color:var(--on-dark-dim)}
.home-hero{background:linear-gradient(150deg,#2A2140 0%,var(--page) 70%);
  border-bottom:1px solid var(--hair);padding-bottom:54px}
.home-hero .hero-cta{color:#2A0A18;border-radius:999px;padding:14px 32px}
.home-hero .hero-cta:hover{background:#FF5CA8;color:#2A0A18}

/* Section headings live on the dark ground */
.section-title{color:var(--on-dark)}
.section-sub{color:var(--on-dark-dim)}
.breadcrumb{color:var(--on-dark-dim)}
.breadcrumb a{color:var(--amber)}
.scroll-hint{color:var(--on-dark-dim)}

/* Listing surfaces: tiles and cards sit on the dark ground, so they take a
   raised plum panel rather than white. */
.cat-tile,.post-card,.guide-card,.review-card,.filter-panel{
  background:var(--page-2);border-color:var(--hair);color:var(--on-dark);
  box-shadow:0 8px 22px rgba(0,0,0,.28)}
.cat-tile:hover,.post-card:hover,.review-card:hover{box-shadow:0 14px 34px rgba(0,0,0,.4)}
.cat-tile .name{color:var(--on-dark)}
.post-card h3 a,.review-card h3 a{color:var(--on-dark)}
.post-card h3 a:hover,.review-card h3 a:hover{color:var(--amber)}
.post-card .card-ex,.review-card p,.guide-card p{color:var(--on-dark-dim)}
.post-card .card-meta{color:var(--on-dark-faint);border-top-color:var(--hair)}
.post-card .thumb,.guide-card .g-preview{background:var(--page-3)}
.post-card .card-cat,.review-card .rc-cat,.guide-card .g-cat{color:var(--amber)}
.review-card .rc-tags span,.filter-panel .chip{
  background:var(--page-3);border-color:var(--hair);color:var(--on-dark-dim)}
.filter-panel-title{color:var(--on-dark)}
.filter-panel-sub,.filter-group-label{color:var(--on-dark-dim)}
.chip.active{background:var(--amber);color:#2A0A18;border-color:var(--amber)}
.chip:hover{border-color:var(--amber);color:var(--on-dark)}
.filter-count{background:var(--page-3);color:var(--on-dark-dim)}
.review-card.soon .rc-score{background:var(--page-3)}
.review-card.soon .rc-score .l{color:var(--on-dark-faint)}
.guide-card h3{color:var(--on-dark)}

/* An author page header is not inside .article, so it does not get the light
   reading sheet. Same component, grounded like the post cards it sits above --
   the in-article copy of this card is untouched and stays white. */
.pgp-au--page{background:var(--page-2);border-color:var(--hair);color:var(--on-dark);
  box-shadow:0 8px 22px rgba(0,0,0,.28)}
.pgp-au--page .pgp-au-name{color:var(--on-dark)}
.pgp-au--page .pgp-au-title,.pgp-au--page .pgp-au-bio{color:var(--on-dark-dim)}
.pgp-au--page .pgp-au-eyebrow{color:var(--amber)}
.pgp-au--page .pgp-au-chip{background:var(--page-3);color:var(--amber)}

/* Buttons on the dark ground */
.cta-btn,.review-card .rc-btn,.guide-card .g-btn,.download-card .dl-btn{
  color:#2A0A18;border-radius:999px}
.cta-btn:hover,.review-card .rc-btn:hover,.guide-card .g-btn:hover{background:#FF5CA8;color:#2A0A18}

/* The article is a sheet of paper laid on the plum ground */
.article{
  background:var(--cream);color:var(--ink);
  border-radius:20px;padding:44px 52px 64px;margin:20px auto 90px;
  box-shadow:0 20px 60px rgba(0,0,0,.38)}
.article h1{color:var(--ink)}
.breadcrumb{padding-bottom:6px}
@media (max-width:760px){ .article{padding:30px 22px 44px;border-radius:16px;margin:14px 14px 60px} }

/* Free-guides grid headings sit on the dark ground too */
.guide-grid + .section-title,.post-grid + .section-title{color:var(--on-dark)}

/* Paw divider on dark */
.paw-divider svg{fill:var(--amber)}

/* Footer separates from the ground with a hairline, not a colour change */
footer.site-footer{background:var(--page-2);border-top:1px solid var(--hair);margin-top:0}
footer .foot-logo{background:var(--page-3)}
footer .foot-disclosure{border-top-color:var(--hair)}

@media (max-width:640px){
  .product-body{grid-template-columns:1fr}
  .pros-cons{grid-template-columns:1fr}
  .article h1{font-size:30px}
  .prose h2{font-size:24px}
  .brand-name{font-size:18px}
  .site-nav{margin-left:0}
  .home-hero{padding:48px 18px}
  .cat-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px}

  /* Everything below is behind .has-js on purpose. With scripting off none of
     it applies and the nav is the same wrapping row it has always been, which
     is worse looking but still completely usable -- a hamburger with no
     JavaScript behind it is a button that does nothing. */
  .has-js .site-nav{width:100%;flex-direction:column;align-items:stretch;gap:0}
  .has-js .nav-toggle{display:flex;justify-content:center;align-self:stretch}
  .has-js .site-nav .nav-links{display:none;flex-direction:column;align-items:stretch;
    gap:2px;margin-top:10px}
  .has-js .site-nav.open .nav-links{display:flex}
  .has-js .site-nav .nav-links > a,.has-js .site-nav .nav-drop-btn{width:100%;padding:11px 12px}
  .nav-drop{width:100%}
  /* On a phone the dropdown stops being a floating card and becomes an indented
     sub-list, and that part is NOT behind .has-js. A 212px absolute panel
     anchored to a button in a 390px header has nowhere to go: with scripting
     off it stuck out and dragged 111px of horizontal scroll onto the page.
     Static costs nothing when the panel is collapsed anyway. */
  .nav-drop-menu{position:static;opacity:1;visibility:visible;transform:none;
    background:transparent;border:0;box-shadow:none;padding:2px 0 4px 16px;
    min-width:0;transition:none}
  /* Only the collapsing is behind .has-js. With no JS the categories are simply
     listed -- a longer header than anyone wants, but every link reachable,
     which a tap-to-open button with no script behind it would not be. */
  .has-js .nav-drop-menu{display:none}
  .has-js .nav-drop.open .nav-drop-menu{display:grid}
}
`;

export const PAW_SVG = `<svg viewBox="0 0 24 24"><path d="M12 14c-2.5 0-6 1.5-6 4 0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2 0-2.5-3.5-4-6-4zm-5.5-2.5c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9.9 2.9 2 2.9zm11 0c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9.9 2.9 2 2.9zM9 8c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9S7.9 8 9 8zm6 0c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9S13.9 8 15 8z"/></svg>`;

/* The shop promo band, as it appears at the foot of the homepage and of every
   post. The collage is an img rather than a CSS background and the wording is
   live text, so it scales on a phone and Google can read the heading — a banner
   with its title baked into the pixels throws both of those away. */
export function shopBanner({ cta = 'Browse the shop' } = {}) {
  return `
  <a class="shop-band" href="/shop">
  <img src="/shop-banner.jpg" alt="" loading="lazy" decoding="async">
  <div class="sb-in">
    <span class="sb-kicker">Pet-GoToPro Shop</span>
    <div class="sb-title">Pet parent merchandise</div>
    <span class="sb-sub">Mugs, tees, totes, pillows and stickers for dog, cat, reptile, bird, fish and small-pet people. Printed when you order.</span>
    <span class="sb-cta">${esc(cta)} &rarr;</span>
  </div>`;
}

export function pawDivider() {
  return `<div class="paw-divider" aria-hidden="true">${PAW_SVG}${PAW_SVG}${PAW_SVG}</div>`;
}

export function logoUrl(settings) {
  return settings.logo_media_id ? `/media/${settings.logo_media_id}` : '/logo.png';
}

// ——— Sharing ————————————————————————————————————————————————
// Builds the row of share buttons. Everything is a plain link built here on
// the server, so it works with JS switched off and loads nothing from a
// third party — no widget script, no cookie, no tracking pixel.
//
//   url          absolute, and it must be absolute: every network fetches it
//   title        what gets quoted in the post
//   description  used by Pinterest and email, which allow longer text
//   image        absolute URL of the image Pinterest should pin
//   compact      a slim inline row, for under a byline
//   label        overrides the heading
const SHARE_ICONS = {
  pin: '<svg viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12c0 5.1 3.2 9.4 7.6 11.2-.1-.9-.2-2.4 0-3.4.2-.9 1.4-6 1.4-6s-.4-.7-.4-1.8c0-1.7 1-3 2.2-3 1 0 1.5.8 1.5 1.7 0 1-.7 2.6-1 4.1-.3 1.2.6 2.2 1.8 2.2 2.2 0 3.8-2.3 3.8-5.6 0-2.9-2.1-5-5.1-5-3.5 0-5.5 2.6-5.5 5.3 0 1 .4 2.2.9 2.8.1.1.1.2.1.3l-.3 1.3c0 .2-.2.3-.4.2-1.5-.7-2.4-2.9-2.4-4.7 0-3.8 2.8-7.3 8-7.3 4.2 0 7.4 3 7.4 7 0 4.2-2.6 7.5-6.3 7.5-1.2 0-2.4-.6-2.8-1.4l-.8 2.9c-.3 1.1-1 2.5-1.5 3.4 1.1.3 2.3.5 3.5.5 6.6 0 12-5.4 12-12S18.6 0 12 0z"/></svg>',
  fb:  '<svg viewBox="0 0 24 24"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/></svg>',
  x:   '<svg viewBox="0 0 24 24"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41z"/></svg>',
  wa:  '<svg viewBox="0 0 24 24"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.8h-.01a9.8 9.8 0 01-4.99-1.37l-.36-.21-3.71.97.99-3.62-.23-.37a9.78 9.78 0 01-1.5-5.22c0-5.4 4.4-9.8 9.82-9.8 2.62 0 5.08 1.03 6.93 2.88a9.74 9.74 0 012.87 6.93c0 5.4-4.4 9.81-9.81 9.81zM20.5 3.49A11.76 11.76 0 0012.04 0C5.56 0 .29 5.27.28 11.75c0 2.07.54 4.09 1.57 5.87L.18 24l6.53-1.71a11.73 11.73 0 005.32 1.35h.01c6.48 0 11.75-5.27 11.76-11.75a11.68 11.68 0 00-3.3-8.4z"/></svg>',
  rd:  '<svg viewBox="0 0 24 24"><path d="M24 11.78a2.6 2.6 0 00-4.4-1.86 12.8 12.8 0 00-6.96-2.22l1.18-5.56 3.87.82a1.86 1.86 0 103.7-.3 1.86 1.86 0 00-3.53-.55l-4.32-.92a.45.45 0 00-.53.35l-1.32 6.2a12.8 12.8 0 00-7.05 2.2 2.6 2.6 0 10-2.87 4.26 5.1 5.1 0 00-.06.8c0 4.07 4.74 7.37 10.6 7.37 5.85 0 10.6-3.3 10.6-7.37 0-.27-.02-.53-.06-.79A2.6 2.6 0 0024 11.78zM6.28 13.64a1.86 1.86 0 113.72 0 1.86 1.86 0 01-3.72 0zm10.4 4.93a6.9 6.9 0 01-4.67 1.45h-.02a6.9 6.9 0 01-4.67-1.45.46.46 0 01.65-.65 6.03 6.03 0 004.02 1.18h.02a6.03 6.03 0 004.02-1.18.46.46 0 11.65.65zm-.35-3.07a1.86 1.86 0 110-3.72 1.86 1.86 0 010 3.72z"/></svg>',
  em:  '<svg viewBox="0 0 24 24"><path d="M1.5 4.5h21a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5h-21A1.5 1.5 0 010 18V6a1.5 1.5 0 011.5-1.5zm10.5 8.1L2.4 6.75h19.2L12 12.6zM2.25 8.63V17.1h19.5V8.63l-9.3 5.67a.9.9 0 01-.9 0z"/></svg>',
  link:'<svg viewBox="0 0 24 24"><path d="M10.6 13.4a1 1 0 001.4 0l4.9-4.9a2.5 2.5 0 00-3.5-3.5l-2 2a1 1 0 001.4 1.4l2-2a.5.5 0 01.7.7l-4.9 4.9a1 1 0 000 1.4zm2.8-2.8a1 1 0 00-1.4 0l-4.9 4.9a2.5 2.5 0 003.5 3.5l2-2a1 1 0 10-1.4-1.4l-2 2a.5.5 0 01-.7-.7l4.9-4.9a1 1 0 000-1.4z"/><path d="M6.5 21a4.5 4.5 0 01-3.2-7.7l2.6-2.6a1 1 0 011.4 1.4l-2.6 2.6A2.5 2.5 0 008.3 18.2l2.6-2.6a1 1 0 011.4 1.4l-2.6 2.6A4.47 4.47 0 016.5 21zM14.9 12.6a1 1 0 01-.7-1.7l2.6-2.6a2.5 2.5 0 00-3.6-3.5l-2.6 2.6a1 1 0 01-1.4-1.4l2.6-2.6a4.5 4.5 0 116.4 6.3l-2.6 2.6a1 1 0 01-.7.3z"/></svg>',
  share:'<svg viewBox="0 0 24 24"><path d="M18 16.08a2.9 2.9 0 00-1.96.77L8.9 12.7a3.3 3.3 0 000-1.4l7.05-4.11A2.99 2.99 0 1015 5c0 .24.04.47.09.7L8.04 9.81a3 3 0 100 4.38l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 105.92 0 2.92 2.92 0 00-3-2.92z"/></svg>',
};

export function shareBar({ url, title, description, image, compact, label,
                           only, icons } = {}) {
  const u = encodeURIComponent(url || '');
  const t = encodeURIComponent(title || '');
  const d = encodeURIComponent((description || title || '').slice(0, 480));
  const m = encodeURIComponent(image || '');
  // `only` picks a subset, for somewhere too narrow to carry the full row —
  // a guide card is 280px wide however big the window is.
  const want = n => !only || only.indexOf(n) !== -1;
  const btn = (cls, href, name, icon) => want(cls)
    ? `<a class="sh sh-${cls}" href="${href}" target="_blank" rel="noopener noreferrer" ` +
      `aria-label="Share on ${name}" title="Share on ${name}">${icon}<span class="sh-t">${name}</span></a>`
    : '';
  return `
<div class="share-bar${compact ? ' share-bar--compact' : ''}${icons ? ' share-bar--icons' : ''}" data-share-url="${esc(url || '')}" data-share-title="${esc(title || '')}" data-share-text="${esc(description || '')}">
  <span class="share-label">${esc(label || 'Share this')}</span>
  <div class="share-btns">
    ${image && want('pin') ? btn('pin', `https://pinterest.com/pin/create/button/?url=${u}&media=${m}&description=${d}`, 'Pinterest', SHARE_ICONS.pin) : ''}
    ${btn('fb', `https://www.facebook.com/sharer/sharer.php?u=${u}`, 'Facebook', SHARE_ICONS.fb)}
    ${btn('x', `https://twitter.com/intent/tweet?url=${u}&text=${t}`, 'X', SHARE_ICONS.x)}
    ${btn('wa', `https://api.whatsapp.com/send?text=${t}%20${u}`, 'WhatsApp', SHARE_ICONS.wa)}
    ${btn('rd', `https://www.reddit.com/submit?url=${u}&title=${t}`, 'Reddit', SHARE_ICONS.rd)}
    ${btn('em', `mailto:?subject=${t}&body=${d}%0A%0A${u}`, 'Email', SHARE_ICONS.em)}
    ${want('copy') ? `<button class="sh sh-copy" type="button" aria-label="Copy link to this page" title="Copy link">${SHARE_ICONS.link}<span class="sh-t">Copy</span></button>` : ''}
    ${want('native') ? `<button class="sh sh-native" type="button" aria-label="Open your device share menu" title="Share" hidden>${SHARE_ICONS.share}<span class="sh-t">Share…</span></button>` : ''}
  </div>
</div>`;
}

// Full page layout for the public site
export function layout({ settings, menu, title, description, canonical, body,
                         ogImage, ogImageAlt, jsonLd, ogType, article }) {
  // The owner's own menu items, flat. The footer keeps exactly this: a footer
  // is a list, not a place to hide things behind a hover.
  const nav = (menu || []).map(m => `<a href="${esc(m.url)}">${esc(m.label)}</a>`).join('');
  // General is a real category but not an animal, so it is not in the dropdown.
  const petLinks = PET_CATEGORIES.filter(cat => cat.key !== 'General').map(cat =>
    `<a href="/category/${encodeURIComponent(cat.key)}">` +
    `<span class="d-emoji" aria-hidden="true">${cat.emoji}</span>${esc(cat.key)}</a>`).join('');
  // Putting the categories in the header means every page links to every
  // category, which the homepage tiles alone were not doing.
  const headerNav = `<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="pgp-nav-links">`
    + `<span class="nav-bars" aria-hidden="true"><i></i></span>Menu</button>
    <div class="nav-links" id="pgp-nav-links">${nav}<div class="nav-drop">`
    + `<button class="nav-drop-btn" type="button" aria-expanded="false">Pets`
    + `<span class="caret" aria-hidden="true">\u25BE</span></button>`
    + `<div class="nav-drop-menu">${petLinks}</div></div></div>`;
  const logo = logoUrl(settings);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description || '')}">
${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ''}
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="apple-touch-icon" href="${esc(logo)}">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#15111C">
<meta name="apple-mobile-web-app-title" content="${esc(settings.site_name)}">
<meta name="mobile-web-app-capable" content="yes">
<link rel="alternate" type="application/rss+xml" title="${esc(settings.site_name)} RSS" href="/rss.xml">
<meta property="og:type" content="${ogType || 'website'}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description || '')}">
<meta property="og:site_name" content="${esc(settings.site_name)}">
<meta property="og:locale" content="en_US">
${canonical ? `<meta property="og:url" content="${esc(canonical)}">` : ''}
${ogImage ? `<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:image:alt" content="${esc(ogImageAlt || title)}">` : ''}
${article && article.published ? `<meta property="article:published_time" content="${esc(article.published)}">` : ''}
${article && article.modified ? `<meta property="article:modified_time" content="${esc(article.modified)}">` : ''}
${article && article.section ? `<meta property="article:section" content="${esc(article.section)}">` : ''}
${article && article.tags ? article.tags.slice(0, 6).map(t => `<meta property="article:tag" content="${esc(t)}">`).join('\n') : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description || '')}">
${ogImage ? `<meta name="twitter:image" content="${esc(ogImage)}">
<meta name="twitter:image:alt" content="${esc(ogImageAlt || title)}">` : ''}
${jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&family=Quicksand:wght@600;700&display=swap" rel="stylesheet">
<style>${PUBLIC_CSS}</style>
<!-- Set in the head, not with the scripts at the foot of the page: the phone
     nav is collapsed by a .has-js rule, so marking it any later would show the
     menu fully expanded for a frame and then snap it shut. -->
<script>document.documentElement.className += ' has-js';</script>
</head>
<body>
<div class="brand-bar">
  <div class="brand-bar-inner">
    <a class="brand-link" href="/">
      <div class="brand-logo"><img src="${esc(logo)}" alt="${esc(settings.site_name)} logo"></div>
      <div class="brand-text">
        <div class="brand-name">${esc(settings.site_name)}</div>
        <div class="brand-tag">${esc(settings.tagline)}</div>
      </div>
    </a>
    <nav class="site-nav" aria-label="Main navigation">${headerNav}</nav>
  </div>
</div>
${body}
<footer class="site-footer">
  <div class="foot-logo"><img src="${esc(logo)}" alt="${esc(settings.site_name)}"></div>
  <div class="foot-name">${esc(settings.site_name)}</div>
  <div class="foot-tag">${esc(settings.tagline)}</div>
  <nav class="foot-nav">${nav}</nav>
  <nav class="foot-nav foot-sub" aria-label="Browse by pet"><span class="foot-lead">Browse by pet</span><a href="/category/Dogs">Dogs</a><a href="/category/Cats">Cats</a><a href="/category/Small%20Pets">Small Pets</a><a href="/category/Birds">Birds</a><a href="/category/Reptiles">Reptiles</a><a href="/category/Aquatics">Aquatics</a><a href="/category/Invertebrates">Invertebrates</a></nav>
  <nav class="foot-nav foot-sub" aria-label="Site information"><a href="/affiliate-disclosure">Affiliate Disclosure</a><a href="/privacy-policy">Privacy Policy</a><a href="/terms">Terms</a><a href="/shipping">Shipping</a><a href="/refunds-returns">Refunds &amp; Returns</a><a href="/intellectual-property">Intellectual Property</a></nav>
  <div class="foot-disclosure"><strong style="color:var(--cream);">Affiliate Disclosure:</strong> ${esc(settings.footer_disclosure)}</div>
  <!-- Legal entity, then the trading name. The year is dynamic so it never goes
       stale, and the legal name falls back to a literal rather than requiring a
       settings row, so this keeps working on a database that has not got one. -->
  <div class="foot-copy">© ${new Date().getFullYear()} ${esc(settings.legal_name || 'Bizarre Collections LLC')}, trading as ${esc(settings.site_name)}. All rights reserved.</div>
</footer>

<!-- Click-to-expand lightbox -->
<div id="pgp-lightbox" role="dialog" aria-modal="true" aria-label="Expanded image">
  <button id="pgp-lb-close" aria-label="Close image">&times;</button>
  <img id="pgp-lb-img" alt="">
  <div id="pgp-lb-cap"></div>
  <div id="pgp-lb-bar">
    <button id="pgp-lb-zoom">🔍 Zoom in</button>
    <a id="pgp-lb-dl" download>⬇️ Download free</a>
    <button id="pgp-lb-x">✕ Close</button>
  </div>
</div>
<script>
(function(){
  var lb=document.getElementById('pgp-lightbox'), im=document.getElementById('pgp-lb-img'),
      cap=document.getElementById('pgp-lb-cap'), dl=document.getElementById('pgp-lb-dl'),
      zb=document.getElementById('pgp-lb-zoom');
  if(!lb) return;
  function open(src,alt,caption){
    im.src=src; im.alt=alt||''; im.classList.remove('zoomed'); zb.textContent='🔍 Zoom in';
    cap.textContent=caption||'';
    dl.href=src+(src.indexOf('?')>-1?'&':'?')+'download=1';
    lb.classList.add('open'); document.body.style.overflow='hidden';
  }
  function close(){ lb.classList.remove('open'); document.body.style.overflow=''; im.src=''; }
  document.addEventListener('click', function(e){
    var t=e.target;
    if(t.tagName==='IMG' && t.closest('.prose') && !t.classList.contains('no-zoom') && !t.closest('a')){
      var fig=t.closest('figure'), fc=fig?fig.querySelector('figcaption'):null;
      open(t.currentSrc||t.src, t.alt, fc?fc.textContent:'');
    }
  });
  lb.addEventListener('click', function(e){ if(e.target===lb) close(); });
  document.getElementById('pgp-lb-close').addEventListener('click', close);
  document.getElementById('pgp-lb-x').addEventListener('click', close);
  im.addEventListener('click', function(){ if(im.classList.contains('zoomed')){ im.classList.remove('zoomed'); zb.textContent='🔍 Zoom in'; } else close(); });
  zb.addEventListener('click', function(){
    im.classList.toggle('zoomed');
    zb.textContent = im.classList.contains('zoomed') ? '🔍 Fit to screen' : '🔍 Zoom in';
  });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && lb.classList.contains('open')) close(); });
})();
</script>
<script>
/* Sharing helpers. Everything here is an enhancement: the network links are
   plain anchors rendered on the server, so with JS off they still work and
   these two extra buttons simply never appear. */
(function(){
  // ——— Copy link ———
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('.sh-copy');
    if(!b) return;
    var bar = b.closest('.share-bar');
    var url = (bar && bar.getAttribute('data-share-url')) || location.href;
    var t = b.querySelector('.sh-t'), old = t ? t.textContent : '';
    function done(){
      b.classList.add('done');
      if(t) t.textContent = 'Copied!';
      setTimeout(function(){ b.classList.remove('done'); if(t) t.textContent = old; }, 2000);
    }
    function fallback(){
      var ta = document.createElement('textarea');
      ta.value = url; ta.setAttribute('readonly','');
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); }
      catch(_) { window.prompt('Copy this link:', url); }
      document.body.removeChild(ta);
    }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(url).then(done, fallback);
    } else fallback();
  });

  // ——— The device's own share sheet, where there is one ———
  var coarse = window.matchMedia && matchMedia('(pointer:coarse)').matches;
  if(navigator.share){
    Array.prototype.forEach.call(document.querySelectorAll('.sh-native'), function(b){
      b.hidden = false;
      if(coarse){ var bar0 = b.closest('.share-bar'); if(bar0) bar0.classList.add('share-bar--native'); }
      b.addEventListener('click', function(){
        var bar = b.closest('.share-bar');
        navigator.share({
          title: (bar && bar.getAttribute('data-share-title')) || document.title,
          text:  (bar && bar.getAttribute('data-share-text')) || '',
          url:   (bar && bar.getAttribute('data-share-url')) || location.href
        }).catch(function(){});
      });
    });
  }

  // ——— Save an article image to Pinterest ———
  if(!window.matchMedia || !matchMedia('(hover:hover)').matches) return;
  var PIN = '<svg viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12c0 5.1 3.2 9.4 7.6 11.2-.1-.9-.2-2.4 0-3.4.2-.9 1.4-6 1.4-6s-.4-.7-.4-1.8c0-1.7 1-3 2.2-3 1 0 1.5.8 1.5 1.7 0 1-.7 2.6-1 4.1-.3 1.2.6 2.2 1.8 2.2 2.2 0 3.8-2.3 3.8-5.6 0-2.9-2.1-5-5.1-5-3.5 0-5.5 2.6-5.5 5.3 0 1 .4 2.2.9 2.8.1.1.1.2.1.3l-.3 1.3c0 .2-.2.3-.4.2-1.5-.7-2.4-2.9-2.4-4.7 0-3.8 2.8-7.3 8-7.3 4.2 0 7.4 3 7.4 7 0 4.2-2.6 7.5-6.3 7.5-1.2 0-2.4-.6-2.8-1.4l-.8 2.9c-.3 1.1-1 2.5-1.5 3.4 1.1.3 2.3.5 3.5.5 6.6 0 12-5.4 12-12S18.6 0 12 0z"/></svg>';
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'pin-save';
  btn.innerHTML = PIN + 'Save';
  btn.setAttribute('aria-label', 'Save this image to Pinterest');
  document.body.appendChild(btn);
  var target = null, hideT = null;

  function place(){
    if(!target) return;
    var r = target.getBoundingClientRect();
    // gone off screen, or scrolled away under the sticky header
    if(r.bottom < 40 || r.top > innerHeight - 10){ hide(true); return; }
    btn.style.top  = Math.max(46, r.top + 10) + 'px';
    btn.style.left = (r.left + 10) + 'px';
  }
  function show(im){
    target = im; place(); btn.classList.add('on');
  }
  function hide(now){
    clearTimeout(hideT);
    if(now){ btn.classList.remove('on'); target = null; return; }
    hideT = setTimeout(function(){ btn.classList.remove('on'); target = null; }, 220);
  }
  function pinnable(im){
    if(!im.closest('.prose')) return false;
    // inside a link the click belongs to the link; product wells and care-sheet
    // thumbnails are the owner's own art and are handled by the page's own bar
    if(im.closest('a, .pgp-prod, .product, .dl-thumb, .brand-logo')) return false;
    // Measure what is on screen, not the intrinsic size. naturalWidth reads 0
    // until the file has loaded, so sizing off it loses the button on any image
    // the reader reaches before it finishes downloading.
    var r = im.getBoundingClientRect();
    var w = r.width || im.naturalWidth, h = r.height || im.naturalHeight;
    return w >= 300 && h >= 200;
  }
  document.addEventListener('mouseover', function(e){
    var im = e.target;
    if(im.tagName === 'IMG' && pinnable(im)){ clearTimeout(hideT); show(im); }
    else if(!e.target.closest || !e.target.closest('.pin-save')) hide();
  });
  btn.addEventListener('mouseenter', function(){ clearTimeout(hideT); });
  btn.addEventListener('mouseleave', function(){ hide(); });
  addEventListener('scroll', place, { passive: true });
  addEventListener('resize', place);
  btn.addEventListener('click', function(e){
    e.preventDefault(); e.stopPropagation();   // must not open the lightbox
    if(!target) return;
    var src = target.currentSrc || target.src;
    if(src.charAt(0) === '/') src = location.origin + src;
    window.open('https://pinterest.com/pin/create/button/?url=' + encodeURIComponent(location.href) +
      '&media=' + encodeURIComponent(src) +
      '&description=' + encodeURIComponent(target.alt || document.title),
      '_blank', 'noopener,noreferrer,width=760,height=620');
  });
})();
</script>
<script>
/* Navigation. The CSS already opens the dropdown on hover and on focus-within,
   so this script is only here for the two things CSS cannot do: the phone
   panel, and tapping on a touch screen where there is no hover at all. */
(function(){
  var nav = document.querySelector('.site-nav');
  if (!nav) return;
  var toggle = nav.querySelector('.nav-toggle');
  var drops  = [].slice.call(nav.querySelectorAll('.nav-drop'));

  function setOpen(el, btn, open) {
    el.classList.toggle('open', open);
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function closeDrops() {
    drops.forEach(function(d){ setOpen(d, d.querySelector('.nav-drop-btn'), false); });
  }
  function closeAll() {
    closeDrops();
    setOpen(nav, toggle, false);
  }

  if (toggle) toggle.addEventListener('click', function(){
    var open = !nav.classList.contains('open');
    setOpen(nav, toggle, open);
    if (!open) closeDrops();
  });

  drops.forEach(function(drop){
    var btn = drop.querySelector('.nav-drop-btn');
    if (!btn) return;
    btn.addEventListener('click', function(){
      var open = !drop.classList.contains('open');
      closeDrops();
      setOpen(drop, btn, open);
    });
  });

  document.addEventListener('click', function(e){
    if (!nav.contains(e.target)) closeAll();
  });
  document.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    /* Escape has to hand focus back to the button it came from, or the reader
       is left with focus on a panel that is no longer on screen. */
    var inDrop = drops.filter(function(d){ return d.contains(document.activeElement); })[0];
    closeAll();
    if (inDrop) { var b = inDrop.querySelector('.nav-drop-btn'); if (b) b.focus(); }
    else if (toggle && nav.contains(document.activeElement)) toggle.focus();
  });
})();
</script>
<button id="to-top" type="button" aria-label="Back to top" title="Back to top">&uarr;</button>
<script>
(function(){
  var b = document.getElementById('to-top'); if (!b) return;
  var ticking = false;
  function sync(){ b.classList.toggle('on', (window.scrollY || document.documentElement.scrollTop) > 600); ticking = false; }
  addEventListener('scroll', function(){ if (!ticking) { ticking = true; requestAnimationFrame(sync); } }, { passive: true });
  b.addEventListener('click', function(){
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    var h = document.querySelector('h1');
    if (h) { h.setAttribute('tabindex','-1'); h.focus({ preventScroll: true }); }
  });
  sync();
})();
// Offline support for articles and images. Registered after load so it never
// competes with first paint, and silent on failure - it is an enhancement.
if ('serviceWorker' in navigator) {
  addEventListener('load', function(){ navigator.serviceWorker.register('/sw.js').catch(function(){}); });
}
</script>

<div id="pgp-consent" role="region" aria-label="Cookie choice">
  <p>We use affiliate tracking cookies so partners like Chewy and Amazon can credit a purchase you make
  through our links. It costs you nothing and it is what keeps the guides free.
  <a href="/privacy-policy">How we handle data</a>.</p>
  <div class="cbtns">
    <button type="button" class="no">Decline</button>
    <button type="button" class="yes">Accept</button>
  </div>
</div>
<script>
(function(){
  var KEY = 'pgp-consent-v1';
  var box = document.getElementById('pgp-consent');
  function loadImpact(){
    if (window.impactStat) return;
    (function(i,m,p,a,c,t){c.ire_o=p;c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};t=a.createElement(m);var z=a.getElementsByTagName(m)[0];t.async=1;t.src=i;z.parentNode.insertBefore(t,z)})("https://utt.impactcdn.com/P-A6799522-bb6d-499d-83ab-091ac86acb071.js",'script','impactStat',document,window);
    window.impactStat('transformLinks');
    window.impactStat('trackImpression');
  }
  function close(v){
    try { localStorage.setItem(KEY, v); } catch (e) {}
    if (box) box.classList.remove('on');
    document.body.classList.remove('consent-open');
    if (v === 'yes') loadImpact();
  }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === 'yes') { loadImpact(); return; }
  if (saved === 'no' || !box) return;
  box.classList.add('on');
  document.body.classList.add('consent-open');
  box.querySelector('.yes').addEventListener('click', function(){ close('yes'); });
  box.querySelector('.no').addEventListener('click', function(){ close('no'); });
})();
</script>
</body>
</html>`;
}
