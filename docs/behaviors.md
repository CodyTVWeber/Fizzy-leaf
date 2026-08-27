# Behaviors (JS modules)

## Hydrogen

### Shop loader + `ShopConfigurator`
- **`loadDisplayPrices(storefront, env)`** (`app/lib/product.js`): one-time `price.amount` via Hydrogen `storefront.query`. Subscribe `sellingPlanAllocations` via a raw Storefront fetch (swallows ACCESS_DENIED / empty and keeps `PRICES.subscribe` fallbacks). Never throws to the shop UI.
- **`shop.jsx` loader** returns `{prices}`; `ShopConfigurator` reads them via `useLoaderData()` and renders with `priceDisplay(pack, purchaseType, prices)`.
- Pack selector (12/24), one-time/subscribe toggle, quantity stepper, gallery fade-swap, `CartForm` add-to-cart → aside drawer.

### `DeliveryChecker` (`/delivery`)
- **Map**: Leaflet + OSM tiles (npm `leaflet`, client-only `useEffect`). Gold 30-mile circle around College Grove `{ lat: 35.7869, lng: -86.6750 }`. Visitor marker after a check.
- **Address check**: server action on `/delivery`. US Census geocoder first (rural / highway addresses), Nominatim fallback, then last 5-digit ZIP (Nominatim postalcode, then Zippopotam). Haversine vs origin, radius 30 mi. Outside/unknown: message, hide inquiry. Inside: show miles (1 decimal) + inquiry form. ZIP fallback is approximate and labeled in the status copy.
- **Inquiry**: name, email, message. Hidden: `address`, `miles`, `lat`, `lng`, `topic=local-delivery-inquiry`. Formspark `vwsJT57aO` — direct deal with Christian, **not** Shopify checkout. Out of range / not found: inquiry stays closed; a quiet “Still want to message me anyway?” control opens the same form.
- **Submit**: same async Formspark pattern as `ContactForm`.

### Contact
- `ContactForm` — async Formspark submit via `~/lib/formspark`.

### Nav / chrome (`app/lib/nav.js`, `SiteHeader`)
- **Mobile menu**: hamburger toggles full-screen overlay; closes on link click, backdrop tap, or `Escape`; locks body scroll while open.
- **Header scroll**: adds `.scrolled` shadow past 10px.

### Gallery / map cross-fade
- Shop gallery thumbnails use `fadeSwapImage` in `ShopConfigurator.jsx`.
- Locations map swaps use `fadeSwapFrame` in `LocationsExplorer.jsx`.
- Cross-page fades use `~/lib/page-fade` (`FADE_OUT_MS`, `internalFadeUrl`).

### Cart drawer
- `Aside` + `CartMain` + `CartFab`: slide-in drawer, overlay, FAB bump on add, checkout via `cart.checkoutUrl`.
