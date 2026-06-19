# Animations & motion

All motion respects `prefers-reduced-motion` where it would disrupt (page transitions disable entirely).

## Page transitions (cross-page fade)
- **In**: `main, .site-footer { animation: pageFadeIn 0.4s ease-out both; }` (fades content only — navbar/hamburger never fade).
- **Out**: `nav.js` intercepts clicks on internal `*.html` links, adds `body.is-leaving` → `main, .site-footer { opacity:0; transition: opacity 0.22s ease; }`, then navigates.
- **Sync rule**: the JS delay `FADE_OUT_MS` in `nav.js` MUST equal the CSS fade-out duration (currently **220ms**). Change both together.
- Background lives on `<html>` so only content fades, never the cream backdrop.
- `pageshow` (bfcache) handler clears `is-leaving` so back/forward isn't stuck invisible.
- Reduced-motion: animation + transition disabled, content stays at opacity 1.

## Button / control press feedback
Tactile `:active { transform: scale(...) }` with short transitions:
- Global (`index.css`): `.btn`, `.nav-cta`, `.filter-btn`, `.pack-btn`, `.purchase-option`, `.shop-thumb`, `.location-card` → scale 0.96.
- Shop (`shop.html`): quantity stepper buttons scale 0.82; drawer qty/close buttons scale 0.85–0.9; cart FAB scale 0.9.

## Cart drawer (shop)
- Slide: `.cart-drawer { transform: translateX(100%); transition: transform 0.35s cubic-bezier(0.4,0,0.2,1); }`, `.open` → `translateX(0)`.
- Overlay: `.cart-overlay` opacity 0.3s.
- **FAB bump on add**: `addToCart()` toggles `.cart-fab.bump` → `@keyframes fabBump` (scale 1→1.18→1, 0.4s). Re-triggered each add via reflow (`void offsetWidth`).

## Cross-fade swaps (`util.js` `FizzyLeaf.fadeSwap`)
Used for the shop image gallery and the locations map iframe: set `opacity:0`, swap `src` after `swapDelay` (~180–220ms), restore on `load` (+ safety timeout). Target element needs `transition: opacity`.

## Mobile hamburger
3-bar → X morph: `.menu-toggle.open span` rotates bars into an X; overlay `.nav-overlay.open` fades in (opacity transition).

## Contact form success
On accepted submit: `#submitBtn.is-success` turns green (`#4c7a3f`) + `successPop` scale pulse; status message animates in via `statusIn` (fade + translateY).

## Header on scroll
`nav.js` toggles `.site-header.scrolled` past 10px scroll → adds a soft shadow.
