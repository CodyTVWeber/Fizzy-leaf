/* Shop page: pack/subscription pricing UI + product gallery. */
(function () {
  'use strict';

  var PRICES = {
    12: { onetime: 43, subscribe: 34.4 },
    24: { onetime: 79, subscribe: 63.2 }
  };

  var state = { pack: 12, type: 'subscribe' };

  var els = {
    price: document.getElementById('priceDisplay'),
    packSelector: document.getElementById('packSelector'),
    purchaseToggle: document.getElementById('purchaseToggle'),
    buyLabel: document.getElementById('buyNowLabel'),
    packLine: document.getElementById('productPackLine'),
    packFeature: document.getElementById('packFeature'),
    mainImage: document.getElementById('shopMainImage'),
    thumbs: document.getElementById('shopThumbs')
  };

  function money(n) { return '$' + n.toFixed(2); }

  function priceMarkup(p) {
    return state.type === 'subscribe'
      ? '<s>' + money(p.onetime) + '</s> ' + money(p.subscribe) + ' /mo'
      : money(p.onetime);
  }

  function buyLabel(p) {
    return state.type === 'subscribe'
      ? 'Subscribe & Save 20%'
      : 'Add to Cart — ' + money(p.onetime);
  }

  function render() {
    var p = PRICES[state.pack];
    els.price.innerHTML = priceMarkup(p);
    els.buyLabel.textContent = buyLabel(p);
    els.packLine.textContent = state.pack + '-Pack · Sparkling Tea · 12 oz cans';
    els.packFeature.textContent = state.pack + '-pack of 12 oz cans';
    els.packSelector.querySelectorAll('.pack-btn').forEach(function (btn) {
      btn.classList.toggle('selected', Number(btn.dataset.size) === state.pack);
    });
    els.purchaseToggle.querySelectorAll('.purchase-option').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.type === state.type);
    });
  }

  function initSelectors() {
    els.packSelector.addEventListener('click', function (e) {
      var btn = e.target.closest('.pack-btn');
      if (!btn) return;
      state.pack = Number(btn.dataset.size);
      render();
    });
    els.purchaseToggle.addEventListener('click', function (e) {
      var btn = e.target.closest('.purchase-option');
      if (!btn) return;
      state.type = btn.dataset.type;
      render();
    });
  }

  function initGallery() {
    if (!els.thumbs || !els.mainImage) return;
    els.thumbs.addEventListener('click', function (e) {
      var thumb = e.target.closest('.shop-thumb');
      if (!thumb) return;
      els.thumbs.querySelectorAll('.shop-thumb').forEach(function (t) {
        t.classList.toggle('active', t === thumb);
      });
      if (thumb.dataset.src !== els.mainImage.getAttribute('src')) {
        FizzyLeaf.fadeSwap(els.mainImage, thumb.dataset.src, { swapDelay: 220 });
      }
    });
  }

  render();
  initSelectors();
  initGallery();
})();
