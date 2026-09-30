#!/usr/bin/env python3
"""Builds seed.sql — starter content for the Pet-GoToPro CMS."""
import json, pathlib

HERE = pathlib.Path(__file__).parent

def q(s):
    return "'" + str(s).replace("'", "''") + "'"

stmts = ["DELETE FROM posts;", "DELETE FROM pages;", "DELETE FROM menu_items;"]

# ——— Post 1: slow feeder bowls (published 2026-04-21) ———
body1 = (HERE / 'slow-feeder-body.html').read_text()
stmts.append(
    "INSERT INTO posts (slug, title, description, keywords, category, hero_image, body_html, status, created_at, updated_at, published_at) VALUES ("
    + q('best-slow-feeder-dog-bowls-2026') + ','
    + q('The 5 Best Slow-Feeder Bowls for Fast-Eating Dogs in 2026') + ','
    + q("Your dog inhaling dinner in 30 seconds is a real health risk — bloat, choking, and vomiting all start there. Here are the 5 best slow-feeder bowls of 2026.") + ','
    + q('best slow feeder dog bowl, slow feeder for dogs, dog bowl for fast eaters, bloat prevention dog bowl, slow feeder bowl 2026, puzzle feeder dog, ceramic slow feeder, stainless steel slow feeder') + ','
    + q('Dogs') + ", '',"
    + q(body1) + ","
    + "'published', '2026-04-21T12:00:00.000Z', '2026-04-21T12:00:00.000Z', '2026-04-21T12:00:00.000Z');"
)

# ——— Post 2: separation anxiety (from JSON built by converter) ———
p2 = json.loads((HERE / 'post-separation-anxiety.json').read_text())
stmts.append(
    "INSERT INTO posts (slug, title, description, keywords, category, hero_image, body_html, status, created_at, updated_at, published_at) VALUES ("
    + q(p2['slug']) + ',' + q(p2['title']) + ',' + q(p2['description']) + ',' + q(p2['keywords']) + ','
    + q(p2['category']) + ',' + q(p2.get('hero_image', '')) + ',' + q(p2['body_html']) + ","
    + "'published', '2026-04-21T11:00:00.000Z', '2026-04-21T11:00:00.000Z', '2026-04-21T11:00:00.000Z');"
)

# ——— Pages ———
NOW = "'2026-08-13T12:00:00.000Z'"
pages = [
    ('about', 'About Us', 'Who is behind Pet-GoToPro — trusted pet care information for dogs, cats and exotic companions.', """
<p><strong>Pet-GoToPro</strong> exists for one reason: to give every pet owner the kind of advice they'd get from a veterinary professional who genuinely cares — clear, honest, and practical.</p>
<p>We cover dogs and cats, but we don't stop there. Small pets, birds, reptiles, aquatics, and invertebrates deserve expert care too, and they're often the animals whose owners struggle most to find trustworthy information.</p>
<h2>What we believe</h2>
<p><strong>Filtered hydration is key.</strong> Clean, fresh, filtered water is the cheapest health upgrade available for any animal — it supports kidney function, digestion, and long-term wellbeing.</p>
<p><strong>Immunity support extends lifespan.</strong> Species-appropriate nutrition, sensible supplements, and preventive care add healthy years to your companion's life.</p>
<p><strong>Activity and socialisation matter.</strong> A well-exercised, mentally stimulated, properly socialised animal is a healthier and happier one — whether that's a Border Collie or a leopard gecko.</p>
<h2>How we review products</h2>
<p>When we recommend a product, it's because we believe it solves a real problem at a fair price. Some links on this site are Amazon affiliate links — if you buy through them we earn a small commission at no extra cost to you. Commissions never decide our picks; our editorial judgment does.</p>
"""),
    ('contact', 'Contact Us', 'Get in touch with the Pet-GoToPro team.', """
<p>Questions, corrections, product suggestions, or partnership enquiries — we'd love to hear from you.</p>
<p><strong>Email:</strong> replace this line with the email address you'd like readers to use (edit this page in your admin dashboard → Pages → Contact Us).</p>
<p>We do our best to reply within two business days.</p>
<p><em>Please note: we can't provide individual veterinary advice by email. If your pet is unwell, contact your local veterinarian.</em></p>
"""),
    ('affiliate-disclosure', 'Affiliate Disclosure', 'How Pet-GoToPro earns money and why it never affects our recommendations.', """
<p>Pet-GoToPro is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.</p>
<p>When you click a product link on this site and make a purchase, we may earn a small commission. This comes at <strong>no extra cost to you</strong> — the price you pay is exactly the same.</p>
<p>Affiliate commissions are how we keep the site free, fund product testing, and continue publishing in-depth care guides. They never influence which products we recommend: our reviews reflect our honest editorial judgment, and we routinely recommend cheaper options when they're the better choice.</p>
<p>Product prices and availability shown on this site are accurate at the time of publication and are subject to change. Always verify the current price on Amazon before purchasing.</p>
"""),
    ('privacy-policy', 'Privacy Policy', 'How Pet-GoToPro handles your data.', """
<p>Your privacy matters to us. This page explains what data this website handles.</p>
<h2>What we collect</h2>
<p>This website does not require accounts, does not run advertising trackers, and does not sell data. Standard server logs (IP address, pages visited) may be processed by our hosting provider, Cloudflare, for security and performance purposes.</p>
<h2>Affiliate links</h2>
<p>When you click an Amazon link on this site, Amazon may set cookies to attribute your purchase. Amazon's own privacy policy governs that data.</p>
<h2>Contact</h2>
<p>For any privacy questions, reach us via the details on our <a href="/contact">contact page</a>.</p>
"""),
]
for slug, title, desc, body in pages:
    stmts.append(
        "INSERT INTO pages (slug, title, description, body_html, status, created_at, updated_at) VALUES ("
        + q(slug) + ',' + q(title) + ',' + q(desc) + ',' + q(body.strip()) + ",'published'," + NOW + ',' + NOW + ');'
    )

# ——— Menu ———
menu = [('Home', '/'), ('Blog', '/blog'), ('Dogs', '/category/Dogs'), ('Cats', '/category/Cats'), ('About', '/about'), ('Contact', '/contact')]
for i, (label, url) in enumerate(menu):
    stmts.append(f"INSERT INTO menu_items (label, url, sort) VALUES ({q(label)}, {q(url)}, {i});")

(HERE / 'seed.sql').write_text('\n'.join(stmts))
print(f"seed.sql written: {len(stmts)} statements, {(HERE/'seed.sql').stat().st_size} bytes")
