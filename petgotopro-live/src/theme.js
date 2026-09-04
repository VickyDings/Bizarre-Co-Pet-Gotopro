// ——— Public site theme: shared CSS + layout ———
import { esc } from './util.js';

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
/* Unfilled image placeholders are invisible to visitors — they only show in the
   admin editor, so a box you forgot to fill never renders as a broken image.
   The caption and the product card's photo well collapse with them, so an
   unfilled box leaves no empty furniture behind either. */
.pgp-cell-ph{display:none}
.pgp-cell:not(:has(img))>.pgp-cap{display:none}
.pgp-prod-img:not(:has(img)){display:none}
.pgp-section .pgp-cap,.pgp-grid .pgp-cap{display:block;font-size:13px;color:#6E6480;font-style:italic;text-align:center;margin-top:9px;line-height:1.5}

/* Compact product card — the full .product card is too wide for a column */
.pgp-prod{background:#fff;border:1px solid #E5E0EE;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(21,17,28,.06);display:flex;flex-direction:column;height:100%}
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

/* Hero */
.home-hero{background:linear-gradient(135deg,#2A2140 0%,var(--ink) 100%);color:var(--cream);padding:64px 24px;text-align:center}
.home-hero h1{font-family:'Instrument Serif',Georgia,serif;font-size:clamp(30px,5vw,46px);line-height:1.15;max-width:760px;margin:0 auto 16px}
.home-hero p{font-size:18px;font-style:italic;color:#C0B6CE;max-width:620px;margin:0 auto}
.home-hero .hero-cta{display:inline-block;margin-top:26px;background:var(--amber);color:#fff;padding:13px 30px;border-radius:6px;text-decoration:none;font-weight:700}
.home-hero .hero-cta:hover{background:var(--amber-deep)}

/* Layout */
.container{max-width:1100px;margin:0 auto;padding:0 24px}
.section-title{font-family:'Instrument Serif',Georgia,serif;font-size:28px;font-weight:700;margin:52px 0 8px}
.section-sub{color:var(--ink-soft);font-size:15px;margin-bottom:24px}

/* Category tiles */
.cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin:20px 0 10px}
.cat-tile{background:#fff;border:1px solid var(--line);border-radius:10px;padding:20px 16px;text-align:center;text-decoration:none;color:var(--ink);box-shadow:var(--shadow-soft);transition:box-shadow .15s,transform .15s}
.cat-tile:hover{box-shadow:var(--shadow-med);transform:translateY(-2px)}
.cat-tile .emoji{font-size:30px;margin-bottom:8px}
.cat-tile .name{font-family:'Instrument Serif',Georgia,serif;font-weight:700;font-size:16px}

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
.disclosure{background:var(--cream-deep);border-left:3px solid var(--amber);padding:14px 20px;font-size:14px;color:var(--ink-soft);margin:0 0 32px;border-radius:0 4px 4px 0}
.hero-img{border-radius:12px;overflow:hidden;margin-bottom:32px;box-shadow:var(--shadow-med)}

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

/* Product cards (for review posts) */
.product{background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden;margin:28px 0;box-shadow:var(--shadow-soft)}
.product:hover{box-shadow:var(--shadow-med)}
.product-ribbon{display:flex;align-items:center;justify-content:space-between;padding:12px 22px;background:var(--ink);color:var(--cream);font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:600}
.product-ribbon .star{color:var(--amber)}
.product-body{display:grid;grid-template-columns:240px 1fr;gap:24px;padding:26px}
.product-image-wrap{aspect-ratio:1;background:var(--cream-deep);border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center}
.product-image-wrap img{width:100%;height:100%;object-fit:cover}
.product-image-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--amber);font-size:13px;text-align:center;padding:16px;font-style:italic}
.product-content h2.product-title,.product-content .product-title{font-family:'Instrument Serif',Georgia,serif;font-size:24px;line-height:1.25;margin:0 0 8px}
.product-price{display:flex;align-items:baseline;gap:10px;margin-bottom:14px}
.product-price .dollar{font-family:'Instrument Serif',Georgia,serif;font-size:26px;font-weight:700;color:var(--clay)}
.product-price .disclaimer{font-size:12px;color:var(--ink-soft);font-style:italic}
.best-for{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--forest);background:#E9F3EC;padding:5px 11px;border-radius:4px;margin-bottom:14px}
.product-desc{font-size:15px;color:var(--ink-soft);margin-bottom:16px;line-height:1.65}
.product-desc p{margin-bottom:12px}
.pros-cons{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:14px 0 18px;font-size:14px}
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
.callout{background:linear-gradient(135deg,#2A2140 0%,var(--ink) 100%);color:var(--cream);padding:36px 32px;border-radius:12px;margin:48px 0;position:relative;overflow:hidden}
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
.table-wrap{overflow-x:auto;margin:28px 0;border-radius:10px;border:1px solid var(--line);box-shadow:var(--shadow-soft)}
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
.funfact{background:linear-gradient(135deg,#F7F2FC 0%,var(--cream-deep) 100%);border:1px solid var(--line);border-left:5px solid var(--amber);border-radius:0 12px 12px 0;padding:18px 24px;margin:28px 0;position:relative}
.funfact .ff-label{display:block;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--amber-deep);margin-bottom:6px}
.funfact p{margin:0;font-size:16px;color:var(--ink-soft);line-height:1.6}
.funfact p strong{color:var(--ink)}

/* Vet warning box */
.vet-warning{background:#FDEEF0;border:1px solid #F4CFD6;border-left:5px solid var(--clay);border-radius:0 12px 12px 0;padding:20px 24px;margin:28px 0}
.vet-warning h4{font-family:'Instrument Serif',Georgia,serif;font-size:18px;color:var(--clay);margin-bottom:8px}
.vet-warning p{margin-bottom:8px;font-size:15.5px;color:var(--ink-soft)}
.vet-warning p:last-child{margin-bottom:0}

/* Vet tip / positive box */
.vet-tip{background:#E9F5EE;border:1px solid #CFE6D8;border-left:5px solid var(--moss);border-radius:0 12px 12px 0;padding:20px 24px;margin:28px 0}
.vet-tip h4{font-family:'Instrument Serif',Georgia,serif;font-size:18px;color:var(--forest);margin-bottom:8px}
.vet-tip p{margin-bottom:8px;font-size:15.5px;color:var(--ink-soft)}
.vet-tip p:last-child{margin-bottom:0}

/* Quick facts / at-a-glance card */
.quick-facts{background:#fff;border:1px solid var(--line);border-radius:12px;padding:24px 26px;margin:32px 0;box-shadow:var(--shadow-soft)}
.quick-facts h3{font-family:'Instrument Serif',Georgia,serif;font-size:20px;margin-bottom:16px}
.qf-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}
.qf-item{background:var(--cream);border-radius:8px;padding:12px 14px}
.qf-item .qf-label{display:block;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--amber-deep);margin-bottom:3px}
.qf-item .qf-value{font-size:15px;color:var(--ink);line-height:1.4}

/* Shopping checklist */
.kit-section{margin:24px 0}
.kit-section h3{font-family:'Instrument Serif',Georgia,serif;font-size:20px;margin:28px 0 6px}
.kit-section .kit-note{font-size:14px;color:var(--ink-soft);font-style:italic;margin-bottom:14px}
.kit-item{display:flex;gap:14px;align-items:flex-start;background:#fff;border:1px solid var(--line);border-radius:10px;padding:16px 18px;margin-bottom:10px;box-shadow:var(--shadow-soft)}
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
.method-list{counter-reset:m;list-style:none;margin:20px 0 0 0}
.method-list li{counter-increment:m;position:relative;padding-left:52px;margin-bottom:18px;font-size:15.5px;color:var(--ink-soft);line-height:1.6}
.method-list li::before{content:counter(m);position:absolute;left:0;top:-2px;width:34px;height:34px;border-radius:50%;background:var(--amber);color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Instrument Serif',Georgia,serif;font-weight:700;font-size:17px}
.method-list li b{color:var(--ink)}

/* Free download card */
.download-card{display:flex;gap:22px;align-items:center;background:linear-gradient(135deg,#2A2140 0%,var(--ink) 100%);color:var(--cream);border-radius:14px;padding:24px 28px;margin:36px 0;box-shadow:var(--shadow-med);flex-wrap:wrap}
.download-card .dl-thumb{flex-shrink:0;width:92px;border-radius:8px;overflow:hidden;background:#fff;box-shadow:0 4px 14px rgba(0,0,0,.3)}
.download-card .dl-thumb img{width:100%;display:block;margin:0;border-radius:0;box-shadow:none}
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
footer.site-footer{background:var(--ink);color:var(--cream);padding:48px 24px;margin-top:80px;text-align:center}
footer .foot-logo{width:44px;height:44px;border-radius:10px;background:var(--cream);padding:4px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;overflow:hidden}
footer .foot-logo img{width:100%;height:100%;object-fit:contain}
footer .foot-name{font-family:'Instrument Serif',Georgia,serif;font-size:20px;font-weight:700}
footer .foot-tag{color:var(--amber);font-style:italic;font-size:14px;margin-top:4px}
footer .foot-nav{margin-top:18px;display:flex;gap:18px;justify-content:center;flex-wrap:wrap}
footer .foot-nav a{color:#B0A6C0;font-size:13px;text-decoration:none}
footer .foot-nav a:hover{color:var(--cream)}
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

/* Chrome */
.brand-bar{background:transparent;border-bottom:1px solid var(--hair)}
.home-hero{background:linear-gradient(150deg,#2A2140 0%,var(--page) 70%);
  border-bottom:1px solid var(--hair);padding-bottom:72px}
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
}
`;

export const PAW_SVG = `<svg viewBox="0 0 24 24"><path d="M12 14c-2.5 0-6 1.5-6 4 0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2 0-2.5-3.5-4-6-4zm-5.5-2.5c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9.9 2.9 2 2.9zm11 0c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9.9 2.9 2 2.9zM9 8c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9S7.9 8 9 8zm6 0c1.1 0 2-1.3 2-2.9s-.9-2.9-2-2.9-2 1.3-2 2.9S13.9 8 15 8z"/></svg>`;

export function pawDivider() {
  return `<div class="paw-divider" aria-hidden="true">${PAW_SVG}${PAW_SVG}${PAW_SVG}</div>`;
}

export function logoUrl(settings) {
  return settings.logo_media_id ? `/media/${settings.logo_media_id}` : '/logo.png';
}

// Full page layout for the public site
export function layout({ settings, menu, title, description, canonical, body, ogImage, jsonLd, ogType }) {
  const nav = (menu || []).map(m => `<a href="${esc(m.url)}">${esc(m.label)}</a>`).join('');
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
<link rel="alternate" type="application/rss+xml" title="${esc(settings.site_name)} RSS" href="/rss.xml">
<meta property="og:type" content="${ogType || 'website'}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description || '')}">
<meta property="og:site_name" content="${esc(settings.site_name)}">
${ogImage ? `<meta property="og:image" content="${esc(ogImage)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description || '')}">
${jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&family=Quicksand:wght@600;700&display=swap" rel="stylesheet">
<style>${PUBLIC_CSS}</style>
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
    <nav class="site-nav" aria-label="Main navigation">${nav}</nav>
  </div>
</div>
${body}
<footer class="site-footer">
  <div class="foot-logo"><img src="${esc(logo)}" alt="${esc(settings.site_name)}"></div>
  <div class="foot-name">${esc(settings.site_name)}</div>
  <div class="foot-tag">${esc(settings.tagline)}</div>
  <nav class="foot-nav">${nav}</nav>
  <div class="foot-disclosure"><strong style="color:var(--cream);">Affiliate Disclosure:</strong> ${esc(settings.footer_disclosure)}</div>
  <div class="foot-copy">© ${new Date().getFullYear()} ${esc(settings.site_name)}. All rights reserved.</div>
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
</body>
</html>`;
}
