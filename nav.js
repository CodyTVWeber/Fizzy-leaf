/* Shared nav: hamburger toggle + overlay menu, used on every page. */
(function () {
  var toggle = document.getElementById('menuToggle');
  var overlay = document.getElementById('navOverlay');
  var header = document.getElementById('header');
  if (!toggle || !overlay) return;

  function setOpen(open) {
    toggle.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  toggle.addEventListener('click', function () {
    setOpen(!overlay.classList.contains('open'));
  });

  overlay.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setOpen(false); });
  });

  // tap the overlay background (not a link) to close
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) setOpen(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });

  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }
})();

/* Page transition: fade the content out before navigating to another
   internal page (the fade-in is handled by CSS on load). */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || reduce) return;
    var href = a.getAttribute('href');
    if (!href) return;
    // only intercept same-site .html navigations (skip anchors, externals, new tabs, downloads)
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    if (!/^[^#?:]+\.html(\?|#|$)/.test(href)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    e.preventDefault();
    document.body.classList.add('is-leaving');
    window.setTimeout(function () { window.location.href = href; }, 520);
  });

  // restore visibility if the page is served from the bfcache (back/forward)
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) document.body.classList.remove('is-leaving');
  });
})();
