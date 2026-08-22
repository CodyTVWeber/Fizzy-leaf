# Architecture

## Hard constraints
- **Plain static site**: hand-written HTML + CSS + JS. **No build step, no bundler, no framework, no node app.** `node --check` is used only as a syntax linter.
- Open `*.html` directly or via any static server. No install.
- Hosting target **today**: GitHub Pages (`*.html` at repo root). Shopify handles cart→checkout only (see [shopify.md](shopify.md)).
- **`theme/`**: unpublished Shopify Liquid wrap of the same pages. Ignored by Pages. Not the live theme until a later DNS/publish cutover.

## Pages (each a standalone `.html`)
| Page | File | Purpose |
|------|------|---------|
| Home | `index.html` | Hero (logo + title), Our Story, Instagram (Elfsight embed) |
| Shop | `shop.html` | Product configurator + slide-out cart drawer |
| Locations | `locations.html` | 18 retail shops, city filter, embedded Google map |
| Contact | `contact.html` | Async contact form |

## Shared chrome (loaded on every page)
- `index.css` — palette tokens, base, navbar, footer, page-transition. See [styling.md](styling.md).
- `nav.js` — mobile menu, header scroll shadow, page-fade transitions. See [behaviors.md](behaviors.md).
- `util.js` — `FizzyLeaf.fadeSwap()` cross-fade helper for `<img>`/`<iframe>`.

## Page-specific code
| Page | CSS | JS |
|------|-----|-----|
| Home | inline `<style>` | — (nav.js only) |
| Shop | inline `<style>` | `cart-api.js` (data layer) + `shop.js` (UI) |
| Locations | inline `<style>` | `locations.js` |
| Contact | inline `<style>` | `contact.js` |

**Pattern**: shared rules live in `index.css`; each page keeps its section CSS in its own inline `<style>` so pages stay self-contained. Page JS is a single IIFE module, ES5 style (`var` + `function`), `'use strict'`.

## Repo
- Git repo; work branch `feat/final-redesign-jun-2026`, remote `milfordcwm/Fizzy-leaf`.
- `.gitignore` excludes `tmp/`, scratch PNGs, `blah.har`.
- `tmp/` and `ShopifyPreviewProductPage.html` are reference scratch, not part of the site.

See also: [styling.md](styling.md) · [animations.md](animations.md) · [behaviors.md](behaviors.md) · [shopify.md](shopify.md) · [images.md](images.md) · [plans/2026/08/2026-08-22_shopify-theme-wrap.md](plans/2026/08/2026-08-22_shopify-theme-wrap.md)
