/* ===================================================
   Pet Go Pro - Admin Console
   Composer, AI SEO panel, social setup and the
   multi-share publisher. State lives in localStorage.
   =================================================== */

(function () {
    'use strict';

    const D = window.PGP_SEO_DATA;
    const SEO = window.PGP_SEO;
    const KEY = 'pgp_admin_v1';

    const $ = sel => document.querySelector(sel);
    const $$ = sel => Array.from(document.querySelectorAll(sel));
    const el = (tag, cls, html) => {
        const n = document.createElement(tag);
        if (cls) n.className = cls;
        if (html != null) n.innerHTML = html;
        return n;
    };
    const esc = s => String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    /* =============== State =============== */

    const defaults = {
        settings: {
            siteUrl: '',
            brandName: 'Bizarre Co - Pet Go Pro',
            author: '',
            cta: 'Full guide on the blog',
            amazonTag: '',
            utmMedium: 'social',
            utmCampaign: '',
            utm: {},
            webhook: '',
            webhookAuto: false,
            aiEndpoint: '',
            passcode: '',
            profiles: {}
        },
        post: {
            title: '', slug: '', category: 'reptiles', species: '', date: '',
            excerpt: '', body: '', image: '', imageAlt: '', author: '', reviewedBy: '',
            focusKeyphrase: '', intents: ['informational', 'commercial', 'comparison'],
            metaTitle: '', metaDesc: ''
        },
        library: []
    };

    let state = load();
    let analysis = null;
    let shareCaptions = {};
    let stepQueue = [];
    let stepIndex = 0;

    function load() {
        try {
            const raw = localStorage.getItem(KEY);
            if (!raw) return JSON.parse(JSON.stringify(defaults));
            const saved = JSON.parse(raw);
            return {
                settings: Object.assign({}, defaults.settings, saved.settings || {}),
                post: Object.assign({}, defaults.post, saved.post || {}),
                library: Array.isArray(saved.library) ? saved.library : []
            };
        } catch (e) {
            return JSON.parse(JSON.stringify(defaults));
        }
    }

    function save(quiet) {
        try {
            localStorage.setItem(KEY, JSON.stringify(state));
            markSaved();
        } catch (e) {
            if (!quiet) toast('Could not save - browser storage is full or blocked.', 'bad');
        }
    }

    let dirtyTimer = null;
    function markDirty() {
        const s = $('#saveState');
        s.className = 'save-state dirty';
        s.innerHTML = '<i class="fas fa-circle-dot"></i> Unsaved';
        clearTimeout(dirtyTimer);
        dirtyTimer = setTimeout(() => save(true), 900);   // autosave
    }
    function markSaved() {
        const s = $('#saveState');
        s.className = 'save-state saved';
        s.innerHTML = '<i class="fas fa-circle-check"></i> Saved';
    }

    /* =============== Toasts =============== */

    function toast(msg, kind, ms) {
        const t = el('div', 'toast' + (kind ? ' ' + kind : ''),
            '<i class="fas fa-' + (kind === 'bad' ? 'triangle-exclamation' :
                kind === 'good' ? 'circle-check' : 'circle-info') + '"></i><div>' + esc(msg) + '</div>');
        $('#toasts').appendChild(t);
        setTimeout(() => {
            t.style.opacity = '0';
            t.style.transition = 'opacity .25s';
            setTimeout(() => t.remove(), 260);
        }, ms || 3600);
    }

    /* =============== Clipboard =============== */

    function copy(text, label) {
        const done = () => toast((label || 'Copied') + ' to clipboard', 'good', 2200);
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(done).catch(() => fallback());
        } else {
            fallback();
        }
        function fallback() {
            // execCommand is deprecated but is the only path on http:// origins.
            const ta = el('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;left:-9999px;top:0';
            document.body.appendChild(ta);
            ta.select();
            let ok = false;
            try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
            ta.remove();
            ok ? done() : toast('Copy blocked by the browser - select the text and copy manually.', 'bad');
        }
    }

    /* =============== Gate =============== */

    function initGate() {
        const pass = state.settings.passcode;
        if (!pass || sessionStorage.getItem('pgp_unlocked') === '1') {
            openConsole();
            return;
        }
        $('#gate').hidden = false;
        $('#gateForm').addEventListener('submit', e => {
            e.preventDefault();
            if ($('#gatePass').value === pass) {
                sessionStorage.setItem('pgp_unlocked', '1');
                $('#gate').hidden = true;
                openConsole();
            } else {
                toast('Wrong passcode', 'bad');
                $('#gatePass').value = '';
            }
        });
    }

    function openConsole() {
        $('#gate').hidden = true;
        $('#console').hidden = false;
        boot();
    }

    /* =============== Navigation =============== */

    function showPanel(name) {
        $$('.panel').forEach(p => { p.hidden = p.id !== 'panel-' + name; });
        $$('.side-link').forEach(b => b.classList.toggle('active', b.dataset.panel === name));
        if (name === 'preview') renderPreview();
        if (name === 'library') renderLibrary();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /* =============== Composer binding =============== */

    const FIELD_MAP = {
        fTitle: 'title', fSlug: 'slug', fCategory: 'category', fSpecies: 'species',
        fDate: 'date', fExcerpt: 'excerpt', fBody: 'body', fImage: 'image',
        fImageAlt: 'imageAlt', fAuthor: 'author', fReviewer: 'reviewedBy',
        fFocus: 'focusKeyphrase', fMetaTitle: 'metaTitle', fMetaDesc: 'metaDesc'
    };

    function bindComposer() {
        Object.keys(FIELD_MAP).forEach(id => {
            const node = $('#' + id);
            if (!node) return;
            node.value = state.post[FIELD_MAP[id]] || '';
            node.addEventListener('input', () => {
                state.post[FIELD_MAP[id]] = node.value;
                markDirty();
                updateCounters();
                if (id === 'fCategory') populateSpecies();
                if (['fMetaTitle', 'fMetaDesc', 'fTitle', 'fImage'].indexOf(id) !== -1) renderPreview();
            });
            if (node.tagName === 'SELECT') node.addEventListener('change', () => {
                state.post[FIELD_MAP[id]] = node.value;
                populateSpecies();
                markDirty();
            });
        });

        // Intent checkboxes
        const box = $('#intentChecks');
        Object.keys(D.MODIFIERS).forEach(intent => {
            const label = el('label');
            const on = state.post.intents.indexOf(intent) !== -1;
            label.innerHTML = '<input type="checkbox" value="' + intent + '"' + (on ? ' checked' : '') +
                '><span>' + intent.charAt(0).toUpperCase() + intent.slice(1) + '</span>';
            label.querySelector('input').addEventListener('change', e => {
                const v = e.target.value;
                const i = state.post.intents.indexOf(v);
                if (e.target.checked && i === -1) state.post.intents.push(v);
                if (!e.target.checked && i !== -1) state.post.intents.splice(i, 1);
                markDirty();
            });
            box.appendChild(label);
        });
    }

    function populateCategories() {
        const sel = $('#fCategory');
        sel.innerHTML = '';
        Object.keys(D.CATEGORIES).forEach(key => {
            const o = el('option');
            o.value = key;
            o.textContent = D.CATEGORIES[key].label;
            sel.appendChild(o);
        });
        sel.value = state.post.category || 'reptiles';
        populateSpecies();

        const chips = $('#catChips');
        if (chips) {
            chips.innerHTML = '';
            Object.keys(D.CATEGORIES).forEach(key => {
                const c = D.CATEGORIES[key];
                const b = el('button', 'chip',
                    '<i class="' + c.icon + '"></i> ' + esc(c.label) +
                    ' <span class="x">' + c.species.length + ' species</span>');
                b.type = 'button';
                b.addEventListener('click', () => {
                    $('#fCategory').value = key;
                    state.post.category = key;
                    populateSpecies();
                    markDirty();
                    showPanel('composer');
                });
                chips.appendChild(b);
            });
        }
    }

    function populateSpecies() {
        const cat = D.CATEGORIES[$('#fCategory').value] || D.CATEGORIES.general;
        const list = $('#speciesList');
        list.innerHTML = '';
        cat.species.forEach(s => {
            const o = el('option');
            o.value = s;
            list.appendChild(o);
        });
    }

    function meter(node, len, min, max) {
        node.textContent = len;
        node.className = 'counter ' + (len === 0 ? '' : len > max ? 'over' : len < min ? 'warn' : 'ok');
    }

    function updateCounters() {
        meter($('#cTitle'), $('#fTitle').value.length, 30, 65);
        meter($('#cSlug'), $('#fSlug').value.length, 0, 70);
        meter($('#cExcerpt'), $('#fExcerpt').value.length, 80, 200);
        meter($('#cAlt'), $('#fImageAlt').value.length, 15, 125);
        const w = SEO.words($('#fBody').value).length;
        const c = $('#cBody');
        c.textContent = w.toLocaleString() + ' words';
        c.className = 'counter ' + (w === 0 ? '' : w < 900 ? 'warn' : 'ok');
        if ($('#fMetaTitle')) meter($('#cMetaTitle'), $('#fMetaTitle').value.length, 30, 60);
        if ($('#fMetaDesc')) meter($('#cMetaDesc'), $('#fMetaDesc').value.length, 110, 155);
    }

    /* =============== Analysis =============== */

    function currentPost() {
        const p = Object.assign({}, state.post);
        p.author = p.author || state.settings.author;
        p.date = p.date || new Date().toISOString().slice(0, 10);
        p.internalLinks = analysis ? analysis.internalLinks : [];
        return p;
    }

    function runAnalysis(silent) {
        const post = currentPost();
        if (!post.title && !post.body) {
            toast('Add a headline and some body text first.', 'bad');
            showPanel('composer');
            return null;
        }
        analysis = SEO.analyse(post, state.settings);

        // Fill anything the author left blank with the suggestion.
        if (!state.post.slug) { state.post.slug = analysis.slug; $('#fSlug').value = analysis.slug; }
        if (!state.post.metaTitle) { state.post.metaTitle = analysis.meta.title; }
        if (!state.post.metaDesc) { state.post.metaDesc = analysis.meta.description; }
        if ($('#fMetaTitle')) $('#fMetaTitle').value = state.post.metaTitle;
        if ($('#fMetaDesc')) $('#fMetaDesc').value = state.post.metaDesc;
        $('#fFocus').value = state.post.focusKeyphrase || analysis.focus;

        renderSeo();
        renderPreview();
        updateCounters();
        save(true);

        // An endpoint, if configured, may override the local suggestions.
        if (state.settings.aiEndpoint) {
            SEO.remoteSuggest(post, state.settings).then(remote => {
                if (!remote) return;
                if (remote.focus) { analysis.focus = remote.focus; $('#fFocus').value = remote.focus; }
                if (Array.isArray(remote.keywords) && remote.keywords.length) {
                    analysis.keywords = remote.keywords.map(k =>
                        typeof k === 'string' ? { phrase: k, words: k.split(' ').length, count: 0, density: 0 } : k);
                }
                if (Array.isArray(remote.longTail) && remote.longTail.length) {
                    analysis.longTail = remote.longTail.map(l => typeof l === 'string'
                        ? { phrase: l, intent: 'informational', competition: 'medium' } : l);
                }
                if (remote.meta) analysis.meta = Object.assign(analysis.meta, remote.meta);
                renderSeo();
                toast('Suggestions refreshed from your model endpoint.', 'good');
            }).catch(err => toast('Model endpoint failed: ' + err.message, 'bad', 5000));
        }

        if (!silent) {
            showPanel('seo');
            toast('Analysis complete - score ' + analysis.score.total + '/100', 'good');
        }
        return analysis;
    }

    /* =============== SEO panel rendering =============== */

    function renderSeo() {
        if (!analysis) return;
        $('#seoEmpty').hidden = true;
        $('#seoResults').hidden = false;

        renderScore();
        renderFocus();
        renderLongTail();
        renderGaps();
        renderQuestions();
        renderAngles();
        renderTagSets();
        renderProducts();
        renderSchema();

        $('#pillScore').textContent = analysis.score.total;
    }

    function renderScore() {
        const s = analysis.score;
        const dial = $('#scoreDial');
        const circ = 2 * Math.PI * 50;
        $('#dialFill').setAttribute('stroke-dasharray', circ.toFixed(1));
        $('#dialFill').setAttribute('stroke-dashoffset', (circ * (1 - s.total / 100)).toFixed(1));
        dial.className = 'dial' + (s.total >= 70 ? '' : s.total >= 50 ? ' mid' : ' low');
        $('#scoreNum').textContent = s.total;
        $('#scoreGrade').textContent = s.grade;

        $('#scoreFacts').innerHTML = [
            ['Words', s.wordCount.toLocaleString()],
            ['Subheadings', s.headings],
            ['Keyphrase density', s.density + '%'],
            ['Avg sentence', s.avgSentence + ' words'],
            ['Checks passed', s.checks.filter(c => c.pass).length + '/' + s.checks.length]
        ].map(([k, v]) => '<div><b>' + esc(v) + '</b><span>' + esc(k) + '</span></div>').join('');

        const list = $('#checkList');
        list.innerHTML = '';
        s.checks.slice().sort((a, b) => (a.pass ? 1 : 0) - (b.pass ? 1 : 0)).forEach(c => {
            const li = el('li', c.pass ? 'pass' : 'fail',
                '<i class="fas fa-' + (c.pass ? 'circle-check' : 'circle-exclamation') + '"></i>' +
                '<div><strong>' + esc(c.label) + '</strong>' +
                (c.pass ? '' : '<span class="hint">' + esc(c.hint) + '</span>') + '</div>');
            list.appendChild(li);
        });
    }

    function renderFocus() {
        const box = $('#focusAlts');
        box.innerHTML = '';
        analysis.keywords.filter(k => k.words >= 2).slice(0, 10).forEach(k => {
            const active = k.phrase === (state.post.focusKeyphrase || analysis.focus);
            const b = el('button', 'chip' + (active ? ' selected' : ''),
                esc(k.phrase) + ' <span class="x">&times;' + k.count + '</span>');
            b.type = 'button';
            b.title = (k.inCorpus ? 'Recognised niche term. ' : '') + 'Appears ' + k.count +
                ' time(s), density ' + k.density + '%';
            b.addEventListener('click', () => {
                state.post.focusKeyphrase = k.phrase;
                $('#fFocus').value = k.phrase;
                markDirty();
                runAnalysis(true);
            });
            box.appendChild(b);
        });
    }

    function renderLongTail() {
        const body = $('#ltBody');
        body.innerHTML = '';
        $('#ltCount').textContent = analysis.longTail.length;
        analysis.longTail.forEach(l => {
            const tr = el('tr');
            tr.innerHTML =
                '<td>' + esc(l.phrase) + '</td>' +
                '<td><span class="badge ' + esc(l.intent) + '">' + esc(l.intent) + '</span></td>' +
                '<td><span class="badge ' + esc(l.competition) + '">' + esc(l.competition) + '</span></td>' +
                '<td style="color:var(--gray-500);font-size:12.5px">' + esc(useAs(l)) + '</td>';
            const td = el('td');
            const b = el('button', 'btn-b btn-sm', '<i class="fas fa-copy"></i>');
            b.type = 'button';
            b.title = 'Copy keyphrase';
            b.addEventListener('click', () => copy(l.phrase, 'Keyphrase'));
            td.appendChild(b);
            tr.appendChild(td);
            body.appendChild(tr);
        });
    }

    function useAs(l) {
        if (l.intent === 'commercial') return 'Product round-up section';
        if (l.intent === 'comparison') return 'Comparison table';
        if (l.intent === 'transactional') return 'Shop page, not the blog';
        if (l.intent === 'local') return 'Location page';
        return 'H2 inside this post';
    }

    function renderGaps() {
        const box = $('#gapChips');
        box.innerHTML = '';
        $('#gapCount').textContent = analysis.semantic.length;
        analysis.semantic.forEach(term => {
            const b = el('button', 'chip is-gap', '<i class="fas fa-plus"></i> ' + esc(term));
            b.type = 'button';
            b.title = 'Append as a to-cover note at the end of the body';
            b.addEventListener('click', () => {
                const ta = $('#fBody');
                ta.value = ta.value.replace(/\s*$/, '') + '\n\nTODO cover: ' + term;
                state.post.body = ta.value;
                markDirty();
                updateCounters();
                b.className = 'chip is-done';
                b.innerHTML = '<i class="fas fa-check"></i> ' + esc(term);
                toast('Added "' + term + '" as a note in the body.', 'good', 2200);
            });
            box.appendChild(b);
        });
        if (!analysis.semantic.length) box.innerHTML = '<p style="color:var(--gray-500);font-size:13px">' +
            'Nothing missing - this draft already covers the expected terms for the group.</p>';

        const cov = $('#coveredChips');
        cov.innerHTML = '';
        $('#coveredCount').textContent = analysis.covered.length;
        analysis.covered.slice(0, 20).forEach(t => {
            cov.appendChild(el('span', 'chip is-done', '<i class="fas fa-check"></i> ' + esc(t)));
        });
    }

    function renderQuestions() {
        const box = $('#questionChips');
        box.innerHTML = '';
        analysis.questions.forEach(q => {
            const b = el('button', 'chip', '<i class="fas fa-circle-question"></i> ' + esc(q));
            b.type = 'button';
            b.title = 'Copy this question';
            b.addEventListener('click', () => copy(q, 'Question'));
            box.appendChild(b);
        });
    }

    function renderAngles() {
        const box = $('#angleChips');
        box.innerHTML = '';
        analysis.angles.forEach(a => {
            const b = el('button', 'chip',
                '<span class="badge ' + esc(a.intent) + '">' + esc(a.label) + '</span> ' + esc(a.title));
            b.type = 'button';
            b.title = 'Use as the headline';
            b.addEventListener('click', () => {
                $('#fTitle').value = a.title;
                state.post.title = a.title;
                state.post.slug = '';
                $('#fSlug').value = '';
                markDirty();
                updateCounters();
                runAnalysis(true);
                toast('Headline swapped. Re-analysed.', 'good', 2400);
            });
            box.appendChild(b);
        });
    }

    function renderTagSets() {
        const host = $('#tagSets');
        host.innerHTML = '';
        Object.keys(analysis.captions).forEach(pid => {
            const cap = analysis.captions[pid];
            if (!cap.tags.length) return;
            const wrap = el('div');
            wrap.style.cssText = 'margin-bottom:16px';
            wrap.innerHTML = '<div style="display:flex;align-items:center;gap:9px;margin-bottom:8px">' +
                '<span class="plat-ico" style="--p-colour:' + cap.colour + ';background:' + cap.colour +
                ';width:26px;height:26px;font-size:12px"><i class="' + cap.icon + '"></i></span>' +
                '<b style="font-size:13.5px">' + esc(cap.label) + '</b>' +
                '<span style="font-size:11.5px;color:var(--gray-500)">' + cap.tags.length + ' tags</span></div>';
            const set = el('div', 'chip-set');
            cap.tags.forEach(t => set.appendChild(el('span', 'chip is-tag', esc(t))));
            const btn = el('button', 'btn-b btn-sm', '<i class="fas fa-copy"></i> Copy set');
            btn.type = 'button';
            btn.style.marginTop = '9px';
            btn.addEventListener('click', () => copy(cap.tags.join(' '), cap.label + ' tags'));
            wrap.appendChild(set);
            wrap.appendChild(btn);
            host.appendChild(wrap);
        });
    }

    function renderProducts() {
        const body = $('#prodBody');
        body.innerHTML = '';
        analysis.products.forEach(p => {
            const tr = el('tr');
            tr.innerHTML = '<td><b>' + esc(p.label) + '</b><br><span style="font-size:11.5px;color:var(--gray-500)">' +
                esc(p.query) + '</span></td>' +
                '<td><a href="' + esc(p.url) + '" target="_blank" rel="noopener nofollow sponsored" ' +
                'style="font-size:12px;color:var(--primary)">Open on Amazon <i class="fas fa-arrow-up-right-from-square"></i></a></td>';
            const td = el('td');
            const b = el('button', 'btn-b btn-sm', '<i class="fas fa-link"></i> Copy HTML');
            b.type = 'button';
            b.addEventListener('click', () => copy(
                '<a href="' + p.url + '" target="_blank" rel="nofollow sponsored noopener">' + p.label + '</a>',
                'Affiliate link HTML'));
            td.appendChild(b);
            tr.appendChild(td);
            body.appendChild(tr);
        });
        if (!state.settings.amazonTag) {
            const tr = el('tr');
            tr.innerHTML = '<td colspan="3" style="color:var(--accent-dark);font-size:12.5px">' +
                '<i class="fas fa-triangle-exclamation"></i> No Associate tag set - links are untagged and will not ' +
                'earn commission. Add it in Settings.</td>';
            body.appendChild(tr);
        }
    }

    function renderSchema() {
        $('#schemaOut').textContent = JSON.stringify(analysis.schema, null, 2);
    }

    /* =============== Preview =============== */

    function renderPreview() {
        const metaTitle = state.post.metaTitle || (analysis && analysis.meta.title) || state.post.title || '';
        const metaDesc = state.post.metaDesc || (analysis && analysis.meta.description) || state.post.excerpt || '';
        let host = 'example.com';
        try { if (state.settings.siteUrl) host = new URL(state.settings.siteUrl).host; } catch (e) { /* unparsable */ }

        $('#pvCrumb').textContent = host + ' › blog › ' + (state.post.slug || 'post-slug');
        $('#pvTitle').textContent = SEO.truncate(metaTitle, 62, '…') || 'Your headline appears here';
        $('#pvDesc').textContent = SEO.truncate(metaDesc, 158, '…') || 'Your meta description appears here.';
        $('#pvDom').textContent = host;
        $('#pvOgTitle').textContent = state.post.title || metaTitle || 'Your headline appears here';
        $('#pvOgDesc').textContent = SEO.truncate(metaDesc, 120, '…') || 'Your meta description appears here.';

        const img = $('#pvImg');
        if (state.post.image) {
            img.style.backgroundImage = 'url("' + state.post.image.replace(/"/g, '%22') + '")';
            img.textContent = '';
        } else {
            img.style.backgroundImage = '';
            img.textContent = 'No featured image set';
        }
    }

    /* =============== Social setup =============== */

    function profile(pid) {
        if (!state.settings.profiles[pid]) {
            state.settings.profiles[pid] = { enabled: true, handle: '', url: '', defaultTags: '' };
        }
        return state.settings.profiles[pid];
    }

    function renderPlatforms() {
        const host = $('#platGrid');
        host.innerHTML = '';
        D.PLATFORMS.forEach(p => {
            const prof = profile(p.id);
            const card = el('div', 'plat' + (prof.enabled === false ? ' off' : ''));
            card.style.setProperty('--p-colour', p.colour);
            card.innerHTML =
                '<div class="plat-top">' +
                    '<span class="plat-ico"><i class="' + p.icon + '"></i></span>' +
                    '<div><div class="plat-name">' + esc(p.label) + '</div>' +
                    '<div class="plat-meta"><span class="mode-tag ' + p.share + '">' + p.share + '</span> ' +
                    p.captionLimit.toLocaleString() + ' chars &middot; ' + p.tagCount + ' tags</div></div>' +
                    '<label class="switch"><input type="checkbox"' + (prof.enabled === false ? '' : ' checked') +
                    ' aria-label="Enable ' + esc(p.label) + '"><span class="track"></span></label>' +
                '</div>' +
                '<div class="plat-note">' + esc(p.note) + '</div>';

            const fields = el('div');
            fields.innerHTML =
                '<div class="field" style="margin-bottom:10px"><label>Handle</label>' +
                '<input type="text" data-k="handle" placeholder="@petgopro" value="' + esc(prof.handle) + '"></div>' +
                '<div class="field" style="margin-bottom:10px"><label>Profile URL</label>' +
                '<input type="url" data-k="url" placeholder="https://..." value="' + esc(prof.url) + '"></div>' +
                '<div class="field" style="margin-bottom:10px"><label>Extra default tags <span class="opt">(appended to every caption)</span></label>' +
                '<input type="text" data-k="defaultTags" placeholder="#yourbrandtag" value="' + esc(prof.defaultTags) + '"></div>' +
                '<div class="field" style="margin-bottom:0"><label>utm_source override</label>' +
                '<input type="text" data-k="utm" placeholder="' + esc(p.id) + '" value="' +
                esc(state.settings.utm[p.id] || '') + '"></div>';

            fields.querySelectorAll('input').forEach(inp => {
                inp.addEventListener('input', () => {
                    if (inp.dataset.k === 'utm') state.settings.utm[p.id] = inp.value;
                    else prof[inp.dataset.k] = inp.value;
                    markDirty();
                });
            });

            card.appendChild(fields);
            card.querySelector('.switch input').addEventListener('change', e => {
                prof.enabled = e.target.checked;
                card.classList.toggle('off', !e.target.checked);
                markDirty();
                updatePlatformPill();
            });
            host.appendChild(card);
        });
        updatePlatformPill();

        $('#sBrand').value = state.settings.brandName || '';
        $('#sCta').value = state.settings.cta || '';
        $('#sBrand').addEventListener('input', e => { state.settings.brandName = e.target.value; markDirty(); });
        $('#sCta').addEventListener('input', e => { state.settings.cta = e.target.value; markDirty(); });
    }

    function enabledPlatforms() {
        return D.PLATFORMS.filter(p => profile(p.id).enabled !== false);
    }

    function updatePlatformPill() {
        $('#pillPlatforms').textContent = enabledPlatforms().length;
    }

    /* =============== Cadence table =============== */

    function renderTimes() {
        const body = $('#timesBody');
        body.innerHTML = '';
        D.PLATFORMS.forEach(p => {
            const tr = el('tr');
            tr.innerHTML =
                '<td><span class="plat-ico" style="background:' + p.colour +
                ';width:22px;height:22px;font-size:10px;display:inline-grid;vertical-align:middle;margin-right:7px">' +
                '<i class="' + p.icon + '"></i></span>' + esc(p.label) + '</td>' +
                '<td>' + esc(p.bestTimes) + '</td>' +
                '<td class="num">' + p.captionLimit.toLocaleString() + '</td>' +
                '<td class="num">' + p.tagCount + '</td>' +
                '<td><span class="mode-tag ' + p.share + '">' + p.share + '</span></td>';
            body.appendChild(tr);
        });
    }

    /* =============== Settings =============== */

    const SETTING_MAP = {
        sSiteUrl: 'siteUrl', sAuthor: 'author', sUtmMedium: 'utmMedium',
        sUtmCampaign: 'utmCampaign', sAmazonTag: 'amazonTag', sWebhook: 'webhook',
        sAiEndpoint: 'aiEndpoint', sPass: 'passcode'
    };

    function bindSettings() {
        Object.keys(SETTING_MAP).forEach(id => {
            const node = $('#' + id);
            node.value = state.settings[SETTING_MAP[id]] || '';
            node.addEventListener('input', () => {
                state.settings[SETTING_MAP[id]] = node.value;
                markDirty();
                if (id === 'sSiteUrl') renderPreview();
            });
        });
        $('#sWebhookAuto').checked = !!state.settings.webhookAuto;
        $('#sWebhookAuto').addEventListener('change', e => {
            state.settings.webhookAuto = e.target.checked;
            markDirty();
        });

        $('#btnSaveSettings').addEventListener('click', () => {
            save();
            if (analysis) runAnalysis(true);
            toast('Settings saved.', 'good');
        });

        $('#btnResetAll').addEventListener('click', () => {
            if (!confirm('This deletes every saved post, setting and social profile in this browser. Continue?')) return;
            localStorage.removeItem(KEY);
            sessionStorage.removeItem('pgp_unlocked');
            location.reload();
        });

        $('#btnShowPayload').addEventListener('click', () => {
            const out = $('#payloadOut');
            out.hidden = !out.hidden;
            if (!out.hidden) out.textContent = JSON.stringify(buildWebhookPayload(true), null, 2);
        });

        $('#btnTestWebhook').addEventListener('click', () => fireWebhook(true));
    }

    /* =============== Publish =============== */

    function publish() {
        const a = runAnalysis(true);
        if (!a) return;
        if (!state.post.title) { toast('A headline is required to publish.', 'bad'); return; }

        state.post.date = state.post.date || new Date().toISOString().slice(0, 10);
        $('#fDate').value = state.post.date;

        const entry = {
            id: 'p_' + Date.now().toString(36),
            savedAt: new Date().toISOString(),
            post: JSON.parse(JSON.stringify(state.post)),
            score: a.score.total,
            focus: a.focus,
            category: a.categoryKey,
            url: SEO.postUrl(currentPost(), state.settings)
        };
        const existing = state.library.findIndex(x => x.post.slug && x.post.slug === state.post.slug);
        if (existing !== -1) state.library[existing] = entry; else state.library.unshift(entry);
        save();
        renderLibrary();

        openShare(a, entry);

        if (state.settings.webhookAuto && state.settings.webhook) fireWebhook(false);
    }

    /* =============== Multi-share =============== */

    function openShare(a, entry) {
        shareCaptions = {};
        const grid = $('#shareGrid');
        grid.innerHTML = '';

        const list = enabledPlatforms();
        list.forEach(p => {
            const cap = a.captions[p.id] || SEO.buildCaption(p, currentPost(), a, state.settings);
            shareCaptions[p.id] = { platform: p, caption: cap, selected: true, done: false };

            const card = el('div', 'share-card');
            card.style.setProperty('--p-colour', p.colour);
            card.dataset.pid = p.id;
            card.innerHTML =
                '<div class="share-top">' +
                    '<span class="plat-ico"><i class="' + p.icon + '"></i></span>' +
                    '<b>' + esc(p.label) + '</b>' +
                    '<span class="mode-tag ' + p.share + '">' + p.share + '</span>' +
                    '<label class="switch"><input type="checkbox" checked aria-label="Include ' +
                    esc(p.label) + '"><span class="track"></span></label>' +
                '</div>';

            const ta = el('textarea');
            ta.value = cap.text;
            ta.setAttribute('aria-label', p.label + ' caption');
            card.appendChild(ta);

            const meta = el('div', 'share-meta');
            const counter = el('span', 'counter');
            meta.appendChild(counter);
            if (cap.url) {
                const link = el('a', '', '<i class="fas fa-link"></i> tracked link');
                link.href = cap.url;
                link.target = '_blank';
                link.rel = 'noopener';
                link.style.cssText = 'font-size:11.5px;color:var(--primary)';
                meta.appendChild(link);
            }
            const tick = el('span', 'share-done-tick');
            tick.hidden = true;
            tick.innerHTML = '<i class="fas fa-check"></i> sent';
            meta.appendChild(tick);
            card.appendChild(meta);

            const setCount = () => {
                const extra = p.id === 'x' && cap.url ? 23 : 0;
                const n = ta.value.length + extra;
                counter.textContent = n.toLocaleString() + ' / ' + p.captionLimit.toLocaleString();
                counter.className = 'counter ' + (n > p.captionLimit ? 'over' :
                    n > p.idealLength * 2 ? 'warn' : 'ok');
            };
            setCount();
            ta.addEventListener('input', () => {
                shareCaptions[p.id].caption.text = ta.value;
                setCount();
            });

            if (cap.warnings.length) {
                card.appendChild(el('div', 'share-warn',
                    '<i class="fas fa-circle-info"></i> ' + cap.warnings.map(esc).join(' ')));
            }

            const actions = el('div', 'share-actions');
            const bCopy = el('button', 'btn-b', '<i class="fas fa-copy"></i> Copy');
            bCopy.type = 'button';
            bCopy.addEventListener('click', () => copy(ta.value, p.label + ' caption'));
            const bOpen = el('button', 'btn-a',
                '<i class="fas fa-arrow-up-right-from-square"></i> ' +
                (p.share === 'intent' ? 'Open share' : 'Copy & open'));
            bOpen.type = 'button';
            bOpen.addEventListener('click', () => {
                if (p.share !== 'intent') copy(ta.value, p.label + ' caption');
                openOne(p.id, true);
            });
            actions.appendChild(bCopy);
            actions.appendChild(bOpen);
            card.appendChild(actions);

            card.querySelector('.switch input').addEventListener('change', e => {
                shareCaptions[p.id].selected = e.target.checked;
                card.classList.toggle('skip', !e.target.checked);
                updateShareCount();
            });

            grid.appendChild(card);
        });

        const url = entry ? entry.url : SEO.postUrl(currentPost(), state.settings);
        $('#shareSub').textContent = 'Score ' + a.score.total + '/100 · focus "' + a.focus + '" · ' +
            list.length + ' networks ready';
        $('#shareSaved').hidden = false;
        $('#shareSavedText').innerHTML = '<strong>Saved to the library.</strong> ' +
            (url ? 'Shared links point at <code>' + esc(url) + '</code>.'
                 : 'No site URL is set in Settings, so captions carry no link yet.');
        $('#shareStatus').innerHTML = '';
        updateShareCount();
        $('#shareModal').hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function updateShareCount() {
        const sel = Object.keys(shareCaptions).filter(k => shareCaptions[k].selected);
        const intents = sel.filter(k => shareCaptions[k].platform.share === 'intent');
        const comp = sel.filter(k => shareCaptions[k].platform.share !== 'intent');
        $('#shareCountLabel').textContent = sel.length + ' selected · ' + intents.length +
            ' open together · ' + comp.length + ' need the stepper';
        $('#btnStepper').disabled = comp.length === 0;
        $('#btnOpenAll').disabled = intents.length === 0;
    }

    function shareUrlFor(pid) {
        const item = shareCaptions[pid];
        return SEO.buildShareUrl(item.platform, item.caption, currentPost(), state.settings);
    }

    function markDone(pid) {
        shareCaptions[pid].done = true;
        const card = $('.share-card[data-pid="' + pid + '"]');
        if (card) {
            card.classList.add('done');
            const tick = card.querySelector('.share-done-tick');
            if (tick) tick.hidden = false;
        }
    }

    function openOne(pid, manual) {
        const win = window.open(shareUrlFor(pid), '_blank', 'noopener');
        if (win) { markDone(pid); return true; }
        if (manual) toast('Your browser blocked the popup. Allow popups for this page.', 'bad', 5000);
        return false;
    }

    /** Opens every intent-capable network in the one user gesture. Browsers cap
        how many popups a single gesture may spawn, so anything blocked is listed
        with its own button rather than silently dropped. */
    function openAll() {
        const ids = Object.keys(shareCaptions).filter(k =>
            shareCaptions[k].selected && shareCaptions[k].platform.share === 'intent');
        const blocked = [];
        ids.forEach(pid => { if (!openOne(pid, false)) blocked.push(pid); });

        const status = $('#shareStatus');
        status.innerHTML = '';
        const opened = ids.length - blocked.length;

        if (opened) {
            status.appendChild(el('div', 'notice good',
                '<i class="fas fa-circle-check"></i><div><strong>' + opened + ' of ' + ids.length +
                ' opened.</strong> Each tab has the caption and the tracked link pre-filled where the ' +
                'network allows it. Facebook and LinkedIn will need a paste - use the Copy button on those cards.</div>'));
        }
        if (blocked.length) {
            const box = el('div', 'notice warn');
            box.innerHTML = '<i class="fas fa-triangle-exclamation"></i><div><strong>' + blocked.length +
                ' blocked by the popup blocker.</strong> Allow popups for this page to open them all in one go, ' +
                'or launch them individually:<div class="btn-bar" style="margin-top:10px"></div></div>';
            const bar = box.querySelector('.btn-bar');
            blocked.forEach(pid => {
                const p = shareCaptions[pid].platform;
                const b = el('button', 'btn-b btn-sm', '<i class="' + p.icon + '"></i> ' + esc(p.label));
                b.type = 'button';
                b.addEventListener('click', () => { if (openOne(pid, true)) b.remove(); });
                bar.appendChild(b);
            });
            status.appendChild(box);
        }
        if (!ids.length) toast('No intent-capable networks selected.', 'bad');
    }

    /** Compose-only networks share one clipboard between them, so they go
        through a queue: copy, open, next. */
    function startStepper() {
        stepQueue = Object.keys(shareCaptions).filter(k =>
            shareCaptions[k].selected && shareCaptions[k].platform.share !== 'intent');
        stepIndex = 0;
        if (!stepQueue.length) { toast('Nothing needs the stepper.', 'bad'); return; }
        renderStep();
    }

    function renderStep() {
        const status = $('#shareStatus');
        status.innerHTML = '';
        if (stepIndex >= stepQueue.length) {
            status.appendChild(el('div', 'notice good',
                '<i class="fas fa-circle-check"></i><div><strong>Compose queue finished.</strong> ' +
                'All ' + stepQueue.length + ' composer-only networks have been opened with their caption copied.</div>'));
            return;
        }
        const pid = stepQueue[stepIndex];
        const item = shareCaptions[pid];
        const p = item.platform;

        const box = el('div', 'notice info');
        box.innerHTML = '<i class="' + p.icon + '"></i><div><strong>Step ' + (stepIndex + 1) + ' of ' +
            stepQueue.length + ' &mdash; ' + esc(p.label) + '.</strong> ' + esc(p.note) +
            '<div class="btn-bar" style="margin-top:11px"></div></div>';
        const bar = box.querySelector('.btn-bar');

        const go = el('button', 'btn-a btn-sm',
            '<i class="fas fa-copy"></i> Copy caption &amp; open ' + esc(p.label));
        go.type = 'button';
        go.addEventListener('click', () => {
            copy(item.caption.text, p.label + ' caption');
            openOne(pid, true);
            stepIndex++;
            renderStep();
        });

        const skip = el('button', 'btn-b btn-sm', 'Skip');
        skip.type = 'button';
        skip.addEventListener('click', () => { stepIndex++; renderStep(); });

        bar.appendChild(go);
        bar.appendChild(skip);
        status.appendChild(box);
    }

    /* =============== Webhook fan-out =============== */

    function buildWebhookPayload(sample) {
        const post = currentPost();
        const a = analysis || (sample ? null : runAnalysis(true));
        const caps = {};
        Object.keys(shareCaptions).length
            ? Object.keys(shareCaptions).forEach(pid => {
                if (!shareCaptions[pid].selected) return;
                const c = shareCaptions[pid].caption;
                caps[pid] = { text: c.text, tags: c.tags, url: c.url, limit: c.limit, mode: c.mode };
            })
            : a && Object.keys(a.captions).forEach(pid => {
                const c = a.captions[pid];
                caps[pid] = { text: c.text, tags: c.tags, url: c.url, limit: c.limit, mode: c.mode };
            });

        return {
            source: 'pet-go-pro-admin',
            version: D.version,
            firedAt: new Date().toISOString(),
            post: {
                title: post.title,
                slug: post.slug,
                url: SEO.postUrl(post, state.settings),
                excerpt: post.excerpt,
                category: post.category,
                species: a ? a.slots.species : post.species,
                image: post.image,
                imageAlt: post.imageAlt,
                author: post.author,
                reviewedBy: post.reviewedBy,
                date: post.date
            },
            seo: a ? {
                focusKeyphrase: a.focus,
                metaTitle: state.post.metaTitle || a.meta.title,
                metaDescription: state.post.metaDesc || a.meta.description,
                keywords: a.keywords.slice(0, 12).map(k => k.phrase),
                longTail: a.longTail.slice(0, 20).map(l => ({ phrase: l.phrase, intent: l.intent })),
                score: a.score.total
            } : {},
            captions: caps
        };
    }

    function fireWebhook(isTest) {
        const url = state.settings.webhook;
        if (!url) { toast('No webhook URL set in Settings.', 'bad'); showPanel('settings'); return; }
        const payload = buildWebhookPayload(isTest);
        payload.test = !!isTest;

        toast(isTest ? 'Sending test payload…' : 'Firing fan-out webhook…');
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(r => {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            toast(isTest ? 'Test payload accepted.' : 'Webhook fired - your automation is publishing.', 'good');
            if (!isTest) {
                Object.keys(shareCaptions).forEach(pid => { if (shareCaptions[pid].selected) markDone(pid); });
            }
        }).catch(err => {
            // A no-cors endpoint or a CORS-less catch hook often still receives the POST.
            toast('Webhook response not readable (' + err.message + '). If this is a Zapier or Make hook ' +
                'it probably still arrived - check the task history.', 'bad', 6500);
        });
    }

    /* =============== Post file generation =============== */

    function buildPostHtml() {
        const post = currentPost();
        const a = analysis || runAnalysis(true);
        if (!a) return '';
        const metaTitle = state.post.metaTitle || a.meta.title;
        const metaDesc = state.post.metaDesc || a.meta.description;
        const url = SEO.postUrl(post, state.settings);

        const bodyHtml = SEO.stripHtml(post.body) === post.body
            ? post.body.split(/\n{2,}/).map(block => {
                const t = block.trim();
                if (!t) return '';
                if (/^###\s/.test(t)) return '<h3>' + esc(t.replace(/^###\s/, '')) + '</h3>';
                if (/^##\s/.test(t)) return '<h2>' + esc(t.replace(/^##\s/, '')) + '</h2>';
                if (/^#\s/.test(t)) return '<h2>' + esc(t.replace(/^#\s/, '')) + '</h2>';
                if (/^[-*]\s/m.test(t)) {
                    return '<ul>' + t.split('\n').filter(Boolean)
                        .map(li => '<li>' + esc(li.replace(/^[-*]\s*/, '')) + '</li>').join('') + '</ul>';
                }
                return '<p>' + esc(t) + '</p>';
            }).filter(Boolean).join('\n            ')
                // Bullets separated by blank lines are still one list.
                .replace(/<\/ul>\s*<ul>/g, '')
            : post.body;

        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
'    <meta charset="UTF-8">\n' +
'    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'    <title>' + esc(metaTitle) + '</title>\n' +
'    <meta name="description" content="' + esc(metaDesc) + '">\n' +
'    <meta name="keywords" content="' + esc(a.keywords.slice(0, 10).map(k => k.phrase).join(', ')) + '">\n' +
'    <meta name="author" content="' + esc(post.author) + '">\n' +
(url ? '    <link rel="canonical" href="' + esc(url) + '">\n' : '') +
'\n    <!-- Open Graph -->\n' +
'    <meta property="og:type" content="article">\n' +
'    <meta property="og:title" content="' + esc(post.title) + '">\n' +
'    <meta property="og:description" content="' + esc(metaDesc) + '">\n' +
(url ? '    <meta property="og:url" content="' + esc(url) + '">\n' : '') +
(post.image ? '    <meta property="og:image" content="' + esc(post.image) + '">\n' +
'    <meta property="og:image:alt" content="' + esc(post.imageAlt) + '">\n' : '') +
'    <meta property="og:site_name" content="' + esc(state.settings.brandName) + '">\n' +
'    <meta property="article:published_time" content="' + esc(post.date) + '">\n' +
'    <meta property="article:section" content="' + esc(a.category.label) + '">\n' +
a.keywords.slice(0, 8).map(k =>
    '    <meta property="article:tag" content="' + esc(k.phrase) + '">\n').join('') +
'\n    <!-- Twitter / X -->\n' +
'    <meta name="twitter:card" content="summary_large_image">\n' +
'    <meta name="twitter:title" content="' + esc(post.title) + '">\n' +
'    <meta name="twitter:description" content="' + esc(metaDesc) + '">\n' +
(post.image ? '    <meta name="twitter:image" content="' + esc(post.image) + '">\n' : '') +
(state.settings.profiles.x && state.settings.profiles.x.handle
    ? '    <meta name="twitter:site" content="' + esc(state.settings.profiles.x.handle) + '">\n' : '') +
'\n    <!-- Pinterest rich pin -->\n' +
'    <meta name="pinterest-rich-pin" content="true">\n' +
'\n    <link rel="stylesheet" href="../css/styles.css">\n' +
'    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">\n' +
'\n    <script type="application/ld+json">\n' +
JSON.stringify(a.schema, null, 2).split('\n').map(l => '    ' + l).join('\n') + '\n' +
'    <\/script>\n' +
'</head>\n<body>\n' +
'    <article class="container" style="max-width:760px;padding:40px 20px">\n' +
'        <nav aria-label="Breadcrumb" style="font-size:13px;margin-bottom:18px">\n' +
'            <a href="../index.html">Home</a> &rsaquo; <a href="index.html">Pet Advice</a> &rsaquo; ' +
esc(a.category.label) + '\n        </nav>\n' +
'        <h1>' + esc(post.title) + '</h1>\n' +
'        <p class="meta" style="color:#6B7280;font-size:14px">By ' + esc(post.author) +
(post.reviewedBy ? ' &middot; Reviewed by ' + esc(post.reviewedBy) : '') +
' &middot; <time datetime="' + esc(post.date) + '">' + esc(post.date) + '</time></p>\n' +
(post.image ? '        <img src="' + esc(post.image) + '" alt="' + esc(post.imageAlt) +
'" width="1200" height="630" style="width:100%;height:auto;border-radius:16px;margin:22px 0">\n' : '') +
(post.excerpt ? '        <p><strong>' + esc(post.excerpt) + '</strong></p>\n' : '') +
'        <div class="post-body">\n            ' + bodyHtml + '\n        </div>\n' +
'        <aside style="margin-top:36px;padding:18px;background:#F9FAFB;border-radius:12px;font-size:13px">\n' +
'            <p><strong>Affiliate disclosure:</strong> some links on this page are Amazon Associates links. ' +
'We may earn a commission at no extra cost to you. Product picks are chosen on husbandry merit.</p>\n' +
'            <p style="margin-top:8px"><strong>Not veterinary advice:</strong> this guide is general ' +
'information. For a sick or injured animal, contact a vet who treats your species.</p>\n' +
'        </aside>\n' +
'    </article>\n</body>\n</html>\n';
    }

    function download(name, text, mime) {
        const blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
        const a = el('a');
        a.href = URL.createObjectURL(blob);
        a.download = name;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    }

    /* =============== Library =============== */

    function renderLibrary() {
        const host = $('#libList');
        host.innerHTML = '';
        $('#libCount').textContent = state.library.length;
        $('#pillLibrary').textContent = state.library.length;

        if (!state.library.length) {
            host.innerHTML = '<div class="empty"><i class="fas fa-box-open"></i>' +
                '<p>Nothing saved yet. Publish a post and it lands here.</p></div>';
            return;
        }

        state.library.forEach(entry => {
            const row = el('div', 'lib-row');
            const band = entry.score >= 85 ? 'hi' : entry.score >= 60 ? 'mid' : 'lo';
            row.innerHTML =
                '<div class="lib-score ' + band + '">' + entry.score + '</div>' +
                '<div class="lib-main"><b>' + esc(entry.post.title || '(untitled)') + '</b>' +
                '<span>' + esc((D.CATEGORIES[entry.category] || {}).label || entry.category) +
                ' &middot; focus &ldquo;' + esc(entry.focus) + '&rdquo; &middot; ' +
                esc(new Date(entry.savedAt).toLocaleString()) + '</span></div>';

            const bar = el('div', 'btn-bar');
            const mk = (label, icon, fn, cls) => {
                const b = el('button', (cls || 'btn-b') + ' btn-sm', '<i class="fas fa-' + icon + '"></i> ' + label);
                b.type = 'button';
                b.addEventListener('click', fn);
                return b;
            };
            bar.appendChild(mk('Load', 'folder-open', () => {
                state.post = Object.assign({}, defaults.post, entry.post);
                Object.keys(FIELD_MAP).forEach(id => {
                    const n = $('#' + id);
                    if (n) n.value = state.post[FIELD_MAP[id]] || '';
                });
                populateSpecies();
                updateCounters();
                runAnalysis(true);
                save();
                showPanel('composer');
                toast('Loaded into the composer.', 'good');
            }));
            bar.appendChild(mk('Re-share', 'share-nodes', () => {
                state.post = Object.assign({}, defaults.post, entry.post);
                const a = runAnalysis(true);
                if (a) openShare(a, entry);
            }));
            bar.appendChild(mk('Delete', 'trash', () => {
                if (!confirm('Delete "' + (entry.post.title || 'untitled') + '" from the library?')) return;
                state.library = state.library.filter(x => x.id !== entry.id);
                save();
                renderLibrary();
            }, 'btn-danger'));
            row.appendChild(bar);
            host.appendChild(row);
        });
    }

    /* =============== Sample post =============== */

    const SAMPLE = {
        title: 'Bearded Dragon Basking Temperature: Getting UVB and Heat Right',
        category: 'reptiles',
        species: 'bearded dragon',
        excerpt: 'Most bearded dragon health problems trace back to one number on a thermometer. ' +
            'Here is the basking temperature range that keeps a dragon digesting, and the lighting that gets it there.',
        author: 'Vicky',
        reviewedBy: 'Dr. A. Patel BVSc, exotics',
        imageAlt: 'A bearded dragon basking on a flat rock under a linear T5 UVB bulb',
        body: [
            '## Why basking temperature is the number that matters',
            'A bearded dragon digests food with heat, not enzymes alone. Get the basking surface temperature ' +
            'wrong and the animal stops processing calcium, stops eating, and starts sliding toward metabolic ' +
            'bone disease. Every other husbandry decision sits downstream of this one.',
            '## The numbers for each life stage',
            'Hatchlings want a basking surface of 42-45C. Juveniles sit at 40-42C. Adults do well at 38-40C. ' +
            'The cool end of the enclosure should land between 22C and 26C so the dragon can choose. ' +
            'Measure the surface with an infrared temperature gun, not the air with a dial gauge.',
            '## UVB is a separate job from heat',
            'Heat lamps do not make usable UVB, and UVB bulbs do not make useful heat. A linear T5 HO tube ' +
            'running a third to a half of the enclosure length gives a usable gradient. Coil bulbs concentrate ' +
            'output into a narrow column and are far easier to get wrong.',
            '## The wiring that keeps it stable',
            'Put the heat source on a dimming thermostat with the probe at basking height, never loose on the ' +
            'floor. Check the readings for a week before the animal moves in. A thermostat failing high is the ' +
            'most common cause of a burn in this hobby.',
            '## What to check every week',
            '- Basking surface temperature with an infrared gun\n' +
            '- Cool end temperature and ambient humidity\n' +
            '- UVB tube age - output drops long before the light looks dim\n' +
            '- Appetite and stool, which tell you whether the gradient is actually working'
        ].join('\n\n')
    };

    /* =============== Boot =============== */

    function boot() {
        populateCategories();
        bindComposer();
        bindSettings();
        renderPlatforms();
        renderTimes();
        renderLibrary();
        updateCounters();
        renderPreview();
        if (!state.post.date) { state.post.date = new Date().toISOString().slice(0, 10); $('#fDate').value = state.post.date; }
        if (!state.post.author && state.settings.author) { state.post.author = state.settings.author; $('#fAuthor').value = state.post.author; }

        $$('.side-link').forEach(b => b.addEventListener('click', () => showPanel(b.dataset.panel)));
        $$('[data-goto]').forEach(b => b.addEventListener('click', () => showPanel(b.dataset.goto)));

        $('#btnAnalyse').addEventListener('click', () => runAnalysis(false));
        $('#btnSaveDraft').addEventListener('click', () => { save(); toast('Draft saved.', 'good'); });
        $('#btnPublish').addEventListener('click', publish);
        $('#btnClear').addEventListener('click', () => {
            if (!confirm('Clear the composer? Saved library posts are untouched.')) return;
            state.post = JSON.parse(JSON.stringify(defaults.post));
            state.post.date = new Date().toISOString().slice(0, 10);
            Object.keys(FIELD_MAP).forEach(id => { const n = $('#' + id); if (n) n.value = state.post[FIELD_MAP[id]] || ''; });
            $('#fCategory').value = state.post.category;
            analysis = null;
            $('#seoResults').hidden = true;
            $('#seoEmpty').hidden = false;
            $('#pillScore').textContent = '–';
            updateCounters();
            renderPreview();
            save();
        });

        $('#btnLoadSample').addEventListener('click', () => {
            Object.keys(SAMPLE).forEach(k => { state.post[k] = SAMPLE[k]; });
            state.post.slug = '';
            state.post.metaTitle = '';
            state.post.metaDesc = '';
            state.post.focusKeyphrase = '';
            Object.keys(FIELD_MAP).forEach(id => { const n = $('#' + id); if (n) n.value = state.post[FIELD_MAP[id]] || ''; });
            populateSpecies();
            updateCounters();
            runAnalysis(false);
            toast('Sample loaded and analysed.', 'good');
        });

        $('#btnAltSuggest').addEventListener('click', () => {
            const a = analysis || runAnalysis(true);
            if (!a) return;
            $('#fImageAlt').value = a.altText;
            state.post.imageAlt = a.altText;
            updateCounters();
            markDirty();
        });

        $('#btnCopyKeywords').addEventListener('click', () =>
            copy(analysis.longTail.map(l => l.phrase).join('\n'), 'Keyphrase list'));
        $('#btnCopySchema').addEventListener('click', () =>
            copy(JSON.stringify(analysis.schema, null, 2), 'JSON-LD'));
        $('#btnCopyHead').addEventListener('click', () => {
            const html = buildPostHtml();
            const head = html.slice(html.indexOf('<head>') + 6, html.indexOf('</head>'));
            copy(head.trim(), 'Head block');
        });
        $('#btnInsertFaq').addEventListener('click', () => {
            const ta = $('#fBody');
            ta.value = ta.value.replace(/\s*$/, '') + '\n\n' +
                analysis.questions.map(q => '## ' + q + '\n\nANSWER in 40-60 words.').join('\n\n');
            state.post.body = ta.value;
            updateCounters();
            markDirty();
            showPanel('composer');
            toast('FAQ outline appended to the body.', 'good');
        });

        // Share modal
        $('#btnOpenAll').addEventListener('click', openAll);
        $('#btnStepper').addEventListener('click', startStepper);
        $('#btnFireWebhook').addEventListener('click', () => fireWebhook(false));
        $('#btnCopyAll').addEventListener('click', () => {
            const txt = Object.keys(shareCaptions).filter(k => shareCaptions[k].selected).map(k => {
                const i = shareCaptions[k];
                return '=== ' + i.platform.label + ' ===\n' + i.caption.text;
            }).join('\n\n');
            copy(txt, 'All captions');
        });
        $('#btnDownloadPost').addEventListener('click', () => {
            const html = buildPostHtml();
            if (!html) return;
            download((state.post.slug || 'post') + '.html', html, 'text/html;charset=utf-8');
            toast('Post HTML downloaded - commit it to /blog/ to publish.', 'good', 4500);
        });
        const closeShare = () => { $('#shareModal').hidden = true; document.body.style.overflow = ''; };
        $('#shareClose').addEventListener('click', closeShare);
        $('#btnShareDone').addEventListener('click', closeShare);
        $('#shareModal').addEventListener('click', e => { if (e.target.id === 'shareModal') closeShare(); });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && !$('#shareModal').hidden) closeShare();
        });

        // Library import / export
        $('#btnExportLib').addEventListener('click', () =>
            download('pet-go-pro-library.json', JSON.stringify(state.library, null, 2), 'application/json'));
        $('#btnImportLib').addEventListener('click', () => $('#fileImport').click());
        $('#fileImport').addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const incoming = JSON.parse(reader.result);
                    if (!Array.isArray(incoming)) throw new Error('Expected a JSON array of posts');
                    const ids = new Set(state.library.map(x => x.id));
                    let added = 0;
                    incoming.forEach(x => { if (x && x.id && !ids.has(x.id)) { state.library.push(x); added++; } });
                    save();
                    renderLibrary();
                    toast('Imported ' + added + ' post(s).', 'good');
                } catch (err) {
                    toast('Import failed: ' + err.message, 'bad', 5000);
                }
                e.target.value = '';
            };
            reader.readAsText(file);
        });

        // A restored draft should come back with its analysis intact, not with an
        // empty SEO panel that the author has to re-trigger by hand.
        if (state.post.title && SEO.words(state.post.body).length > 20) runAnalysis(true);

        window.addEventListener('beforeunload', () => save(true));
        markSaved();
    }

    document.addEventListener('DOMContentLoaded', initGate);
})();
