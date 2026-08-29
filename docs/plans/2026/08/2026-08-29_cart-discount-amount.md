# Plan: Cart discount amount + code field

**Date:** 2026-08-29  
**Branch:** `fix/cart-show-discount-amount`  
**Status:** Implemented

Show Shopify’s cart discount (already applied via `/discount/:code` or a typed code) in the drawer. Do not fake local math.

---

## Concrete steps

1. Query `cart.discountAllocations` (code/title + `discountedAmount`).
2. Drawer: code input + Apply (`CartForm` `DiscountCodesUpdate`). List −$ amount. Subtotal / Total from cart cost.
3. Invalid codes: `applicable: false` error line. No gift-card field.

---

## Out of scope

Gift cards · changing checkout · Collabs vanity routes
