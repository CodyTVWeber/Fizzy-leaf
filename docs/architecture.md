# Architecture

## Live storefront

**Hydrogen** (`storefront/` on Oxygen) is the live site at fizzyleaf.com. Root `*.html` on `main` is leftover Pages source — not served in production.

| | Hydrogen (`storefront/`) | Pages (repo root `*.html`) |
|--|--|--|
| Stack | Shopify Hydrogen + React Router | Plain HTML/CSS/JS — **no build** |
| Host | Oxygen (production) | GitHub Pages — **not live** |
| Cart | Hydrogen cookie cart (`CartForm`) | `cart-api.js` + `localStorage` |
| Routes | `/`, `/shop`, `/locations`, `/delivery`, `/contact` | `*.html` |

## Pages (Hydrogen routes)

| Page | Leftover Pages file | Hydrogen route |
|------|---------------------|----------------|
| Home | `index.html` | `app/routes/_index.jsx` |
| Shop | `shop.html` | `app/routes/shop.jsx` |
| Locations | `locations.html` | `app/routes/locations.jsx` |
| Delivery | — | `app/routes/delivery.jsx` |
| Contact | `contact.html` | `app/routes/contact.jsx` |

`products.$handle` redirects to `/shop` (single-product configurator).

## Pages shared chrome (leftover)
- `index.css` — palette, nav, footer. See [styling.md](styling.md).
- `nav.js` — hamburger, header scroll, page-fade. See [behaviors.md](behaviors.md).
- `util.js` — `FizzyLeaf.fadeSwap()`.

## Hydrogen chrome
- Styles: `storefront/app/styles/{index,home,shop,locations,delivery,contact,shop-cart,app}.css` (no `reset.css`).
- `SiteHeader` / `SiteFooter` — `NAV_LINKS` (`/`, `/shop`, `/locations`, `/delivery`, `/contact`); Shop Now stays `/shop`.
- Cart: `Aside` + `CartMain` + `CartFab`; add via `CartForm`.
- Images: `storefront/public/img/`.

## Repo
- Remote `milfordcwm/Fizzy-leaf`. Feature branches off `main`; Hydrogen work on `storefront/`.
- `.gitignore`: `tmp/`, `storefront/.env`, `storefront/node_modules`, etc.

See also: [styling.md](styling.md) · [animations.md](animations.md) · [behaviors.md](behaviors.md) · [shopify.md](shopify.md) · [images.md](images.md) · [plan](plans/2026/08/2026-08-22_hydrogen-storefront.md)
