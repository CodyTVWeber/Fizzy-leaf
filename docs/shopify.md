# Shopify integration

Hydrogen (`storefront/`) is the **live** storefront. Root Pages `*.html` + `cart-api.js` are leftover source.

| Surface | Cart | Status |
|---|---|---|
| Hydrogen (`storefront/`) | Cookie cart via `@shopify/hydrogen` `CartForm` | **Live** (Oxygen) |
| GitHub Pages (`main`, root `*.html`) | `cart-api.js` + `localStorage` cart id | Leftover — not live |

**No Buy Button SDK / iframe** — can't do subscriptions cleanly and can't match Fizzy chrome.

## Store / product constants
| Thing | Value |
|-------|-------|
| Store domain | `4nrp1u-ka.myshopify.com` |
| Storefront API | `https://{domain}/api/2025-01/graphql.json` |
| Public Storefront token | `b42a54c4c455ccdc767511135953a5bb` |
| Product | Roselle Hibiscus, id `7681726742622` |
| Variant 12-Pack | `42907503034462` |
| Variant 24-Pack | `42907503067230` |
| Selling plan (Subscribe & Save 20%, monthly) | `6531121246` (both variants) |

GIDs: `gid://shopify/ProductVariant/<id>`, `gid://shopify/SellingPlan/6531121246`.

Hydrogen mirrors these in `storefront/app/lib/product.js` + `storefront/.env` (`PUBLIC_STORE_DOMAIN`, `PUBLIC_STOREFRONT_API_TOKEN`, …).

## Pricing (display)
Shop UI loads display prices server-side via `loadDisplayPrices(storefront)` in the shop loader. One-time amounts come from variant `price.amount`. Subscribe amounts need `sellingPlanAllocations` — **still denied** without `unauthenticated_read_selling_plans`; fallbacks below stay until that scope is granted. Checkout prices are always live from Shopify cart + selling plan.

| Pack | One-time (fallback) | Subscribe (−20%, fallback) |
|------|----------|------------------|
| 12 | $43.00 | $34.40/mo |
| 24 | $79.00 | $63.20/mo |

**Local delivery is not Shopify.** `/delivery` is a custom 30-mile map + inquiry (Formspark `vwsJT57aO`, `topic=local-delivery-inquiry`) for a direct deal with Christian. Address check geocodes on the server (US Census first, Nominatim fallback). Listed 12/$35, 24/$65, 48/$120 + $3 are informational only — no cart, no 48-pack variant, no checkout.

## Checkout

### Hydrogen
1. Shop configurator → `CartForm` `LinesAdd` with `merchandiseId` + optional `sellingPlanId`.
2. Cart session cookie (Hydrogen) — same cart as `/discount/:code`.
3. Aside drawer + `cart.checkoutUrl` in `CartSummary`.

### Pages (`cart-api.js`, leftover)
1. `FizzyCart.add` → `cartCreate` / `cartLinesAdd` (+ `sellingPlanId` on subscribe).
2. Cart id in `localStorage['fizzy_cart_id']`.
3. Drawer → `checkoutUrl` (`/cart/c/...` → `/checkouts/cn/...`) bypasses store password (permalinks do not).

## `/discount/:code` (Hydrogen)
`storefront/app/routes/discount.$code.jsx`: applies code, 303 redirects. Keeps leftover query (`dt_id`). First-party redirect only (`//` → `/`).

## Oxygen / cutover
Order (do not skip): merge PR #10 to **`main`** (delete `hydrogen`) → Oxygen production **`main`**, root **`storefront`** → verify Oxygen URL → **DNS** `fizzyleaf.com` → **then** turn off GitHub Pages.

Full walkthrough: [docs/plans/2026/08/2026-08-23_hydrogen-oxygen-cutover.md](plans/2026/08/2026-08-23_hydrogen-oxygen-cutover.md).

Do **not** DNS / password off / theme publish until that plan’s step is explicitly approved.

## Gotchas / launch gates
- **Store password**: checkout completes when password is OFF (also exposes themed store).
- **Shipping zones**: TN only before real orders.
- API version pinned (`2025-01`).

## Contact form
Formspark `https://submit-form.com/vwsJT57aO` (`~/lib/formspark.js` — `ContactForm`, delivery inquiry). Not Shopify.
