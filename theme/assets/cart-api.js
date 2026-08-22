/* Storefront Cart API wrapper for the shop page.
   Persists a cart id in localStorage and exposes a small async API that
   returns a normalized cart: { id, checkoutUrl, count, subtotal, lines[] }.
   Each line: { id, quantity, pack, type, title, total }.
   Subscription lines are detected by unit price, since reading
   sellingPlanAllocation needs a scope this storefront token lacks. */
window.FizzyCart = (function () {
  'use strict';

  var CFG = {
    domain: '4nrp1u-ka.myshopify.com',
    apiVersion: '2025-01',
    token: 'b42a54c4c455ccdc767511135953a5bb',
    variantIds: { 12: '42907503034462', 24: '42907503067230' },
    sellingPlanId: '6531121246'
  };

  var PRICES = {
    12: { onetime: 43, subscribe: 34.4 },
    24: { onetime: 79, subscribe: 63.2 }
  };

  var STORAGE_KEY = 'fizzy_cart_id';

  var CART_FIELDS =
    'id checkoutUrl totalQuantity cost{subtotalAmount{amount}}' +
    'lines(first:50){edges{node{id quantity cost{totalAmount{amount}}' +
    'merchandise{... on ProductVariant{id title}}}}}';

  function gql(query, variables) {
    return fetch('https://' + CFG.domain + '/api/' + CFG.apiVersion + '/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': CFG.token
      },
      body: JSON.stringify({ query: query, variables: variables || {} })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.errors && res.errors.length) throw new Error(res.errors[0].message);
        return res.data;
      });
  }

  function variantId(pack) { return 'gid://shopify/ProductVariant/' + CFG.variantIds[pack]; }
  function planId() { return 'gid://shopify/SellingPlan/' + CFG.sellingPlanId; }

  function lineInput(pack, type, qty) {
    var line = { quantity: qty || 1, merchandiseId: variantId(pack) };
    if (type === 'subscribe') line.sellingPlanId = planId();
    return line;
  }

  function classify(unit, pack) {
    var p = PRICES[pack];
    return Math.abs(unit - p.subscribe) < Math.abs(unit - p.onetime) ? 'subscribe' : 'onetime';
  }

  function normalize(cart) {
    if (!cart) return null;
    var lines = (cart.lines.edges || []).map(function (e) {
      var n = e.node;
      var total = Number(n.cost.totalAmount.amount);
      var pack = n.merchandise.title.indexOf('24') !== -1 ? 24 : 12;
      return {
        id: n.id,
        quantity: n.quantity,
        pack: pack,
        type: classify(total / n.quantity, pack),
        title: n.merchandise.title,
        total: total
      };
    });
    return {
      id: cart.id,
      checkoutUrl: cart.checkoutUrl,
      count: cart.totalQuantity,
      subtotal: Number(cart.cost.subtotalAmount.amount),
      lines: lines
    };
  }

  function saveId(id) { try { localStorage.setItem(STORAGE_KEY, id); } catch (e) {} }
  function loadId() { try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; } }
  function clearId() { try { localStorage.removeItem(STORAGE_KEY); } catch (e) {} }

  function createCart(lines) {
    return gql(
      'mutation($lines:[CartLineInput!]!){cartCreate(input:{lines:$lines}){cart{' + CART_FIELDS + '}userErrors{message}}}',
      { lines: lines }
    ).then(function (d) {
      var cart = d.cartCreate.cart;
      saveId(cart.id);
      return normalize(cart);
    });
  }

  function fetchCart(id) {
    return gql('query($id:ID!){cart(id:$id){' + CART_FIELDS + '}}', { id: id })
      .then(function (d) { return normalize(d.cart); });
  }

  // Current saved cart, or null. Self-heals if the id is stale/expired.
  function get() {
    var id = loadId();
    if (!id) return Promise.resolve(null);
    return fetchCart(id)
      .then(function (cart) { if (!cart) clearId(); return cart; })
      .catch(function () { clearId(); return null; });
  }

  // Add a line to the saved cart (creating one if needed). Identical
  // merchandise + plan merges into the existing line server-side.
  function add(pack, type, qty) {
    var line = lineInput(pack, type, qty);
    var id = loadId();
    if (!id) return createCart([line]);
    return gql(
      'mutation($id:ID!,$lines:[CartLineInput!]!){cartLinesAdd(cartId:$id,lines:$lines){cart{' + CART_FIELDS + '}userErrors{message}}}',
      { id: id, lines: [line] }
    )
      .then(function (d) {
        var cart = d.cartLinesAdd && d.cartLinesAdd.cart;
        if (!cart) { clearId(); return createCart([line]); }
        return normalize(cart);
      })
      .catch(function () { clearId(); return createCart([line]); });
  }

  function updateLine(lineId, qty) {
    return gql(
      'mutation($id:ID!,$lines:[CartLineUpdateInput!]!){cartLinesUpdate(cartId:$id,lines:$lines){cart{' + CART_FIELDS + '}userErrors{message}}}',
      { id: loadId(), lines: [{ id: lineId, quantity: qty }] }
    ).then(function (d) { return normalize(d.cartLinesUpdate.cart); });
  }

  function removeLine(lineId) {
    return gql(
      'mutation($id:ID!,$ids:[ID!]!){cartLinesRemove(cartId:$id,lineIds:$ids){cart{' + CART_FIELDS + '}userErrors{message}}}',
      { id: loadId(), ids: [lineId] }
    ).then(function (d) { return normalize(d.cartLinesRemove.cart); });
  }

  return {
    PRICES: PRICES,
    money: function (n) { return '$' + Number(n).toFixed(2); },
    get: get,
    add: add,
    updateLine: updateLine,
    removeLine: removeLine
  };
})();
