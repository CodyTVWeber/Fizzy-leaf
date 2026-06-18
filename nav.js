/* Shared site chrome: mobile menu, header scroll state, page transitions. */
(function () {
  'use strict';

  // Mobile overlay menu toggled by the floating hamburger.
  function initMenu() {
    var toggle = document.getElementById('menuToggle');
    var overlay = document.getElementById('navOverlay');
    if (!toggle || !overlay) return;

    function setOpen(open) {
      toggle.classList.toggle('open', open);
      overlay.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      overlay.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
    }

    toggle.addEventListener('click', function () {
      setOpen(!overlay.classList.contains('open'));
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) setOpen(false); // tap backdrop to close
    });
    overlay.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  // Add a shadow to the header once the page is scrolled.
  function initHeaderScroll() {
    var header = document.getElementById('header');
    if (!header) return;
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // Fade the content out before navigating to another internal page.
  // Must stay in sync with the CSS fade-out duration (.is-leaving).
  function initPageTransitions() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var FADE_OUT_MS = 700;

    function isInternalPage(a) {
      if (a.target === '_blank' || a.hasAttribute('download')) return false;
      var href = a.getAttribute('href');
      return !!href && /^[^#?:]+\.html(\?|#|$)/.test(href);
    }

    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if (!a || !isInternalPage(a)) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      document.body.classList.add('is-leaving');
      window.setTimeout(function () { window.location.href = a.getAttribute('href'); }, FADE_OUT_MS);
    });

    // Page restored from bfcache (back/forward) — make sure it's visible.
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) document.body.classList.remove('is-leaving');
    });
  }

  initMenu();
  initHeaderScroll();
  initPageTransitions();
})();
