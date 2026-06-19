/* Shop page: product configurator (pack · one-time/subscribe · quantity),
   image gallery, and a slide-out cart drawer backed by the Storefront Cart
   API (cart-api.js). */
(function () {
  'use strict';

  function id(x) { return document.getElementById(x); }
  var money = FizzyCart.money;
  var PRICES = FizzyCart.PRICES;

  var state = { pack: 12, type: 'onetime', qty: 1 };
  var current = null; // last known cart

  var els = {
    price: id('priceDisplay'),
    packSelector: id('packSelector'),
    purchaseToggle: id('purchaseToggle'),
    packLine: id('productPackLine'),
    packFeature: id('packFeature'),
    mainImage: id('shopMainImage'),
    thumbs: id('shopThumbs'),
    qtyStepper: id('qtyStepper'),
    qtyValue: id('qtyValue'),
    buyButton: id('shopBuyButton'),
    fab: id('cartFab'),
    count: id('cartCount'),
    overlay: id('cartOverlay'),
    drawer: id('cartDrawer'),
    drawerClose: id('cartClose'),
    drawerBody: id('cartBody'),
    subtotal: id('cartSubtotal'),
    checkout: id('cartCheckout')
  };

  /* ── product configurator ── */

  function priceMarkup(p) {
    return state.type === 'subscribe'
      ? '<s>' + money(p.onetime) + '</s> ' + money(p.subscribe) + ' /mo'
      : money(p.onetime);
  }

  function renderProduct() {
    var p = PRICES[state.pack];
    els.price.innerHTML = priceMarkup(p);
    els.packLine.textContent = state.pack + '-Pack · Sparkling Tea · 12 oz cans';
    els.packFeature.textContent = state.pack + '-pack of 12 oz cans';
    els.qtyValue.textContent = state.qty;
    els.packSelector.querySelectorAll('.pack-btn').forEach(function (b) {
      b.classList.toggle('selected', Number(b.dataset.size) === state.pack);
    });
    els.purchaseToggle.querySelectorAll('.purchase-option').forEach(function (b) {
      b.classList.toggle('active', b.dataset.type === state.type);
    });
  }

  function initConfigurator() {
    els.packSelector.addEventListener('click', function (e) {
      var b = e.target.closest('.pack-btn'); if (!b) return;
      state.pack = Number(b.dataset.size); renderProduct();
    });
    els.purchaseToggle.addEventListener('click', function (e) {
      var b = e.target.closest('.purchase-option'); if (!b) return;
      state.type = b.dataset.type; renderProduct();
    });
    els.qtyStepper.addEventListener('click', function (e) {
      var b = e.target.closest('[data-step]'); if (!b) return;
      state.qty = Math.max(1, state.qty + Number(b.dataset.step)); renderProduct();
    });
    els.buyButton.addEventListener('click', addToCart);
  }

  function initGallery() {
    if (!els.thumbs || !els.mainImage) return;
    els.thumbs.addEventListener('click', function (e) {
      var t = e.target.closest('.shop-thumb'); if (!t) return;
      els.thumbs.querySelectorAll('.shop-thumb').forEach(function (x) {
        x.classList.toggle('active', x === t);
      });
      if (t.dataset.src !== els.mainImage.getAttribute('src')) {
        FizzyLeaf.fadeSwap(els.mainImage, t.dataset.src, { swapDelay: 220 });
      }
    });
  }

  /* ── cart drawer ── */

  function typeLabel(t) {
    return t === 'subscribe' ? 'Subscribe & Save · monthly' : 'One-time purchase';
  }

  function lineRow(l) {
    return '<div class="cart-line" data-id="' + l.id + '">' +
      '<div><div class="cl-title">' + l.title + '</div>' +
      '<div class="cl-meta">' + typeLabel(l.type) + '</div>' +
      '<div class="cl-qty"><button data-act="dec" aria-label="Decrease">−</button>' +
      '<span>' + l.quantity + '</span>' +
      '<button data-act="inc" aria-label="Increase">+</button></div>' +
      '<button class="cl-remove" data-act="rm">Remove</button></div>' +
      '<div class="cl-price">' + money(l.total) + '</div></div>';
  }

  function renderCart(cart) {
    current = cart;
    var n = cart ? cart.count : 0;
    els.count.textContent = n || '';
    els.count.setAttribute('data-count', n);
    if (!cart || !cart.lines.length) {
      els.drawerBody.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
      els.subtotal.textContent = money(0);
      els.checkout.style.display = 'none';
      return;
    }
    els.checkout.style.display = '';
    els.checkout.href = cart.checkoutUrl;
    els.drawerBody.innerHTML = cart.lines.map(lineRow).join('');
    els.subtotal.textContent = money(cart.subtotal);
  }

  function openDrawer() { els.overlay.classList.add('open'); els.drawer.classList.add('open'); }
  function closeDrawer() { els.overlay.classList.remove('open'); els.drawer.classList.remove('open'); }
  function drawerBusy(on) {
    els.drawerBody.style.opacity = on ? '0.5' : '';
    els.drawerBody.style.pointerEvents = on ? 'none' : '';
  }

  function bumpFab() {
    els.fab.classList.remove('bump');
    void els.fab.offsetWidth; // restart the animation
    els.fab.classList.add('bump');
  }

  function addToCart() {
    var btn = els.buyButton;
    btn.classList.add('is-loading');
    var orig = btn.textContent;
    btn.textContent = 'Adding…';
    FizzyCart.add(state.pack, state.type, state.qty)
      .then(function (cart) {
        renderCart(cart); bumpFab(); openDrawer();
        state.qty = 1; renderProduct();
      })
      .catch(function () { alert('Sorry — could not add to cart. Please try again.'); })
      .then(function () { btn.classList.remove('is-loading'); btn.textContent = orig; });
  }

  function initDrawer() {
    els.drawerBody.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]'); if (!btn || !current) return;
      var lineId = e.target.closest('.cart-line').dataset.id;
      var line = current.lines.filter(function (l) { return l.id === lineId; })[0];
      if (!line) return;
      var act = btn.dataset.act;
      var p;
      if (act === 'inc') p = FizzyCart.updateLine(lineId, line.quantity + 1);
      else if (act === 'dec') p = line.quantity <= 1 ? FizzyCart.removeLine(lineId) : FizzyCart.updateLine(lineId, line.quantity - 1);
      else p = FizzyCart.removeLine(lineId);
      drawerBusy(true);
      p.then(renderCart).catch(function () {}).then(function () { drawerBusy(false); });
    });
    els.fab.addEventListener('click', openDrawer);
    els.overlay.addEventListener('click', closeDrawer);
    els.drawerClose.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  renderProduct();
  initConfigurator();
  initGallery();
  initDrawer();
  FizzyCart.get().then(renderCart).catch(function () {});
})();
