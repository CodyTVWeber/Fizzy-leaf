/* Shop page: pack/subscription pricing UI + product gallery. */
(function () {
  'use strict';

  var PRICES = {
    12: { onetime: 43, subscribe: 34.4 },
    24: { onetime: 79, subscribe: 63.2 }
  };

  // TODO: once the Shopify Subscriptions app's 20%-off selling plan exists,
  // add its sellingPlanId here per pack and pass it into createComponent()
  // options below to enable real Subscribe & Save checkout.
  var SHOPIFY = {
    domain: '4nrp1u-ka.myshopify.com',
    storefrontAccessToken: 'b42a54c4c455ccdc767511135953a5bb',
    productId: '7681726742622',
    variantIds: { 12: '42907503034462', 24: '42907503067230' },
    sellingPlanIds: { 12: null, 24: null }
  };

  var state = { pack: 12, type: 'onetime' };

  var els = {
    price: document.getElementById('priceDisplay'),
    packSelector: document.getElementById('packSelector'),
    purchaseToggle: document.getElementById('purchaseToggle'),
    packLine: document.getElementById('productPackLine'),
    packFeature: document.getElementById('packFeature'),
    mainImage: document.getElementById('shopMainImage'),
    thumbs: document.getElementById('shopThumbs'),
    subscribeNotice: document.getElementById('subscribeNotice'),
    buyButtonWrap: document.getElementById('shopify-buy-button')
  };

  function money(n) { return '$' + n.toFixed(2); }

  function priceMarkup(p) {
    return state.type === 'subscribe'
      ? '<s>' + money(p.onetime) + '</s> ' + money(p.subscribe) + ' /mo'
      : money(p.onetime);
  }

  function renderBuyButton() {
    var showSubscribe = state.type === 'subscribe';
    els.subscribeNotice.style.display = showSubscribe ? '' : 'none';
    els.buyButtonWrap.style.display = showSubscribe ? 'none' : '';
    if (!showSubscribe) mountBuyButton(state.pack);
  }

  function render() {
    var p = PRICES[state.pack];
    els.price.innerHTML = priceMarkup(p);
    els.packLine.textContent = state.pack + '-Pack · Sparkling Tea · 12 oz cans';
    els.packFeature.textContent = state.pack + '-pack of 12 oz cans';
    els.packSelector.querySelectorAll('.pack-btn').forEach(function (btn) {
      btn.classList.toggle('selected', Number(btn.dataset.size) === state.pack);
    });
    els.purchaseToggle.querySelectorAll('.purchase-option').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.type === state.type);
    });
    renderBuyButton();
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

  var BUY_BUTTON_OPTIONS = {
    product: {
      styles: {
        product: {
          '@media (min-width: 601px)': {
            'max-width': 'calc(25% - 20px)',
            'margin-left': '20px',
            'margin-bottom': '50px'
          }
        },
        button: {
          'font-weight': 'bold',
          ':hover': { 'background-color': '#b09e43' },
          'background-color': '#c3b04a',
          ':focus': { 'background-color': '#b09e43' },
          'border-radius': '8px'
        }
      },
      buttonDestination: 'checkout',
      contents: { img: false, title: false, price: false, options: false },
      text: { button: 'Buy now' }
    },
    cart: {
      styles: {
        button: {
          'font-weight': 'bold',
          ':hover': { 'background-color': '#b09e43' },
          'background-color': '#c3b04a',
          ':focus': { 'background-color': '#b09e43' },
          'border-radius': '8px'
        }
      },
      text: { total: 'Subtotal', button: 'Checkout' },
      popup: false
    }
  };

  function loadShopifyBuySDK(cb) {
    if (window.ShopifyBuy && window.ShopifyBuy.UI) return cb();
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    script.onload = cb;
    document.head.appendChild(script);
  }

  var shopifyUi = null;
  var mountedComponent = null;
  var mountedPack = null;

  // Buy Button iframes size themselves once, at creation time. If the
  // container is display:none then (e.g. Subscribe & Save is selected),
  // the iframe locks in at zero height and never recovers. So we only
  // ever create the component while its container is visible, and
  // recreate it on pack switch instead of pre-mounting both up front.
  function mountBuyButton(pack) {
    if (mountedPack === pack) return;
    loadShopifyBuySDK(function () {
      if (shopifyUi) return doMount(shopifyUi);
      var client = ShopifyBuy.buildClient({
        domain: SHOPIFY.domain,
        storefrontAccessToken: SHOPIFY.storefrontAccessToken
      });
      ShopifyBuy.UI.onReady(client).then(function (ui) {
        shopifyUi = ui;
        doMount(ui);
      });
    });

    function doMount(ui) {
      if (mountedComponent) {
        mountedComponent.destroy();
        mountedComponent = null;
      }
      els.buyButtonWrap.innerHTML = '';
      ui.createComponent('product', {
        id: SHOPIFY.productId,
        variantId: SHOPIFY.variantIds[pack],
        node: els.buyButtonWrap,
        moneyFormat: '%24%7B%7Bamount%7D%7D',
        options: BUY_BUTTON_OPTIONS
      });
      mountedComponent = ui.components[ui.components.length - 1];
      mountedPack = pack;
    }
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
