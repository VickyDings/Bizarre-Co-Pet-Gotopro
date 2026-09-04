// ——— Admin dashboard: auth, posts, Word import, pages, menu, settings, AI ———
import { Hono } from 'hono';
import {
  esc, slugify, now, fmtDate, excerpt, stripHtml,
  getSettings, setSetting, hashPassword, verifyPassword,
  createSession, sessionCookieHeader, clearSessionCookieHeader,
  checkAuth, destroySession, sameOrigin,
} from './util.js';
import { CATEGORIES, getGuides } from './public.js';
import { IMAGE_CSS, SECTION_CSS } from './theme.js';
import { seoSuggestions, topicIdeas } from './ai.js';

const ADMIN_CSS = IMAGE_CSS + SECTION_CSS + `
:root{--ink:#1a1410;--ink-soft:#3d322a;--cream:#faf6ef;--cream-deep:#f3ead9;--amber:#c8822b;--amber-deep:#a86618;--clay:#b8533a;--forest:#3d5c3a;--line:#e8dcc4;--radius:10px}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:var(--cream);color:var(--ink);font-size:15px;line-height:1.6}
a{color:var(--amber-deep)}
.shell{display:flex;min-height:100vh}
.side{width:220px;background:var(--ink);color:var(--cream);padding:20px 0;flex-shrink:0;display:flex;flex-direction:column}
.side .logo{display:flex;align-items:center;gap:10px;padding:0 18px 18px;border-bottom:1px solid #3d322a;margin-bottom:14px}
.side .logo img{width:38px;height:38px;border-radius:8px;background:var(--cream);padding:3px}
.side .logo b{font-size:15px}
.side a.nav{display:block;padding:10px 20px;color:#d9cdb4;text-decoration:none;font-size:14px;font-weight:500}
.side a.nav:hover{background:rgba(200,130,43,.18);color:#fff}
.side a.nav.active{background:rgba(200,130,43,.3);color:#fff;border-left:3px solid var(--amber)}
.side .spacer{flex:1}
.main{flex:1;padding:28px 34px;max-width:1060px}
h1.pagetitle{font-size:24px;font-weight:700;margin-bottom:4px}
.pagesub{color:var(--ink-soft);font-size:13px;margin-bottom:22px}
.card{background:#fff;border:1px solid var(--line);border-radius:var(--radius);padding:22px;margin-bottom:20px;box-shadow:0 2px 10px rgba(26,20,16,.05)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.stat{background:#fff;border:1px solid var(--line);border-radius:var(--radius);padding:18px;text-align:center}
.stat .n{font-size:30px;font-weight:800;color:var(--amber-deep)}
.stat .l{font-size:12px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.08em}
label{display:block;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-soft);margin:14px 0 6px}
input[type=text],input[type=password],input[type=url],select,textarea{width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:8px;font-size:14px;font-family:inherit;background:#fff}
input:focus,select:focus,textarea:focus{outline:2px solid var(--amber);outline-offset:0;border-color:var(--amber)}
.btn{display:inline-block;background:var(--amber);color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;text-decoration:none;font-family:inherit}
.btn:hover{background:var(--amber-deep)}
.btn.ghost{background:transparent;color:var(--ink-soft);border:1px solid var(--line)}
.btn.ghost:hover{border-color:var(--amber);color:var(--amber-deep);background:transparent}
.btn.danger{background:var(--clay)}
.btn.small{padding:6px 12px;font-size:12px}
.btn.green{background:var(--forest)}
table.list{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--line);border-radius:var(--radius);overflow:hidden}
table.list th{background:var(--ink);color:var(--cream);text-align:left;padding:10px 14px;font-size:11px;text-transform:uppercase;letter-spacing:.08em}
table.list td{padding:12px 14px;border-bottom:1px solid var(--line);font-size:14px;vertical-align:middle}
table.list tr:last-child td{border-bottom:none}
.badge{display:inline-block;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:.05em}
.badge.published{background:#eef5ea;color:var(--forest)}
.badge.draft{background:var(--cream-deep);color:var(--amber-deep)}
.toolbar{display:flex;gap:4px;flex-wrap:wrap;background:var(--cream-deep);border:1px solid var(--line);border-bottom:none;border-radius:8px 8px 0 0;padding:8px}
.toolbar button{background:#fff;border:1px solid var(--line);border-radius:6px;padding:6px 10px;font-size:13px;cursor:pointer;font-family:inherit;min-width:34px}
.toolbar button:hover{border-color:var(--amber);color:var(--amber-deep)}
.toolbar button:disabled{opacity:.38;cursor:default;border-color:var(--line);color:var(--ink-soft)}
.toolbar button:disabled:hover{border-color:var(--line);color:var(--ink-soft)}
.toolbar .tb-sep{width:1px;background:var(--line);margin:2px 4px;align-self:stretch}
#editor{min-height:420px;background:#fff;border:1px solid var(--line);border-radius:0 0 8px 8px;padding:20px 24px;font-family:Georgia,serif;font-size:16px;line-height:1.7;overflow-y:auto}
#editor:focus{outline:2px solid var(--amber)}
#editor h2{font-size:24px;margin:22px 0 10px}
#editor h3{font-size:19px;margin:18px 0 8px}
#editor p{margin-bottom:14px}
#editor ul,#editor ol{margin:0 0 14px 24px}
#editor img{max-width:100%;height:auto;border-radius:8px}
#editor blockquote{border-left:3px solid var(--amber);padding:6px 16px;background:var(--cream);margin:14px 0}
#htmlview{display:none;min-height:420px;font-family:ui-monospace,Menlo,monospace;font-size:12px;border-radius:0 0 8px 8px}
.aibox{background:linear-gradient(135deg,#2d241a,#1a1410);color:var(--cream);border-radius:var(--radius);padding:20px;margin-bottom:20px}
.aibox h3{font-size:15px;margin-bottom:4px;color:#fff}
.aibox .hint{font-size:12px;color:#c9bfa8;margin-bottom:12px}
.ai-result{background:#fff;color:var(--ink);border-radius:8px;padding:14px;margin-top:12px;font-size:13px;display:none}
.ai-result h4{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--amber-deep);margin:12px 0 6px}
.ai-result h4:first-child{margin-top:0}
.sugg{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 10px;background:var(--cream);border-radius:6px;margin-bottom:6px}
.sugg span{flex:1}
.idea{background:#fff;color:var(--ink);border-radius:8px;padding:14px;margin-top:10px}
.idea b{display:block;margin-bottom:2px}
.idea .im{font-size:12px;color:var(--ink-soft)}
.kw{display:inline-block;background:var(--cream-deep);color:var(--amber-deep);font-size:12px;padding:2px 8px;border-radius:20px;margin:2px 2px 0 0}
.flash{background:#eef5ea;border-left:3px solid var(--forest);padding:10px 16px;border-radius:0 6px 6px 0;margin-bottom:18px;font-size:14px}
/* Selected-image toolbar */
#editor img.pgp-selected{outline:3px solid var(--amber);outline-offset:2px}
#imgbar{position:fixed;z-index:900;background:var(--ink);border-radius:10px;padding:10px 12px;box-shadow:0 10px 30px rgba(26,20,16,.35);display:none;max-width:min(94vw,560px)}
#imgbar.show{display:block}
#imgbar .ib-row{display:flex;align-items:center;gap:6px;margin-bottom:7px;flex-wrap:wrap}
#imgbar .ib-row:last-child{margin-bottom:0}
#imgbar .ib-label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a89b83;width:52px;flex-shrink:0}
#imgbar button{background:#3d322a;color:#e6dcc8;border:1px solid #52443a;border-radius:6px;padding:6px 11px;font-size:12.5px;cursor:pointer;font-family:inherit;font-weight:600}
#imgbar button:hover{background:var(--amber);border-color:var(--amber);color:#fff}
#imgbar button.on{background:var(--amber);border-color:var(--amber);color:#fff}
#imgbar button.ib-danger:hover{background:var(--clay);border-color:var(--clay)}
#imgbar .ib-hint{font-size:11px;color:#a89b83;margin-top:7px;font-style:italic}
/* Editor preview of download cards */
#editor .download-card{background:#1a1410;color:#faf6ef;border-radius:12px;padding:18px 20px;margin:20px 0;display:flex;gap:16px;align-items:center;flex-wrap:wrap}
#editor .download-card .dl-thumb{width:70px;border-radius:6px;overflow:hidden;background:#fff;flex-shrink:0}
#editor .download-card .dl-thumb img{width:100%;display:block;margin:0}
#editor .download-card .dl-body{flex:1;min-width:200px}
#editor .download-card .dl-tag{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#1a1410;background:var(--amber);padding:3px 9px;border-radius:20px;margin-bottom:6px}
#editor .download-card h3{font-size:17px;color:#fff;margin:0 0 4px}
#editor .download-card p{font-size:13px;color:#d9cdb4;margin:0 0 10px}
#editor .download-card .dl-btn{display:inline-block;background:var(--amber);color:#fff;padding:8px 18px;border-radius:6px;text-decoration:none;font-weight:700;font-size:13px}
#editor .download-card .dl-note{display:block;font-size:11px;color:#a89b83;margin-top:6px;font-style:italic}
#editor figure.pgp-figure figcaption{outline:1px dashed transparent}
#editor figure.pgp-figure figcaption:focus{outline:1px dashed var(--amber)}
/* Link dialog */
#linkModal{position:fixed;inset:0;background:rgba(26,20,16,.55);z-index:1000;display:none;align-items:center;justify-content:center;padding:20px}
#linkModal.show{display:flex}
#linkModal .lm-box{background:#fff;border-radius:14px;padding:26px 28px;width:100%;max-width:470px;box-shadow:0 20px 60px rgba(26,20,16,.35)}
#linkModal h3{font-size:19px;margin-bottom:3px}
#linkModal .lm-sub{font-size:13px;color:var(--ink-soft);margin-bottom:6px}
#linkModal .seg{display:flex;gap:8px}
#linkModal .seg button{flex:1;background:var(--cream);border:1px solid var(--line);border-radius:8px;padding:9px;font-size:13px;cursor:pointer;font-family:inherit;font-weight:600;color:var(--ink-soft)}
#linkModal .seg button.on{background:var(--ink);color:var(--cream);border-color:var(--ink)}
#linkModal .cb{display:flex;align-items:center;gap:8px;margin-top:14px;font-size:13.5px;color:var(--ink-soft);text-transform:none;letter-spacing:0;font-weight:400}
#linkModal .cb input{width:auto;margin:0}
#linkModal #lnkColorRow{display:none}
#linkModal #lnkColorRow.show{display:block}
#linkModal .swatches{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
#linkModal .swatches button{width:34px;height:34px;border-radius:8px;border:2px solid transparent;cursor:pointer;padding:0;box-shadow:0 1px 4px rgba(26,20,16,.2)}
#linkModal .swatches button.on{border-color:var(--ink);box-shadow:0 0 0 2px var(--cream),0 0 0 4px var(--ink)}
#linkModal .custom-sw{position:relative;width:34px;height:34px;border-radius:8px;border:2px dashed var(--line);display:flex;align-items:center;justify-content:center;cursor:pointer;margin:0;overflow:hidden}
#linkModal .custom-sw input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;padding:0;border:none}
#linkModal .custom-sw span{font-size:17px;color:var(--ink-soft);font-weight:700;pointer-events:none}
#linkModal .lm-preview{margin-top:14px;font-size:12.5px;color:var(--ink-soft);display:flex;align-items:center;gap:10px;flex-wrap:wrap}
#linkModal .lm-aff{display:none;background:#eef5ea;border-left:3px solid var(--forest);border-radius:0 8px 8px 0;padding:10px 14px;font-size:12.5px;color:var(--ink-soft);margin-top:12px;line-height:1.5}
#linkModal .lm-aff.show{display:block}
#linkModal .lm-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:20px}
/* Floating link toolbar */
#linkbar{position:fixed;z-index:900;background:var(--ink);border-radius:10px;padding:9px 11px;box-shadow:0 10px 30px rgba(26,20,16,.35);display:none;align-items:center;gap:7px;max-width:min(92vw,520px)}
#linkbar.show{display:flex}
#linkbar .lb-url{font-size:12px;color:#c9bfa8;max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:ui-monospace,Menlo,monospace}
#linkbar button{background:#3d322a;color:#e6dcc8;border:1px solid #52443a;border-radius:6px;padding:6px 11px;font-size:12.5px;cursor:pointer;font-family:inherit;font-weight:600;white-space:nowrap}
#linkbar button:hover{background:var(--amber);border-color:var(--amber);color:#fff}
#linkbar button.lb-danger:hover{background:var(--clay);border-color:var(--clay)}
#editor a{color:var(--amber-deep)}
/* The public stylesheet gives .cta-btn its amber background; without a copy here
   the white button text sat on white paper and the button looked missing. */
#editor a.cta-btn{display:inline-block;background:var(--amber);color:#fff;padding:11px 24px;border-radius:6px;text-decoration:none;font-weight:700;font-size:15px;font-family:Georgia,serif}
#editor a.cta-btn::after{content:' →'}
.flash.err{background:#fbeeea;border-left-color:var(--clay)}
.drop{border:2px dashed var(--line);border-radius:var(--radius);padding:26px;text-align:center;color:var(--ink-soft);background:#fff}
.drop.drag{border-color:var(--amber);background:var(--cream-deep)}
.menurow{display:flex;gap:8px;align-items:center;margin-bottom:8px}
.menurow input{flex:1}
.auth-wrap{max-width:420px;margin:8vh auto;padding:0 20px}
.auth-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:34px;box-shadow:0 8px 30px rgba(26,20,16,.08);text-align:center}
.auth-card img{width:84px;height:84px;margin:0 auto 12px;border-radius:16px}
.auth-card h1{font-size:20px;margin-bottom:4px}
.auth-card p{font-size:13px;color:var(--ink-soft)}
.auth-card form{text-align:left;margin-top:14px}
.auth-card .btn{width:100%;margin-top:16px}
/* ————— Section / column blocks in the editor ————— */
/* Faint guides so you can see where each box starts and ends while editing.
   None of this reaches the published page — it lives in the admin stylesheet. */
#editor .pgp-section{position:relative;outline:1px dashed rgba(200,130,43,.45);outline-offset:3px;min-height:40px}
#editor .pgp-section:hover{outline-color:var(--amber)}
#editor .pgp-section.pgp-sec-active{outline:2px solid var(--amber);outline-offset:3px}
#editor .pgp-cell{outline:1px dashed rgba(111,96,85,.3);outline-offset:2px;min-height:32px;padding:2px}
#editor .pgp-cell.pgp-cell-active{outline:1.5px solid var(--forest);background:rgba(61,92,58,.04)}
#editor .pgp-cell:empty::before,#editor .pgp-cell>p:only-child:empty::before{content:'Click here, then use the box toolbar to add text, an image or a product';color:#b3a795;font-size:12.5px;font-style:italic;font-family:-apple-system,'Segoe UI',sans-serif}
#editor .pgp-cell-ph{display:flex;align-items:center;justify-content:center;text-align:center;min-height:96px;padding:14px;border:2px dashed var(--line);border-radius:8px;background:var(--cream);color:#b3a795;font-size:12.5px;font-style:italic;font-family:-apple-system,'Segoe UI',sans-serif;line-height:1.4}
#editor .pgp-prod-img .pgp-cell-ph{min-height:0;height:100%;width:100%;border:none;border-radius:0}
#editor .pgp-section>.pgp-sec-tag{position:absolute;top:-9px;left:10px;background:var(--amber);color:#fff;font-size:9.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:2px 7px;border-radius:20px;font-family:-apple-system,'Segoe UI',sans-serif;pointer-events:none;user-select:none}
/* ————— Drag to move, drag to resize ————— */
/* Both handles are drawn with pseudo-elements, so no extra nodes are ever
   inserted into the article and nothing can leak into the saved HTML. */
#editor .pgp-cell{position:relative}
#editor .pgp-cell::before{content:'⠿';position:absolute;top:-2px;left:-2px;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:13px;color:#fff;background:var(--amber);border-radius:5px;cursor:grab;opacity:0;transition:opacity .12s;z-index:5;font-family:-apple-system,'Segoe UI',sans-serif;line-height:1}
#editor .pgp-cell:hover::before,#editor .pgp-cell.pgp-cell-active::before{opacity:.85}
#editor .pgp-cell::before:hover{opacity:1}
/* Right-edge grip: drags this column's width against its neighbour */
#editor .pgp-grid:not(.pgp-grid--rows)>.pgp-cell:not(:last-child)::after{content:'';position:absolute;top:0;bottom:0;right:-9px;width:18px;cursor:col-resize;border-radius:3px;background:transparent;transition:background .12s;z-index:4}
#editor .pgp-grid:not(.pgp-grid--rows)>.pgp-cell:not(:last-child):hover::after{background:rgba(200,130,43,.28)}
#editor .pgp-cell.pgp-resizing::after{background:var(--amber)!important}
/* While a box is being dragged */
#editor .pgp-cell.pgp-dragging{opacity:.4}
#editor .pgp-cell.pgp-drop-before{box-shadow:-4px 0 0 var(--forest)}
#editor .pgp-cell.pgp-drop-after{box-shadow:4px 0 0 var(--forest)}
#editor .pgp-grid--rows>.pgp-cell.pgp-drop-before{box-shadow:0 -4px 0 var(--forest)}
#editor .pgp-grid--rows>.pgp-cell.pgp-drop-after{box-shadow:0 4px 0 var(--forest)}
body.pgp-dragging-now{cursor:grabbing!important;user-select:none}
body.pgp-resizing-now{cursor:col-resize!important;user-select:none}
/* Section picker dialog */
#secModal{position:fixed;inset:0;background:rgba(26,20,16,.55);z-index:1000;display:none;align-items:center;justify-content:center;padding:20px}
#secModal.show{display:flex}
#secModal .sm-box{background:#fff;border-radius:14px;padding:26px 28px;width:100%;max-width:620px;max-height:88vh;overflow-y:auto;box-shadow:0 20px 60px rgba(26,20,16,.35)}
#secModal h3{font-size:19px;margin-bottom:3px}
#secModal .sm-sub{font-size:13px;color:var(--ink-soft);margin-bottom:16px;line-height:1.5}
#secModal .sm-lab{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-soft);margin:18px 0 8px}
#secModal .sm-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
#secModal .sm-opt{background:var(--cream);border:2px solid var(--line);border-radius:9px;padding:10px 8px;cursor:pointer;font-family:inherit;text-align:center;color:var(--ink-soft)}
#secModal .sm-opt:hover{border-color:var(--amber)}
#secModal .sm-opt.on{border-color:var(--ink);background:#fff;color:var(--ink)}
#secModal .sm-opt .sm-name{display:block;font-size:11px;font-weight:600;margin-top:7px;line-height:1.25}
#secModal .sm-dia{display:grid;gap:3px;height:30px}
#secModal .sm-dia i{background:var(--amber);opacity:.45;border-radius:2px;display:block}
#secModal .sm-opt.on .sm-dia i{opacity:1}
#secModal .sm-row{display:flex;gap:8px;flex-wrap:wrap}
#secModal .sm-row button{flex:1;min-width:88px;background:var(--cream);border:2px solid var(--line);border-radius:8px;padding:9px 6px;font-size:12.5px;cursor:pointer;font-family:inherit;font-weight:600;color:var(--ink-soft)}
#secModal .sm-row button:hover{border-color:var(--amber)}
#secModal .sm-row button.on{background:var(--ink);color:var(--cream);border-color:var(--ink)}
#secModal .sm-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:22px}
/* Floating section toolbar */
#secbar{position:fixed;z-index:900;background:var(--ink);border-radius:10px;padding:9px 11px;box-shadow:0 10px 30px rgba(26,20,16,.35);display:none;gap:6px;max-width:min(94vw,660px);flex-wrap:wrap;align-items:center}
#secbar.show{display:flex}
#secbar .sb-label{font-size:10px;color:#a89b83;text-transform:uppercase;letter-spacing:.12em;font-weight:700;margin-right:2px;width:100%}
#secbar button{background:#3d322a;color:#e6dcc8;border:1px solid #52443a;border-radius:6px;padding:6px 10px;font-size:12.5px;cursor:pointer;font-family:inherit;font-weight:600;white-space:nowrap}
#secbar button:hover{background:var(--amber);border-color:var(--amber);color:#fff}
#secbar button.sb-danger:hover{background:var(--clay);border-color:var(--clay)}
#secbar .sb-sep{width:1px;height:22px;background:#52443a;margin:0 3px}
@media(max-width:840px){.shell{flex-direction:column}.side{width:100%;flex-direction:row;flex-wrap:wrap;align-items:center;padding:8px}.side .logo{border:none;padding:6px 12px;margin:0}.side a.nav{padding:8px 10px}.side .spacer{display:none}.main{padding:18px}.grid2,.grid3{grid-template-columns:1fr}}
`;

// ——— Undo / redo for the editor ———
// The browser's own undo only tracks execCommand and typing. Every section
// operation — insert, delete, add a box, change the background — works on the
// DOM directly, so Ctrl+Z could not reach it. This keeps its own snapshot
// history so one Undo covers both kinds of change.
const UNDO_JS = `
var UNDO_MAX = 60;
var undoStack = [], redoStack = [], undoTimer = null, undoBusy = false;
// Snapshots must never carry the editing-only outline classes, or undoing
// would paint a selection back onto something that is no longer selected.
// One place that strips every editing-only class, used by the undo history
// and by the save handlers, so a transient outline or drag marker can never
// be written to the database.
function sanitizeHtml(h) {
  return h
    .replace(/ ?pgp-selected/g, '')
    .replace(/ ?pgp-sec-active/g, '')
    .replace(/ ?pgp-cell-active/g, '')
    .replace(/ ?pgp-dragging/g, '')
    .replace(/ ?pgp-drop-before/g, '')
    .replace(/ ?pgp-drop-after/g, '')
    .replace(/ ?pgp-resizing/g, '');
}
function undoHtml() { return sanitizeHtml(editor.innerHTML); }
var lastCommitted = undoHtml();

function refreshUndo() {
  var u = document.getElementById('undoBtn'), r = document.getElementById('redoBtn');
  if (u) { u.disabled = !undoStack.length; u.title = undoStack.length ? 'Undo (' + undoStack.length + ' step' + (undoStack.length === 1 ? '' : 's') + ') — Ctrl+Z' : 'Nothing to undo yet'; }
  if (r) { r.disabled = !redoStack.length; r.title = redoStack.length ? 'Redo (' + redoStack.length + ') — Ctrl+Y' : 'Nothing to redo'; }
}
function pushState(html) {
  if (undoStack.length && undoStack[undoStack.length - 1] === html) return;
  undoStack.push(html);
  if (undoStack.length > UNDO_MAX) undoStack.shift();
  redoStack.length = 0;
  refreshUndo();
}
// Typing is grouped into bursts: one Undo takes back a phrase, not a letter.
function commitTyping() {
  if (undoBusy) return;
  var cur = undoHtml();
  if (cur === lastCommitted) return;
  pushState(lastCommitted);
  lastCommitted = cur;
}
// Call this immediately BEFORE any change made straight to the DOM.
function pushUndo() {
  if (undoBusy) return;
  clearTimeout(undoTimer); undoTimer = null;
  commitTyping();
  var cur = undoHtml();
  pushState(cur);
  lastCommitted = cur;
}
function restoreState(html) {
  undoBusy = true;
  if (typeof deselectSection === 'function') deselectSection();
  if (typeof deselect === 'function') deselect();
  editor.innerHTML = html;
  lastCommitted = html;
  undoBusy = false;
  editor.focus();
  // put the caret at the end so typing carries on somewhere sensible
  try {
    var r = document.createRange(); r.selectNodeContents(editor); r.collapse(false);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  } catch (e) {}
  if (typeof countWords === 'function') countWords();
  refreshUndo();
}
function doUndo() {
  clearTimeout(undoTimer); undoTimer = null;
  commitTyping();
  if (!undoStack.length) return;
  redoStack.push(undoHtml());
  restoreState(undoStack.pop());
}
function doRedo() {
  if (!redoStack.length) return;
  undoStack.push(undoHtml());
  restoreState(redoStack.pop());
}
editor.addEventListener('input', function () {
  if (undoBusy) return;
  clearTimeout(undoTimer);
  undoTimer = setTimeout(function () { undoTimer = null; commitTyping(); }, 700);
});
var undoBtnEl = document.getElementById('undoBtn');
var redoBtnEl = document.getElementById('redoBtn');
if (undoBtnEl) undoBtnEl.addEventListener('click', doUndo);
if (redoBtnEl) redoBtnEl.addEventListener('click', doRedo);
document.addEventListener('keydown', function (e) {
  if (!(e.ctrlKey || e.metaKey)) return;
  var inEditor = document.activeElement === editor || editor.contains(document.activeElement);
  if (!inEditor) return;
  var k = (e.key || '').toLowerCase();
  if (k === 'z' && !e.shiftKey) { e.preventDefault(); doUndo(); }
  else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); doRedo(); }
});
refreshUndo();
`;

// ——— "Add section" dialog + floating box toolbar (post editor and page editor) ———
const SECTION_DIALOG_HTML = `
<div id="secModal">
  <div class="sm-box">
    <h3>Add a section</h3>
    <p class="sm-sub">A section is its own independent band. Anything you put inside it &mdash; photos, text, product cards &mdash; stays inside it, so an image dropped between two sections can never get pulled up into the one above.</p>

    <span class="sm-lab">Shape</span>
    <div class="sm-grid" id="smLayouts"></div>

    <span class="sm-lab">What goes in the boxes</span>
    <div class="sm-row" id="smFill">
      <button type="button" data-fill="text" class="on">Text</button>
      <button type="button" data-fill="image">Photos</button>
      <button type="button" data-fill="imgtext">Photo + text</button>
      <button type="button" data-fill="product">Product cards</button>
    </div>

    <span class="sm-lab">Background</span>
    <div class="sm-row" id="smBg">
      <button type="button" data-bg="" class="on">None</button>
      <button type="button" data-bg="pgp-section--cream">Cream</button>
      <button type="button" data-bg="pgp-section--tint">Warm</button>
      <button type="button" data-bg="pgp-section--paper">White card</button>
      <button type="button" data-bg="pgp-section--rule">Top rule</button>
      <button type="button" data-bg="pgp-section--ink">Dark</button>
    </div>

    <span class="sm-lab">Heading <span style="font-weight:400;text-transform:none;letter-spacing:0">(optional)</span></span>
    <input type="text" id="smTitle" placeholder="e.g. What to feed, week by week">

    <div class="sm-actions">
      <button type="button" class="btn ghost" id="smCancel">Cancel</button>
      <button type="button" class="btn" id="smInsert">Insert section</button>
    </div>
  </div>
</div>

<!-- Floating toolbar for the section you are standing in -->
<div id="secbar">
  <span class="sb-label">This box</span>
  <button type="button" id="sbHead">H Heading</button>
  <button type="button" id="sbText">¶ Text</button>
  <button type="button" id="sbImg">🖼️ Image</button>
  <button type="button" id="sbProd">🛒 Product</button>
  <span class="sb-sep"></span>
  <button type="button" id="sbCell">➕ Add box</button>
  <button type="button" id="sbEven">⇹ Even widths</button>
  <button type="button" id="sbBg">🎨 Background</button>
  <span class="sb-sep"></span>
  <button type="button" id="sbSecUp">⬆ Move section up</button>
  <button type="button" id="sbSecDown">⬇ Move section down</button>
  <span class="sb-sep"></span>
  <button type="button" id="sbUp">⬆ Line above</button>
  <button type="button" id="sbDown">⬇ Line below</button>
  <button type="button" id="sbDone">✓ Done</button>
  <button type="button" id="sbDel" class="sb-danger">🗑 Delete section</button>
</div>
`;

// Editor JavaScript for sections. Shared verbatim by the post editor and the
// page editor; both define `editor` and an `uploadImage(file)` helper before
// this runs.
const SECTION_JS = `
/* ————— Sections: independent bands with 1–4 column layouts ————— */
var SEC_LAYOUTS = [
  { key:'one',    name:'One column',  grid:'pgp-grid--rows',       cells:1, cols:'1fr',        rows:'1fr' },
  { key:'two',    name:'Two columns', grid:'pgp-grid--2',          cells:2, cols:'1fr 1fr',    rows:'1fr' },
  { key:'three',  name:'Three cols',  grid:'pgp-grid--3',          cells:3, cols:'1fr 1fr 1fr',rows:'1fr' },
  { key:'four',   name:'Four cols',   grid:'pgp-grid--4',          cells:4, cols:'1fr 1fr 1fr 1fr', rows:'1fr' },
  { key:'wleft',  name:'Wide left',   grid:'pgp-grid--wide-left',  cells:2, cols:'2fr 1fr',    rows:'1fr' },
  { key:'wright', name:'Wide right',  grid:'pgp-grid--wide-right', cells:2, cols:'1fr 2fr',    rows:'1fr' },
  { key:'rows2',  name:'1 col, 2 rows', grid:'pgp-grid--rows',     cells:2, cols:'1fr',        rows:'1fr 1fr' },
  { key:'rows3',  name:'1 col, 3 rows', grid:'pgp-grid--rows',     cells:3, cols:'1fr',        rows:'1fr 1fr 1fr' }
];
var SEC_BGS = ['', 'pgp-section--cream', 'pgp-section--tint', 'pgp-section--paper', 'pgp-section--rule', 'pgp-section--ink'];
var secModal = document.getElementById('secModal');
var secLayout = SEC_LAYOUTS[1], secFill = 'text', secBg = '';
var secSavedRange = null;

/* ——— Cell contents ——— */
var CELL_PLACEHOLDER = '<div class="pgp-cell-ph">📷 Click this box, then press “🖼️ Image” to drop a photo in</div>';

function cellText(i) {
  return '<h3>Heading ' + i + '</h3><p>Write this box\\'s text here.</p>';
}
function cellImage() {
  return CELL_PLACEHOLDER + '<span class="pgp-cap">Caption for this photo</span>';
}
function cellProduct() {
  return [
    '<div class="pgp-prod">',
    '<div class="pgp-prod-badge">Our pick</div>',
    '<div class="pgp-prod-img">' + CELL_PLACEHOLDER + '</div>',
    '<div class="pgp-prod-body">',
    '<div class="pgp-prod-name">Product name</div>',
    '<div class="pgp-prod-price">$00–$00</div>',
    '<div class="pgp-prod-disc">*Price starts from and is subject to change</div>',
    '<div class="pgp-prod-why">Why this one — two honest sentences.</div>',
    '<a class="cta-btn" href="https://www.amazon.com/s?k=PRODUCT+NAME&tag=petgo2pro-20" target="_blank" rel="nofollow noopener sponsored">Check price on Amazon</a>',
    '<div class="pgp-prod-note">Link opens your local Amazon store where available.</div>',
    '</div></div>'
  ].join('');
}
function cellFor(fill, i) {
  if (fill === 'image') return cellImage();
  if (fill === 'product') return cellProduct();
  if (fill === 'imgtext') return (i % 2 === 1) ? cellImage() : cellText(i);
  return cellText(i);
}
function buildSection(layout, fill, bg, heading) {
  var cells = '';
  for (var i = 1; i <= layout.cells; i++) {
    cells += '<div class="pgp-cell">' + cellFor(fill, i) + '</div>';
  }
  var head = '';
  if (heading) head = '<h2 class="pgp-sec-title">' + heading + '</h2>';
  var secCls = 'pgp-section' + (bg ? ' ' + bg : '');
  return '<div class="' + secCls + '">' + head +
    '<div class="pgp-grid ' + layout.grid + '">' + cells + '</div></div><p><br></p>';
}

/* ——— The picker dialog ——— */
(function buildPicker(){
  var wrap = document.getElementById('smLayouts');
  if (!wrap) return;
  SEC_LAYOUTS.forEach(function(L, idx){
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'sm-opt' + (idx === 1 ? ' on' : '');
    b.dataset.layout = L.key;
    var bars = '';
    var n = (L.cols.split(' ').length) * (L.rows.split(' ').length);
    for (var i = 0; i < n; i++) bars += '<i></i>';
    b.innerHTML = '<span class="sm-dia" style="grid-template-columns:' + L.cols +
      ';grid-template-rows:' + L.rows + '">' + bars + '</span>' +
      '<span class="sm-name">' + L.name + '</span>';
    b.addEventListener('click', function(){
      wrap.querySelectorAll('.sm-opt').forEach(function(x){ x.classList.remove('on'); });
      b.classList.add('on');
      secLayout = L;
    });
    wrap.appendChild(b);
  });
})();
function segPick(containerId, attr, setter) {
  var c = document.getElementById(containerId);
  if (!c) return;
  c.querySelectorAll('button').forEach(function(b){
    b.addEventListener('click', function(){
      c.querySelectorAll('button').forEach(function(x){ x.classList.remove('on'); });
      b.classList.add('on');
      setter(b.dataset[attr]);
    });
  });
}
segPick('smFill', 'fill', function(v){ secFill = v; });
segPick('smBg', 'bg', function(v){ secBg = v; });

document.getElementById('secBtn').addEventListener('click', function(){
  var sel = window.getSelection();
  secSavedRange = (sel.rangeCount && editor.contains(sel.anchorNode)) ? sel.getRangeAt(0).cloneRange() : null;
  document.getElementById('smTitle').value = '';
  secModal.classList.add('show');
});
document.getElementById('smCancel').addEventListener('click', function(){ secModal.classList.remove('show'); });
secModal.addEventListener('click', function(e){ if (e.target === secModal) secModal.classList.remove('show'); });
document.getElementById('smInsert').addEventListener('click', function(){
  var heading = document.getElementById('smTitle').value.trim();
  var html = buildSection(secLayout, secFill, secBg, heading);
  pushUndo();
  secModal.classList.remove('show');
  editor.focus();
  if (secSavedRange) {
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(secSavedRange);
  }
  // Sections never nest. If the caret is sitting inside one, the new section
  // goes after it rather than inside one of its boxes.
  var anchor = window.getSelection().anchorNode;
  var inside = null;
  if (anchor) {
    var el = (anchor.nodeType === 1) ? anchor : anchor.parentElement;
    if (el && el.closest) inside = el.closest('.pgp-section');
    if (inside && !editor.contains(inside)) inside = null;
  }
  if (inside) {
    var top = inside;
    while (top.parentElement && top.parentElement !== editor) top = top.parentElement;
    top.insertAdjacentHTML('afterend', html);
  } else {
    document.execCommand('insertHTML', false, html);
  }
  if (typeof countWords === 'function') countWords();
});

/* ————— Floating toolbar for the section you are standing in ————— */
var secbar = document.getElementById('secbar');
var activeSection = null, activeCell = null;

function placeSecbar() {
  if (!activeSection) return;
  var r = activeSection.getBoundingClientRect();
  secbar.classList.add('show');
  var bw = secbar.offsetWidth, bh = secbar.offsetHeight;
  var top = r.bottom + 10;
  if (top + bh > window.innerHeight - 8) top = Math.max(8, r.top - bh - 10);
  var left = Math.min(Math.max(8, r.left), window.innerWidth - bw - 8);
  secbar.style.top = top + 'px';
  secbar.style.left = left + 'px';
}
function selectSection(sec, cell) {
  if (activeSection && activeSection !== sec) activeSection.classList.remove('pgp-sec-active');
  if (activeCell && activeCell !== cell) activeCell.classList.remove('pgp-cell-active');
  activeSection = sec; activeCell = cell || null;
  sec.classList.add('pgp-sec-active');
  if (activeCell) activeCell.classList.add('pgp-cell-active');
  placeSecbar();
}
function deselectSection() {
  if (activeSection) activeSection.classList.remove('pgp-sec-active');
  if (activeCell) activeCell.classList.remove('pgp-cell-active');
  activeSection = null; activeCell = null;
  secbar.classList.remove('show');
}
editor.addEventListener('click', function(e){
  var sec = e.target.closest ? e.target.closest('.pgp-section') : null;
  if (sec && editor.contains(sec)) {
    selectSection(sec, e.target.closest('.pgp-cell'));
  } else {
    deselectSection();
  }
});
document.addEventListener('click', function(e){
  if (!e.target.closest('#secbar') && !e.target.closest('#editor') && !e.target.closest('#secModal')) deselectSection();
});
window.addEventListener('scroll', function(){ if (activeSection) placeSecbar(); }, true);
window.addEventListener('resize', function(){ if (activeSection) placeSecbar(); });

/* Put new content at the end of the box you are standing in. If that box only
   holds an empty placeholder, the placeholder is replaced rather than kept. */
function targetBox() {
  if (activeCell) return activeCell;
  if (!activeSection) return null;
  var c = activeSection.querySelector('.pgp-cell');
  if (c) { activeCell = c; c.classList.add('pgp-cell-active'); return c; }
  return activeSection;
}
function addToBox(html, replacePlaceholder) {
  var box = targetBox();
  if (!box) { alert('Click inside a box first.'); return; }
  pushUndo();
  if (replacePlaceholder) {
    var ph = box.querySelector('.pgp-cell-ph');
    if (ph) { ph.outerHTML = html; if (typeof countWords === 'function') countWords(); return; }
  }
  box.insertAdjacentHTML('beforeend', html);
  if (typeof countWords === 'function') countWords();
}
document.getElementById('sbHead').addEventListener('click', function(){ addToBox('<h3>Heading</h3>', false); });
document.getElementById('sbText').addEventListener('click', function(){ addToBox('<p>Write here.</p>', false); });
document.getElementById('sbProd').addEventListener('click', function(){ addToBox(cellProduct(), false); });
document.getElementById('sbImg').addEventListener('click', function(){
  var box = targetBox();
  if (!box) { alert('Click inside a box first.'); return; }
  var inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = async function(){
    if (!inp.files[0]) return;
    var url = await uploadImage(inp.files[0]);
    if (!url) return;
    addToBox('<img class="pgp-img" src="' + url + '" alt="">', true);
  };
  inp.click();
});
document.getElementById('sbCell').addEventListener('click', function(){
  if (!activeSection) return;
  var grid = activeSection.querySelector('.pgp-grid');
  if (!grid) return;
  pushUndo();
  var n = grid.querySelectorAll(':scope > .pgp-cell').length + 1;
  grid.insertAdjacentHTML('beforeend', '<div class="pgp-cell">' + cellText(n) + '</div>');
  placeSecbar();
  if (typeof countWords === 'function') countWords();
});
document.getElementById('sbBg').addEventListener('click', function(){
  if (!activeSection) return;
  pushUndo();
  var cur = '';
  SEC_BGS.forEach(function(b){ if (b && activeSection.classList.contains(b)) cur = b; });
  var next = SEC_BGS[(SEC_BGS.indexOf(cur) + 1) % SEC_BGS.length];
  SEC_BGS.forEach(function(b){ if (b) activeSection.classList.remove(b); });
  if (next) activeSection.classList.add(next);
  placeSecbar();
});
/* A section at the very top or bottom of the article traps the cursor —
   these two put an ordinary empty line where you need it. */
function addLine(where) {
  if (!activeSection) return;
  pushUndo();
  activeSection.insertAdjacentHTML(where, '<p><br></p>');
  var p = (where === 'beforebegin') ? activeSection.previousElementSibling : activeSection.nextElementSibling;
  if (p) {
    var r = document.createRange();
    r.setStart(p, 0); r.collapse(true);
    var sel = window.getSelection();
    sel.removeAllRanges(); sel.addRange(r);
  }
  editor.focus();
  placeSecbar();
}
document.getElementById('sbUp').addEventListener('click', function(){ addLine('beforebegin'); });
document.getElementById('sbDown').addEventListener('click', function(){ addLine('afterend'); });
document.getElementById('sbDone').addEventListener('click', deselectSection);
document.getElementById('sbDel').addEventListener('click', function(){
  if (!activeSection) return;
  if (!confirm('Delete this whole section and everything in it?')) return;
  pushUndo();
  activeSection.remove();
  deselectSection();
  if (typeof countWords === 'function') countWords();
});
`;

// ——— Drag a box to move it, drag its edge to resize it ———
// Pointer events rather than HTML5 drag-and-drop: native DnD inside a
// contenteditable lets the browser move nodes itself, which fights with the
// grid. Handles are hit-tested by geometry against the CSS pseudo-elements.
const MOVE_JS = `
var GRIP = 22;      // top-left square that starts a move
var EDGE = 13;      // right-edge strip that starts a resize
var dragCell = null, dropCell = null, dropAfter = false, didDrag = false;
var rzGrid = null, rzIndex = null, rzStartX = 0, rzWidths = null;

function cellsOf(grid) { return Array.prototype.slice.call(grid.children).filter(function (c) { return c.classList.contains('pgp-cell'); }); }
function onGrip(cell, e) { var r = cell.getBoundingClientRect(); return (e.clientX - r.left) <= GRIP && (e.clientY - r.top) <= GRIP; }
function onEdge(cell, e) {
  var grid = cell.parentElement;
  if (!grid || !grid.classList.contains('pgp-grid') || grid.classList.contains('pgp-grid--rows')) return false;
  if (cell === cellsOf(grid)[cellsOf(grid).length - 1]) return false;
  var r = cell.getBoundingClientRect();
  return Math.abs(e.clientX - r.right) <= EDGE;
}
function clearDropMarks() {
  editor.querySelectorAll('.pgp-drop-before,.pgp-drop-after').forEach(function (c) { c.classList.remove('pgp-drop-before', 'pgp-drop-after'); });
}
// A grid whose column count changed can't keep hand-set widths, or the tracks
// stop lining up with the boxes. Fall back to even columns.
function resetCols(grid) { if (grid) grid.style.removeProperty('--pgp-cols'); }

/* ————— Move ————— */
function startDrag(cell, e) {
  dragCell = cell; didDrag = false;
  document.body.classList.add('pgp-dragging-now');
  editor.setAttribute('contenteditable', 'false');   // stop text selection fighting the drag
  cell.classList.add('pgp-dragging');
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', endDrag);
  e.preventDefault();
}
function onDragMove(e) {
  didDrag = true;
  clearDropMarks();
  dropCell = null;
  var el = document.elementFromPoint(e.clientX, e.clientY);
  var target = el && el.closest ? el.closest('.pgp-cell') : null;
  if (!target || target === dragCell || !editor.contains(target)) return;
  var r = target.getBoundingClientRect();
  var vertical = target.parentElement.classList.contains('pgp-grid--rows');
  dropAfter = vertical ? (e.clientY > r.top + r.height / 2) : (e.clientX > r.left + r.width / 2);
  dropCell = target;
  target.classList.add(dropAfter ? 'pgp-drop-after' : 'pgp-drop-before');
}
function endDrag() {
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', endDrag);
  document.body.classList.remove('pgp-dragging-now');
  editor.setAttribute('contenteditable', 'true');
  if (dragCell) dragCell.classList.remove('pgp-dragging');
  clearDropMarks();
  if (dragCell && dropCell && dropCell !== dragCell) {
    pushUndo();
    var from = dragCell.parentElement, to = dropCell.parentElement;
    if (dropAfter) dropCell.after(dragCell); else dropCell.before(dragCell);
    if (from !== to) { resetCols(from); resetCols(to); }
    if (typeof countWords === 'function') countWords();
  }
  dragCell = null; dropCell = null;
  setTimeout(function () { didDrag = false; }, 0);
}

/* ————— Resize ————— */
function startResize(cell, e) {
  var grid = cell.parentElement, cells = cellsOf(grid);
  rzGrid = grid;
  rzIndex = cells.indexOf(cell);
  rzStartX = e.clientX;
  rzWidths = cells.map(function (c) { return c.getBoundingClientRect().width; });
  pushUndo();
  cell.classList.add('pgp-resizing');
  document.body.classList.add('pgp-resizing-now');
  editor.setAttribute('contenteditable', 'false');
  document.addEventListener('mousemove', onResizeMove);
  document.addEventListener('mouseup', endResize);
  e.preventDefault();
}
function onResizeMove(e) {
  if (!rzGrid) return;
  var MIN = 60;
  var d = e.clientX - rzStartX;
  var a = rzWidths[rzIndex] + d, b = rzWidths[rzIndex + 1] - d;
  if (a < MIN) { d += (MIN - a); a = MIN; b = rzWidths[rzIndex + 1] - d; }
  if (b < MIN) { d -= (MIN - b); b = MIN; a = rzWidths[rzIndex] + d; }
  var w = rzWidths.slice();
  w[rzIndex] = a; w[rzIndex + 1] = b;
  var total = w.reduce(function (x, y) { return x + y; }, 0) || 1;
  // Store as fractions of the row, so the layout stays fluid at any screen size
  rzGrid.style.setProperty('--pgp-cols', w.map(function (px) {
    return 'minmax(0,' + (px / total * w.length).toFixed(3) + 'fr)';
  }).join(' '));
}
function endResize() {
  document.removeEventListener('mousemove', onResizeMove);
  document.removeEventListener('mouseup', endResize);
  document.body.classList.remove('pgp-resizing-now');
  editor.setAttribute('contenteditable', 'true');
  editor.querySelectorAll('.pgp-resizing').forEach(function (c) { c.classList.remove('pgp-resizing'); });
  rzGrid = null; rzWidths = null;
}

// The gap between two columns belongs to the grid, not to either cell, so a
// press landing there has no .pgp-cell to close over. Look for the nearest
// resizable edge in the grid before giving up.
function edgeCellAt(e) {
  var el = e.target.closest ? e.target.closest('.pgp-grid') : null;
  if (!el || el.classList.contains('pgp-grid--rows') || !editor.contains(el)) return null;
  var cells = cellsOf(el);
  for (var i = 0; i < cells.length - 1; i++) {
    var r = cells[i].getBoundingClientRect();
    if (Math.abs(e.clientX - r.right) <= EDGE && e.clientY >= r.top && e.clientY <= r.bottom) return cells[i];
  }
  return null;
}
editor.addEventListener('mousedown', function (e) {
  if (e.button !== 0) return;
  var cell = e.target.closest ? e.target.closest('.pgp-cell') : null;
  if (cell && editor.contains(cell)) {
    if (onEdge(cell, e)) { startResize(cell, e); return; }
    if (onGrip(cell, e)) { startDrag(cell, e); return; }
    return;
  }
  var edge = edgeCellAt(e);
  if (edge) startResize(edge, e);
});
// a finished drag must not also register as a click on the box
editor.addEventListener('click', function (e) { if (didDrag) { e.stopPropagation(); e.preventDefault(); } }, true);

/* ————— Move a whole section up or down ————— */
function moveSection(dir) {
  if (!activeSection) return;
  var top = activeSection;
  while (top.parentElement && top.parentElement !== editor) top = top.parentElement;
  var sib = dir < 0 ? top.previousElementSibling : top.nextElementSibling;
  if (!sib) return;
  pushUndo();
  if (dir < 0) sib.before(top); else sib.after(top);
  placeSecbar();
}
var sbUpSec = document.getElementById('sbSecUp'), sbDownSec = document.getElementById('sbSecDown');
if (sbUpSec) sbUpSec.addEventListener('click', function () { moveSection(-1); });
if (sbDownSec) sbDownSec.addEventListener('click', function () { moveSection(1); });

/* Even out the columns again */
var sbEven = document.getElementById('sbEven');
if (sbEven) sbEven.addEventListener('click', function () {
  if (!activeSection) return;
  pushUndo();
  activeSection.querySelectorAll('.pgp-grid').forEach(resetCols);
});
`;

// ——— Shared link dialog (used by both the post editor and the page editor) ———
const LINK_DIALOG_HTML = `
<div id="linkModal">
  <div class="lm-box">
    <h3 id="lmTitle">Add a link</h3>
    <p class="lm-sub">Link to another page on your site, or out to a product.</p>
    <label>Link text <span style="font-weight:400;text-transform:none">(what readers see)</span></label>
    <input type="text" id="lnkText" placeholder="e.g. See our tested picks">
    <label>Web address</label>
    <input type="text" id="lnkUrl" placeholder="https://www.amazon.com/…  or  /blog/my-other-post">
    <div class="lm-aff" id="lnkAff">🛒 <b>Amazon link detected.</b> Your affiliate tag will be added automatically, along with the <code>sponsored</code> and <code>nofollow</code> tags that Amazon and Google require. It will also open in a new tab.</div>
    <label>Appearance</label>
    <div class="seg" id="lnkStyle">
      <button type="button" data-style="text" class="on">Normal text link</button>
      <button type="button" data-style="button">Big button</button>
    </div>
    <div id="lnkColorRow">
      <label>Button colour</label>
      <div class="swatches" id="lnkColors">
        <button type="button" data-col="" title="Amber" style="background:#c8822b" class="on"></button>
        <button type="button" data-col="cta-green" title="Forest green" style="background:#3d5c3a"></button>
        <button type="button" data-col="cta-teal" title="Teal" style="background:#1f6f6b"></button>
        <button type="button" data-col="cta-blue" title="Blue" style="background:#2b5f8a"></button>
        <button type="button" data-col="cta-purple" title="Purple" style="background:#6b4a8a"></button>
        <button type="button" data-col="cta-pink" title="Pink" style="background:#b8446f"></button>
        <button type="button" data-col="cta-clay" title="Clay red" style="background:#b8533a"></button>
        <button type="button" data-col="cta-ink" title="Black" style="background:#1a1410"></button>
        <label class="custom-sw" title="Pick any colour">
          <input type="color" id="lnkCustom" value="#c8822b"><span>＋</span>
        </label>
      </div>
      <div class="lm-preview">Preview: <a class="cta-btn" id="lnkPreview" href="#" onclick="return false">Your button</a></div>
    </div>
    <label class="cb"><input type="checkbox" id="lnkBlank"> Open in a new tab</label>
    <div class="lm-actions">
      <button type="button" class="btn ghost" id="lnkCancel">Cancel</button>
      <button type="button" class="btn" id="lnkSave">Insert link</button>
    </div>
  </div>
</div>
<div id="linkbar">
  <span class="lb-url" id="lbUrl"></span>
  <button type="button" id="lbEdit">✏️ Edit link</button>
  <button type="button" id="lbOpen">↗ Test it</button>
  <button type="button" id="lbUnlink" class="lb-danger">✕ Remove link</button>
</div>`;

const LINK_DIALOG_JS = `
(function(){
  var modal = document.getElementById('linkModal');
  var lbar = document.getElementById('linkbar');
  var fText = document.getElementById('lnkText'), fUrl = document.getElementById('lnkUrl');
  var fBlank = document.getElementById('lnkBlank'), fAff = document.getElementById('lnkAff');
  var editingAnchor = null, savedRange = null, linkStyle = 'text', activeAnchor = null;
  var COLOR_CLASSES = ['cta-green','cta-teal','cta-blue','cta-purple','cta-pink','cta-clay','cta-ink'];
  var btnColorClass = '', btnCustomColor = '';
  var colorRow = document.getElementById('lnkColorRow');
  var preview = document.getElementById('lnkPreview');
  var customInput = document.getElementById('lnkCustom');

  function markSwatch(el){
    document.querySelectorAll('#lnkColors button').forEach(function(b){ b.classList.remove('on'); });
    document.querySelector('.custom-sw').style.borderColor = '';
    if (el) el.classList.add('on');
  }
  function refreshPreview(){
    preview.className = 'cta-btn' + (btnColorClass ? ' ' + btnColorClass : '');
    preview.style.background = btnCustomColor || '';
  }
  function pickPreset(cls, el){
    btnColorClass = cls; btnCustomColor = '';
    markSwatch(el); refreshPreview();
  }
  document.querySelectorAll('#lnkColors button[data-col]').forEach(function(b){
    b.addEventListener('click', function(){ pickPreset(b.dataset.col, b); });
  });
  customInput.addEventListener('input', function(){
    btnColorClass = ''; btnCustomColor = customInput.value;
    markSwatch(null);
    document.querySelector('.custom-sw').style.borderColor = customInput.value;
    refreshPreview();
  });

  function isAmazon(u){ return /amazon\\.[a-z]/i.test(u || ''); }
  function tidyUrl(u){
    u = (u || '').trim();
    if (!u) return '';
    if (/^(https?:|mailto:|tel:|#|\\/)/i.test(u)) return u;
    return 'https://' + u;
  }
  function setStyle(s){
    linkStyle = s;
    document.querySelectorAll('#lnkStyle button').forEach(function(b){ b.classList.toggle('on', b.dataset.style === s); });
    colorRow.classList.toggle('show', s === 'button');
    if (s === 'button') refreshPreview();
  }
  function refreshAff(){
    var amz = isAmazon(fUrl.value);
    fAff.classList.toggle('show', amz);
    if (amz) fBlank.checked = true;
  }
  fUrl.addEventListener('input', refreshAff);
  document.querySelectorAll('#lnkStyle button').forEach(function(b){
    b.addEventListener('click', function(){ setStyle(b.dataset.style); });
  });

  function openLink(anchor){
    editingAnchor = anchor || null;
    var sel = window.getSelection();
    savedRange = (sel.rangeCount && editor.contains(sel.anchorNode)) ? sel.getRangeAt(0).cloneRange() : null;
    if (anchor) {
      document.getElementById('lmTitle').textContent = 'Edit link';
      document.getElementById('lnkSave').textContent = 'Update link';
      fText.value = anchor.textContent;
      fUrl.value = anchor.getAttribute('href') || '';
      fBlank.checked = anchor.getAttribute('target') === '_blank';
      btnColorClass = COLOR_CLASSES.filter(function(c){ return anchor.classList.contains(c); })[0] || '';
      btnCustomColor = anchor.style.background || '';
      var swatch = document.querySelector('#lnkColors button[data-col="' + btnColorClass + '"]');
      markSwatch(btnCustomColor ? null : swatch);
      setStyle(anchor.classList.contains('cta-btn') ? 'button' : 'text');
    } else {
      document.getElementById('lmTitle').textContent = 'Add a link';
      document.getElementById('lnkSave').textContent = 'Insert link';
      fText.value = savedRange ? String(savedRange.toString() || '') : '';
      fUrl.value = ''; fBlank.checked = false;
      btnColorClass = ''; btnCustomColor = '';
      markSwatch(document.querySelector('#lnkColors button[data-col=""]'));
      setStyle('text');
    }
    refreshAff();
    modal.classList.add('show');
    lbar.classList.remove('show');
    setTimeout(function(){ (fUrl.value ? fText : fUrl).focus(); }, 40);
  }
  function closeLink(){ modal.classList.remove('show'); editingAnchor = null; }

  document.getElementById('linkBtn').addEventListener('click', function(){ openLink(null); });
  document.getElementById('lnkCancel').addEventListener('click', closeLink);
  modal.addEventListener('click', function(e){ if (e.target === modal) closeLink(); });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && modal.classList.contains('show')) closeLink();
    if (e.key === 'Enter' && modal.classList.contains('show') && document.activeElement && document.activeElement.tagName === 'INPUT') {
      e.preventDefault(); document.getElementById('lnkSave').click();
    }
  });

  document.getElementById('lnkSave').addEventListener('click', function(){
    var url = tidyUrl(fUrl.value);
    if (!url) { alert('Please enter a web address for this link.'); fUrl.focus(); return; }
    var text = (fText.value || '').trim() || url;
    var amz = isAmazon(url);
    var blank = fBlank.checked || amz;

    var btnClass = (linkStyle === 'button') ? ('cta-btn' + (btnColorClass ? ' ' + btnColorClass : '')) : '';

    if (editingAnchor) {
      editingAnchor.setAttribute('href', url);
      editingAnchor.textContent = text;
      editingAnchor.className = btnClass;
      if (linkStyle === 'button' && btnCustomColor) editingAnchor.style.background = btnCustomColor;
      else editingAnchor.style.background = '';
      if (!editingAnchor.getAttribute('style')) editingAnchor.removeAttribute('style');
      if (!editingAnchor.className) editingAnchor.removeAttribute('class');
      if (blank) editingAnchor.setAttribute('target', '_blank'); else editingAnchor.removeAttribute('target');
      if (amz) editingAnchor.setAttribute('rel', 'nofollow noopener sponsored');
      else if (blank) editingAnchor.setAttribute('rel', 'noopener');
      else editingAnchor.removeAttribute('rel');
    } else {
      var a = document.createElement('a');
      a.setAttribute('href', url);
      a.textContent = text;
      if (btnClass) a.className = btnClass;
      if (linkStyle === 'button' && btnCustomColor) a.style.background = btnCustomColor;
      if (blank) a.setAttribute('target', '_blank');
      if (amz) a.setAttribute('rel', 'nofollow noopener sponsored');
      else if (blank) a.setAttribute('rel', 'noopener');
      editor.focus();
      if (savedRange) {
        var sel = window.getSelection();
        sel.removeAllRanges(); sel.addRange(savedRange);
      }
      document.execCommand('insertHTML', false, a.outerHTML + '&nbsp;');
    }
    closeLink();
    if (typeof countWords === 'function') countWords();
  });

  // Click an existing link inside the editor to edit, test or remove it
  function positionLinkBar(a){
    var r = a.getBoundingClientRect();
    lbar.classList.add('show');
    var top = r.bottom + 8, bh = lbar.offsetHeight, bw = lbar.offsetWidth;
    if (top + bh > window.innerHeight - 10) top = Math.max(10, r.top - bh - 8);
    var left = Math.min(r.left, window.innerWidth - bw - 12);
    lbar.style.top = top + 'px'; lbar.style.left = Math.max(10, left) + 'px';
  }
  editor.addEventListener('click', function(e){
    var a = e.target.closest ? e.target.closest('a') : null;
    if (a && editor.contains(a)) {
      e.preventDefault();
      activeAnchor = a;
      document.getElementById('lbUrl').textContent = a.getAttribute('href') || '';
      positionLinkBar(a);
    } else if (!e.target.closest('#linkbar')) {
      lbar.classList.remove('show'); activeAnchor = null;
    }
  });
  document.addEventListener('click', function(e){
    if (!e.target.closest('#linkbar') && !e.target.closest('#editor')) { lbar.classList.remove('show'); activeAnchor = null; }
  });
  window.addEventListener('scroll', function(){ if (activeAnchor) positionLinkBar(activeAnchor); }, true);

  document.getElementById('lbEdit').addEventListener('click', function(){ if (activeAnchor) openLink(activeAnchor); });
  document.getElementById('lbOpen').addEventListener('click', function(){
    if (activeAnchor) window.open(activeAnchor.getAttribute('href'), '_blank', 'noopener');
  });
  document.getElementById('lbUnlink').addEventListener('click', function(){
    if (!activeAnchor) return;
    var parent = activeAnchor.parentNode;
    while (activeAnchor.firstChild) parent.insertBefore(activeAnchor.firstChild, activeAnchor);
    activeAnchor.remove();
    lbar.classList.remove('show'); activeAnchor = null;
  });
})();
`;

export function adminLayout({ title, active, body, flash, flashErr }) {
  const nav = [
    ['dashboard', '/admin', '📊 Dashboard'],
    ['posts', '/admin/posts', '📝 Blog Posts'],
    ['pages', '/admin/pages', '📄 Pages'],
    ['shop', '/admin/shop', '🛍️ Shop'],
    ['menu', '/admin/menu', '🧭 Menu'],
    ['settings', '/admin/settings', '⚙️ Settings'],
  ].map(([k, href, label]) => `<a class="nav${active === k ? ' active' : ''}" href="${href}">${label}</a>`).join('');
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)} — Pet-GoToPro Admin</title>
<link rel="icon" type="image/png" href="/favicon.png">
<style>${ADMIN_CSS}</style></head><body>
<div class="shell">
  <div class="side">
    <div class="logo"><img src="/logo.png" alt=""><b>Pet-GoToPro</b></div>
    ${nav}
    <div class="spacer"></div>
    <a class="nav" href="/" target="_blank">🌐 View site</a>
    <form method="POST" action="/admin/logout"><button class="nav" style="background:none;border:none;width:100%;text-align:left;color:#d9cdb4;cursor:pointer;font-size:14px;padding:10px 20px;font-family:inherit">🚪 Log out</button></form>
  </div>
  <div class="main">
    ${flash ? `<div class="flash">${esc(flash)}</div>` : ''}
    ${flashErr ? `<div class="flash err">${esc(flashErr)}</div>` : ''}
    ${body}
  </div>
</div>
</body></html>`;
}

function authPage({ title, sub, formBody, error }) {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)}</title><link rel="icon" type="image/png" href="/favicon.png"><style>${ADMIN_CSS}</style></head>
<body><div class="auth-wrap"><div class="auth-card">
<img src="/logo.png" alt="Pet-GoToPro">
<h1>${esc(title)}</h1><p>${esc(sub)}</p>
${error ? `<div class="flash err" style="text-align:left;margin-top:12px">${esc(error)}</div>` : ''}
${formBody}
</div></div></body></html>`;
}

export const adminRoutes = new Hono();

// ——— Auth gate ———
adminRoutes.use('*', async (c, next) => {
  const path = new URL(c.req.url).pathname;
  const open = ['/admin/login', '/admin/setup'];
  if (open.includes(path)) return next();
  const settings = await getSettings(c.env.DB);
  if (!settings.password_hash) return c.redirect('/admin/setup');
  if (!(await checkAuth(c))) return c.redirect('/admin/login');
  if (c.req.method !== 'GET' && !sameOrigin(c)) return c.text('Cross-origin request blocked', 403);
  return next();
});

// ——— First-run setup ———
adminRoutes.get('/setup', async (c) => {
  const settings = await getSettings(c.env.DB);
  if (settings.password_hash) return c.redirect('/admin/login');
  return c.html(authPage({
    title: 'Welcome to your new website!',
    sub: 'Create your admin password to get started. Keep it somewhere safe — it protects your whole site.',
    formBody: `<form method="POST" action="/admin/setup">
      <label>Choose a password (min 8 characters)</label>
      <input type="password" name="password" minlength="8" required autofocus>
      <label>Repeat password</label>
      <input type="password" name="password2" minlength="8" required>
      <button class="btn">Create password & log in</button>
    </form>`,
  }));
});

adminRoutes.post('/setup', async (c) => {
  const settings = await getSettings(c.env.DB);
  if (settings.password_hash) return c.redirect('/admin/login');
  if (!sameOrigin(c)) return c.text('Blocked', 403);
  const form = await c.req.parseBody();
  const pw = String(form.password || '');
  if (pw.length < 8 || pw !== String(form.password2 || '')) {
    return c.html(authPage({ title: 'Welcome!', sub: 'Create your admin password.', error: 'Passwords must match and be at least 8 characters.', formBody: `<form method="POST" action="/admin/setup"><label>Choose a password</label><input type="password" name="password" minlength="8" required><label>Repeat password</label><input type="password" name="password2" minlength="8" required><button class="btn">Create password & log in</button></form>` }));
  }
  await setSetting(c.env.DB, 'password_hash', await hashPassword(pw));
  const { token, expires } = await createSession(c.env.DB);
  c.header('Set-Cookie', sessionCookieHeader(token, expires, c.req.url.startsWith('https')));
  return c.redirect('/admin');
});

// ——— Login / logout ———
adminRoutes.get('/login', async (c) => {
  const settings = await getSettings(c.env.DB);
  if (!settings.password_hash) return c.redirect('/admin/setup');
  if (await checkAuth(c)) return c.redirect('/admin');
  return c.html(authPage({
    title: 'Pet-GoToPro Admin',
    sub: 'Enter your admin password to manage your website.',
    formBody: `<form method="POST" action="/admin/login">
      <label>Password</label>
      <input type="password" name="password" required autofocus>
      <button class="btn">Log in</button>
    </form>`,
  }));
});

adminRoutes.post('/login', async (c) => {
  if (!sameOrigin(c)) return c.text('Blocked', 403);
  const settings = await getSettings(c.env.DB);
  const form = await c.req.parseBody();
  const ok = settings.password_hash && (await verifyPassword(String(form.password || ''), settings.password_hash));
  if (!ok) {
    return c.html(authPage({
      title: 'Pet-GoToPro Admin', sub: 'Enter your admin password.', error: 'Wrong password — try again.',
      formBody: `<form method="POST" action="/admin/login"><label>Password</label><input type="password" name="password" required autofocus><button class="btn">Log in</button></form>`,
    }), 401);
  }
  const { token, expires } = await createSession(c.env.DB);
  c.header('Set-Cookie', sessionCookieHeader(token, expires, c.req.url.startsWith('https')));
  return c.redirect('/admin');
});

adminRoutes.post('/logout', async (c) => {
  await destroySession(c);
  c.header('Set-Cookie', clearSessionCookieHeader(c.req.url.startsWith('https')));
  return c.redirect('/admin/login');
});

// ——— Dashboard ———
adminRoutes.get('/', async (c) => {
  const db = c.env.DB;
  const [published, drafts, pages] = await Promise.all([
    db.prepare("SELECT COUNT(*) n FROM posts WHERE status='published'").first(),
    db.prepare("SELECT COUNT(*) n FROM posts WHERE status='draft'").first(),
    db.prepare("SELECT COUNT(*) n FROM pages WHERE status='published'").first(),
  ]);
  const recent = (await db.prepare('SELECT id, title, status, updated_at FROM posts ORDER BY updated_at DESC LIMIT 6').all()).results || [];
  const body = `
<h1 class="pagetitle">Dashboard</h1>
<p class="pagesub">Welcome back! Here's how ${esc('Pet-GoToPro')} is looking.</p>
<div class="grid3">
  <div class="stat"><div class="n">${published?.n ?? 0}</div><div class="l">Published posts</div></div>
  <div class="stat"><div class="n">${drafts?.n ?? 0}</div><div class="l">Drafts</div></div>
  <div class="stat"><div class="n">${pages?.n ?? 0}</div><div class="l">Pages</div></div>
</div>
<div class="card" style="margin-top:20px">
  <b>Quick actions</b><br><br>
  <a class="btn" href="/admin/posts/new">＋ New blog post</a>
  <a class="btn ghost" href="/admin/posts/new#import">📄 Import Word doc</a>
  <a class="btn ghost" href="/admin/pages/new">＋ New page</a>
</div>
<div class="aibox">
  <h3>💡 AI blog post ideas</h3>
  <div class="hint">Get fresh article topics with real Google search demand — based on what you've already published.</div>
  <select id="ideaCat" style="max-width:220px;display:inline-block;margin-right:8px">
    <option value="">All categories</option>
    ${CATEGORIES.map(x => `<option>${x.key}</option>`).join('')}
  </select>
  <button class="btn" id="ideaBtn" type="button">Suggest topics</button>
  <div id="ideaOut"></div>
</div>
<div class="card">
  <b>Recently edited</b>
  <table class="list" style="margin-top:12px;border-radius:8px">
    ${recent.map(p => `<tr><td><a href="/admin/posts/${p.id}">${esc(p.title)}</a></td><td><span class="badge ${p.status}">${p.status}</span></td><td style="color:var(--ink-soft);font-size:12px">${esc(fmtDate(p.updated_at))}</td></tr>`).join('') || '<tr><td>No posts yet — create your first one!</td></tr>'}
  </table>
</div>
<script>
document.getElementById('ideaBtn').addEventListener('click', async () => {
  const btn = document.getElementById('ideaBtn'), out = document.getElementById('ideaOut');
  btn.disabled = true; btn.textContent = 'Thinking…';
  out.innerHTML = '';
  try {
    const r = await fetch('/admin/ai/topics', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({category: document.getElementById('ideaCat').value})});
    const d = await r.json();
    if (d.error) throw new Error(d.error);
    out.innerHTML = d.ideas.map(i => \`<div class="idea"><b>\${i.title}</b>
      <div class="im">\${i.category} · \${i.type} · target: <i>\${i.target_keyword}</i></div>
      <div class="im" style="margin-top:4px">\${i.why}</div>
      <a class="btn small" style="margin-top:8px" href="/admin/posts/new?title=\${encodeURIComponent(i.title)}&category=\${encodeURIComponent(i.category)}&keywords=\${encodeURIComponent(i.target_keyword)}">Start this draft →</a></div>\`).join('');
  } catch (e) { out.innerHTML = '<div class="idea">AI is unavailable right now ('+e.message+'). Try again in a minute.</div>'; }
  btn.disabled = false; btn.textContent = 'Suggest topics';
});
</script>`;
  return c.html(adminLayout({ title: 'Dashboard', active: 'dashboard', body }));
});

// ——— Posts list ———
adminRoutes.get('/posts', async (c) => {
  const posts = (await c.env.DB.prepare('SELECT id, title, slug, category, status, updated_at FROM posts ORDER BY updated_at DESC').all()).results || [];
  const body = `
<h1 class="pagetitle">Blog Posts</h1>
<p class="pagesub">${posts.length} post${posts.length === 1 ? '' : 's'} — click any title to edit.</p>
<p style="margin-bottom:16px"><a class="btn" href="/admin/posts/new">＋ New blog post</a> <a class="btn ghost" href="/admin/posts/new#import">📄 Import Word doc</a></p>
<table class="list">
<tr><th>Title</th><th>Category</th><th>Status</th><th>Updated</th><th></th></tr>
${posts.map(p => `<tr>
  <td><a href="/admin/posts/${p.id}">${esc(p.title)}</a></td>
  <td>${esc(p.category)}</td>
  <td><span class="badge ${p.status}">${p.status}</span></td>
  <td style="font-size:12px;color:var(--ink-soft)">${esc(fmtDate(p.updated_at))}</td>
  <td>${p.status === 'published' ? `<a class="btn small ghost" target="_blank" href="/blog/${esc(p.slug)}">View</a>` : ''}</td>
</tr>`).join('') || '<tr><td colspan="5">No posts yet.</td></tr>'}
</table>`;
  return c.html(adminLayout({ title: 'Posts', active: 'posts', body }));
});

// ——— Post editor (new + edit) ———
async function editorPage(c, post, msg) {
  const q = c.req.query();
  const guideList = (await getGuides(c.env.DB)).map(g => ({ file: g.file, title: g.title, blurb: g.blurb }));
  post = post || { id: '', title: q.title || '', slug: '', category: q.category || 'Dogs', description: '', keywords: q.keywords || '', hero_image: '', body_html: '', status: 'draft' };
  const catOpts = CATEGORIES.map(x => `<option${x.key === post.category ? ' selected' : ''}>${x.key}</option>`).join('');
  const body = `
<h1 class="pagetitle">${post.id ? 'Edit post' : 'New blog post'}</h1>
<p class="pagesub">${post.id ? `Editing “${esc(post.title)}”` : 'Write from scratch, or import a Word document below.'}</p>
${!post.id ? `
<div class="card" id="import">
  <b>📄 Import from Microsoft Word</b>
  <p style="font-size:13px;color:var(--ink-soft);margin:6px 0 12px">Upload a .docx file — headings, lists, bold text and images come across automatically, then you can polish and publish.</p>
  <form method="POST" action="/admin/import-docx" enctype="multipart/form-data" id="docxForm">
    <div class="drop" id="drop">
      <input type="file" name="file" id="docxFile" accept=".docx" style="display:none">
      <p><b>Drop your Word document here</b> or <a href="#" id="browse">browse files</a></p>
      <p style="font-size:12px;margin-top:4px">.docx up to 8&nbsp;MB</p>
    </div>
  </form>
</div>` : ''}
<form method="POST" action="/admin/posts/save" id="postForm">
  <input type="hidden" name="id" value="${esc(post.id)}">
  <input type="hidden" name="body_html" id="body_html">
  <div class="card">
    <label>Title</label>
    <input type="text" name="title" id="f_title" value="${esc(post.title)}" required placeholder="e.g. The 7 Best Water Fountains for Cats in 2026">
    <div class="grid2">
      <div><label>URL slug <span style="font-weight:400;text-transform:none">(auto-fills from title)</span></label>
      <input type="text" name="slug" id="f_slug" value="${esc(post.slug)}" placeholder="best-cat-water-fountains-2026"></div>
      <div><label>Category</label><select name="category" id="f_cat">${catOpts}</select></div>
    </div>
    <label>Meta description <span style="font-weight:400;text-transform:none">(what Google shows under your title — aim for 140–155 characters)</span></label>
    <textarea name="description" id="f_desc" rows="2" maxlength="300">${esc(post.description)}</textarea>
    <label>Keywords <span style="font-weight:400;text-transform:none">(comma-separated)</span></label>
    <input type="text" name="keywords" id="f_kw" value="${esc(post.keywords)}">
    <label>Hero image</label>
    <div style="display:flex;gap:10px;align-items:center">
      <input type="text" name="hero_image" id="f_hero" value="${esc(post.hero_image)}" placeholder="Upload → or paste an image URL">
      <button type="button" class="btn ghost small" id="heroBtn">Upload</button>
    </div>
    <div id="heroPrev" style="margin-top:10px">${post.hero_image ? `<img src="${esc(post.hero_image)}" style="max-height:120px;border-radius:8px">` : ''}</div>
  </div>

  <div class="aibox">
    <h3>✨ AI SEO assistant</h3>
    <div class="hint">Analyses your draft and suggests better titles, a meta description, slug, and keywords tuned for Google.</div>
    <button type="button" class="btn" id="seoBtn">Get SEO suggestions</button>
    <div class="ai-result" id="seoOut"></div>
  </div>

  <div class="card">
    <label style="margin-top:0">Article content</label>
    <div class="toolbar">
      <button type="button" id="undoBtn" title="Undo — Ctrl+Z">↶ Undo</button>
      <button type="button" id="redoBtn" title="Redo — Ctrl+Y">↷ Redo</button>
      <span class="tb-sep"></span>
      <button type="button" data-cmd="bold" title="Bold"><b>B</b></button>
      <button type="button" data-cmd="italic" title="Italic"><i>I</i></button>
      <button type="button" data-cmd="underline" title="Underline"><u>U</u></button>
      <button type="button" data-block="h2" title="Big heading">H2</button>
      <button type="button" data-block="h3" title="Small heading">H3</button>
      <button type="button" data-block="p" title="Paragraph">¶</button>
      <button type="button" data-cmd="insertUnorderedList" title="Bullet list">• List</button>
      <button type="button" data-cmd="insertOrderedList" title="Numbered list">1. List</button>
      <button type="button" data-block="blockquote" title="Quote">❝</button>
      <button type="button" id="linkBtn" title="Add or edit a link">🔗 Link</button>
      <button type="button" id="imgBtn" title="Insert image">🖼️ Image</button>
      <button type="button" id="prodBtn" title="Insert a product review card">🛒 Product card</button>
      <button type="button" id="faqBtn" title="Insert an FAQ item">❓ FAQ</button>
      <button type="button" id="dlBtn" title="Insert a free-download card for a guide">📥 Download card</button>
      <button type="button" id="secBtn" title="Add an independent section — 1, 2, 3 or 4 columns holding photos, text or product cards">▦ Section</button>
      <button type="button" id="htmlBtn" title="Edit raw HTML">&lt;/&gt;</button>
      <span style="flex:1"></span>
      <span id="wordcount" style="font-size:12px;color:var(--ink-soft);align-self:center"></span>
    </div>
    <p style="font-size:12.5px;color:var(--ink-soft);margin:8px 2px 0">💡 <b>Tip:</b> click any image in your article below to resize it, add a frame, move it left or right of the text, or give it a caption.</p>
    <div id="editor" contenteditable="true">${post.body_html}</div>
    <textarea id="htmlview"></textarea>
  </div>
  <div class="card" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
    <button class="btn green" name="action" value="publish">🚀 ${post.status === 'published' ? 'Update (published)' : 'Publish'}</button>
    <button class="btn" name="action" value="draft">💾 Save as draft</button>
    ${post.status === 'published' ? '<button class="btn ghost" name="action" value="unpublish">Unpublish</button>' : ''}
    ${post.id ? `<button class="btn danger" name="action" value="delete" onclick="return confirm('Delete this post permanently?')">Delete</button>` : ''}
    <span style="flex:1"></span>
    ${post.id && post.status === 'published' ? `<a href="/blog/${esc(post.slug)}" target="_blank">View live post →</a>` : ''}
  </div>
</form>
<input type="file" id="imgFile" accept="image/*" style="display:none">

<!-- Floating image toolbar -->
<div id="imgbar">
  <div class="ib-row"><span class="ib-label">Size</span>
    <button type="button" data-size="img-sm">Small</button>
    <button type="button" data-size="img-md">Medium</button>
    <button type="button" data-size="img-lg">Large</button>
    <button type="button" data-size="img-full">Full width</button>
  </div>
  <div class="ib-row"><span class="ib-label">Position</span>
    <button type="button" data-align="img-left">⬅ Left of text</button>
    <button type="button" data-align="img-center">Centre</button>
    <button type="button" data-align="img-right">Right of text ➡</button>
  </div>
  <div class="ib-row"><span class="ib-label">Frame</span>
    <button type="button" data-frame="">None</button>
    <button type="button" data-frame="img-frame">White</button>
    <button type="button" data-frame="img-frame-warm">Warm</button>
  </div>
  <div class="ib-row"><span class="ib-label">More</span>
    <button type="button" id="ibCaption">💬 Caption</button>
    <button type="button" id="ibReplace">🔄 Replace</button>
    <button type="button" id="ibAlt">🏷️ Alt text</button>
    <button type="button" id="ibDone">✓ Done</button>
    <button type="button" id="ibDelete" class="ib-danger">🗑 Delete</button>
  </div>
  <div class="ib-hint">Left/right positions let your text wrap around the image. Visitors can click any image to expand it full screen.</div>
</div>
${LINK_DIALOG_HTML}
${SECTION_DIALOG_HTML}
<script>
const editor = document.getElementById('editor');
const htmlview = document.getElementById('htmlview');

// Toolbar
document.querySelectorAll('.toolbar [data-cmd]').forEach(b => b.addEventListener('click', () => { editor.focus(); document.execCommand(b.dataset.cmd); }));
document.querySelectorAll('.toolbar [data-block]').forEach(b => b.addEventListener('click', () => { editor.focus(); document.execCommand('formatBlock', false, b.dataset.block); }));
// Shrink large photos in the browser before upload (max 1600px, JPEG)
async function compressImage(file) {
  try {
    if (!/^image\\/(png|jpe?g|webp)$/i.test(file.type) || file.size < 500 * 1024) return file;
    const img = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.85));
    if (blob && blob.size < file.size) return new File([blob], file.name.replace(/\\.\\w+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch (e) {}
  return file;
}

// Image upload → insert
async function uploadImage(file) {
  file = await compressImage(file);
  const fd = new FormData(); fd.append('file', file);
  const r = await fetch('/admin/media', { method: 'POST', body: fd });
  const d = await r.json();
  if (d.error) { alert('Upload failed: ' + d.error); return null; }
  return d.url;
}
document.getElementById('imgBtn').addEventListener('click', () => document.getElementById('imgFile').click());
document.getElementById('imgFile').addEventListener('change', async (e) => {
  const f = e.target.files[0]; if (!f) return;
  const url = await uploadImage(f);
  if (url) {
    editor.focus();
    document.execCommand('insertHTML', false, '<img class="pgp-img img-full img-center" src="' + url + '" alt=""><p></p>');
  }
  e.target.value = '';
});

// Hero upload
document.getElementById('heroBtn').addEventListener('click', () => {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = async () => {
    const url = await uploadImage(inp.files[0]);
    if (url) { document.getElementById('f_hero').value = url; document.getElementById('heroPrev').innerHTML = '<img src="'+url+'" style="max-height:120px;border-radius:8px">'; }
  };
  inp.click();
});

// Insert a ready-made product review card (same layout as the live review posts)
document.getElementById('prodBtn').addEventListener('click', () => {
  const card = [
    '<div class="product">',
    '<div class="product-ribbon"><span class="rank"><span class="star">★</span> #1 · Best Overall</span><span class="asin">ASIN: PASTE-ASIN</span></div>',
    '<div class="product-body">',
    '<div class="product-image-wrap"><div class="product-image-placeholder">📷 Product photo coming soon</div></div>',
    '<div class="product-content">',
    '<div class="product-title">Product name here</div>',
    '<div class="product-price"><span class="dollar">$00.00</span><span class="disclaimer">*Price starts from and is subject to change</span></div>',
    '<span class="best-for">Best For: describe the ideal buyer</span>',
    '<div class="product-desc"><p>Why this product earns its spot — write 2–3 honest sentences.</p></div>',
    '<div class="pros-cons">',
    '<div class="pros"><h4>Pros</h4><ul><li>First pro</li><li>Second pro</li></ul></div>',
    '<div class="cons"><h4>Cons</h4><ul><li>First con</li><li>Second con</li></ul></div>',
    '</div>',
    '<a class="cta-btn" href="https://www.amazon.com/dp/PASTE-ASIN?th=1&linkCode=ll1&tag=petgo2pro-20&language=en_US&ref_=as_li_ss_tl" target="_blank" rel="nofollow noopener sponsored">View on Amazon</a>',
    '</div></div></div><p></p>'
  ].join('');
  editor.focus(); document.execCommand('insertHTML', false, card);
});
// Insert an FAQ item
document.getElementById('faqBtn').addEventListener('click', () => {
  editor.focus();
  document.execCommand('insertHTML', false, '<details class="faq-item"><summary>Your question here?</summary><p>Your answer here.</p></details><p></p>');
});

// Insert a free-download card for one of the site's free guides
var FREE_GUIDES = ${JSON.stringify(guideList)};
document.getElementById('dlBtn').addEventListener('click', function(){
  if (!FREE_GUIDES.length) { alert('No free guides are set up yet.'); return; }
  var list = FREE_GUIDES.map(function(g,i){ return (i+1) + '. ' + g.title; }).join('\\n');
  var pick = prompt('Which free guide should this card offer?\\n\\n' + list + '\\n\\nEnter a number:', '1');
  var g = FREE_GUIDES[parseInt(pick,10) - 1];
  if (!g) return;
  var card = '<div class="download-card">' +
    '<div class="dl-thumb"><img src="/img/' + g.file + '" alt="' + g.title + '"></div>' +
    '<div class="dl-body"><span class="dl-tag">Free download</span>' +
    '<h3>' + g.title + '</h3><p>' + g.blurb + '</p>' +
    '<a class="dl-btn" href="/download/' + g.file + '">⬇️ Download free</a>' +
    '<span class="dl-note">Free for everyone — print it, share it, no sign-up needed.</span>' +
    '</div></div><p></p>';
  editor.focus(); document.execCommand('insertHTML', false, card);
});

/* ————— Image editing toolbar ————— */
var imgbar = document.getElementById('imgbar');
var selectedImg = null;
var SIZES = ['img-sm','img-md','img-lg','img-full'];
var ALIGNS = ['img-left','img-center','img-right'];
var FRAMES = ['img-frame','img-frame-warm'];

// target for size/align classes: the wrapping figure if there is one, else the image
function targetOf(img){ var f = img.closest('figure.pgp-figure'); return f || img; }

function positionBar(img){
  var r = img.getBoundingClientRect();
  imgbar.classList.add('show');
  var bh = imgbar.offsetHeight, bw = imgbar.offsetWidth;
  var top = r.bottom + 10;
  if (top + bh > window.innerHeight - 10) top = Math.max(10, r.top - bh - 10);
  var left = r.left;
  if (left + bw > window.innerWidth - 10) left = Math.max(10, window.innerWidth - bw - 10);
  imgbar.style.top = top + 'px';
  imgbar.style.left = left + 'px';
}

function syncBar(){
  if (!selectedImg) return;
  var t = targetOf(selectedImg);
  imgbar.querySelectorAll('[data-size]').forEach(function(b){ b.classList.toggle('on', t.classList.contains(b.dataset.size)); });
  imgbar.querySelectorAll('[data-align]').forEach(function(b){ b.classList.toggle('on', t.classList.contains(b.dataset.align)); });
  imgbar.querySelectorAll('[data-frame]').forEach(function(b){
    b.classList.toggle('on', b.dataset.frame ? selectedImg.classList.contains(b.dataset.frame)
      : !FRAMES.some(function(f){ return selectedImg.classList.contains(f); }));
  });
}

function selectImage(img){
  deselect();
  selectedImg = img;
  img.classList.add('pgp-selected','pgp-img');
  var t = targetOf(img);
  if (!SIZES.some(function(s){ return t.classList.contains(s); })) t.classList.add('img-full');
  if (!ALIGNS.some(function(a){ return t.classList.contains(a); })) t.classList.add('img-center');
  positionBar(img); syncBar();
}

function deselect(){
  if (selectedImg) selectedImg.classList.remove('pgp-selected');
  selectedImg = null;
  imgbar.classList.remove('show');
}

editor.addEventListener('click', function(e){
  if (e.target.tagName === 'IMG') { e.preventDefault(); selectImage(e.target); }
  else if (!e.target.closest('figcaption')) deselect();
});
document.addEventListener('click', function(e){
  if (!e.target.closest('#imgbar') && !e.target.closest('#editor')) deselect();
});
window.addEventListener('scroll', function(){ if (selectedImg) positionBar(selectedImg); }, true);
window.addEventListener('resize', function(){ if (selectedImg) positionBar(selectedImg); });

imgbar.querySelectorAll('[data-size]').forEach(function(b){
  b.addEventListener('click', function(){
    if (!selectedImg) return;
    pushUndo();
    var t = targetOf(selectedImg);
    SIZES.forEach(function(s){ t.classList.remove(s); });
    t.classList.add(b.dataset.size);
    positionBar(selectedImg); syncBar();
  });
});
imgbar.querySelectorAll('[data-align]').forEach(function(b){
  b.addEventListener('click', function(){
    if (!selectedImg) return;
    pushUndo();
    var t = targetOf(selectedImg);
    ALIGNS.forEach(function(a){ t.classList.remove(a); });
    t.classList.add(b.dataset.align);
    // A floated image at full width has nothing to wrap, so step it down automatically
    if ((b.dataset.align === 'img-left' || b.dataset.align === 'img-right') && t.classList.contains('img-full')) {
      t.classList.remove('img-full'); t.classList.add('img-md');
    }
    positionBar(selectedImg); syncBar();
  });
});
imgbar.querySelectorAll('[data-frame]').forEach(function(b){
  b.addEventListener('click', function(){
    if (!selectedImg) return;
    pushUndo();
    FRAMES.forEach(function(f){ selectedImg.classList.remove(f); });
    if (b.dataset.frame) selectedImg.classList.add(b.dataset.frame);
    syncBar();
  });
});

// Caption: wraps the image in a <figure> with an editable <figcaption>
document.getElementById('ibCaption').addEventListener('click', function(){
  if (!selectedImg) return;
  var fig = selectedImg.closest('figure.pgp-figure');
  var existing = fig ? (fig.querySelector('figcaption') || {}).textContent || '' : '';
  var text = prompt('Caption for this image (leave blank to remove):', existing);
  if (text === null) return;
  pushUndo();
  if (!fig) {
    if (!text.trim()) return;
    fig = document.createElement('figure');
    fig.className = 'pgp-figure';
    // move sizing/alignment classes from the image up onto the figure
    SIZES.concat(ALIGNS).forEach(function(c){
      if (selectedImg.classList.contains(c)) { selectedImg.classList.remove(c); fig.classList.add(c); }
    });
    selectedImg.parentNode.insertBefore(fig, selectedImg);
    fig.appendChild(selectedImg);
    var cap = document.createElement('figcaption');
    fig.appendChild(cap);
  }
  var cap2 = fig.querySelector('figcaption');
  if (!text.trim()) {
    // unwrap: put the image back where the figure was
    SIZES.concat(ALIGNS).forEach(function(c){ if (fig.classList.contains(c)) selectedImg.classList.add(c); });
    fig.parentNode.insertBefore(selectedImg, fig);
    fig.remove();
  } else {
    cap2.textContent = text;
  }
  positionBar(selectedImg); syncBar();
});

document.getElementById('ibAlt').addEventListener('click', function(){
  if (!selectedImg) return;
  var t = prompt('Describe this image for screen readers and Google (alt text):', selectedImg.alt || '');
  if (t !== null) { pushUndo(); selectedImg.alt = t; }
});

document.getElementById('ibReplace').addEventListener('click', function(){
  if (!selectedImg) return;
  var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = async function(){
    var url = await uploadImage(inp.files[0]);
    if (url) { pushUndo(); selectedImg.src = url; positionBar(selectedImg); }
  };
  inp.click();
});

document.getElementById('ibDelete').addEventListener('click', function(){
  if (!selectedImg) return;
  if (!confirm('Remove this image from the article?')) return;
  pushUndo();
  var fig = selectedImg.closest('figure.pgp-figure');
  (fig || selectedImg).remove();
  deselect(); countWords();
});

document.getElementById('ibDone').addEventListener('click', deselect);

// HTML view toggle
let htmlMode = false;
document.getElementById('htmlBtn').addEventListener('click', () => {
  htmlMode = !htmlMode;
  if (typeof deselectSection === 'function') deselectSection();
  if (htmlMode) { htmlview.value = editor.innerHTML; editor.style.display = 'none'; htmlview.style.display = 'block'; }
  else { pushUndo(); editor.innerHTML = htmlview.value; htmlview.style.display = 'none'; editor.style.display = 'block'; }
});

// Slug auto-fill
const slugify = s => s.toLowerCase().trim().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);
let slugTouched = ${post.slug ? 'true' : 'false'};
document.getElementById('f_slug').addEventListener('input', () => slugTouched = true);
document.getElementById('f_title').addEventListener('input', (e) => { if (!slugTouched) document.getElementById('f_slug').value = slugify(e.target.value); });

// Word count
function countWords() {
  const words = (editor.innerText || '').trim().split(/\\s+/).filter(Boolean).length;
  document.getElementById('wordcount').textContent = words + ' words · ~' + Math.max(1, Math.round(words/220)) + ' min read';
}
editor.addEventListener('input', countWords); countWords();

// Submit: copy editor HTML
document.getElementById('postForm').addEventListener('submit', () => {
  deselect();
  if (typeof deselectSection === 'function') deselectSection();
  if (htmlMode) editor.innerHTML = htmlview.value;
  // never save the editing-only selection outlines
  document.getElementById('body_html').value = sanitizeHtml(editor.innerHTML);
});

// AI SEO
document.getElementById('seoBtn').addEventListener('click', async () => {
  const btn = document.getElementById('seoBtn'), out = document.getElementById('seoOut');
  btn.disabled = true; btn.textContent = 'Analysing your post…'; out.style.display = 'none';
  try {
    const r = await fetch('/admin/ai/seo', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: document.getElementById('f_title').value, category: document.getElementById('f_cat').value, body_html: htmlMode ? htmlview.value : editor.innerHTML }) });
    const d = await r.json();
    if (d.error) throw new Error(d.error);
    out.innerHTML =
      '<h4>Title ideas</h4>' + d.titles.map(t => '<div class="sugg"><span>' + t + '</span><button type="button" class="btn small ghost" onclick="useTitle(this)">Use</button></div>').join('') +
      '<h4>Meta description</h4><div class="sugg"><span id="aiDesc">' + d.meta_description + '</span><button type="button" class="btn small ghost" onclick="useDesc()">Use</button></div>' +
      '<h4>URL slug</h4><div class="sugg"><span id="aiSlug">' + d.slug + '</span><button type="button" class="btn small ghost" onclick="useSlug()">Use</button></div>' +
      '<h4>Keywords</h4><div class="sugg"><span id="aiKw">' + d.keywords.join(', ') + '</span><button type="button" class="btn small ghost" onclick="useKw()">Use</button></div>' +
      '<h4>Tips to rank higher</h4>' + d.seo_tips.map(t => '<div style="padding:4px 0">✅ ' + t + '</div>').join('');
    out.style.display = 'block';
  } catch (e) { out.innerHTML = 'AI is unavailable right now (' + e.message + '). Try again shortly.'; out.style.display = 'block'; }
  btn.disabled = false; btn.textContent = 'Get SEO suggestions';
});
function useTitle(btn) { document.getElementById('f_title').value = btn.previousElementSibling.textContent; }
function useDesc() { document.getElementById('f_desc').value = document.getElementById('aiDesc').textContent; }
function useSlug() { document.getElementById('f_slug').value = document.getElementById('aiSlug').textContent; slugTouched = true; }
function useKw() { document.getElementById('f_kw').value = document.getElementById('aiKw').textContent; }

// Docx drag & drop
const drop = document.getElementById('drop');
if (drop) {
  const fileInput = document.getElementById('docxFile');
  document.getElementById('browse').addEventListener('click', (e) => { e.preventDefault(); fileInput.click(); });
  fileInput.addEventListener('change', () => { if (fileInput.files.length) document.getElementById('docxForm').submit(); });
  ['dragover','dragenter'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('drag'); }));
  ['dragleave','drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('drag'); }));
  drop.addEventListener('drop', e => {
    if (e.dataTransfer.files.length) { fileInput.files = e.dataTransfer.files; document.getElementById('docxForm').submit(); }
  });
}
${LINK_DIALOG_JS}
${UNDO_JS}
${SECTION_JS}
${MOVE_JS}
</script>`;
  return c.html(adminLayout({ title: post.id ? 'Edit post' : 'New post', active: 'posts', body, flash: msg }));
}

adminRoutes.get('/posts/new', (c) => editorPage(c, null));
adminRoutes.get('/posts/:id', async (c) => {
  const post = await c.env.DB.prepare('SELECT * FROM posts WHERE id=?').bind(c.req.param('id')).first();
  if (!post) return c.redirect('/admin/posts');
  return editorPage(c, post, c.req.query('msg'));
});

adminRoutes.post('/posts/save', async (c) => {
  const db = c.env.DB;
  const f = await c.req.parseBody();
  const action = String(f.action || 'draft');
  const id = String(f.id || '');
  if (action === 'delete' && id) {
    await db.prepare('DELETE FROM posts WHERE id=?').bind(id).run();
    return c.redirect('/admin/posts');
  }
  const title = String(f.title || 'Untitled').trim() || 'Untitled';
  let slug = slugify(String(f.slug || '') || title);
  const status = action === 'publish' ? 'published' : action === 'unpublish' ? 'draft' : (id ? String((await db.prepare('SELECT status FROM posts WHERE id=?').bind(id).first())?.status || 'draft') : 'draft');
  const finalStatus = action === 'draft' ? 'draft' : status;
  const t = now();
  // ensure slug unique
  const clash = await db.prepare('SELECT id FROM posts WHERE slug=? AND id<>?').bind(slug, id || -1).first();
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  if (id) {
    const existing = await db.prepare('SELECT published_at, slug FROM posts WHERE id=?').bind(id).first();
    const publishedAt = finalStatus === 'published' ? (existing?.published_at || t) : existing?.published_at;
    // If the URL changed, remember the old one so existing links keep working
    if (existing?.slug && existing.slug !== slug) {
      await db.prepare("INSERT INTO slug_history (old_slug, kind, new_slug, changed_at) VALUES (?, 'post', ?, ?) ON CONFLICT(old_slug, kind) DO UPDATE SET new_slug=excluded.new_slug, changed_at=excluded.changed_at")
        .bind(existing.slug, slug, t).run();
      // keep older redirects pointing at the newest address
      await db.prepare("UPDATE slug_history SET new_slug=? WHERE new_slug=? AND kind='post'").bind(slug, existing.slug).run();
      await db.prepare("DELETE FROM slug_history WHERE old_slug=new_slug").run();
    }
    await db.prepare('UPDATE posts SET slug=?, title=?, description=?, keywords=?, category=?, hero_image=?, body_html=?, status=?, updated_at=?, published_at=? WHERE id=?')
      .bind(slug, title, String(f.description || ''), String(f.keywords || ''), String(f.category || 'General'), String(f.hero_image || ''), String(f.body_html || ''), finalStatus, t, publishedAt, id).run();
    return c.redirect(`/admin/posts/${id}?msg=${encodeURIComponent(finalStatus === 'published' ? 'Post published! 🎉' : 'Saved.')}`);
  } else {
    const publishedAt = finalStatus === 'published' ? t : null;
    const r = await db.prepare('INSERT INTO posts (slug, title, description, keywords, category, hero_image, body_html, status, created_at, updated_at, published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      .bind(slug, title, String(f.description || ''), String(f.keywords || ''), String(f.category || 'General'), String(f.hero_image || ''), String(f.body_html || ''), finalStatus, t, t, publishedAt).run();
    return c.redirect(`/admin/posts/${r.meta.last_row_id}?msg=${encodeURIComponent(finalStatus === 'published' ? 'Post published! 🎉' : 'Draft created.')}`);
  }
});

// ——— Word (.docx) import ———
adminRoutes.post('/import-docx', async (c) => {
  const db = c.env.DB;
  const f = await c.req.parseBody();
  const file = f.file;
  if (!file || typeof file === 'string') return c.text('No file uploaded', 400);
  if (file.size > 8 * 1024 * 1024) return c.text('File too large (max 8 MB)', 400);
  const buf = await file.arrayBuffer();
  const mammoth = await import('mammoth');
  const images = [];
  const result = await mammoth.convertToHtml({ arrayBuffer: buf }, {
    convertImage: mammoth.images.imgElement(async (image) => {
      const b64 = await image.read('base64');
      const bytes = Uint8Array.from(atob(b64), ch => ch.charCodeAt(0));
      const mime = image.contentType || 'image/png';
      const r = await db.prepare('INSERT INTO media (filename, mime, data, created_at) VALUES (?,?,?,?)')
        .bind(`docx-image-${Date.now()}-${images.length}`, mime, bytes, now()).run();
      images.push(r.meta.last_row_id);
      return { src: `/media/${r.meta.last_row_id}` };
    }),
    styleMap: [
      "p[style-name='Title'] => h1:fresh",
      "p[style-name='Subtitle'] => p.deck:fresh",
    ],
  });
  let html = result.value || '';
  // Pull the first H1 out as the post title
  let title = (file.name || 'Imported post').replace(/\.docx$/i, '').replace(/[-_]+/g, ' ');
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    title = stripHtml(h1[1]) || title;
    html = html.replace(h1[0], '');
  }
  // Only the post title should be an H1 — demote any remaining H1s to H2 for SEO
  html = html.replace(/<(\/?)h1([^>]*)>/gi, '<$1h2$2>');
  // Use the first short paragraph as the meta description
  let description = '';
  const p1 = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (p1) {
    const text = stripHtml(p1[1]);
    if (text.length >= 40 && text.length <= 300) description = text.slice(0, 155);
  }
  const t = now();
  let slug = slugify(title);
  const clash = await db.prepare('SELECT id FROM posts WHERE slug=?').bind(slug).first();
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  const heroImage = images.length ? `/media/${images[0]}` : '';
  const r = await db.prepare('INSERT INTO posts (slug, title, description, keywords, category, hero_image, body_html, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .bind(slug, title, description, '', 'General', heroImage, html, 'draft', t, t).run();
  return c.redirect(`/admin/posts/${r.meta.last_row_id}?msg=${encodeURIComponent('Word document imported! Review it below, run the AI SEO assistant, then publish. ✨')}`);
});

// ——— Media upload (images) ———
adminRoutes.post('/media', async (c) => {
  try {
    const f = await c.req.parseBody();
    const file = f.file;
    if (!file || typeof file === 'string') return c.json({ error: 'No file' }, 400);
    if (!/^image\//.test(file.type)) return c.json({ error: 'Only images allowed' }, 400);
    if (file.size > 4 * 1024 * 1024) return c.json({ error: 'Image too large (max 4 MB — try resizing it first)' }, 400);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const r = await c.env.DB.prepare('INSERT INTO media (filename, mime, data, created_at) VALUES (?,?,?,?)')
      .bind(file.name || 'upload', file.type, bytes, now()).run();
    return c.json({ url: `/media/${r.meta.last_row_id}` });
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

// ——— Pages ———
adminRoutes.get('/pages', async (c) => {
  const pages = (await c.env.DB.prepare('SELECT id, title, slug, status, updated_at FROM pages ORDER BY title').all()).results || [];
  const body = `
<h1 class="pagetitle">Pages</h1>
<p class="pagesub">Standalone pages like About, Contact, or your Privacy Policy.</p>
<p style="margin-bottom:16px"><a class="btn" href="/admin/pages/new">＋ New page</a></p>
<table class="list">
<tr><th>Title</th><th>URL</th><th>Status</th><th>Updated</th><th></th></tr>
${pages.map(p => `<tr>
  <td><a href="/admin/pages/${p.id}">${esc(p.title)}</a></td>
  <td style="font-family:monospace;font-size:12px">/${esc(p.slug)}</td>
  <td><span class="badge ${p.status}">${p.status}</span></td>
  <td style="font-size:12px;color:var(--ink-soft)">${esc(fmtDate(p.updated_at))}</td>
  <td><a class="btn small ghost" target="_blank" href="/${esc(p.slug)}">View</a></td>
</tr>`).join('') || '<tr><td colspan="5">No pages yet.</td></tr>'}
</table>`;
  return c.html(adminLayout({ title: 'Pages', active: 'pages', body }));
});

async function pageEditor(c, page, msg) {
  page = page || { id: '', title: '', slug: '', description: '', body_html: '', status: 'published' };
  const body = `
<h1 class="pagetitle">${page.id ? 'Edit page' : 'New page'}</h1>
<p class="pagesub">Pages appear at yoursite.com/<i>slug</i> — add them to your menu from the Menu tab.</p>
<form method="POST" action="/admin/pages/save" id="pageForm">
  <input type="hidden" name="id" value="${esc(page.id)}">
  <input type="hidden" name="body_html" id="body_html">
  <div class="card">
    <label>Title</label><input type="text" name="title" id="f_title" value="${esc(page.title)}" required>
    <div class="grid2">
      <div><label>URL slug</label><input type="text" name="slug" id="f_slug" value="${esc(page.slug)}" placeholder="about"></div>
      <div><label>Status</label><select name="status"><option value="published"${page.status === 'published' ? ' selected' : ''}>Published</option><option value="draft"${page.status === 'draft' ? ' selected' : ''}>Hidden</option></select></div>
    </div>
    <label>Meta description</label><textarea name="description" rows="2">${esc(page.description)}</textarea>
  </div>
  <div class="card">
    <label style="margin-top:0">Page content</label>
    <div class="toolbar">
      <button type="button" id="undoBtn" title="Undo — Ctrl+Z">↶ Undo</button>
      <button type="button" id="redoBtn" title="Redo — Ctrl+Y">↷ Redo</button>
      <span class="tb-sep"></span>
      <button type="button" data-cmd="bold"><b>B</b></button>
      <button type="button" data-cmd="italic"><i>I</i></button>
      <button type="button" data-block="h2">H2</button>
      <button type="button" data-block="h3">H3</button>
      <button type="button" data-block="p">¶</button>
      <button type="button" data-cmd="insertUnorderedList">• List</button>
      <button type="button" id="linkBtn">🔗 Link</button>
      <button type="button" id="secBtn" title="Add an independent section — 1, 2, 3 or 4 columns holding photos, text or product cards">▦ Section</button>
      <button type="button" id="htmlBtn">&lt;/&gt;</button>
    </div>
    <p style="font-size:12.5px;color:var(--ink-soft);margin:8px 2px 0">💡 <b>Tip:</b> click any existing link in your page to edit, test or remove it.</p>
    <div id="editor" contenteditable="true">${page.body_html}</div>
    <textarea id="htmlview"></textarea>
  </div>
  ${LINK_DIALOG_HTML}
  ${SECTION_DIALOG_HTML}
  <div class="card" style="display:flex;gap:10px">
    <button class="btn green" name="action" value="save">💾 Save page</button>
    ${page.id ? `<button class="btn danger" name="action" value="delete" onclick="return confirm('Delete this page?')">Delete</button>` : ''}
  </div>
</form>
<script>
const editor = document.getElementById('editor'); const htmlview = document.getElementById('htmlview');
document.querySelectorAll('.toolbar [data-cmd]').forEach(b => b.addEventListener('click', () => { editor.focus(); document.execCommand(b.dataset.cmd); }));
document.querySelectorAll('.toolbar [data-block]').forEach(b => b.addEventListener('click', () => { editor.focus(); document.execCommand('formatBlock', false, b.dataset.block); }));
let htmlMode = false;
document.getElementById('htmlBtn').addEventListener('click', () => {
  htmlMode = !htmlMode;
  if (typeof deselectSection === 'function') deselectSection();
  if (htmlMode) { htmlview.value = editor.innerHTML; editor.style.display='none'; htmlview.style.display='block'; }
  else { pushUndo(); editor.innerHTML = htmlview.value; htmlview.style.display='none'; editor.style.display='block'; }
});
const slugify = s => s.toLowerCase().trim().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);
let slugTouched = ${page.slug ? 'true' : 'false'};
document.getElementById('f_slug').addEventListener('input', () => slugTouched = true);
document.getElementById('f_title').addEventListener('input', (e) => { if (!slugTouched) document.getElementById('f_slug').value = slugify(e.target.value); });
document.getElementById('pageForm').addEventListener('submit', () => {
  if (typeof deselectSection === 'function') deselectSection();
  if (htmlMode) editor.innerHTML = htmlview.value;
  document.getElementById('body_html').value = sanitizeHtml(editor.innerHTML);
});
// Shrink large photos in the browser before upload (max 1600px, JPEG)
async function compressImage(file) {
  try {
    if (!/^image\\/(png|jpe?g|webp)$/i.test(file.type) || file.size < 500 * 1024) return file;
    const img = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.85));
    if (blob && blob.size < file.size) return new File([blob], file.name.replace(/\\.\\w+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch (e) {}
  return file;
}
async function uploadImage(file) {
  file = await compressImage(file);
  const fd = new FormData(); fd.append('file', file);
  const r = await fetch('/admin/media', { method: 'POST', body: fd });
  const d = await r.json();
  if (d.error) { alert('Upload failed: ' + d.error); return null; }
  return d.url;
}
${LINK_DIALOG_JS}
${UNDO_JS}
${SECTION_JS}
${MOVE_JS}
</script>`;
  return c.html(adminLayout({ title: page.id ? 'Edit page' : 'New page', active: 'pages', body, flash: msg }));
}

adminRoutes.get('/pages/new', (c) => pageEditor(c, null));
adminRoutes.get('/pages/:id', async (c) => {
  const page = await c.env.DB.prepare('SELECT * FROM pages WHERE id=?').bind(c.req.param('id')).first();
  if (!page) return c.redirect('/admin/pages');
  return pageEditor(c, page, c.req.query('msg'));
});

const RESERVED_SLUGS = ['admin', 'blog', 'category', 'media', 'logo.png', 'favicon.png', 'robots.txt', 'sitemap.xml', 'rss.xml'];

adminRoutes.post('/pages/save', async (c) => {
  const db = c.env.DB;
  const f = await c.req.parseBody();
  const id = String(f.id || '');
  if (String(f.action) === 'delete' && id) {
    await db.prepare('DELETE FROM pages WHERE id=?').bind(id).run();
    return c.redirect('/admin/pages');
  }
  const title = String(f.title || 'Untitled').trim() || 'Untitled';
  let slug = slugify(String(f.slug || '') || title);
  if (RESERVED_SLUGS.includes(slug)) slug = `page-${slug}`;
  const t = now();
  const clash = await db.prepare('SELECT id FROM pages WHERE slug=? AND id<>?').bind(slug, id || -1).first();
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  if (id) {
    const existingPage = await db.prepare('SELECT slug FROM pages WHERE id=?').bind(id).first();
    if (existingPage?.slug && existingPage.slug !== slug) {
      await db.prepare("INSERT INTO slug_history (old_slug, kind, new_slug, changed_at) VALUES (?, 'page', ?, ?) ON CONFLICT(old_slug, kind) DO UPDATE SET new_slug=excluded.new_slug, changed_at=excluded.changed_at")
        .bind(existingPage.slug, slug, t).run();
      await db.prepare("UPDATE slug_history SET new_slug=? WHERE new_slug=? AND kind='page'").bind(slug, existingPage.slug).run();
      await db.prepare("DELETE FROM slug_history WHERE old_slug=new_slug").run();
    }
    await db.prepare('UPDATE pages SET slug=?, title=?, description=?, body_html=?, status=?, updated_at=? WHERE id=?')
      .bind(slug, title, String(f.description || ''), String(f.body_html || ''), String(f.status || 'published'), t, id).run();
    return c.redirect(`/admin/pages/${id}?msg=Saved.`);
  }
  const r = await db.prepare('INSERT INTO pages (slug, title, description, body_html, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?)')
    .bind(slug, title, String(f.description || ''), String(f.body_html || ''), String(f.status || 'published'), t, t).run();
  return c.redirect(`/admin/pages/${r.meta.last_row_id}?msg=Page created.`);
});

// ——— Menu editor ———
adminRoutes.get('/menu', async (c) => {
  const items = (await c.env.DB.prepare('SELECT * FROM menu_items ORDER BY sort ASC, id ASC').all()).results || [];
  const pages = (await c.env.DB.prepare("SELECT title, slug FROM pages WHERE status='published'").all()).results || [];
  const body = `
<h1 class="pagetitle">Navigation Menu</h1>
<p class="pagesub">These links appear in your site header and footer. Drag order with the ↑↓ buttons.</p>
<div class="card">
  <div id="rows"></div>
  <button type="button" class="btn ghost small" id="addRow">＋ Add menu item</button>
  <p style="font-size:12px;color:var(--ink-soft);margin-top:10px">Tips: your pages — ${pages.map(p => `<a href="#" class="pagelink" data-url="/${esc(p.slug)}" data-label="${esc(p.title)}">/${esc(p.slug)}</a>`).join(' · ') || 'none yet'} · categories look like <code>/category/Dogs</code></p>
  <form method="POST" action="/admin/menu/save" id="menuForm" style="margin-top:16px">
    <input type="hidden" name="items" id="itemsJson">
    <button class="btn green">💾 Save menu</button>
  </form>
</div>
<script>
let items = ${JSON.stringify(items.map(i => ({ label: i.label, url: i.url })))};
if (!items.length) items = [{label:'Home',url:'/'},{label:'Blog',url:'/blog'}];
const rows = document.getElementById('rows');
function render() {
  rows.innerHTML = '';
  items.forEach((it, i) => {
    const div = document.createElement('div'); div.className = 'menurow';
    div.innerHTML = \`<input type="text" placeholder="Label" value="\${it.label.replace(/"/g,'&quot;')}" data-i="\${i}" data-k="label">
      <input type="text" placeholder="/url" value="\${it.url.replace(/"/g,'&quot;')}" data-i="\${i}" data-k="url">
      <button type="button" class="btn small ghost" data-up="\${i}">↑</button>
      <button type="button" class="btn small ghost" data-down="\${i}">↓</button>
      <button type="button" class="btn small danger" data-del="\${i}">✕</button>\`;
    rows.appendChild(div);
  });
}
rows.addEventListener('input', e => { const i = e.target.dataset.i, k = e.target.dataset.k; if (i !== undefined) items[i][k] = e.target.value; });
rows.addEventListener('click', e => {
  const t = e.target;
  if (t.dataset.up !== undefined) { const i = +t.dataset.up; if (i > 0) { [items[i-1], items[i]] = [items[i], items[i-1]]; render(); } }
  if (t.dataset.down !== undefined) { const i = +t.dataset.down; if (i < items.length-1) { [items[i+1], items[i]] = [items[i], items[i+1]]; render(); } }
  if (t.dataset.del !== undefined) { items.splice(+t.dataset.del, 1); render(); }
});
document.getElementById('addRow').addEventListener('click', () => { items.push({label:'',url:''}); render(); });
document.querySelectorAll('.pagelink').forEach(a => a.addEventListener('click', e => { e.preventDefault(); items.push({label: a.dataset.label, url: a.dataset.url}); render(); }));
document.getElementById('menuForm').addEventListener('submit', () => { document.getElementById('itemsJson').value = JSON.stringify(items.filter(i => i.label && i.url)); });
render();
</script>`;
  return c.html(adminLayout({ title: 'Menu', active: 'menu', body, flash: c.req.query('msg') }));
});

adminRoutes.post('/menu/save', async (c) => {
  const f = await c.req.parseBody();
  let items = [];
  try { items = JSON.parse(String(f.items || '[]')); } catch {}
  const db = c.env.DB;
  await db.prepare('DELETE FROM menu_items').run();
  for (let i = 0; i < items.length && i < 20; i++) {
    const it = items[i];
    await db.prepare('INSERT INTO menu_items (label, url, sort) VALUES (?,?,?)').bind(String(it.label).slice(0, 40), String(it.url).slice(0, 200), i).run();
  }
  return c.redirect('/admin/menu?msg=' + encodeURIComponent('Menu saved — it\'s live on your site.'));
});

// ——— Settings ———
adminRoutes.get('/settings', async (c) => {
  const s = await getSettings(c.env.DB);
  const body = `
<h1 class="pagetitle">Site Settings</h1>
<p class="pagesub">Branding, affiliate settings, and your admin password.</p>
<form method="POST" action="/admin/settings/save" enctype="multipart/form-data">
<div class="card">
  <b>Branding</b>
  <label>Site name</label><input type="text" name="site_name" value="${esc(s.site_name)}">
  <label>Tagline</label><input type="text" name="tagline" value="${esc(s.tagline)}">
  <label>Site URL <span style="font-weight:400;text-transform:none">(your domain, e.g. https://petgotopro.com — used for SEO tags & sitemap)</span></label>
  <input type="url" name="site_url" value="${esc(s.site_url)}" placeholder="https://petgotopro.com">
  <label>Logo</label>
  <div style="display:flex;align-items:center;gap:14px">
    <img src="/logo.png" style="width:56px;height:56px;border-radius:10px;border:1px solid var(--line)">
    <input type="file" name="logo" accept="image/*" style="border:none;padding:0">
  </div>
</div>
<div class="card">
  <b>Amazon affiliate</b>
  <label>Associate tag <span style="font-weight:400;text-transform:none">(added automatically to Amazon links in your posts)</span></label>
  <input type="text" name="amazon_tag" value="${esc(s.amazon_tag)}">
  <label>Footer disclosure text</label>
  <textarea name="footer_disclosure" rows="3">${esc(s.footer_disclosure)}</textarea>
</div>
<div class="card">
  <b>Change admin password</b> <span style="font-size:12px;color:var(--ink-soft)">(leave blank to keep current)</span>
  <label>Current password</label><input type="password" name="current_password" autocomplete="current-password">
  <label>New password (min 8 chars)</label><input type="password" name="new_password" autocomplete="new-password">
</div>
<button class="btn green">💾 Save settings</button>
</form>`;
  return c.html(adminLayout({ title: 'Settings', active: 'settings', body, flash: c.req.query('msg'), flashErr: c.req.query('err') }));
});

adminRoutes.post('/settings/save', async (c) => {
  const db = c.env.DB;
  const f = await c.req.parseBody();
  for (const k of ['site_name', 'tagline', 'site_url', 'amazon_tag', 'footer_disclosure']) {
    if (f[k] !== undefined) await setSetting(db, k, String(f[k]).trim());
  }
  const logo = f.logo;
  if (logo && typeof logo !== 'string' && logo.size > 0) {
    if (!/^image\//.test(logo.type)) return c.redirect('/admin/settings?err=' + encodeURIComponent('Logo must be an image file.'));
    if (logo.size > 2 * 1024 * 1024) return c.redirect('/admin/settings?err=' + encodeURIComponent('Logo too large (max 2 MB).'));
    const bytes = new Uint8Array(await logo.arrayBuffer());
    const r = await db.prepare('INSERT INTO media (filename, mime, data, created_at) VALUES (?,?,?,?)').bind('logo', logo.type, bytes, now()).run();
    await setSetting(db, 'logo_media_id', String(r.meta.last_row_id));
  }
  const newPw = String(f.new_password || '');
  if (newPw) {
    const s = await getSettings(db);
    if (!(await verifyPassword(String(f.current_password || ''), s.password_hash))) {
      return c.redirect('/admin/settings?err=' + encodeURIComponent('Current password was wrong — password not changed.'));
    }
    if (newPw.length < 8) return c.redirect('/admin/settings?err=' + encodeURIComponent('New password must be at least 8 characters.'));
    await setSetting(db, 'password_hash', await hashPassword(newPw));
  }
  return c.redirect('/admin/settings?msg=' + encodeURIComponent('Settings saved.'));
});

// ——— AI endpoints ———
adminRoutes.post('/ai/seo', async (c) => {
  try {
    const data = await c.req.json();
    const out = await seoSuggestions(c.env, data);
    return c.json(out);
  } catch (e) {
    return c.json({ error: e.message || 'AI unavailable' }, 500);
  }
});

adminRoutes.post('/ai/topics', async (c) => {
  try {
    const { category } = await c.req.json();
    const titles = ((await c.env.DB.prepare('SELECT title FROM posts ORDER BY updated_at DESC LIMIT 40').all()).results || []).map(r => r.title);
    const out = await topicIdeas(c.env, { existingTitles: titles, category });
    return c.json(out);
  } catch (e) {
    return c.json({ error: e.message || 'AI unavailable' }, 500);
  }
});
