# Plan: Post-launch checkout domain + cutover docs

**Date:** 2026-08-28  
**Branch:** `fix/post-launch-checkout-domain`  
**Status:** Implemented  
**Base:** `origin/main`

Prod Hydrogen is live. Close the leftover **code** gap from missing Oxygen `PUBLIC_CHECKOUT_DOMAIN`, and mark DNS cutover done in docs.

---

## Why

Analytics.Provider throws in the browser when `consent.checkoutDomain` is empty. `.env.example` already has the value; Oxygen Admin may not. Fall back to `PUBLIC_STORE_DOMAIN` so prod stops erroring without an Admin change.

Docs still say “don’t DNS / then Pages off” after DNS is live and `CNAME` is gone.

---

## Concrete steps

1. `checkoutDomain(env)` → `PUBLIC_CHECKOUT_DOMAIN || PUBLIC_STORE_DOMAIN`. Use in `app/root.jsx` and `app/entry.server.jsx`.
2. Update `docs/shopify.md`, cutover plan, `CLAUDE.md`: DNS done; remaining Admin = GitHub Pages unpublish, optional env var, Collabs URLs. Still no password off / theme publish.

---

## Out of scope

- Store password off
- `shopify theme publish`
- GitHub Pages Settings (no API permission)
- Collabs partner invite / dummy affiliate
- Stripping unused Hydrogen skeleton routes
- Emailing Christian
