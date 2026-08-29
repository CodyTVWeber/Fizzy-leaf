# Plan: Cart discounts in a dialog

**Date:** 2026-08-29  
**Branch:** `fix/cart-show-discount-amount`  
**PR:** https://github.com/milfordcwm/Fizzy-leaf/pull/15  
**Status:** Implemented  

**Base:** same branch (do not open a second PR)

Drawer footer is crowded: Apply field + per-code −$ lines sit on top of Subtotal / Total / Checkout. Totals already come from Shopify `cart.cost`. Move manage-codes UI into a dialog.

---

## Why this approach

- Shopify already applies codes on the cart; **do not** recompute locally.
- Footer should only show **money + checkout**.
- Native `<dialog showModal()>` uses the **top layer**, so it paints above the cart overlay (`z-index: 1300` in `app/styles/shop-cart.css`) without fighting Aside stacking.

---

## Concrete steps

1. **`CartSummary` footer** (`app/components/CartSummary.jsx`):
   - Remove inline `CartDiscountCode` and the `cartDiscountLines` list.
   - Keep **Subtotal** from `cart.cost.subtotalAmount`.
   - Keep **Total** from `cart.cost.totalAmount` when any discount allocation has amount > 0 (same helper `cartDiscountLines`).
   - Add a compact **Discounts** button (label `Discounts` or `Discounts (N)` when N applied codes).
   - Checkout unchanged.

2. **New `app/components/CartDiscountDialog.jsx`** (keep `CartDiscountCode.jsx` as the Apply form):
   - Button opens `<dialog>` via `showModal()`.
   - Dialog lists applied rows from `cartDiscountLines` (code/title + −$ `Money`). Empty: one line “No discounts applied”.
   - Include existing `CartDiscountCode` (input + Apply + `applicable: false` error).
   - Close: dialog Close control + native Escape. **`keydown` Escape must `stopPropagation()`** so `Aside` (`app/components/Aside.jsx` document listener) does not close the cart.
   - After Apply, dialog **stays open** so the user sees the new list / error.

3. **CSS** (`app/styles/shop-cart.css`): dialog panel (cream, radius, padding, max-width ~22rem). Reuse existing `.cart-code-*` / `.cart-discount` tokens. Footer button: text/ghost, not a second primary next to Checkout.

4. **Keep** `app/lib/cartDiscounts.js` and Cart GraphQL `discountAllocations` as-is.

5. `npm run lint` green. Manual: `./local-run.sh` → add 12-pack → Discounts → apply a code → footer Total drops, dialog lists the code; Escape closes dialog not cart.

---

## Out of scope

- Remove-code UI
- Gift cards
- Checkout / Collabs `/discount` routes
- Second PR
- Password / DNS / theme publish
