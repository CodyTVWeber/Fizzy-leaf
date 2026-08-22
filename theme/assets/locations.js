/* Locations page: city filtering + driving the embedded map. */
(function () {
  'use strict';

  var OVERVIEW_SRC = 'https://maps.google.com/maps?q=35.85,-86.90&z=9&output=embed';

  var filterBtns = document.querySelectorAll('.filter-btn');
  var cards = document.querySelectorAll('.location-card');
  var grid = document.getElementById('locationsGrid');
  var mapFrame = document.getElementById('locationMap');
  var mapBox = document.querySelector('.map-container');

  function text(parent, selector) {
    var el = parent.querySelector(selector);
    return el ? el.textContent : '';
  }

  function embedSrc(query, zoom) {
    return 'https://maps.google.com/maps?q=' + encodeURIComponent(query) + '&z=' + zoom + '&output=embed';
  }

  function mapSrcForCity(city) {
    return city === 'all' ? OVERVIEW_SRC : embedSrc(city + ', TN', 12);
  }

  function mapSrcForShop(card) {
    return embedSrc((text(card, 'strong') + ' ' + text(card, '.addr')).trim(), 15);
  }

  function clearActiveCards() {
    cards.forEach(function (c) { c.classList.remove('active'); });
  }

  function filterByCity(city) {
    if (grid) { grid.style.opacity = '0'; grid.style.transform = 'translateY(8px)'; }
    window.setTimeout(function () {
      clearActiveCards();
      cards.forEach(function (card) {
        var match = city === 'all' || card.dataset.city === city;
        card.classList.toggle('hidden', !match);
      });
      if (grid) { grid.style.opacity = '1'; grid.style.transform = 'none'; }
    }, 180);
    FizzyLeaf.fadeSwap(mapFrame, mapSrcForCity(city), { swapDelay: 180 });
  }

  function showShop(card) {
    clearActiveCards();
    card.classList.add('active');
    FizzyLeaf.fadeSwap(mapFrame, mapSrcForShop(card), { swapDelay: 180 });
    // on phone the map sits below the cards — bring it into view
    if (mapBox && window.matchMedia('(max-width: 768px)').matches) {
      mapBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function initFilters() {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        filterByCity(btn.dataset.city);
      });
    });
  }

  function initCards() {
    cards.forEach(function (card) {
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('title', 'Show ' + text(card, 'strong') + ' on the map');

      var hint = document.createElement('span');
      hint.className = 'card-hint';
      hint.textContent = 'View on map →';
      card.appendChild(hint);

      card.addEventListener('click', function () { showShop(card); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showShop(card); }
      });
    });
  }

  initFilters();
  initCards();
})();
