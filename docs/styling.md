# Styling

All tokens + shared rules live in `index.css`. Page sections style themselves in their own inline `<style>`.

## Palette (canonical tokens)
| Token | Value | Use |
|-------|-------|-----|
| `--maroon` / `--gold` | `#9c6f1f` | primary brand (warm gold-brown) |
| `--maroon-dark` | `#5c4420` | headings, dark accents, footer bg |
| `--gold-soft` | `#c9a86b` | — |
| `--gold-pale` | `#f6ecd4` | badges, subtle fills |
| `--cream` | `#fffefb` | page background (on `<html>`) |
| `--cream-deep` | `#f7f0e3` | cards/toggles |
| `--ink` | `#3a3024` | body text |
| `--text-muted` | `#6b5544` | secondary text |
| `--warm-white` | `#fffdf8` | inputs, pack buttons |

### Token aliasing (important)
Section markup was pasted from several source prototypes that used their own color vars. `index.css` aliases all of them to the canonical palette so that markup renders on-brand unchanged:
- copy theme: `--hibiscus`, `--leaf`, `--text`, `--cream-dark` → palette
- spindrift theme: `--primary`, `--primary-hover`, `--text-dark`, etc. → palette

When editing pasted markup, either alias works; prefer canonical `--maroon`/`--ink` for new code.

## Typography
- Body: **Montserrat** (300–800), Google Fonts.
- Headings: **Playfair Display** serif (`--font-heading`).
- `.eyebrow` = uppercase, letter-spaced gold label. `.lead` = larger muted intro text.

## Shape tokens
`--radius` 16px · `--radius-lg` 24px · `--radius-sm` 10px · `--header-h` 72px · shadows `--shadow`/`--shadow-md`/`--shadow-lg` (maroon-tinted).

## Buttons
`.btn` pill base; `.btn-primary`/`.btn--primary` (maroon, both spellings live), `.btn-outline`. Press feedback in [animations.md](animations.md).

## Background
Page bg is set on `<html>` (not `body`) so the page-transition opacity fade never flashes the background. See [animations.md](animations.md).

## Responsive breakpoints
| Width | Effect |
|-------|--------|
| ≤968px | Shop layout → 1 column |
| ≤900px | Hero + story split stack to 1 column |
| ≤768px | **Navbar hidden, floating hamburger only**; first-section top padding drops 7rem→3rem (no navbar to clear); locations/contact/delivery stack |
| ≤480px | Shop pack selector + purchase toggle stack vertically |

Phone navbar behavior: `.site-header` collapses to `height:0` transparent; `.menu-toggle` becomes a fixed maroon circle top-right. Mobile pages must NOT keep the desktop 7rem top padding (it reads as an empty navbar gap) — use 3rem.

## Hydrogen page CSS
| Page | File |
|------|------|
| Delivery | `storefront/app/styles/delivery.css` — map, price list, inquiry layout; first-section padding 7rem desktop / 3rem ≤768px |
| Contact | `storefront/app/styles/contact.css` |
| Shop | `storefront/app/styles/shop.css` + `shop-cart.css` |
| Locations | `storefront/app/styles/locations.css` |
| Home | `storefront/app/styles/home.css` |

Loaded from `storefront/app/root.jsx` like other page styles.
