# Plan: Live Shopify prices + Local Delivery page

**Date:** 2026-08-22
**Branch:** `plan/live-prices-and-local-delivery` (implement on same branch → one PR)
**Status:** In progress (call 2026-08-22: local delivery is **inquiry**, not signup/checkout)
**Base:** `origin/main` @ `fb5328e`

Prep the custom GitHub-hosted site (Storefront Cart API, **not** Buy Button / JS Buy SDK) so Christian can keep it if he does not migrate to the default Shopify theme. Wire what we can; **placeholders** for admin-only / missing-access pieces.

---

## Context

Verified on `origin/main` (`cart-api.js`, `shop.js`, `docs/shopify.md`, live Storefront API):

| Fact | Value |
|------|--------|
| Shop display prices | Hardcoded `PRICES` in `cart-api.js` (12: $43 / $34.40; 24: $79 / $63.20) |
| Checkout prices | Live from Shopify (`cartCreate` + selling plan `6531121246`) |
| Token | `b42a54c4c455ccdc767511135953a5bb` — **lacks** `unauthenticated_read_selling_plans` |
| Reading `sellingPlanGroups` / allocations | `ACCESS_DENIED` (product query returns null if those fields are included) |
| Variants | 12 `42907503034462`, 24 `42907503067230`. **No 48-pack variant** in Shopify |
| Contact | `contact.html` → Formspark `https://submit-form.com/vwsJT57aO` via `contact.js` |
| Pages | `index.html`, `shop.html`, `locations.html`, `contact.html` — chrome copied on each (nav-desktop, nav-overlay, footer-links) |

Christian (texts, 2026-08): **Local Delivery** page — 30 miles of College Grove; monthly 12/$35, 24/$65, 48/$120 + $3. These prices are **not** shop Subscribe & Save ($34.40 / $63.20) and **not** one-time shop ($43 / $79).

**Call 2026-08-22:** local delivery is **not a Shopify buy**. Direct inquiry with Christian. Flow: map + “Enter your address to see if you are in range” → in-range “Message me for an inquiry”. Mileage **or** ~30-minute drive; no-key implementation is a **30-mile haversine circle** (copy: about a 30-minute drive). Drive-time routing stays out of scope.

Emails (decoded): he asked for GitHub site + Shopify button; later asked about Storefront API vs rebuild. Custom site **already uses** Storefront Cart API. Buy Button cannot do subscriptions.

---

## Why this approach

1. **Shop prices:** fetch one-time variant `price.amount` (works today). Try selling-plan prices in a **separate** query; on deny, keep `PRICES.subscribe` fallback. Do not put `sellingPlanAllocation` on every cart query until the scope exists (would break cart).
2. **Local delivery:** custom map + inquiry, **not** Shopify checkout. Different SKUs/prices (informational); no 48-pack variant. Radius check in the browser; in-range inquiry POSTs to existing Formspark `vwsJT57aO` with `topic=local-delivery-inquiry`.
3. **Stay static:** new `delivery.html` + `delivery.js` matching contact/shop IIFE pattern. No framework, no Buy Button, no JS Buy SDK.
4. **Placeholders** instead of blocking on Shopify admin / new Formspark form / exact house GPS.

---

## Placeholders (do not invent real values)

| Placeholder | Where | Swap when |
|-------------|--------|-----------|
| Formspark delivery form | Reuse contact `vwsJT57aO` + hidden `topic=local-delivery-inquiry` | Optional later: dedicated Formspark form |
| `COLLEGE_GROVE` lat/lng | `delivery.js` `ORIGIN` | Optional: Christian’s house GPS. Until then: College Grove, TN 37046 centroid **35.7869, -86.6750** (town, not a street address) |
| `PRICES[pack].subscribe` fallback | `cart-api.js` `34.4` / `63.2` | Storefront token gains `unauthenticated_read_selling_plans` |
| 48-pack Shopify variant | **none** | Not needed for this PR (delivery is not cart) |

Inquiry POSTs immediately (no `REPLACE_` placeholder). Hidden fields: `address`, `miles`, `lat`, `lng`, `topic`.

---

## Concrete steps

### 1. Live shop display prices — `cart-api.js`, `shop.js`, `shop.html`

**`cart-api.js`**

- Keep `CFG` (domain, token, variant ids, selling plan id, API `2025-01`) **unchanged**.
- Keep fallback `PRICES` as today.
- Add `loadPrices()`:
  1. Query product `gid://shopify/Product/7681726742622` **without** selling-plan fields: `variants(first:10){edges{node{id title price{amount}}}}`.
  2. Map variant id → pack via existing `CFG.variantIds` (not title string). Write `PRICES[pack].onetime = Number(amount)`.
  3. **Separate** query including `sellingPlanAllocations(first:5){edges{node{priceAdjustments{price{amount}}}}}`. On `errors`, null product, or empty allocations: leave `PRICES[pack].subscribe` as fallback. On success: write subscribe amounts.
- Export `FizzyCart.ready` = `loadPrices()` promise (never reject the shop UI — catch inside, keep fallbacks).
- Keep `classify()` as unit-price vs `PRICES` (still required until selling-plan read works).
- Do **not** add `sellingPlanAllocation` to `CART_FIELDS` in this PR.

**`shop.js`**

- Call `renderProduct()` after `FizzyCart.ready` (and once immediately with fallback so first paint isn’t blank).

**`shop.html`**

- Update the HTML comment pricing block: display is loaded from Storefront API; listed numbers are fallbacks.

### 2. Local Delivery page — `delivery.html`, `delivery.js`

**`delivery.html`** — copy chrome from `contact.html` (header, hamburger overlay, footer, `index.css` + `nav.js`). Title: `Local Delivery · Fizzy Leaf`. Inline `<style>` (page-owned, same as contact). First-section padding: desktop `7rem`, `≤768px` `3rem`.

**Copy (cleaned from Christian):**

- Eyebrow: `Middle Tennessee`
- H1/H2: `Local Delivery`
- Body: *If you live in the Middle TN area you might be close enough for me to just deliver Fizzy Leaf to you. Enter your address to see if you’re inside the 30-mile area around College Grove (about a 30-minute drive). If you are, send me an inquiry — this is a direct deal with me, not a Shopify checkout.*
- Price list (informational): **Delivery fee $3.** 12 pack **$35**/mo · 24 pack **$65**/mo · 48 pack **$120**/mo.
- Note: **Not a one-time shop order** — those ship TN-wide from `shop.html`.

**Flow**

1. Leaflet map with 30-mile circle around College Grove. Address box + “Check my address”. Label: “Enter your address to see if you are in range”.
2. Geocode via **Nominatim** (Census has no CORS):

   `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=…`

   Haversine miles vs `ORIGIN` `{ lat: 35.7869, lng: -86.6750 }`. Radius **30**. Plot visitor marker.
3. **Outside / unknown:** message; **hide** inquiry.
4. **Inside:** show miles (1 decimal) + inquiry: name, email, message. Hidden: `address`, `miles`, `lat`, `lng`, `topic=local-delivery-inquiry`. CTA: “Message me for an inquiry”. No pack select, no cart.
5. Submit: same async pattern as `contact.js` (`fetch` + `FormData` + `Accept: application/json`; Sending… / ✓ Sent! / error). New IIFE in `delivery.js` — **do not** reuse `#contactForm` ids.

Reuse contact form-row / card CSS patterns (copy into delivery’s inline style; do not extract a shared CSS module).

### 3. Nav + footer — all pages

Add **Delivery** (`delivery.html`) **after Locations, before Contact** in:

| Slot | Pages |
|------|--------|
| `.nav-desktop` | `index.html`, `shop.html`, `locations.html`, `contact.html`, `delivery.html` |
| `#navOverlay` | same |
| `.footer-links` | same |

Keep “Shop Now” CTA pointing at `shop.html`. Mark `active` on Delivery only on `delivery.html`.

### 4. Docs (keep in sync — this repo’s source of truth)

| File | Change |
|------|--------|
| `docs/architecture.md` | Add Delivery row (`delivery.html` / `delivery.js`); pages table |
| `docs/behaviors.md` | `delivery.js` flow; `cart-api.js` `loadPrices` / `ready` |
| `docs/shopify.md` | Display prices now fetched; fallback table; selling-plan read still denied; **local delivery is not Shopify** |
| `README.md` | **Out of scope** (already stale vs architecture) |

Do **not** edit `PLAN.md` (historical merge plan).

### 5. Verify

```bash
node --check cart-api.js shop.js delivery.js contact.js nav.js
```

No npm test suite. Manual: `python3 -m http.server` → shop prices render (fallback then live one-time); subscribe still shows ~$34.40/$63.20 if plan read denied; cart add + drawer; delivery map circle; in-radius (Franklin/Spring Hill) shows inquiry; out (e.g. Knoxville) hides it; inquiry POST to Formspark; mobile ≤768 padding; no-flash bg.

---

## Out of scope

- Buy Button JS / JS Buy SDK (discontinued; cannot do subscriptions)
- Migrating to default Shopify / Dawn theme
- Changing Storefront token, variant ids, selling plan id, or API version
- Shopify Admin API, billing, or charging the $3 + pack prices
- Dedicated Formspark delivery form (reuses contact id + `topic` for now)
- 48-pack Shopify product
- Emailing Christian / investor copy
- Exact house GPS until he provides it
- Drive-time routing (30 **miles**, not 30 minutes)
- `unauthenticated_read_selling_plans` grant (document only)

---

## Manual verification

- [ ] Shop 12/24 one-time matches live Shopify (today $43 / $79) after load
- [ ] Shop subscribe still shows fallback if selling-plan query denied
- [ ] Add subscribe line → drawer labels Subscribe; checkoutUrl is `/cart/c/…` or `/checkouts/cn/…`
- [ ] Delivery nav on every page; active state on delivery page
- [ ] College Grove / Franklin → in; far TN / other state → out
- [ ] Inquiry hidden until in-radius; no pack select / no Shopify buy
- [ ] In-range inquiry POST to Formspark `vwsJT57aO` with `topic=local-delivery-inquiry`
- [ ] `node --check` on touched JS
- [ ] Phone viewport: hamburger only, first section 3rem top padding
