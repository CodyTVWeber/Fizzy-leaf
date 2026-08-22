# Shopify integration

The site is a custom storefront; Shopify only handles cart + checkout. Implemented in `cart-api.js` (data layer) and `shop.js` (UI). **No Buy Button SDK, no iframe** — it can't do subscriptions and can't be styled.

## Store / product constants (`cart-api.js`)
| Thing | Value |
|-------|-------|
| Store domain | `4nrp1u-ka.myshopify.com` |
| Storefront API | `https://{domain}/api/2025-01/graphql.json` |
| Storefront token (header `X-Shopify-Storefront-Access-Token`) | `b42a54c4c455ccdc767511135953a5bb` |
| Product | Roselle Hibiscus, id `7681726742622` |
| Variant 12-Pack | `42907503034462` |
| Variant 24-Pack | `42907503067230` |
| Selling plan (Subscribe & Save 20%, monthly) | `6531121246` (applies to **both** variants) |

GIDs: `gid://shopify/ProductVariant/<id>`, `gid://shopify/SellingPlan/6531121246`.

## Pricing (display)
Shop UI loads display prices from Storefront API (`loadPrices` → `FizzyCart.ready`). One-time amounts come from variant `price.amount`. Subscribe amounts need `sellingPlanAllocations` — **still denied** without `unauthenticated_read_selling_plans`; fallbacks below stay until that scope is granted. Checkout prices are always live from Shopify cart + selling plan.

| Pack | One-time (fallback) | Subscribe (−20%, fallback) |
|------|----------|------------------|
| 12 | $43.00 | $34.40/mo |
| 24 | $79.00 | $63.20/mo |

**Local delivery is not Shopify.** Monthly College Grove delivery (12/$35, 24/$65, 48/$120 + $3 fee) is lead-gen on `delivery.html` / Formspark — different SKUs/prices; no cart or 48-pack variant.

## How checkout works
1. `FizzyCart.add(pack, type, qty)` → `cartCreate` (first add) or `cartLinesAdd`. Subscribe attaches `sellingPlanId`.
2. Cart id persisted in `localStorage['fizzy_cart_id']`; reused across pages. Stale/expired id self-heals (clears + recreates).
3. Drawer shows lines (`cartLinesUpdate`/`cartLinesRemove` for ±/remove) and a `checkoutUrl`.
4. `checkoutUrl` (`/cart/c/...` → `/checkouts/cn/...`) goes straight to Shopify checkout and **bypasses the store password gate** — unlike a `/cart/{variant}:1` permalink, which is password-gated.

## Subscription line detection
The storefront token lacks `unauthenticated_read_selling_plans`, so `sellingPlanAllocation` can't be read back. The drawer infers one-time vs subscribe from the **line unit price** vs the `PRICES` map (`cart-api.js` `classify()`).

## Gotchas / launch gates
- **Store password**: checkout only completes when the online-store password is OFF. Turning it off also makes the Shopify themed store publicly reachable (same gate) — keep customers on the custom site; optionally redirect the Dawn theme to it.
- **Shipping zones**: restrict to Tennessee in Shopify admin before real orders (TN-only product).
- API version is pinned (`2025-01`); bump deliberately.

## Contact form (separate)
`contact.js` POSTs to `https://submit-form.com/vwsJT57aO` (Formspark) via `fetch`, JSON `Accept`. Not Shopify.
