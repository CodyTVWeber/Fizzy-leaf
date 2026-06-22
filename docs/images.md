# Images

All images live in `img/` and are **WebP**. Photos were downscaled to ≤1400px / quality 80; the logo to 600px.

## Conventions
- Format: `.webp` only. Convert with ImageMagick: `magick in.jpg -resize '1400x1400>' -quality 80 -define webp:method=6 out.webp` (`>` only shrinks, never upscales). Preserve alpha for logo/icons.
- Keep files lean: photos target <200KB; logo/icons small. Re-check after adding.
- Reference by exact basename in HTML/CSS/JS. **Unreferenced files get pruned** — if you add an image, wire it up in the same change.

## Current assets
| File | Used by | Notes |
|------|---------|-------|
| `FizzyLeafLogo.webp` | all pages (hero, footer) | 600px, transparent, ~60KB |
| `FizzyLeafIcon_favicon.webp` | favicon, all pages | small |
| `fizzy-cans-trio.webp` | home hero | |
| `fizzy-can-shelf.webp` | home story | |
| `fizzy-detail1–4,6.webp` | shop gallery, home/locations | product detail shots |
| `Fizzyleaf2–4.webp` | shop gallery, home/locations | product shots |

## History / cautions
- 11 unused images (old `fizzy-can-*`, `fizzy-lifestyle-*`, extra icon variants) were removed — ~836KB freed.
- `FizzyLeafLogo.webp` was 1316×1312 / 924KB; downscaled to 600px / ~60KB (alpha kept). Don't re-import the giant original.
- Earlier mistake to avoid: converting full-res photos to WebP without `-resize` produced files *larger* than the source. Always downscale.
- The product is displayed ≤420px wide (hero) / ≤72px (thumbs); 1400px source is plenty.
