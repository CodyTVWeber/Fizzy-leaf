# Architecture

## Live storefront

**Hydrogen** at the **repository root**, deployed on Oxygen — live at fizzyleaf.com.

| | Hydrogen (repo root) |
|--|--|
| Stack | Shopify Hydrogen + React Router |
| Host | Oxygen (production) |
| Cart | Hydrogen cookie cart (`CartForm`) |
| Routes | `/`, `/shop`, `/locations`, `/delivery`, `/contact` |

## Pages (Hydrogen routes)

| Page | Hydrogen route |
|------|----------------|
| Home | `app/routes/_index.jsx` |
| Shop | `app/routes/shop.jsx` |
| Locations | `app/routes/locations.jsx` |
| Delivery | `app/routes/delivery.jsx` |
| Contact | `app/routes/contact.jsx` |

`products.$handle` redirects to `/shop` (single-product configurator).

## Hydrogen chrome
- Styles: `app/styles/{index,home,shop,locations,delivery,contact,shop-cart,app}.css` (no `reset.css`).
- `SiteHeader` / `SiteFooter` — `NAV_LINKS` (`/`, `/shop`, `/locations`, `/delivery`, `/contact`); Shop Now stays `/shop`.
- Cart: `Aside` + `CartMain` + `CartFab`; add via `CartForm`.
- Images: `public/img/`.

## Repo
- Remote `milfordcwm/Fizzy-leaf`. Feature branches off `main`.
- `.gitignore`: `tmp/`, `.env`, `node_modules`, etc.

See also: [styling.md](styling.md) · [animations.md](animations.md) · [behaviors.md](behaviors.md) · [shopify.md](shopify.md) · [images.md](images.md) · [plan](plans/2026/08/2026-08-22_hydrogen-storefront.md)
