/* Shop page: pack/subscription pricing UI + product gallery.
   Checkout goes through the Storefront Cart API: we create a cart (attaching
   the subscription selling plan when "Subscribe & Save" is chosen) and send
   the customer to the returned checkoutUrl. This lets us use our own styled
   button and supports subscriptions — the Buy Button SDK does neither. The
   checkoutUrl also bypasses the store's password gate. */
(function () {
  'use strict';

  var PRICES = {
    12: { onetime: 43, subscribe: 34.4 },
    24: { onetime: 79, subscribe: 63.2 }
  };

  var SHOPIFY = {
    domain: '4nrp1u-ka.myshopify.com',
    apiVersion: '2025-01',
    storefrontAccessToken: 'b42a54c4c455ccdc767511135953a5bb',
    variantIds: { 12: '42907503034462', 24: '42907503067230' },
    // Subscriptions app "Subscribe & Save 20% — deliver every month" plan.
    // Same selling plan applies to both pack variants.
    sellingPlanId: '6531121246'
  };

  var state = { pack: 12, type: 'onetime' };
  var busy = false;

  var els = {
    price: document.getElementById('priceDisplay'),
    packSelector: document.getElementById('packSelector'),
    purchaseToggle: document.getElementById('purchaseToggle'),
    packLine: document.getElementById('productPackLine'),
    packFeature: document.getElementById('packFeature'),
    mainImage: document.getElementById('shopMainImage'),
    thumbs: document.getElementById('shopThumbs'),
    buyButton: document.getElementById('shopBuyButton')
  };

  function money(n) { return '$' + n.toFixed(2); }

  function priceMarkup(p) {
    return state.type === 'subscribe'
      ? '<s>' + money(p.onetime) + '</s> ' + money(p.subscribe) + ' /mo'
      : money(p.onetime);
  }

  function buyLabel() {
    return state.type === 'subscribe' ? 'Subscribe & Save' : 'Add to Cart';
  }

  function render() {
    var p = PRICES[state.pack];
    els.price.innerHTML = priceMarkup(p);
    els.packLine.textContent = state.pack + '-Pack · Sparkling Tea · 12 oz cans';
    els.packFeature.textContent = state.pack + '-pack of 12 oz cans';
    els.buyButton.textContent = buyLabel();
    els.packSelector.querySelectorAll('.pack-btn').forEach(function (btn) {
      btn.classList.toggle('selected', Number(btn.dataset.size) === state.pack);
    });
    els.purchaseToggle.querySelectorAll('.purchase-option').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.type === state.type);
    });
  }

  var CART_CREATE = 'mutation cartCreate($lines:[CartLineInput!]!){' +
    'cartCreate(input:{lines:$lines}){cart{checkoutUrl}userErrors{message}}}';

  function startCheckout() {
    if (busy) return;
    busy = true;
    els.buyButton.classList.add('is-loading');
    els.buyButton.textContent = 'Starting checkout…';

    var line = {
      quantity: 1,
      merchandiseId: 'gid://shopify/ProductVariant/' + SHOPIFY.variantIds[state.pack]
    };
    if (state.type === 'subscribe') {
      line.sellingPlanId = 'gid://shopify/SellingPlan/' + SHOPIFY.sellingPlanId;
    }

    fetch('https://' + SHOPIFY.domain + '/api/' + SHOPIFY.apiVersion + '/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY.storefrontAccessToken
      },
      body: JSON.stringify({ query: CART_CREATE, variables: { lines: [line] } })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        var created = res && res.data && res.data.cartCreate;
        var url = created && created.cart && created.cart.checkoutUrl;
        if (!url) throw new Error('no checkout url');
        window.location.href = url;
      })
      .catch(function () {
        busy = false;
        els.buyButton.classList.remove('is-loading');
        els.buyButton.textContent = buyLabel();
        alert('Sorry — we couldn’t start checkout. Please try again.');
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
    els.buyButton.addEventListener('click', startCheckout);
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
