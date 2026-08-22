# Behaviors (JS modules)

Each page JS is one IIFE, ES5 style, `'use strict'`. Shared helpers on `window.FizzyLeaf` / `window.FizzyCart`.

## `nav.js` (every page)
- **Mobile menu**: hamburger (`#menuToggle`) toggles full-screen `#navOverlay`; closes on link click, backdrop tap, or `Escape`; locks body scroll while open.
- **Header scroll**: adds `.scrolled` shadow past 10px.
- **Page transitions**: intercepts internal `*.html` link clicks (regex `^[^#?:]+\.html(\?|#|$)`), fades content out, navigates after `FADE_OUT_MS` (220 — keep synced with CSS). Honors modifier/middle clicks and `prefers-reduced-motion`.

## `util.js`
- `FizzyLeaf.fadeSwap(el, newSrc, {swapDelay, safetyDelay})` — opacity cross-fade for `<img>`/`<iframe>` src changes.

## `cart-api.js` → `window.FizzyCart`
Storefront Cart API wrapper. Public: `PRICES`, `ready`, `money()`, `get()`, `add(pack,type,qty)`, `updateLine(id,qty)`, `removeLine(id)`. Returns a normalized cart `{ id, checkoutUrl, count, subtotal, lines[] }`, each line `{ id, quantity, pack, type, title, total }`.
- **`loadPrices` / `ready`**: on load, fetch product variant one-time `price.amount` into `PRICES[pack].onetime`. Separate query tries `sellingPlanAllocations` → subscribe amounts; on deny/null/empty, keep hardcoded `PRICES.subscribe` fallback. `ready` never rejects the shop UI. Details in [shopify.md](shopify.md).

## `shop.js` (shop page)
- **Configurator**: pack selector (12/24), one-time/subscribe toggle, inline quantity stepper (no "Quantity" label), live price (`<s>` strike + /mo for subscribe). Renders immediately with fallbacks, then again after `FizzyCart.ready`.
- **Gallery**: thumbnail strip swaps the main image via `fadeSwap`.
- **Cart drawer**: Add to Cart → `FizzyCart.add` → render drawer, bump FAB, open drawer, reset qty to 1. Drawer supports ±/remove (optimistic busy state), live subtotal, checkout link. Re-open via floating cart FAB (white SVG cart + count badge). Close via ×, overlay, or Escape.

## `locations.js` (locations page)
- **City filter** (`.filter-btn`): animates the grid (fade/translate) to show matching `.location-card`s and swaps the map to a city-zoom embed (`z=12`); "All" → overview (`z=9`).
- **Card click/Enter/Space**: marks card active, swaps map to that shop (`z=15`, query = name + address); on phone, scrolls the map into view. Cards get `role=button`, `tabindex`, and an injected "View on map →" hint.
- Map is a plain Google Maps `output=embed` iframe (no API key).

## `delivery.js` (delivery page)
- **Map**: Leaflet + OSM tiles. Gold 30-mile circle around College Grove `{ lat: 35.7869, lng: -86.6750 }`. Visitor marker after a check. Mileage gate (not drive-time — no routing key). Copy treats 30 miles ≈ 30-minute drive.
- **Address check**: Nominatim (`/search?format=json&limit=1&countrycodes=us`) → Haversine vs origin, radius 30. Outside/unknown: message, hide inquiry. Inside: show miles (1 decimal) + inquiry.
- **Inquiry**: name, email, message. Hidden: `address`, `miles`, `lat`, `lng`, `topic=local-delivery-inquiry`. Direct deal with Christian — **not** Shopify checkout, no pack select, no cart.
- **Submit**: same async Formspark pattern as contact (`vwsJT57aO` + `topic` so delivery rows are distinguishable).

## `contact.js` (contact page)
- Async submit to Formspark via `fetch`. States: Sending… → green "✓ Sent!" + success message (animated), or error message with retry. See [animations.md](animations.md).
