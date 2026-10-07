# -*- coding: utf-8 -*-
"""Reads posts-export.json / pages-export.json and reports what each post is made of,
so the restyle can be planned without opening every body by hand.

  python3 analyze-export.py posts-export.json
"""
import json, re, sys, io, collections

BLOCKS = [
 ('quick-facts', r'class="quick-facts"'), ('spec table', r'table class="compare"'),
 ('section', r'class="pgp-section'), ('product card', r'class="pgp-prod"'),
 ('old .product', r'class="product"'), ('pros/cons', r'class="pros-cons"'),
 ('vet warning', r'class="vet-warning"'), ('vet tip', r'class="vet-tip"'),
 ('fun fact', r'class="funfact"'), ('download card', r'class="download-card"'),
 ('method list', r'class="method-list"'), ('kit list', r'class="kit-section"'),
 ('callout', r'class="callout"'), ('FAQ', r'class="faq-item"'),
 ('disclosure', r'class="disclosure"'), ('paw divider', r'class="paw-divider"'),
]
# a care guide earns the full treatment; a review only needs restructuring
GUIDEY = re.compile(r'care|guide|setup|complete|how to|husbandry|nutrition|feeding|cycle|compatibility', re.I)
REVIEWY = re.compile(r'review|reviewed|best|vs\.?|comparison|top \d', re.I)

def words(h):
    return len(re.sub(r'<[^>]+>', ' ', h).split())

def rows(path):
    raw = io.open(path, encoding='utf-8', errors='replace').read()
    start = raw.find('[')
    data = json.loads(raw[start:])          # skip any wrangler banner
    out = []
    for chunk in (data if isinstance(data, list) else [data]):
        out += chunk.get('results', []) if isinstance(chunk, dict) else []
    return out

for path in sys.argv[1:]:
    print('\n' + '=' * 78)
    print(path)
    print('=' * 78)
    for r in rows(path):
        h = r.get('body_html') or ''
        have = [n for n, pat in BLOCKS if re.search(pat, h)]
        title = (r.get('title') or '')[:52]
        kind = 'REVIEW' if REVIEWY.search(title) else ('GUIDE' if GUIDEY.search(title) else 'other')
        inline = len(re.findall(r'style="[^"]*(?:color|background)[^"]*"', h))
        styleblk = len(re.findall(r'<style', h))
        print('\n  #%-3s %-6s %-52s %s' % (r.get('id'), kind, title, r.get('status', '')))
        print('       %5d words   %2d images   %2d links   slug: %s'
              % (words(h), len(re.findall(r'<img', h)), len(re.findall(r'<a\b', h)), r.get('slug')))
        print('       blocks: %s' % (', '.join(have) if have else 'none — plain headings and paragraphs'))
        if inline or styleblk:
            print('       !! %d inline color styles, %d <style> blocks — these override the theme'
                  % (inline, styleblk))
