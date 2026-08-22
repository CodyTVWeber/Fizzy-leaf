# Fizzy Leaf — site guide

Marketing + commerce site for Fizzy Leaf sparkling hibiscus tea (Middle TN). Custom storefront; Shopify handles checkout only.

## Run / verify (no build step)
- View: open any `*.html`, or `python3 -m http.server` then load `http://localhost:PORT/index.html`.
- Lint JS: `node --check <file>.js` (syntax only — this is NOT a node app).
- Manual test: serve + click through (cart/checkout, locations map, contact form). Checkout reaching `/checkouts/cn/...` = success.

## Red lines
- **No build step, bundler, framework, or dependencies.** Plain HTML/CSS/JS only.
- **Don't break the no-flash background**: page bg stays on `<html>`; transitions fade `main`/`.site-footer` only — never the navbar/hamburger.
- **Page-fade timing is coupled**: `FADE_OUT_MS` in `nav.js` must equal the CSS fade-out duration. Change together.
- **Don't touch Shopify constants** (store/variant/selling-plan ids, token, API version, GraphQL) without intent — see [docs/shopify.md](docs/shopify.md).
- **Mobile (≤768px)**: navbar is hidden (floating hamburger only); keep first-section top padding at 3rem, not the desktop 7rem.
- Images are WebP and pruned if unreferenced — wire up any new image; downscale before adding.
- **Git:** commit + push on the current feature branch. **Never** commit or push to `main`/`master`.
- **`theme/`:** unpublished wrap only. Do **not** `theme publish`, turn the store password off, or connect `fizzyleaf.com` DNS from this branch.

## Detailed references
| Topic | Doc |
|-------|-----|
| Structure, pages, shared-chrome pattern, constraints | [docs/architecture.md](docs/architecture.md) |
| Palette, tokens + aliasing, typography, breakpoints | [docs/styling.md](docs/styling.md) |
| Page transitions, button/drawer/FAB motion, reduced-motion | [docs/animations.md](docs/animations.md) |
| Per-module JS behavior (nav, cart, gallery, map, form) | [docs/behaviors.md](docs/behaviors.md) |
| Cart/checkout, subscriptions, tokens, launch gates | [docs/shopify.md](docs/shopify.md) |
| Image conventions, optimization, history | [docs/images.md](docs/images.md) |
