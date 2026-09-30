// ——— Shared utilities: settings, auth, escaping, slugs ———

export function esc(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function slugify(s) {
  return String(s || '').toLowerCase().trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'untitled';
}

export function now() { return new Date().toISOString(); }

export function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return iso; }
}

// Rough plain-text extraction + reading time
export function stripHtml(html) {
  return String(html || '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
export function readingTime(html) {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
export function excerpt(html, len = 180) {
  const t = stripHtml(html);
  return t.length > len ? t.slice(0, len).replace(/\s\S*$/, '') + '…' : t;
}

// Stamp the configured Amazon Associates tag onto every Amazon link at render time,
// so changing the tag in Settings updates the whole site instantly.
export function applyAmazonTag(html, tag) {
  if (!tag) return html;
  const clean = String(tag).trim();
  if (!/^[A-Za-z0-9_-]{3,40}$/.test(clean)) return html;
  // Rewrite the tag on every Amazon href — and ADD one when the link has no tag at all,
  // so a plain link pasted from Amazon still earns commission.
  return String(html || '').replace(/href=(["'])([^"']*?amazon\.[^"']*?)\1/gi, (m, qt, url) => {
    let out;
    if (/[?&](?:amp;)?(?:tag|AssociateTag)=/i.test(url)) {
      out = url.replace(/([?&](?:amp;)?(?:tag|AssociateTag)=)[A-Za-z0-9_-]*/i, `$1${clean}`);
    } else {
      out = url + (url.includes('?') ? '&' : '?') + 'tag=' + clean;
    }
    return `href=${qt}${out}${qt}`;
  });
}

// ——— Settings ———
const DEFAULT_SETTINGS = {
  site_name: 'Pet-GoToPro',
  tagline: 'Get trusted information from the Pet Pros',
  site_url: '',
  amazon_tag: 'petgo2pro-20',
  logo_media_id: '',
  footer_disclosure: 'As an Amazon Associate, Pet-GoToPro earns from qualifying purchases. Product prices and availability are accurate at time of publication and subject to change. All product recommendations reflect our editorial judgment and are not influenced by commissions.',
};

export async function getSettings(db) {
  const rows = (await db.prepare('SELECT key, value FROM settings').all()).results || [];
  const s = { ...DEFAULT_SETTINGS };
  for (const r of rows) s[r.key] = r.value;
  return s;
}

export async function setSetting(db, key, value) {
  await db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').bind(key, value).run();
}

// ——— Password hashing (PBKDF2-SHA256 via WebCrypto) ———
function bufToHex(buf) {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function hexToBuf(hex) {
  return new Uint8Array(hex.match(/.{2}/g).map(h => parseInt(h, 16)));
}

async function pbkdf2(password, salt, iterations = 100000) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return bufToHex(bits);
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt);
  return `${bufToHex(salt)}:${hash}`;
}

export async function verifyPassword(password, stored) {
  try {
    const [saltHex, hash] = String(stored).split(':');
    const candidate = await pbkdf2(password, hexToBuf(saltHex));
    // constant-time-ish compare
    if (candidate.length !== hash.length) return false;
    let diff = 0;
    for (let i = 0; i < hash.length; i++) diff |= candidate.charCodeAt(i) ^ hash.charCodeAt(i);
    return diff === 0;
  } catch { return false; }
}

// ——— Sessions ———
const SESSION_COOKIE = 'pgp_session';
const SESSION_DAYS = 30;

export async function createSession(db) {
  const token = bufToHex(crypto.getRandomValues(new Uint8Array(32)));
  const expires = Date.now() + SESSION_DAYS * 86400 * 1000;
  await db.prepare('INSERT INTO sessions (token, expires_at) VALUES (?, ?)').bind(token, expires).run();
  return { token, expires };
}

export function sessionCookieHeader(token, expires, secure) {
  const exp = new Date(expires).toUTCString();
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${exp}${secure ? '; Secure' : ''}`;
}
export function clearSessionCookieHeader(secure) {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secure ? '; Secure' : ''}`;
}

export function getCookie(c, name) {
  const header = c.req.header('Cookie') || '';
  const m = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return m ? m[1] : null;
}

export async function checkAuth(c) {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return false;
  const row = await c.env.DB.prepare('SELECT token, expires_at FROM sessions WHERE token = ?').bind(token).first();
  if (!row) return false;
  if (row.expires_at < Date.now()) {
    await c.env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
    return false;
  }
  return true;
}

export async function destroySession(c) {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) await c.env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
}

// Basic same-origin check for state-changing admin requests
export function sameOrigin(c) {
  const origin = c.req.header('Origin');
  if (!origin) return true; // non-browser or same-origin form posts without Origin
  try {
    return new URL(origin).host === new URL(c.req.url).host;
  } catch { return false; }
}
