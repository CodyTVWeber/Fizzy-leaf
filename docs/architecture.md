# Architecture

## Two storefronts

| | GitHub Pages (`main`) | Hydrogen (`hydrogen` / `storefront/`) |
|--|--|--|
| Stack | Plain HTML/CSS/JS — **no build** | Shopify Hydrogen + React Router |
| Host | GitHub Pages — **live** | `shopify hydrogen dev` now; Oxygen later (root `storefront`) |
| Cart | `cart-api.js` + `localStorage` | Hydrogen cookie cart (`CartForm`) |
| Routes | `*.html` | `/`, `/shop`, `/locations`, `/contact` |

Root `*.html` on `hydrogen` is leftover Pages source (reference). Hydrogen does not serve it. Pages stays live until cutover.

## Pages (marketing)

| Page | Pages file | Hydrogen route |
|------|------------|----------------|
| Home | `index.html` | `app/routes/_index.jsx` |
| Shop | `shop.html` | `app/routes/shop.jsx` |
| Locations | `locations.html` | `app/routes/locations.jsx` |
| Contact | `contact.html` | `app/routes/contact.jsx` |

`products.$handle` redirects to `/shop` (single-product configurator).

## Pages shared chrome
- `index.css` — palette, nav, footer. See [styling.md](styling.md).
- `nav.js` — hamburger, header scroll, page-fade. See [behaviors.md](behaviors.md).
- `util.js` — `FizzyLeaf.fadeSwap()`.

## Hydrogen chrome
- Styles: `storefront/app/styles/{index,home,shop,locations,contact,shop-cart,app}.css` (no `reset.css`).
- `SiteHeader` / `SiteFooter` — hardcoded `/` `/shop` `/locations` `/contact` (no Shopify menus).
- Cart: `Aside` + `CartMain` + `CartFab`; add via `CartForm`.
- Images: `storefront/public/img/`.

## Repo
- Remote `milfordcwm/Fizzy-leaf`. Work branch for this port: `hydrogen`.
- `.gitignore`: `tmp/`, `storefront/.env`, `storefront/node_modules`, etc.

See also: [styling.md](styling.md) · [animations.md](animations.md) · [behaviors.md](behaviors.md) · [shopify.md](shopify.md) · [images.md](images.md) · [plan](plans/2026/08/2026-08-22_hydrogen-storefront.md)
