# Pet-GoToPro — Your Website Owner's Guide

Your new website is a complete, self-hosted publishing platform that runs entirely on your existing Cloudflare account — **no monthly fees**. It gives you everything you asked for: a password-protected admin area, blog posting with Word document import, page and menu editing, and built-in AI SEO tools.

## What you got

**The public website** (what visitors and Google see) has a homepage with your logo, tagline and category tiles for Dogs, Cats, Small Pets, Birds, Reptiles, Aquatics and Invertebrates; a blog with category filtering; your two existing articles (slow-feeder bowls and separation anxiety) already published with all Amazon affiliate links intact; and About, Contact, Affiliate Disclosure and Privacy Policy pages. SEO is built in everywhere: meta descriptions, Open Graph tags, Google Article schema, a sitemap at /sitemap.xml, an RSS feed, and automatic affiliate disclosures on any post containing Amazon links.

**The admin area** (at yoursite.com/admin) is protected by a password you choose the very first time you visit. From there you can write posts in a visual editor, upload a Word document that becomes a formatted draft automatically (headings, bold, lists and images all come across), upload photos, create pages, rearrange your navigation menu, and change your logo, tagline or Amazon associate tag at any time.

**The AI tools** run on Cloudflare's free Workers AI. On the dashboard, "AI blog post ideas" suggests new article topics with target keywords based on what you've already published — each with a "Start this draft" button. Inside the post editor, the "AI SEO assistant" reads your draft and proposes better titles, a meta description, a URL slug and keywords, each with a one-click "Use" button.

## Your first visit

1. Open **yoursite.com/admin** after the site is deployed.
2. You'll be asked to **create your admin password** (minimum 8 characters). Write it down somewhere safe — this one password protects your whole site.
3. That's it — you're in.

## Publishing a blog post from Word

1. Write your article in Microsoft Word as usual. Use Word's built-in **Title** style (or a big Heading 1) for the article title, normal headings for sections, and paste images right into the document.
2. In your admin, go to **Blog Posts → Import Word doc** and drop the .docx file in.
3. The post appears as a draft with the title, text, headings and images already in place.
4. Click **Get SEO suggestions**, apply the ones you like, pick a category, then hit **Publish**.

## Getting found on Google

After deployment, do this once: go to [Google Search Console](https://search.google.com/search-console), add your domain, and submit your sitemap (`https://yourdomain.com/sitemap.xml`). Google will then discover every new post automatically. The AI SEO assistant handles the per-post optimisation.

## What it costs

Nothing, at your current scale. Cloudflare's free tier includes 100,000 visits per day, a 5 GB database, and a generous daily AI allowance (roughly 100–200 AI suggestions a day). If the AI limit is ever hit, the buttons simply say "try again later" — the website itself is unaffected.

## Files in this package

- `src/` — the website code (public site, admin, AI tools)
- `assets/` — your logo, built in as the default
- `seed/` — your starter content (the two articles, pages, menu)
- `wrangler.jsonc` — the Cloudflare configuration
- `schema.sql` — the database structure

## Deploying updates later

Any future changes (new features, design tweaks) can be done in a Claude session: upload this zip or point Claude at the project, describe the change, and redeploy with `npx wrangler deploy`.
