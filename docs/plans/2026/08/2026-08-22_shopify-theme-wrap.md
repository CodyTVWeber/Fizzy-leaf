# Plan: Wrap custom site as an unpublished Shopify theme

**Date:** 2026-08-22
**Branch:** `plan/shopify-theme` (implement on same branch → one PR)
**Status:** Implementing
**Base:** `origin/main` @ `fb5328e`

Put the GitHub Pages HTML/CSS/JS into a Shopify **Online Store theme**, pushed **unpublished** to the password-gated store. **Do not** publish, **do not** turn the password off, **do not** move `fizzyleaf.com` DNS. Live site stays GitHub Pages.

---

## Why this is safe

| Surface | This PR |
|---------|---------|
| `fizzyleaf.com` (GitHub Pages) | Untouched. `theme/` is ignored by Pages even if merged |
| `CNAME` / DNS | Not edited |
| Online Store password | Stays **on** |
| Dawn (current live theme) | Not published over; we add a **library** theme |
| Customer traffic | Still GitHub Pages |

Unsafe later (explicit, out of scope): `shopify theme publish`, password off, **Settings → Domains** connect, set primary domain.

Store is already “dark” (password). Unpublished preview is only via preview link / `?preview_theme_id=`.

---

## Context (verified on `origin/main`)

| Fact | Value |
|------|--------|
| Pages | `index.html`, `shop.html`, `locations.html`, `contact.html` — no `delivery.html` on main |
| Chrome | `index.css`, `nav.js`, `util.js`; copied header/footer per page |
| Shop cart | `cart-api.js` + `shop.js` — Storefront Cart API, not Buy Button |
| Storefront domain in `CFG` | `4nrp1u-ka.myshopify.com` |
| Contact | Formspark `https://submit-form.com/vwsJT57aO` |
| Hosting today | GitHub Pages + `CNAME` `fizzyleaf.com` |
| Sibling PR | #8 live prices + Delivery — **do not** stack; rebase after it merges |

Call 2026-08-22: custom site into Shopify so Collabs `/discount/:code` works on the customer domain. Hydrogen / Dawn drag-drop rejected.

---

## Why this approach

1. **Liquid wrap, not Hydrogen.** $0 extra, no framework, git stays GitHub.
2. **`theme/` subfolder + Shopify CLI** (`theme push --unpublished`). GitHub “Connect from GitHub” needs theme folders at **branch root**; current repo root is Pages HTML — connecting `main` would ignore our site.
3. **Keep existing JS for v1** (`cart-api.js`, `shop.js`, `contact.js`, `locations.js`, `nav.js`). Native product/cart templates can replace Storefront API later; not required for unpublished preview.
4. **No DNS / publish / password** in this PR. Preview on `*.myshopify.com` only.

---

## Concrete steps

### 1. Scaffold `theme/` (Shopify folder layout)

Required so CLI will upload:

```
theme/
  layout/theme.liquid          # {{ content_for_header }} in <head>, {{ content_for_layout }} in <body>
  config/settings_schema.json  # [] is enough
  templates/index.liquid
  templates/page.locations.liquid
  templates/page.contact.liquid
  templates/page.shop.liquid   # v1: current shop.html body; not a native product template yet
  assets/                      # index.css, nav.js, util.js, cart-api.js, shop.js, contact.js, locations.js, img/*.webp
```

`theme.liquid` is the shared chrome (header, hamburger, footer) taken from current pages. Templates are the current `<main>` only. Asset URLs use Liquid `{{ 'index.css' | asset_url }}` (and same for js/img).

### 2. Port pages (look/behavior match `origin/main`)

| Source | Theme file |
|--------|------------|
| `index.html` main | `templates/index.liquid` |
| `shop.html` main | `templates/page.shop.liquid` |
| `locations.html` main | `templates/page.locations.liquid` |
| `contact.html` main | `templates/page.contact.liquid` |

Shopify Admin (Christian / collaborator): create **Pages** Locations, Contact, Shop and assign those templates so preview URLs exist (`/pages/locations`, etc.). Homepage uses `index`.

Nav/footer hrefs inside the theme: `/`, `/pages/shop`, `/pages/locations`, `/pages/contact` — not `*.html`.

### 3. Push unpublished only

```bash
shopify theme push --unpublished --path theme --store fizzyleaf.myshopify.com
```

Never `--publish`. Never `shopify theme publish`. If CLI store slug is still `4nrp1u-ka`, use that — confirm at login; do not change `cart-api.js` `CFG` in this PR unless preview checkout fails.

### 4. Docs

| File | Change |
|------|--------|
| `docs/shopify.md` | Unpublished theme path; CLI; Pages still live; DNS/publish are launch gates |
| `docs/architecture.md` | `theme/` is the Shopify wrap; root `*.html` remains Pages until cutover |
| `CLAUDE.md` | One line: don’t publish / don’t DNS from this branch |

Do **not** edit `PLAN.md` (historical).

### 5. Verify (preview theme, password still on)

```bash
node --check theme/assets/*.js
```

Plus manual checklist below.

---

## Out of scope

- `shopify theme publish` / making this the live theme
- Store password off
- Connecting or transferring `fizzyleaf.com` (A/CNAME)
- GitHub theme app (“Connect from GitHub”)
- Hydrogen / Oxygen
- Dawn restyle / theme editor sections
- Native Shopify cart/product templates (replace Storefront API)
- `/discount` production cutover (works on myshopify **after** this theme is previewable; public domain later)
- Delivery page (lives on PR #8, not `origin/main`)
- Emailing Christian
- Changing Storefront token / variant ids / selling plan id

---

## Manual verification

- [ ] `fizzyleaf.com` still the current GitHub Pages site
- [ ] Theme appears in Admin → Online Store → Themes **library**, not Current theme
- [ ] Preview: home, shop, locations, contact match Pages look
- [ ] Shop add-to-cart → drawer → checkout URL still `/cart/c/…` or `/checkouts/cn/…`
- [ ] Contact form still posts to Formspark
- [ ] Store password still on; no domain added
- [ ] Root `*.html` / `CNAME` unchanged in git
