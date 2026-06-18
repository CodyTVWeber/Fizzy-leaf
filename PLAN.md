# Fizzy Leaf — Final Merge Plan

Branch: `feat/final-redesign-jun-2026` · Folder: `Fizzy-leaf-final` (copied from `Fizzy-leaf`/main)

Goal: meld the best parts of the prototype branches into one final site.

## Source map (where each piece comes from)

| Piece | Source branch/folder |
|---|---|
| Desktop/tablet navbar | `Fizzy-leaf-copy` (`.site-header`, full link bar + CTA) |
| Hamburger (icon + animation + menu panel/JS) | `Fizzy-leaf-spindrift-style` (`.mobile-menu-btn`, `.nav-links.active`) |
| Home hero/title | `Fizzy-leaf-claude` `.hero` + **new**: large Fizzy Leaf logo+icon above "Made & Sold in Middle Tennessee" |
| Our Story | `Fizzy-leaf-claude` `#story` |
| Instagram gallery | `Fizzy-leaf-claude` `#gallery` |
| Shop section | `Fizzy-leaf-copy` `#shop` (gallery, pack selector, subscribe toggle, Shopify container) |
| Location title "Where to Find Us" | `Fizzy-leaf-claude` |
| Location grouping/filter chips | `Fizzy-leaf-copy` `.location-filters` (city pills) |
| Location coffee chips (cards) | `Fizzy-leaf-claude` `.location-card` |
| Google Map | `Fizzy-leaf-copy` map iframe/container |
| Contact section | `Fizzy-leaf-copy` `#contact` (form → submit-form.com/vwsJT57aO) |
| Footer/bottom bar | `Fizzy-leaf-spindrift-style` footer, **lighter color + shorter** |
| Logo/icon assets | `img/FizzyLeafLogo.webp`, `img/FizzyLeafIcon*.webp` |

## Layout spec

### Top navbar
- **Desktop/tablet:** copy's horizontal navbar (logo left, links, "Shop Now" CTA). Replace copy's toggle with spindrift's 3-line hamburger styling for the collapse breakpoint.
- **Phone:** large **floating circular** hamburger fixed top-right; opens spindrift-style menu panel.

### Pages / sections
1. **Home** — hero (claude + logo/icon added) → Our Story (claude) → Instagram gallery (claude)
2. **Shop** — shopping section (copy)
3. **Locations** — title (claude) + grouping chips (copy) + cards (claude) + map (copy)
   - Desktop/tablet: Left = 3-col claude chips · Right = copy Google Map (side by side)
   - Phone: title → chips → 2-col claude chips → map (stacked)
4. **Contact** — contact section (copy)

### Footer
Spindrift footer, but background lighter than `#2C2823` (propose a mid warm-brown, e.g. tuned toward brand `#5c4420`/maroon-dark) and reduced padding (`4rem 2rem 2rem` → ~`2.5rem 2rem 1.5rem`).

## Shop pricing (from Christian's email)
| Pack | One-time | Subscribe (−20%) |
|---|---|---|
| 12-pack | $43.00 | $34.40 |
| 24-pack | $79.00 | $63.20 |
- Free shipping. Subscribe & Save = 20% off on both packs.
- TN-only sales (enforced at Shopify checkout via shipping zones limited to TN; site copy already states "ships to TN only").

## Shopify integration
- Store: `4nrp1u-ka.myshopify.com` (format is valid for a modern Shopify store; **cannot confirm without admin access**).
- **JS Buy SDK is deprecated (EOL Jan 2026).** Recommended path = **Buy Button sales channel embed code** generated in the Shopify admin, OR BuyButton.js wired with a Storefront API access token + product IDs.
- **Subscriptions** need the **Shopify Subscriptions app** (selling plans). Buy Button has limited subscription UI; subscribe option may need to route to the product page or use admin-generated code that includes the selling plan.
- copy's shop section already has the integration seam: `#shopify-buy-button` container + `SHOPIFY_CONFIG` placeholder + subscribe toggle. We wire real values in there.
- **Blocker requiring your action:** generating embed code / tokens, installing the Subscriptions app, and setting TN shipping zones all happen inside the Shopify admin. I should not log into your account. You provide the token+product IDs or paste the admin embed code; I scaffold around it.

## Locations (18) — consolidated; addresses to verify
Grouping chips: All · Thompson's Station · Spring Hill · Franklin · Columbia · Nashville

| # | Name | City | Address |
|---|---|---|---|
| 1 | 1819 Coffee | Thompson's Station | 4683 Columbia Pike, 37179 |
| 2 | White Shepherd Coffee | Thompson's Station | 2101 Branford Pl Unit 101, 37179 |
| 3 | White Shepherd Coffee | Spring Hill | 4001 Parkfield Loop N Ste 40, 37174 |
| 4 | Mama Mila's | Columbia | 1200 S Garden St, 38401 |
| 5 | Old Stone Creamery | Spring Hill | 2301 Sugar Ridge Rd, 37174 |
| 6 | Awaken House | Spring Hill | 3035 Reserve Blvd, 37174 |
| 7 | High Brow Coffee | Franklin | 188 Front St Unit 102, 37064 |
| 8 | The Brunch Collective | Spring Hill | 5323 Main St, 37174 |
| 9 | The Coffee House (Downtown Franklin) | Franklin | 144 2nd Ave N, 37064 |
| 10 | The Coffee House (Cool Springs) | Franklin | 6700 Tower Cir, 37067 |
| 11 | Abundant Provisions | Spring Hill | 5322 Main St, 37174 |
| 12 | Bruno's Italian Deli & Market | Columbia | 2500 Hospitality Ln, 38401 |
| 13 | Legacy Coffee Co | Columbia | 2547 Nashville Hwy Ste A, 38401 |
| 14 | North Arrow Coffee Co | Franklin | 406 Church St, 37064 |
| 15 | Columbia Health Foods | Columbia | 106 W 7th St, 38401 |
| 16 | Canine Concepts | Nashville | 1106 Division St, 37203 |
| 17 | Prickly Pear (Batman) | Nashville | 333 Commerce St, 37201 |
| 18 | Prickly Pear (Albion) | Nashville | 645 Division St, 37203 |

*Several addresses were inferred by prototype AIs — flag for Christian to confirm before launch.*

## Build approach
- Practical scaffold: start the final `index.html`/`index.css` from `Fizzy-leaf-copy` (most complete: shop, contact, map, chips, Shopify seam), then graft claude's hero/story/gallery + claude location cards + spindrift hamburger/footer. (The branch home itself was copied from `main` per your instruction.)
- Shared design tokens: reconcile color variables (copy = hibiscus/gold `#d2a863`; claude = maroon/gold `#9c6f1f`; spindrift = `#C5A36E`). Pick one palette so navbar/footer/sections match.

## Locked decisions
1. **Multi-page:** `index.html` (Home) + `shop.html` + `locations.html` + `contact.html`. Shared nav + footer markup/CSS kept identical across all 4 (single `index.css`). Navbar links point to the page files; hamburger menu does the same.
2. **Shopify = scaffold + placeholder now.** Build full shop UI with real prices ($43/$79, −20% subscribe, free shipping, TN-only copy) + `#shopify-buy-button` seam + clear TODO hooks. You paste admin embed code / token later. I do not log into your admin.
3. **Palette = Fizzy-leaf-claude** (maroon `#9c6f1f` / dark `#5c4420` / pale gold `#f6ecd4`). Recolor copy's shop/contact/map/chips + spindrift hamburger/footer to this palette. Footer = lighter than spindrift's `#2C2823` and shorter, tuned to the claude palette.

## Implementation order
1. Establish shared `index.css` (claude palette tokens) + shared nav (copy desktop/tablet + spindrift hamburger; floating circle on phone) + shared footer (lighter/shorter).
2. `index.html` — hero (claude + added logo/icon) → Our Story → Instagram gallery.
3. `shop.html` — copy shop section, recolored, real prices, Shopify seam.
4. `locations.html` — claude title + copy chips + claude cards (3-col desktop / 2-col phone) + copy map.
5. `contact.html` — copy contact form.
6. Wire nav active-states per page; verify responsive (desktop/tablet/phone) for nav, locations layout, footer.
7. Copy needed assets into `img/` (logo, icon, product/lifestyle photos referenced by claude + copy).
