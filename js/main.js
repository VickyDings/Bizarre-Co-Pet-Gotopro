/* ==========================================================================
   Pet-Go'to'Pro
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------- mobile drawer ---- */
  var nav = document.querySelector('.nav');
  var burger = document.querySelector('.burger');

  if (nav && burger) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Close the drawer when a link is chosen, or on Escape.
    nav.addEventListener('click', function (e) {
      if (e.target.closest('.nav-links a')) {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  /* ------------------------------------------------- species filtering ---
     The strip filters any list of [data-species] items on the page. With no
     list present it just tracks the selection, so the homepage strip works
     the same as the one on the guides index.                              */
  var strip = document.querySelector('.species-row');

  if (strip) {
    strip.addEventListener('click', function (e) {
      var chip = e.target.closest('.sp');
      if (!chip) return;

      strip.querySelectorAll('.sp').forEach(function (el) {
        el.classList.remove('on');
        el.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('on');
      chip.setAttribute('aria-pressed', 'true');

      var want = chip.dataset.species;
      var items = document.querySelectorAll('[data-species]');
      if (!items.length) return;

      var shown = 0;
      items.forEach(function (el) {
        var match = !want || want === 'all' || el.dataset.species === want;
        el.hidden = !match;
        if (match) shown++;
      });

      var empty = document.querySelector('[data-empty]');
      if (empty) empty.hidden = shown > 0;
    });
  }

  /* ------------------------------------------------------------ forms ----
     No backend yet, so submissions are acknowledged in place rather than
     failing silently against a dead endpoint.                            */
  document.querySelectorAll('form[data-ack]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.form-msg');
      if (msg) {
        msg.hidden = false;
        msg.textContent = form.dataset.ack;
      }
      form.reset();
    });
  });
})();
