# Plan: Hydrogen Local Delivery + live shop prices

**Date:** 2026-08-26
**Branch:** `cursor/hydrogen-delivery-live-prices-31d7`
**Status:** Implement on Hydrogen (`storefront/`). Pages root `*.html` is leftover — do not port by editing those files.
**Order:** **1. Local Delivery** (new route) **2. Live display prices** (shop loader).

Source intent: Pages PR (delivery.html / delivery.js / cart-api `loadPrices`). This site is live on Hydrogen/Oxygen only. Re-implement that behavior in `storefront/`.

---

## Why this order

Delivery was never ported (`locations.jsx` is still stockists). Shop checkout is already live Shopify; display can drift until we fetch variant amounts. Delivery is the missing page; prices are a shop-loader change.

## Do not

- Edit or add repo-root Pages files (`delivery.html`, `delivery.js`, `index.html`, `shop.html`, …)
- Change Storefront token, variant GIDs, selling plan id, API version
- Add `sellingPlanAllocation` to `CART_QUERY_FRAGMENT` / cart queries
- Shopify checkout for local delivery (no pack select, no cart, no 48-pack variant)
- DNS, store password, theme publish, GitHub Pages off, delete CNAME
- Strip unused skeleton routes (`account.*`, blogs, collections, search)
- Dedicated Formspark form (reuse contact id + `topic=local-delivery-inquiry`)
- Drive-time routing; exact house GPS (use College Grove centroid)
- Close GitHub PRs #8/#9 from this work

## Placeholders (do not invent real values)

| Placeholder | Value |
|-------------|--------|
| Formspark | `https://submit-form.com/vwsJT57aO` + hidden `topic=local-delivery-inquiry` |
| Origin | `{ lat: 35.7869, lng: -86.6750 }` College Grove, TN 37046 centroid |
| Subscribe fallback | `34.4` / `63.2` until `unauthenticated_read_selling_plans` |
| One-time fallback | `43` / `79` |
| Product GID (existing shop product) | `gid://shopify/Product/7681726742622` |

---

## 1. Local Delivery (Hydrogen)

### Nav

`storefront/app/lib/nav.js` — insert after Locations, before Contact:

`{to: '/delivery', label: 'Delivery'}`

Header/footer already map `NAV_LINKS`. Active state via `NavLink`. Shop Now stays `/shop`.

### Route + UI

| Piece | Path |
|-------|------|
| Route | `storefront/app/routes/delivery.jsx` |
| Client UI | `storefront/app/components/DeliveryChecker.jsx` (split helpers if file grows) |
| CSS | `storefront/app/styles/delivery.css` — load from `root.jsx` like contact/shop |
| Map lib | npm `leaflet` (not unpkg). Import CSS from the package. Init only in `useEffect` (SSR-safe). Fix Vite default-marker icon URLs. |

**`delivery.jsx`:** `meta` title `Local Delivery · Fizzy Leaf`. Layout copy from the Pages plan:

- Eyebrow: `Middle Tennessee`
- H2: `Local Delivery`
- Body: If you live in the Middle TN area you might be close enough for me to just deliver Fizzy Leaf to you. Enter your address to see if you’re inside the 30-mile area around College Grove (about a 30-minute drive). If you are, send me an inquiry — this is a direct deal with me, not a Shopify checkout.
- Prices (informational): Delivery fee **$3**. 12 pack **$35**/mo · 24 pack **$65**/mo · 48 pack **$120**/mo.
- Note: **Not a one-time shop order** — those ship TN-wide from `/shop`.

First-section padding: desktop `7rem`, `≤768px` `3rem` (same as contact).

**Flow (client):**

1. Leaflet map, gold 30-mile circle around origin, OSM tiles. `scrollWheelZoom: false`. Radius 30 miles (`1609.34` m/mi).
2. Address field + “Check my address”. Label: “Enter your address to see if you are in range”.
3. Geocode: `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=…` with `Accept-Language: en`.
4. Haversine miles vs origin (earth radius **3958.8** mi). Plot visitor marker.
5. Outside / unknown: message; **hide** inquiry.
6. Inside: show miles (1 decimal) + inquiry (name, email, message). Hidden: `address`, `miles`, `lat`, `lng`, `topic=local-delivery-inquiry`. CTA: “Message me for an inquiry”.
7. Submit: same async Formspark pattern as `ContactForm` (`fetch` + `FormData` + `Accept: application/json`; Sending… / ✓ Sent! / error). Distinct ids (`delivery*` — do not reuse `#contactForm` / `#name`).

Share Formspark URL via a small `storefront/app/lib/formspark.js` (single source). Contact form can import it.

Reuse contact form-row / card classes; delivery-specific layout/prices/map in `delivery.css`. Do not extract a new CSS framework.

### CSP (`entry.server.jsx`)

Hydrogen CSP will block OSM/Nominatim unless updated. Add:

- `imgSrc`: OSM tile hosts (`https://*.tile.openstreetmap.org`, `https://tile.openstreetmap.org`)
- `connectSrc`: `https://nominatim.openstreetmap.org`
- Leaflet marker PNGs from `'self'` / `data:` (already have `data:`). After Vite icon fix, markers are bundled.

Do not load Leaflet from unpkg (would also need `scriptSrc`/`styleSrc`).

---

## 2. Live shop display prices

Keep `VARIANT_12`, `VARIANT_24`, `SELLING_PLAN_ID` unchanged. Keep fallback `PRICES` as today.

**`storefront/app/lib/product.js`**

- Add `loadDisplayPrices(storefront)`:
  1. Query product **without** selling-plan fields: `variants(first:10){edges{node{id title price{amount}}}}`.
  2. Map variant id → pack via existing GIDs (not title). Write `onetime` amounts.
  3. **Separate** query with `sellingPlanAllocations(first:5){edges{node{priceAdjustments{price{amount}}}}}`. On throw, GraphQL `errors`, null product, or empty allocations: leave `subscribe` fallback. On success: write subscribe amounts.
- Never reject the shop UI — catch inside, return fallbacks.
- `priceDisplay(pack, purchaseType, prices = PRICES)` so the configurator can pass loader prices.
- `purchaseTypeFromUnitPrice` still classifies vs display prices (fallbacks OK until subscribe read works).
- Do **not** add selling-plan fields to cart GraphQL.

**`shop.jsx` loader:** `loadDisplayPrices(context.storefront)` → `{prices}`.

**`ShopConfigurator`:** `useLoaderData()` prices; render with fallbacks if loader missing.

Server `storefront.query` is the Hydrogen equivalent of Pages `FizzyCart.ready` (no client token fetch).

---

## 3. Docs (Hydrogen is live)

| File | Change |
|------|--------|
| `docs/architecture.md` | Hydrogen is the live storefront. Add Delivery row (`/delivery`, `delivery.jsx`). Nav includes Delivery. Pages root HTML is leftover, not live. |
| `docs/behaviors.md` | DeliveryChecker flow; `loadDisplayPrices` on shop loader. |
| `docs/shopify.md` | Hydrogen live; display prices fetched; fallback table; selling-plan read still denied; **local delivery is not Shopify**. |
| `docs/styling.md` | Delivery page CSS file. |
| `CLAUDE.md` | Hydrogen/`storefront` is live; Pages root leftover. Git: commit on feature branch, never `main`. |
| `docs/rules/clean-code.md` | Add from intended diff (portable floor). |
| `docs/rules/git-workflow.md` | Add from intended diff (never write `main`). |
| `README.md` | Out of scope. `PLAN.md` | Do not edit. |

---

## 4. Verify

```bash
cd storefront && npm install && npm run lint && npm run build
```

Manual (dev server):

- [ ] Nav Delivery on every page; active on `/delivery`
- [ ] `/delivery` map + 30-mile circle; Franklin/Spring Hill in; Knoxville out; inquiry hidden until in-range
- [ ] In-range POST Formspark `vwsJT57aO` with `topic=local-delivery-inquiry`
- [ ] Mobile ≤768 first-section 3rem; hamburger only
- [ ] CSP: map tiles + geocode work (not blocked)
- [ ] `/shop` one-time matches Shopify after load (fallback then live); subscribe fallback if plan read denied
- [ ] Add subscribe line → drawer Subscribe; checkoutUrl `/cart/c/…` or `/checkouts/cn/…`
- [ ] Cart still works (no sellingPlanAllocation on cart query)

## Out of scope (repeat)

Buy Button / JS Buy SDK · Dawn theme · Admin API / charging $3 delivery SKUs · 48-pack product · emailing Christian · house GPS · drive-time · granting `unauthenticated_read_selling_plans` · Pages file deletion · unused Hydrogen skeleton routes.
