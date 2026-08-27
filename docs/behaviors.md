# Behaviors (JS modules)

## Hydrogen (`storefront/`)

### Shop loader + `ShopConfigurator`
- **`loadDisplayPrices(storefront)`** (`app/lib/product.js`): server-side Storefront API fetch for variant one-time `price.amount`, then a separate query for `sellingPlanAllocations` subscribe amounts. On errors/null/empty allocations, keeps hardcoded `PRICES` fallbacks. Never throws to the shop UI.
- **`shop.jsx` loader** returns `{prices}`; `ShopConfigurator` reads them via `useLoaderData()` and renders with `priceDisplay(pack, purchaseType, prices)`.
- Pack selector (12/24), one-time/subscribe toggle, quantity stepper, gallery fade-swap, `CartForm` add-to-cart → aside drawer.

### `DeliveryChecker` (`/delivery`)
- **Map**: Leaflet + OSM tiles (npm `leaflet`, client-only `useEffect`). Gold 30-mile circle around College Grove `{ lat: 35.7869, lng: -86.6750 }`. Visitor marker after a check.
- **Address check**: server action on `/delivery`. US Census geocoder first (rural / highway addresses), Nominatim fallback. Haversine vs origin, radius 30 mi. Outside/unknown: message, hide inquiry. Inside: show miles (1 decimal) + inquiry form.
- **Inquiry**: name, email, message. Hidden: `address`, `miles`, `lat`, `lng`, `topic=local-delivery-inquiry`. Formspark `vwsJT57aO` — direct deal with Christian, **not** Shopify checkout.
- **Submit**: same async Formspark pattern as `ContactForm`.

### Contact
- `ContactForm` — async Formspark submit via `~/lib/formspark`.

---

## Pages (leftover root `*.html`)

Each page JS is one IIFE, ES5 style, `'use strict'`. Shared helpers on `window.FizzyLeaf` / `window.FizzyCart`.

### `nav.js` (every page)
- **Mobile menu**: hamburger (`#menuToggle`) toggles full-screen `#navOverlay`; closes on link click, backdrop tap, or `Escape`; locks body scroll while open.
- **Header scroll**: adds `.scrolled` shadow past 10px.
- **Page transitions**: intercepts internal `*.html` link clicks (regex `^[^#?:]+\.html(\?|#|$)`), fades content out, navigates after `FADE_OUT_MS` (220 — keep synced with CSS). Honors modifier/middle clicks and `prefers-reduced-motion`.

### `util.js`
- `FizzyLeaf.fadeSwap(el, newSrc, {swapDelay, safetyDelay})` — opacity cross-fade for `<img>`/`<iframe>` src changes.

### `cart-api.js` → `window.FizzyCart`
Storefront Cart API wrapper. Public: `PRICES`, `money()`, `get()`, `add(pack,type,qty)`, `updateLine(id,qty)`, `removeLine(id)`. Returns a normalized cart `{ id, checkoutUrl, count, subtotal, lines[] }`, each line `{ id, quantity, pack, type, title, total }`. Details in [shopify.md](shopify.md).

### `shop.js` (shop page)
- **Configurator**: pack selector (12/24), one-time/subscribe toggle, inline quantity stepper (no "Quantity" label), live price (`<s>` strike + /mo for subscribe).
- **Gallery**: thumbnail strip swaps the main image via `fadeSwap`.
- **Cart drawer**: Add to Cart → `FizzyCart.add` → render drawer, bump FAB, open drawer, reset qty to 1. Drawer supports ±/remove (optimistic busy state), live subtotal, checkout link. Re-open via floating cart FAB (white SVG cart + count badge). Close via ×, overlay, or Escape.

### `locations.js` (locations page)
- **City filter** (`.filter-btn`): animates the grid (fade/translate) to show matching `.location-card`s and swaps the map to a city-zoom embed (`z=12`); "All" → overview (`z=9`).
- **Card click/Enter/Space**: marks card active, swaps map to that shop (`z=15`, query = name + address); on phone, scrolls the map into view. Cards get `role=button`, `tabindex`, and an injected "View on map →" hint.
- Map is a plain Google Maps `output=embed` iframe (no API key).

### `contact.js` (contact page)
- Async submit to Formspark via `fetch`. States: Sending… → green "✓ Sent!" + success message (animated), or error message with retry. See [animations.md](animations.md).
