# Plan: Hydrogen storefront on `hydrogen` branch

**Date:** 2026-08-22
**Branch:** `hydrogen` (from `origin/main` @ `fb5328e`)
**Status:** Implemented + reviewed. Cutover: [2026-08-23_hydrogen-oxygen-cutover.md](2026-08-23_hydrogen-oxygen-cutover.md)
**PR:** one PR, this branch → `main`

Custom Fizzy Leaf site as a **Hydrogen** app in `storefront/`. GitHub Pages on `main` stays live. Oxygen later deploys **this branch**, root directory **`storefront`**. **Do not** point `fizzyleaf.com` DNS, **do not** turn store password off, **do not** `theme publish`.

---

## Why Hydrogen (not Liquid wrap)

| Liquid wrap | Hydrogen |
|---|---|
| `/pages/shop` needs Admin Page records | File routes: `/shop`, `/locations`, `/contact` |
| Storefront JS cart ≠ `/discount` cookie cart | Same Hydrogen cart: `/discount/:code` applies then checkout |
| Theme editor / Pages CMS | Git is source of truth |

## Transition

| Branch | Serves |
|---|---|
| `main` | GitHub Pages (`*.html` at repo root) — **live** |
| `hydrogen` | Hydrogen in `storefront/` — preview via `shopify hydrogen dev` / Oxygen |

Root `*.html` on `hydrogen` is leftover Pages source (reference). Hydrogen does not serve it.

---

## Already done (scaffold)

`shopify hydrogen init --path storefront --language js --styling none --markets none --mock-shop --no-git`

Keep these (do not rewrite):

| File | Why |
|---|---|
| `storefront/app/routes/discount.$code.jsx` | Collabs `/discount/:code` + `redirect` / leftover query (`dt_id`) |
| `storefront/app/routes/cart.jsx` | `CartForm` actions (add/update/remove/discounts) |
| `storefront/app/components/AddToCartButton.jsx` | `CartForm` LinesAdd |
| `storefront/app/components/Aside.jsx` | Drawer overlay |
| `storefront/app/components/CartMain.jsx` `CartLineItem.jsx` `CartSummary.jsx` | Cookie cart UI |
| `storefront/app/lib/context.js` `session.js` `fragments.js` | Hydrogen cart session |
| `storefront/server.js` | `storefrontRedirect` on 404 (Collabs short links) |

---

## Concrete steps

### 1. Env → Fizzy Leaf (not mock.shop)

`storefront/.env` (gitignored) and `storefront/.env.example` (committed):

```
SESSION_SECRET=<random>
PUBLIC_STORE_DOMAIN=4nrp1u-ka.myshopify.com
PUBLIC_STOREFRONT_API_TOKEN=b42a54c4c455ccdc767511135953a5bb
PUBLIC_CHECKOUT_DOMAIN=4nrp1u-ka.myshopify.com
PUBLIC_STOREFRONT_API_VERSION=2025-01
```

Token is the existing public Storefront token (`cart-api.js`). Do not invent a private token.

### 2. Chrome + CSS + images

| Source | Dest |
|---|---|
| `index.css` | `storefront/app/styles/index.css` |
| shop/locations/contact/home inline `<style>` | `storefront/app/styles/{shop,locations,contact,home}.css` |
| `img/*.webp` | `storefront/public/img/` |
| favicon | `root.jsx` `links()` → `/img/FizzyLeafIcon_favicon.webp` |

Skip Hydrogen `reset.css` (fights Fizzy chrome). Keep `app.css` overlay/aside rules (or restyle aside to Fizzy `.cart-drawer` look — look match required).

Hardcode nav (do **not** query Shopify `main-menu` / `footer` — those menus are Dawn, not this site):

| Label | `to` |
|---|---|
| Home | `/` |
| Shop | `/shop` |
| Locations | `/locations` |
| Contact | `/contact` |
| Shop Now | `/shop` |

Port hamburger + overlay + header scroll from `nav.js` into a small client component. React Router `<Link>` replaces `*.html` page-fade (CSS `pageFadeIn` on `main` is enough).

`PageLayout`: Fizzy header/footer + cart `Aside` only. **No search aside. No Shopify menu aside.**

`root.jsx` loader: **cart only** (`context.cart.get()`). Drop `HEADER_QUERY` / `FOOTER_QUERY` so missing menus cannot 500 the whole site. Keep `Analytics.Provider` (`content_for_header` equivalent — Collabs pageviews / `dt_id`).

### 3. Routes (look/behavior match `origin/main` HTML)

| Pages file | Hydrogen | Notes |
|---|---|---|
| `index.html` | `app/routes/_index.jsx` | Hero, story, Elfsight embed |
| `shop.html` | `app/routes/shop.jsx` | See §4 |
| `locations.html` | `app/routes/locations.jsx` | Filters + map; data from `locations.html` cards |
| `contact.html` | `app/routes/contact.jsx` | Formspark `https://submit-form.com/vwsJT57aO` |

`products.$handle.jsx`: `redirect('/shop')` (single product; shop page is the configurator).

Leave account/blogs/collections/search/policies/sitemap/robots as skeleton (unused). Do not spend time restyling them.

### 4. Shop cart (Hydrogen cart, Fizzy UI)

Constants (`storefront/app/lib/product.js`):

| | |
|---|---|
| Variant 12 | `gid://shopify/ProductVariant/42907503034462` |
| Variant 24 | `gid://shopify/ProductVariant/42907503067230` |
| Selling plan | `gid://shopify/SellingPlan/6531121246` |
| Prices (display) | 12: $43 / $34.40·mo · 24: $79 / $63.20·mo |

Configurator (port `shop.js`): pack 12/24, one-time vs subscribe, qty stepper, gallery thumbs, live price (`<s>` + /mo on subscribe).

Add to cart: `AddToCartButton` / `CartForm` `LinesAdd` with `merchandiseId` + `sellingPlanId` when subscribe.

Drawer: existing `Aside` type `cart` + `CartMain`. FAB + count from root `cart` promise. Checkout uses `cart.checkoutUrl` (already in `CartSummary`).

Do **not** keep `localStorage` `cart-api.js` — that was the two-cart bug vs `/discount`.

TN-only notice copy stays on the shop page.

### 5. Locations + contact

- Port `locations.js` filters/map (`embed` iframe, no API key) as a client component. Shop list = current `locations.html` cards (including Settlers / Good Cup / Franklin Bakehouse / Humphreys / Delvin).
- Contact: client `fetch` POST Formspark, Sending… / ✓ Sent! / error (port `contact.js`).

### 6. `/discount/:code`

Already implemented. Do not strip `dt_id`. Confirm `redirect` stays first-party-only (existing `//` guard).

### 7. Docs

Update `CLAUDE.md` **on this branch only**: Pages `main` still no-framework; `storefront/` is Hydrogen (build + `shopify hydrogen dev --path storefront`). Red lines: no DNS, no password off, no theme publish, never push `main`.

`docs/shopify.md`: Hydrogen path + `/discount` + Oxygen root `storefront`.

`docs/architecture.md`: Hydrogen is the Shopify-hosted storefront; Pages remains live until cutover.

### 8. Verify

```bash
cd storefront && npm install && npm run build && npm run lint
shopify hydrogen dev --path storefront   # or cd storefront && npm run dev
```

Checklist:

- [ ] `/` home look matches Pages
- [ ] `/shop` add 12/24 one-time + subscribe → drawer → checkout URL `/cart/c/…` or `/checkouts/cn/…`
- [ ] `/locations` city filter + map
- [ ] `/contact` Formspark success
- [ ] `/discount/TEST?redirect=/shop&dt_id=0` 303s to `/shop?dt_id=0` (code applies when TEST is a real discount)
- [ ] `main` / GitHub Pages files unchanged in intent (no DNS)

---

## Out of scope

- `fizzyleaf.com` DNS / store password off / `shopify theme publish`
- `shopify hydrogen link` / Oxygen production deploy (needs Hydrogen channel in Admin — after this PR)
- Delivery page (PR #8)
- Customer accounts restyle
- Native Shopify contact form
- Emailing Christian
- Changing variant / selling-plan ids / token unless checkout fails
- Merging `hydrogen` into `main` (that cutover is later)

---

## Git

Commits: `hydrogen: 1. … 2. …`  
Push `hydrogen` only. One PR vs `main`.
