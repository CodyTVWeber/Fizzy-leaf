# Shopify integration

The **live** customer site is still GitHub Pages (`fizzyleaf.com`). Shopify handles cart → checkout via Storefront Cart API (`cart-api.js` + `shop.js`). **No Buy Button SDK, no iframe.**

## Unpublished theme wrap (`theme/`)

Liquid wrap of the Pages HTML, pushed **unpublished** only. Does not replace Dawn until a later cutover.

```bash
shopify theme push --unpublished --path theme --store fizzyleaf.myshopify.com
```

| Do | Don't |
|----|--------|
| Preview via CLI `preview_url` / `?preview_theme_id=` | `shopify theme publish` |
| Keep store password **on** | Connect `fizzyleaf.com` DNS |
| Assign Online Store pages Shop / Locations / Contact to `page.shop` / `page.locations` / `page.contact` | GitHub “Connect from GitHub” on `main` (root is not a theme) |

GitHub Pages ignores `theme/`. Root `*.html` is unchanged.

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

## Pricing (display only; real prices are server-side)
| Pack | One-time | Subscribe (−20%) |
|------|----------|------------------|
| 12 | $43.00 | $34.40/mo |
| 24 | $79.00 | $63.20/mo |

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
