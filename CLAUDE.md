# Fizzy Leaf — site guide

Marketing + commerce for Fizzy Leaf sparkling hibiscus tea (Middle TN).

## Two surfaces

| Branch / path | What |
|---|---|
| `main` + repo-root `*.html` | **Live** GitHub Pages — plain HTML/CSS/JS, no build |
| `hydrogen` + `storefront/` | Hydrogen (React Router) storefront — Shopify cart/session; Oxygen later |

## Run / verify

**Pages (`main` / root HTML):** open any `*.html`, or `python3 -m http.server` → `index.html`. Lint: `node --check <file>.js`.

**Hydrogen:**
```bash
cd storefront && npm install && npm run dev
# or: shopify hydrogen dev --path storefront
npm run build && npm run lint
```

## Red lines
- **`main` / root HTML:** no bundler/framework; page bg on `<html>`; fade `main`/`.site-footer` only; `FADE_OUT_MS` ↔ CSS; mobile ≤768px first-section padding 3rem.
- **Do not** point `fizzyleaf.com` DNS, turn store password off, `shopify theme publish`, or push straight to `main` for Hydrogen cutover.
- **Don't touch Shopify constants** (variant/selling-plan ids, token, API version) without intent — [docs/shopify.md](docs/shopify.md).
- Images: WebP, wire new ones, downscale first.
- Commit only when asked (PIR implementer may commit/push `hydrogen` only).

## Detailed references
| Topic | Doc |
|-------|-----|
| Structure / Hydrogen vs Pages | [docs/architecture.md](docs/architecture.md) |
| Palette, tokens, typography | [docs/styling.md](docs/styling.md) |
| Motion | [docs/animations.md](docs/animations.md) |
| Behaviors | [docs/behaviors.md](docs/behaviors.md) |
| Cart / `/discount` / Oxygen | [docs/shopify.md](docs/shopify.md) |
| Images | [docs/images.md](docs/images.md) |
| Hydrogen port plan | [docs/plans/2026/08/2026-08-22_hydrogen-storefront.md](docs/plans/2026/08/2026-08-22_hydrogen-storefront.md) |
