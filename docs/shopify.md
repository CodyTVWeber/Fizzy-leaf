# Shopify integration

Hydrogen at the **repository root** is the **live** storefront on Oxygen.

| Surface | Cart | Status |
|---|---|---|
| Hydrogen (repo root) | Cookie cart via `@shopify/hydrogen` `CartForm` | **Live** (Oxygen) |

**No Buy Button SDK / iframe** — can't do subscriptions cleanly and can't match Fizzy chrome.

## Store / product constants
| Thing | Value |
|-------|-------|
| Store domain | `4nrp1u-ka.myshopify.com` |
| Storefront API | `https://{domain}/api/2025-01/graphql.json` |
| Public Storefront token | `bf82cd9640240e8199e973551385c407` |
| Product | Roselle Hibiscus, id `7681726742622` |
| Variant 12-Pack | `42907503034462` |
| Variant 24-Pack | `42907503067230` |
| Selling plan (Subscribe & Save 20%, monthly) | `6531121246` (both variants) |

GIDs: `gid://shopify/ProductVariant/<id>`, `gid://shopify/SellingPlan/6531121246`.

Hydrogen mirrors these in `app/lib/product.js` + `.env` (`PUBLIC_STORE_DOMAIN`, `PUBLIC_STOREFRONT_API_TOKEN`, …).

## Pricing (display)
Shop UI loads display prices from Storefront API (`loadDisplayPrices`). One-time amounts come from variant `price.amount`. Subscribe amounts come from `sellingPlanAllocations` (this token has `unauthenticated_read_selling_plans`). Fallbacks below are used only if that fetch fails. Checkout prices are always live from Shopify cart + selling plan.

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

## `/discount/:code` (Hydrogen)
`app/routes/discount.$code.jsx`: applies code, 303 redirects. Keeps leftover query (`dt_id`). First-party redirect only (`//` → `/`).

## Oxygen / cutover

**Done:** Hydrogen on `main` (repo root) → Oxygen → DNS `fizzyleaf.com` / `www` → live.

Walkthrough: [docs/plans/2026/08/2026-08-23_hydrogen-oxygen-cutover.md](plans/2026/08/2026-08-23_hydrogen-oxygen-cutover.md). Checkout-domain fallback: [2026-08-28](plans/2026/08/2026-08-28_post-launch-checkout-domain.md).

**Still Admin (not code):** GitHub Pages **Unpublish** (`milfordcwm.github.io/Fizzy-leaf/` still builds). Optional: set Oxygen `PUBLIC_CHECKOUT_DOMAIN` (code falls back to `PUBLIC_STORE_DOMAIN`). Collabs links: `https://www.fizzyleaf.com/discount/CODE?redirect=/shop&dt_id=…`.

Do **not** store password off / `shopify theme publish` without an explicit yes (exposes Dawn on `*.myshopify.com`).

## Gotchas / launch gates
- **`PUBLIC_CHECKOUT_DOMAIN`**: Analytics needs it. Loader/CSP use `checkoutDomain(env)` → env var or `PUBLIC_STORE_DOMAIN`.
- **Store password**: guest checkout without `/cart/c/…` needs it OFF — also exposes the themed store.
- **Shipping zones**: TN only before real orders.
- API version pinned (`2025-01`).

## Contact form
Formspark `https://submit-form.com/vwsJT57aO` (`~/lib/formspark.js` — `ContactForm`, delivery inquiry). Not Shopify.
