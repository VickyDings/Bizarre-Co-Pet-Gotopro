/* ===================================================
   Pet Go Pro - AI SEO Engine
   Turns a draft post into focus keyphrases, long-tail
   sets, per-platform hashtags, meta tags, JSON-LD and
   an on-page SEO score. Runs entirely in the browser
   against js/admin-seo-data.js - no API key needed.
   An optional remote endpoint can override the local
   suggestions (see PGP_SEO.remoteSuggest).
   =================================================== */

window.PGP_SEO = (function () {

    const D = window.PGP_SEO_DATA;
    const STOP = new Set(D.STOPWORDS);

    /* ---------- Text helpers ---------- */

    function stripHtml(s) {
        return String(s || '').replace(/<[^>]*>/g, ' ');
    }

    function words(text) {
        return stripHtml(text)
            .toLowerCase()
            .replace(/[^a-z0-9\s'-]/g, ' ')
            .split(/\s+/)
            .filter(Boolean);
    }

    function contentWords(text) {
        return words(text).filter(w => w.length > 2 && !STOP.has(w));
    }

    function titleCase(s) {
        const small = new Set(['a', 'an', 'and', 'the', 'for', 'of', 'in', 'on', 'to', 'vs', 'with', 'at', 'by']);
        return String(s || '').split(/\s+/).map((w, i) => {
            if (i > 0 && small.has(w.toLowerCase())) return w.toLowerCase();
            return w.charAt(0).toUpperCase() + w.slice(1);
        }).join(' ');
    }

    function slugify(s) {
        return String(s || '')
            .toLowerCase()
            .replace(/&/g, ' and ')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-{2,}/g, '-')
            .slice(0, 70)
            .replace(/-$/, '');
    }

    /** Slug from the title, with any missing focus words pulled to the front.
        Words are de-duplicated so we never emit bearded-dragon-bearded-dragon-... */
    function buildSlug(title, focus) {
        const titleWords = slugify(title).split('-').filter(Boolean);
        const focusWords = slugify(focus).split('-').filter(Boolean);
        const missing = focusWords.filter(w => titleWords.indexOf(w) === -1);
        const seen = new Set();
        return missing.concat(titleWords)
            .filter(w => w && !STOP.has(w) || focusWords.indexOf(w) !== -1)
            .filter(w => { if (seen.has(w)) return false; seen.add(w); return true; })
            .slice(0, 7)
            .join('-');
    }

    /** Cut to `max` characters without splitting a word. */
    function truncate(s, max, suffix) {
        s = String(s || '').replace(/\s+/g, ' ').trim();
        if (s.length <= max) return s;
        const tail = suffix || '';
        const cut = s.slice(0, max - tail.length);
        const space = cut.lastIndexOf(' ');
        return (space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[,;:.\s]+$/, '') + tail;
    }

    /** Like truncate, but prefers a clause boundary so a shortened title
        reads as a finished phrase instead of stopping mid-thought. */
    function truncateClause(s, max) {
        s = String(s || '').replace(/\s+/g, ' ').trim();
        if (s.length <= max) return s;
        const cut = s.slice(0, max);
        let best = -1;
        [':', ' \u2014 ', ' - ', ',', '(', '|'].forEach(mark => {
            const at = cut.lastIndexOf(mark);
            if (at > max * 0.5 && at > best) best = at;
        });
        if (best > -1) return cut.slice(0, best).replace(/[\s,:(|-]+$/, '');
        return truncate(s, max);
    }

    function sentences(text) {
        return stripHtml(text).split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 1);
    }

    function unique(list) {
        const seen = new Set(); const out = [];
        list.forEach(item => {
            const key = String(item).toLowerCase().trim();
            if (key && !seen.has(key)) { seen.add(key); out.push(item); }
        });
        return out;
    }

    /* ---------- Phrase mining ----------
       N-grams from the draft, scored by frequency, position and
       overlap with the niche corpus. Corpus overlap is what keeps
       "bearded dragon basking temperature" above "really nice setup". */

    function ngrams(tokens, n) {
        const out = [];
        for (let i = 0; i + n <= tokens.length; i++) out.push(tokens.slice(i, i + n).join(' '));
        return out;
    }

    /** Split into sentence/line segments first. N-grams must not span a
        boundary, or "...the heat. Heat lamps..." mines a phantom "heat heat". */
    function segments(text) {
        return stripHtml(text)
            .split(/[.!?;:\n\r]+|\s[\u2013\u2014-]\s/)
            .map(seg => contentWords(seg))
            .filter(seg => seg.length);
    }

    function minePhrases(post, cat) {
        const titleTokens = contentWords(post.title);
        const segs = segments(post.title).concat(segments(post.body));
        const all = titleTokens.concat(contentWords(post.body));
        if (!all.length) return [];

        const topicCorpus = new Set(
            (cat.seeds || []).concat(cat.entities || []).map(s => s.toLowerCase())
        );
        const corpus = new Set(
            Array.from(topicCorpus).concat((cat.species || []).map(s => s.toLowerCase()))
        );
        const corpusWords = new Set();
        corpus.forEach(phrase => phrase.split(/\s+/).forEach(w => corpusWords.add(w)));

        const titleSet = new Set(titleTokens);
        const counts = new Map();

        segs.forEach(seg => {
            [1, 2, 3].forEach(n => {
                ngrams(seg, n).forEach(phrase => {
                    const parts = phrase.split(' ');
                    if (STOP.has(parts[0]) || STOP.has(parts[parts.length - 1])) return;
                    // "heat heat", "uvb uvb bulb" - an artefact, never a keyphrase.
                    if (parts.some((w, i) => i > 0 && w === parts[i - 1])) return;
                    const entry = counts.get(phrase) || { phrase: phrase, count: 0, n: n };
                    entry.count++;
                    counts.set(phrase, entry);
                });
            });
        });

        const total = all.length;
        return Array.from(counts.values()).map(e => {
            const parts = e.phrase.split(' ');
            const inCorpus = corpus.has(e.phrase);
            const corpusHits = parts.filter(w => corpusWords.has(w)).length;
            const inTitle = parts.every(w => titleSet.has(w));

            let score = e.count * 2;
            // A single word almost never makes a good focus keyphrase, so it
            // is penalised against the bigram/trigram it sits inside.
            score += e.n === 1 ? -10 : e.n === 2 ? 10 : 8;
            score += inCorpus ? 14 : corpusHits * 4;      // niche relevance
            score += inTitle ? 8 : 0;
            if (e.count === 1 && !inCorpus && !inTitle) score -= 4;

            return {
                phrase: e.phrase,
                count: e.count,
                words: e.n,
                isTopic: topicCorpus.has(e.phrase),
                density: total ? +(e.count * e.n / total * 100).toFixed(2) : 0,
                inCorpus: inCorpus,
                inTitle: inTitle,
                score: score
            };
        }).sort((a, b) => b.score - a.score);
    }

    /* ---------- Long-tail generation ---------- */

    /** "a African grey" -> "an African grey". Skips the u-words that are
        pronounced with a leading consonant sound (a UVB bulb, a unicorn). */
    function fixArticles(s) {
        return String(s || '')
            .replace(/\b([Aa])\s+(?=(?:u|U)(?:vb|v|ni|se|ro|tility))/g, '$1 ')
            .replace(/\b([Aa])\s+(?=[aeiouAEIOU])/g, (m, a) => (a === 'A' ? 'An ' : 'an '));
    }

    function fill(template, slots) {
        const out = template.replace(/\{(\w+)\}/g, (m, key) => slots[key] || '')
            .replace(/\s{2,}/g, ' ').trim();
        return fixArticles(out);
    }

    function pick(list, i) {
        if (!list || !list.length) return '';
        return list[i % list.length];
    }

    /** True when a template collapsed into nonsense because the focus topic
        and the species are the same noun, or a word repeats back to back. */
    function redundant(phrase, slots) {
        const lower = phrase.toLowerCase();
        const topic = (slots.topic || '').toLowerCase();
        const species = (slots.species || '').toLowerCase();
        if (topic && species && (topic === species ||
            (topic.length > 4 && species.indexOf(topic) !== -1) ||
            (species.length > 4 && topic.indexOf(species) !== -1))) {
            // Only reject the templates that use BOTH slots.
            const usesBoth = lower.indexOf(topic) !== -1 &&
                lower.replace(topic, '').indexOf(species.split(' ').pop()) !== -1;
            if (usesBoth) return true;
        }
        return /\b(\w{4,})\b[\s,]+\1\b/i.test(lower);
    }

    function buildLongTail(cat, slots, intents) {
        const wanted = intents && intents.length ? intents : ['informational', 'commercial', 'comparison'];
        const out = [];
        wanted.forEach(intent => {
            (D.MODIFIERS[intent] || []).forEach((tpl, idx) => {
                const gear = (cat.amazon && cat.amazon.length)
                    ? cat.amazon[idx % cat.amazon.length].label.toLowerCase().replace(/\s*&\s*/g, ' and ')
                    : slots.topic;
                const phrase = fill(tpl, {
                    seed: slots.seed,
                    topic: slots.topic,
                    gear: gear,
                    species: slots.species,
                    alt: pick(cat.alts, idx),
                    alt2: pick(cat.alts, idx + 1),
                    altSpecies: pick(cat.species, idx + 3),
                    behaviour: pick(cat.behaviours, idx),
                    problem: pick(cat.problems, idx)
                });
                if (!phrase || /\{\w+\}/.test(phrase)) return;
                if (redundant(phrase, slots)) return;
                out.push({ phrase: phrase.toLowerCase(), intent: intent });
            });
        });
        return unique(out.map(o => o.phrase)).map(p => {
            const match = out.find(o => o.phrase === p);
            return { phrase: p, intent: match.intent, competition: estimateCompetition(p) };
        });
    }

    /** Heuristic difficulty label - NOT live search-volume data.
        Longer, more specific phrases are easier to rank for; short
        head terms with a generic modifier are the hard ones. */
    function estimateCompetition(phrase) {
        const n = phrase.split(/\s+/).length;
        const headish = /^(best|top|buy|cheap)\b/.test(phrase);
        if (n >= 6) return 'low';
        if (n >= 4) return headish ? 'medium' : 'low';
        if (n === 3) return headish ? 'high' : 'medium';
        return 'high';
    }

    /* ---------- Hashtags ---------- */

    function buildHashtags(cat, platformId, slots, limit) {
        const nicheTags = (cat.hashtags && cat.hashtags[platformId]) || [];
        const speciesTag = '#' + slugify(slots.species).replace(/-/g, '');
        const seedTag = '#' + slugify(slots.seed).replace(/-/g, '');
        const pool = unique([seedTag, speciesTag].concat(nicheTags, D.GENERIC_TAGS))
            .filter(t => t.length > 2);
        return pool.slice(0, limit);
    }

    /* ---------- Meta tags ---------- */

    function buildMeta(post, focus, cat) {
        const brand = ' | Pet Go Pro';
        let metaTitle = post.title || titleCase(focus);
        if (focus && metaTitle.toLowerCase().indexOf(focus.toLowerCase()) === -1) {
            metaTitle = titleCase(focus) + ': ' + metaTitle;
        }
        metaTitle = truncateClause(metaTitle, 60 - brand.length) + brand;

        const first = sentences(post.excerpt || post.body)[0] || '';
        let desc = post.excerpt || first;
        if (focus && desc.toLowerCase().indexOf(focus.toLowerCase()) === -1) {
            desc = titleCase(focus) + ' explained: ' + desc;
        }
        desc = String(desc || '').replace(/\s+/g, ' ').trim();
        if (desc && !/[.!?]$/.test(desc)) desc += '.';

        // A 90-character description wastes half the snippet, so top it up with a
        // genuine value line until it reaches the 120-155 sweet spot.
        const fillers = [
            'Vet-informed ' + cat.label.toLowerCase() + ' advice from Pet Go Pro.',
            'Covers setup, diet and the kit that actually lasts.',
            'Read the full step-by-step guide.'
        ];
        for (let i = 0; i < fillers.length && desc.length < 120; i++) {
            if (desc.length + fillers[i].length + 1 <= 155) desc += ' ' + fillers[i];
        }
        if (desc.length > 155) {
            desc = truncateClause(desc, 155).replace(/[\s,;:]*\b(and|or|but|with|for|to|the|a|an)$/i, '');
            if (desc && !/[.!?]$/.test(desc)) desc += '.';
        }

        return { title: metaTitle, description: desc };
    }

    /* ---------- FAQ questions ---------- */

    function buildQuestions(cat, slots) {
        return unique(D.QUESTION_TEMPLATES.map((tpl, i) => fill(tpl, {
            species: slots.species,
            seed: slots.seed,
            behaviour: pick(cat.behaviours, i),
            problem: pick(cat.problems, i)
        }))).filter(q => !/\{\w+\}/.test(q)).slice(0, 8);
    }

    /* ---------- Amazon product pairings ---------- */

    function buildProducts(cat, affiliateTag) {
        return (cat.amazon || []).map(p => {
            const params = ['k=' + encodeURIComponent(p.q)];
            if (affiliateTag) params.push('tag=' + encodeURIComponent(affiliateTag));
            return {
                label: p.label,
                query: p.q,
                url: 'https://www.amazon.com/s?' + params.join('&')
            };
        });
    }

    /* ---------- On-page score ---------- */

    function scorePost(post, focus, analysis) {
        const body = stripHtml(post.body);
        const wordCount = words(body).length;
        const lowerTitle = (post.title || '').toLowerCase();
        const lowerFocus = (focus || '').toLowerCase();
        const firstPara = sentences(body).slice(0, 2).join(' ').toLowerCase();
        const headings = (post.body || '').match(/^#{2,3}\s.+$|<h[23][^>]*>.*?<\/h[23]>/gim) || [];
        const avgSentence = (function () {
            const sents = sentences(body);
            if (!sents.length) return 0;
            return Math.round(words(body).length / sents.length);
        })();
        const focusCount = lowerFocus ? (body.toLowerCase().split(lowerFocus).length - 1) : 0;
        const density = wordCount ? +(focusCount * lowerFocus.split(' ').length / wordCount * 100).toFixed(2) : 0;

        const checks = [
            { id: 'focus', label: 'Focus keyphrase set', weight: 8,
              pass: !!lowerFocus, hint: 'Pick or confirm a focus keyphrase.' },
            { id: 'title-focus', label: 'Keyphrase in the title', weight: 12,
              pass: !!lowerFocus && lowerTitle.indexOf(lowerFocus) !== -1,
              hint: 'Work the focus keyphrase into the H1 - ideally in the first half.' },
            { id: 'title-length', label: 'Title 30-60 characters', weight: 6,
              pass: (post.title || '').length >= 30 && (post.title || '').length <= 65,
              hint: 'Titles under 30 look thin; over 65 get truncated in results.' },
            { id: 'slug', label: 'Keyphrase in the URL slug', weight: 7,
              pass: !!lowerFocus && (post.slug || '').indexOf(slugify(lowerFocus).split('-')[0]) !== -1,
              hint: 'Keep the slug short and keyphrase-led.' },
            { id: 'meta-desc', label: 'Meta description 120-155 characters', weight: 8,
              pass: (analysis.meta.description || '').length >= 110 && (analysis.meta.description || '').length <= 158,
              hint: 'Write a description that earns the click, not just describes the page.' },
            { id: 'intro', label: 'Keyphrase in the opening lines', weight: 8,
              pass: !!lowerFocus && firstPara.indexOf(lowerFocus) !== -1,
              hint: 'Say the keyphrase in the first 100 words so the topic is unmistakable.' },
            { id: 'length', label: 'At least 900 words', weight: 10,
              pass: wordCount >= 900,
              hint: 'Care guides that rank in this niche usually run 1,200-2,000 words. Current: ' + wordCount + '.' },
            { id: 'headings', label: '3+ subheadings', weight: 8,
              pass: headings.length >= 3,
              hint: 'Use H2s per question so you can win featured snippets. Found: ' + headings.length + '.' },
            { id: 'density', label: 'Keyphrase density 0.4-2.5%', weight: 7,
              pass: density >= 0.4 && density <= 2.5,
              hint: 'Current density ' + density + '%. Under-using it is as bad as stuffing.' },
            { id: 'image-alt', label: 'Featured image with alt text', weight: 7,
              pass: !!(post.image && post.imageAlt && post.imageAlt.length > 10),
              hint: 'Alt text should describe the animal and the action, not list keywords.' },
            { id: 'internal', label: 'Internal links to shop pages', weight: 7,
              pass: /href=["']?(index|pets|collectibles|about|contact)/i.test(post.body || '') ||
                    (post.internalLinks || []).length > 0,
              hint: 'Link the guide to the matching product category so the content earns revenue.' },
            { id: 'readability', label: 'Average sentence under 22 words', weight: 6,
              pass: avgSentence > 0 && avgSentence <= 22,
              hint: 'Average is ' + avgSentence + ' words. Short sentences hold mobile readers.' },
            { id: 'eeat', label: 'Author and review note present', weight: 6,
              pass: !!(post.author && post.author.length > 2) && !!post.reviewedBy,
              hint: 'Pet health is a YMYL topic - name the author and who reviewed it (vet, keeper, groomer).' }
        ];

        const earned = checks.reduce((sum, c) => sum + (c.pass ? c.weight : 0), 0);
        const possible = checks.reduce((sum, c) => sum + c.weight, 0);
        const total = Math.round(earned / possible * 100);

        return {
            total: total,
            grade: total >= 85 ? 'excellent' : total >= 70 ? 'good' : total >= 50 ? 'needs work' : 'poor',
            wordCount: wordCount,
            density: density,
            avgSentence: avgSentence,
            headings: headings.length,
            checks: checks
        };
    }

    /* ---------- Structured data ---------- */

    function buildSchema(post, analysis, settings) {
        const base = (settings.siteUrl || '').replace(/\/$/, '');
        const url = base + '/blog/' + (post.slug || slugify(post.title)) + '.html';
        const today = new Date().toISOString().slice(0, 10);

        const graph = [{
            '@type': 'BlogPosting',
            'headline': truncate(post.title || '', 110),
            'description': analysis.meta.description,
            'image': post.image || undefined,
            'datePublished': post.date || today,
            'dateModified': post.date || today,
            'inLanguage': 'en',
            'mainEntityOfPage': { '@type': 'WebPage', '@id': url },
            'author': { '@type': 'Person', 'name': post.author || settings.brandName || 'Pet Go Pro' },
            'publisher': {
                '@type': 'Organization',
                'name': settings.brandName || 'Bizarre Co - Pet Go Pro',
                'url': base || undefined
            },
            'keywords': analysis.keywords.slice(0, 10).map(k => k.phrase).join(', '),
            'about': { '@type': 'Thing', 'name': analysis.category.label }
        }];

        if (post.reviewedBy) {
            graph[0].reviewedBy = { '@type': 'Person', 'name': post.reviewedBy };
        }

        if (analysis.questions.length) {
            graph.push({
                '@type': 'FAQPage',
                'mainEntity': analysis.questions.slice(0, 5).map(q => ({
                    '@type': 'Question',
                    'name': q,
                    'acceptedAnswer': { '@type': 'Answer', 'text': 'ANSWER ' + q + ' in 40-60 words here.' }
                }))
            });
        }

        graph.push({
            '@type': 'BreadcrumbList',
            'itemListElement': [
                { '@type': 'ListItem', position: 1, name: 'Home', item: base + '/index.html' },
                { '@type': 'ListItem', position: 2, name: 'Pet Advice', item: base + '/blog/index.html' },
                { '@type': 'ListItem', position: 3, name: post.title || '' }
            ]
        });

        return { '@context': 'https://schema.org', '@graph': graph };
    }

    /* ---------- Share URLs ---------- */

    function withUtm(url, platform, settings, post) {
        if (!url) return url;
        const source = (settings.utm && settings.utm[platform.id]) || platform.id;
        const parts = [
            'utm_source=' + encodeURIComponent(source),
            'utm_medium=' + encodeURIComponent((settings.utmMedium || 'social')),
            'utm_campaign=' + encodeURIComponent(settings.utmCampaign || slugify(post.title || 'blog') || 'blog')
        ];
        return url + (url.indexOf('?') === -1 ? '?' : '&') + parts.join('&');
    }

    function postUrl(post, settings) {
        const base = (settings.siteUrl || '').replace(/\/$/, '');
        if (!base) return '';
        return base + '/blog/' + (post.slug || slugify(post.title)) + '.html';
    }

    /* ---------- Captions ---------- */

    function hookFrom(post) {
        const s = sentences(post.excerpt || post.body)[0] || post.title || '';
        return truncate(s, 160);
    }

    function buildCaption(platform, post, analysis, settings) {
        const url = withUtm(postUrl(post, settings), platform, settings, post);
        const tags = buildHashtags(analysis.category, platform.id, analysis.slots, platform.tagCount);
        const handle = (settings.profiles && settings.profiles[platform.id] && settings.profiles[platform.id].handle) || '';
        const extra = (settings.profiles && settings.profiles[platform.id] && settings.profiles[platform.id].defaultTags) || '';
        const cta = settings.cta || 'Full guide on the blog';

        let body;
        if (platform.id === 'pinterest') {
            // Pinterest reads descriptions like search queries, so lead with the keyphrase.
            body = titleCase(analysis.focus) + ' - ' + hookFrom(post) + ' ' +
                   analysis.longTail.slice(0, 2).map(l => l.phrase).join(', ') + '.';
        } else if (platform.id === 'reddit') {
            body = post.title || '';                      // Reddit wants a plain, honest title
        } else if (platform.id === 'x') {
            body = truncate(hookFrom(post), 180);
        } else if (platform.id === 'linkedin') {
            body = hookFrom(post) + '\n\nWhy it matters for anyone selling or caring for ' +
                   analysis.category.label.toLowerCase() + ': husbandry questions are the ' +
                   'number one reason first-time keepers return an animal.\n\n' + cta + '.';
        } else if (platform.id === 'email') {
            body = hookFrom(post) + '\n\n' + (post.excerpt || '') + '\n\n' + cta + ':';
        } else if (platform.id === 'youtube') {
            body = post.title + '\n\n' + hookFrom(post) + '\n\n' + cta + ': ' + (url || '') +
                   '\n\nChapters:\n0:00 Intro\n\nTags: ' + tags.map(t => t.replace('#', '')).join(', ');
        } else {
            body = (post.title || '') + '\n\n' + hookFrom(post) + '\n\n' + cta +
                   (platform.linkInBody && url ? ': ' + url : ' - link in bio');
        }

        const tagLine = tags.length ? tags.join(' ') : '';
        const extraLine = extra ? String(extra).trim() : '';
        let text = body;
        if (platform.id !== 'reddit' && platform.id !== 'youtube' && tagLine) {
            text += '\n\n' + tagLine + (extraLine ? ' ' + extraLine : '');
        }
        if (handle && platform.id === 'x') text += ' via ' + handle;

        // X counts any link as 23 characters.
        const linkCost = platform.id === 'x' && url ? 23 : 0;
        const effective = text.length + linkCost;

        const warnings = [];
        if (effective > platform.captionLimit) {
            warnings.push('Over the ' + platform.captionLimit + '-character limit by ' +
                (effective - platform.captionLimit) + '.');
        }
        if (!url && platform.linkInBody) {
            warnings.push('No site URL set in Settings, so no link was added.');
        }
        if (!platform.prefillsCaption) warnings.push(platform.note);

        return {
            platform: platform.id,
            label: platform.label,
            icon: platform.icon,
            colour: platform.colour,
            text: text,
            tags: tags,
            url: url,
            chars: effective,
            limit: platform.captionLimit,
            ideal: platform.idealLength,
            mode: platform.share,
            prefills: platform.prefillsCaption,
            note: platform.note,
            bestTimes: platform.bestTimes,
            warnings: warnings
        };
    }

    function buildShareUrl(platform, caption, post, settings) {
        const url = caption.url || '';
        const text = caption.text;
        const subject = post.title || '';
        const image = post.image || '';
        const tagsCsv = caption.tags.map(t => t.replace('#', '')).join(',');
        const withUrl = url ? text + '\n\n' + url : text;

        return platform.urlTemplate
            .replace('{url}', encodeURIComponent(url))
            .replace('{text}', encodeURIComponent(truncate(text, platform.id === 'reddit' ? 290 : 2000)))
            .replace('{textWithUrl}', encodeURIComponent(truncate(withUrl, 2000)))
            .replace('{subject}', encodeURIComponent(subject))
            .replace('{image}', encodeURIComponent(image))
            .replace('{tagsCsv}', encodeURIComponent(tagsCsv));
    }

    /* ---------- Main entry ---------- */

    function analyse(post, settings) {
        settings = settings || {};
        const catKey = D.CATEGORIES[post.category] ? post.category : 'general';
        const cat = D.CATEGORIES[catKey];

        const mined = minePhrases(post, cat);
        const detectedSpecies = (cat.species || []).find(s =>
            (post.title + ' ' + post.body).toLowerCase().indexOf(s.toLowerCase()) !== -1);
        const detectedSeed = (cat.seeds || []).find(s =>
            (post.title + ' ' + post.body).toLowerCase().indexOf(s.toLowerCase()) !== -1);

        // Prefer a corpus-backed 2-3 word phrase: that is what a real focus
        // keyphrase looks like. Single words are the last resort.
        const multi = mined.filter(m => m.words >= 2);
        const bestPhrase = multi.find(m => m.isTopic) || multi.find(m => m.inCorpus) ||
            multi[0] || mined[0];
        const focus = (post.focusKeyphrase && post.focusKeyphrase.trim()) ||
            (bestPhrase && bestPhrase.phrase) || detectedSeed || cat.seeds[0];

        const slots = {
            species: post.species || detectedSpecies || cat.species[0],
            // seed must stay a curated corpus phrase so templates like
            // "how to {seed}" always read as English.
            seed: detectedSeed || cat.seeds[0],
            topic: focus || detectedSeed || cat.seeds[0]
        };

        const intents = post.intents && post.intents.length
            ? post.intents : ['informational', 'commercial', 'comparison'];

        const semantic = unique(
            (cat.entities || []).filter(e => (post.body || '').toLowerCase().indexOf(e.toLowerCase()) === -1)
        ).slice(0, 18);

        const covered = unique(
            (cat.entities || []).filter(e => (post.body || '').toLowerCase().indexOf(e.toLowerCase()) !== -1)
        );

        const meta = buildMeta(post, focus, cat);
        const questions = buildQuestions(cat, slots);

        const analysis = {
            categoryKey: catKey,
            category: cat,
            focus: focus,
            slots: slots,
            keywords: mined.slice(0, 14),
            longTail: buildLongTail(cat, slots, intents),
            semantic: semantic,
            covered: covered,
            questions: questions,
            meta: meta,
            slug: post.slug || buildSlug(post.title, focus),
            altText: 'A ' + slots.species + ' ' + (post.imageAltHint || 'in a correctly set up enclosure') +
                     ' - ' + focus,
            internalLinks: cat.internal || [],
            products: buildProducts(cat, settings.amazonTag),
            angles: D.ANGLES.map(a => ({
                id: a.id, label: a.label, intent: a.intent,
                title: fill(a.pattern, {
                    Species: titleCase(slots.species),
                    Seed: titleCase(slots.seed),
                    Topic: titleCase(slots.topic),
                    Alt: titleCase(pick(cat.alts, 0)),
                    Alt2: titleCase(pick(cat.alts, 1)),
                    Behaviour: titleCase(pick(cat.behaviours, 0))
                })
            }))
        };

        analysis.score = scorePost(post, focus, analysis);
        analysis.schema = buildSchema(post, analysis, settings);
        analysis.captions = {};
        D.PLATFORMS.forEach(p => {
            const profile = (settings.profiles && settings.profiles[p.id]) || {};
            if (profile.enabled === false) return;
            analysis.captions[p.id] = buildCaption(p, post, analysis, settings);
        });

        return analysis;
    }

    /* ---------- Optional remote model ----------
       Point settings.aiEndpoint at your own server route that calls a
       model and returns {focus, keywords[], longTail[], hashtags{}, meta{}}.
       Never put a provider API key in this page - the browser exposes it. */
    function remoteSuggest(post, settings) {
        if (!settings || !settings.aiEndpoint) return Promise.resolve(null);
        return fetch(settings.aiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post: post, category: post.category })
        }).then(r => {
            if (!r.ok) throw new Error('Endpoint returned ' + r.status);
            return r.json();
        });
    }

    return {
        analyse: analyse,
        remoteSuggest: remoteSuggest,
        buildShareUrl: buildShareUrl,
        buildCaption: buildCaption,
        postUrl: postUrl,
        withUtm: withUtm,
        slugify: slugify,
        buildSlug: buildSlug,
        fixArticles: fixArticles,
        truncate: truncate,
        truncateClause: truncateClause,
        titleCase: titleCase,
        stripHtml: stripHtml,
        words: words
    };
})();
