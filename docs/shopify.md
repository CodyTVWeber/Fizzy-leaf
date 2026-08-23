# Shopify integration

Two storefront paths share the same store + product constants.

| Surface | Cart | Status |
|---|---|---|
| GitHub Pages (`main`, root `*.html`) | `cart-api.js` + `localStorage` cart id | **Live** |
| Hydrogen (`hydrogen`, `storefront/`) | Cookie cart via `@shopify/hydrogen` `CartForm` | Preview / Oxygen later |

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

## Pricing (display only; real prices are server-side)
| Pack | One-time | Subscribe (−20%) |
|------|----------|------------------|
| 12 | $43.00 | $34.40/mo |
| 24 | $79.00 | $63.20/mo |

## Checkout

### Pages (`cart-api.js`)
1. `FizzyCart.add` → `cartCreate` / `cartLinesAdd` (+ `sellingPlanId` on subscribe).
2. Cart id in `localStorage['fizzy_cart_id']`.
3. Drawer → `checkoutUrl` (`/cart/c/...` → `/checkouts/cn/...`) bypasses store password (permalinks do not).

### Hydrogen
1. Shop configurator → `CartForm` `LinesAdd` with `merchandiseId` + optional `sellingPlanId`.
2. Cart session cookie (Hydrogen) — same cart as `/discount/:code`.
3. Aside drawer + `cart.checkoutUrl` in `CartSummary`.

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
Formspark `https://submit-form.com/vwsJT57aO` (Pages `contact.js` / Hydrogen `ContactForm`). Not Shopify.
