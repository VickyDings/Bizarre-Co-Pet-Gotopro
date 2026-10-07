# -*- coding: utf-8 -*-
"""Bring the pre-retheme posts onto the live plum theme without touching a word
of their copy, their images or their links.

Three things make a post look old:
  1. a <style> block that redeclares the theme's colour variables, pinning them
     to the old browns — the same fault that broke the cat calculator page;
  2. a stale copy of the whole old stylesheet embedded in the body, whose rules
     override the current theme for every class it happens to share;
  3. brown hex values hardcoded in the post's own custom rules and inline styles.
"""
import json, re, io, os, sys

# old brown token -> the plum value that replaced it in theme.js
MAP = {
 '#1a1410':'#15111C', '#140f0b':'#0F0C14', '#15100c':'#0F0C14', '#0d0b09':'#0F0C14',
 '#2d241a':'#2A2140', '#2b241c':'#2A2140',
 '#3d322a':'#514860', '#6f6055':'#6E6480', '#8a7d68':'#8B8098', '#a89b83':'#B5ABC0',
 '#c9bfa8':'#D6CFE2', '#d9cdb4':'#E5E0EE', '#d8cbb4':'#E5E0EE', '#e8dcc4':'#E5E0EE',
 '#f0e6d2':'#F0ECF6', '#f3ead9':'#F1EDF7', '#faf6ef':'#FBFAFD', '#f5efe0':'#FBFAFD',
 '#f6f1e7':'#FBFAFD',
 '#c8822b':'#FF3D96', '#a86618':'#C42A6E', '#e8c88a':'#FFC2DC', '#fdf1dd':'#FFF0F6',
 '#a08863':'#9A8FA8', '#8a6a45':'#8B8098', '#7d5f3d':'#6E6480',
 '#b8533a':'#C63B52', '#fbeeea':'#FDEEF0', '#eccfc5':'#F4CFD6', '#fbe4de':'#FDEEF0',
 '#95412c':'#A82F48',
 '#3d5c3a':'#2C7A57', '#6b8a5c':'#4E9E76', '#eef1e8':'#E9F5EE', '#eef5ea':'#E9F5EE',
 '#e8f2e3':'#E9F5EE', '#d5e3cd':'#CFE6D8', '#2e4a2c':'#235F44', '#2a4b28':'#235F44',
 '#3e6b3a':'#2C7A57', '#465b3e':'#2C7A57', '#5c8a47':'#4E9E76', '#6e9c55':'#4E9E76',
 '#7fad62':'#6BB88E',
}
# teals, blues and purples carry meaning in the betta and spider posts (plant
# difficulty, species groups). They are not brown and they sit fine on plum.
KEEP = {'#4fbfa8','#1f6f6b','#175653','#12484a','#06181a','#7fd6c4','#cfe3df',
        '#2b5f8a','#1f486a','#6b4a8a','#553a6e','#b8446f','#983758','#123b3b',
        '#ffffff','#000000'}

def to_hex(c):
    m = re.match(r'rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)', c.strip().lower())
    if m: return '#%02x%02x%02x' % tuple(int(x) for x in m.groups())
    c = c.strip().lower()
    if re.match(r'^#[0-9a-f]{3}$', c): return '#' + ''.join(ch*2 for ch in c[1:])
    return c

def recolour(h, log):
    def swap(m):
        raw = m.group(0); k = to_hex(raw)
        if k in MAP:
            log.setdefault(k, 0); log[k] += 1
            return MAP[k]
        return raw
    return re.sub(r'#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\([^)]*\)', swap, h)

def strip_palette_vars(css):
    # drop only the token redeclarations, so the block inherits the live theme
    return re.sub(r'--(?:ink|ink-soft|ink-mute|cream|cream-deep|paper|amber|amber-deep|'
                  r'clay|forest|moss|line|line-soft|sage|radius)\s*:\s*[^;}]+;?', '', css)

def restyle(html, stale_ok):
    notes, log = [], {}
    def handle(m):
        css = m.group(1)
        sels = set(re.findall(r'(?:^|[\s,}])\.([a-z][a-z0-9-]*)', css))
        if len(css) > 20000 and stale_ok:
            notes.append('deleted a %d-char stale copy of the old sitewide stylesheet' % len(css))
            return ''
        before = len(css)
        css = strip_palette_vars(css)
        if len(css) != before:
            notes.append('removed the palette overrides from a %d-char block (%d selectors kept)'
                         % (before, len(sels)))
        return '<style>' + css + '</style>'
    html = re.sub(r'<style[^>]*>([\s\S]*?)</style>', handle, html)
    html = recolour(html, log)
    if log:
        notes.append('remapped %d brown colour values (%d distinct)' % (sum(log.values()), len(log)))
    return html, notes

rows = json.loads(io.open('posts-export.json', encoding='utf-8').read())[0]['results']
os.makedirs('restyled', exist_ok=True)
summary = []
for r in rows:
    if r['id'] in (15, 16):     # already on the new palette
        continue
    new, notes = restyle(r['body_html'], stale_ok=True)
    if new == r['body_html']:
        summary.append((r['id'], r['slug'], 'already clean', 0))
        continue
    io.open('restyled/%02d-%s.html' % (r['id'], r['slug']), 'w', encoding='utf-8').write(new)
    summary.append((r['id'], r['slug'], '; '.join(notes), len(r['body_html']) - len(new)))

print('%-4s %-46s %s' % ('id', 'slug', 'what changed'))
print('-' * 118)
for i, slug, note, saved in summary:
    print('#%-3s %-46s %s' % (i, slug[:46], note))
    if saved: print('%51s %s bytes of dead CSS removed' % ('', format(saved, ',')))
