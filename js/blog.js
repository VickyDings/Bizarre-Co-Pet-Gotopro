/* ===================================================
   Bizarre Co - Blog & Care Guide Interactions
   Requires js/main.js for shared nav/header behaviour
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- Reading Progress Bar ---------- */
    const progress = document.querySelector('.read-progress');
    const article = document.querySelector('.prose');

    if (progress && article) {
        const updateProgress = () => {
            const start = article.offsetTop;
            const height = article.offsetHeight - window.innerHeight;
            const scrolled = window.scrollY - start;
            const pct = height > 0 ? (scrolled / height) * 100 : 0;
            progress.style.width = Math.min(100, Math.max(0, pct)) + '%';
        };
        window.addEventListener('scroll', updateProgress, { passive: true });
        window.addEventListener('resize', updateProgress);
        updateProgress();
    }

    /* ---------- Table of Contents Scroll Spy ---------- */
    const tocLinks = Array.from(document.querySelectorAll('.toc a[href^="#"]'));
    const sections = tocLinks
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    if (sections.length) {
        const spy = () => {
            const offset = 140;
            let current = sections[0];
            sections.forEach(section => {
                if (section.getBoundingClientRect().top <= offset) current = section;
            });
            tocLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === '#' + current.id);
            });
        };
        window.addEventListener('scroll', spy, { passive: true });
        spy();
    }

    /* Close the mobile TOC after picking a section */
    const mobileToc = document.querySelector('.toc-mobile');
    if (mobileToc) {
        mobileToc.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => { mobileToc.open = false; });
        });
    }

    /* ---------- FAQ Accordion ---------- */
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-q');
        if (!question) return;

        question.setAttribute('aria-expanded', 'false');
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item.open').forEach(other => {
                if (other !== item) {
                    other.classList.remove('open');
                    const q = other.querySelector('.faq-q');
                    if (q) q.setAttribute('aria-expanded', 'false');
                }
            });
            item.classList.toggle('open', !isOpen);
            question.setAttribute('aria-expanded', String(!isOpen));
        });
    });

    /* ---------- Shopping Checklist (remembers progress locally) ---------- */
    const checklist = document.querySelector('.checklist');

    if (checklist) {
        const boxes = Array.from(checklist.querySelectorAll('input[type="checkbox"]'));
        const fill = checklist.querySelector('.cp-fill');
        const label = checklist.querySelector('.cp-label');
        const storeKey = 'bizarreco-checklist-' + (checklist.dataset.checklistId || 'default');

        let saved = {};
        try {
            saved = JSON.parse(localStorage.getItem(storeKey) || '{}');
        } catch (e) {
            saved = {};
        }

        const render = () => {
            const done = boxes.filter(box => box.checked).length;
            const pct = boxes.length ? Math.round((done / boxes.length) * 100) : 0;
            if (fill) fill.style.width = pct + '%';
            if (label) label.textContent = done + ' of ' + boxes.length + ' ready (' + pct + '%)';
        };

        boxes.forEach((box, i) => {
            const key = box.id || 'item-' + i;
            if (saved[key]) box.checked = true;
            box.addEventListener('change', () => {
                saved[key] = box.checked;
                try {
                    localStorage.setItem(storeKey, JSON.stringify(saved));
                } catch (e) {
                    /* storage unavailable - progress just won't persist */
                }
                render();
            });
        });

        render();
    }

    /* ---------- Blog Index Category Filter ---------- */
    const chips = document.querySelectorAll('.filter-chip');
    const posts = document.querySelectorAll('.post-card[data-tags]');

    if (chips.length && posts.length) {
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                const filter = chip.dataset.filter;
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                posts.forEach(post => {
                    const match = filter === 'all' || post.dataset.tags.includes(filter);
                    post.style.display = match ? '' : 'none';
                });
            });
        });
    }

});
