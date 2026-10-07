export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
export const slugify = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const now = () => '2026-09-28T00:00:00Z';
export const getSettings = async () => ({ site_name: 'Pet-GoToPro', shop_mode: 'preview' });
export const setSetting = async () => {};
export const checkAuth = async () => true;
export const sameOrigin = () => true;
