# Plan: Hydrogen live on Oxygen, then DNS, then Pages off

**Date:** 2026-08-23  
**Branch:** `hydrogen` (PR #10 → `main`)  
**Status:** Not started — wait for explicit go on each step  
**PR:** https://github.com/milfordcwm/Fizzy-leaf/pull/10

Port is done (`storefront/`). This is **cutover only**. Production deploys from **`main`**. Delete `hydrogen` at merge.

---

## Why this order

| Fact | Consequence |
|---|---|
| PR #10 base is **`main`** | Merge = Hydrogen code **on `main`**. Does **not** auto-go-live |
| Root `*.html` + `CNAME` still on `hydrogen` (unchanged vs `main`) | Merge **does not** break GitHub Pages |
| Oxygen serves **one production git branch** | Point it at **`main` after merge**. Never at `main` while `main` is Pages-only |
| `fizzyleaf.com` is Pages today | DNS to Oxygen **before** turning Pages off, or the domain has nowhere to go |

---

## Concrete steps

Do **not** skip ahead. Re-ask before DNS / Pages off / password off / theme publish.

### 1. Merge PR #10, delete `hydrogen`

1. Undraft PR if still draft: https://github.com/milfordcwm/Fizzy-leaf/pull/10
2. Merge to `main` (GitHub **delete `hydrogen` branch** = on)
3. Confirm `origin/main` has `storefront/` **and** `index.html` / `CNAME`

`fizzyleaf.com` still Pages.

### 2. Oxygen from `main` (Shopify URL only)

Needs **Hydrogen sales channel** on the store (`4nrp1u-ka.myshopify.com` / `fizzyleaf.myshopify.com`). Collaborator may lack this — store owner may have to install.

1. Admin → Hydrogen channel → storefront linked to `milfordcwm/Fizzy-leaf`
2. **Production environment** git branch = **`main`**
3. **App root** = **`storefront`** (not repo root)
4. Oxygen env (from `storefront/.env.example`; `SESSION_SECRET` = new random, not the local-dev value):

| Key | Value |
|---|---|
| `SESSION_SECRET` | long random (Oxygen-only) |
| `PUBLIC_STORE_DOMAIN` | `4nrp1u-ka.myshopify.com` |
| `PUBLIC_STOREFRONT_API_TOKEN` | `b42a54c4c455ccdc767511135953a5bb` |
| `PUBLIC_CHECKOUT_DOMAIN` | `4nrp1u-ka.myshopify.com` |
| `PUBLIC_STOREFRONT_API_VERSION` | `2025-01` |

5. Deploy (`shopify hydrogen link` / `shopify hydrogen deploy --path storefront`, or GitHub connect)

**Open the Oxygen preview URL only** — not `fizzyleaf.com`.

### 3. Verify on Oxygen URL

Same as local:

- [ ] `/` home (fonts, Instagram)
- [ ] `/shop` 12 one-time + 24 subscribe → drawer → checkout `/cart/c/…` or `/checkouts/cn/…`
- [ ] `/locations` filter + map
- [ ] `/contact` Formspark send
- [ ] `/discount/TEST?redirect=/shop&dt_id=0` 303 → `/shop?dt_id=0` (real Collabs code when you have one)

Stop here if anything fails. Do **not** DNS.

### 4. DNS `fizzyleaf.com` → Oxygen

In Hydrogen/Oxygen (or store **Domains**), add `fizzyleaf.com` / `www`. Put the **A / CNAME records Shopify shows** at the DNS host.

Wait for TTL. Confirm **https://fizzyleaf.com** is Hydrogen (nav `/shop` not `shop.html`).

### 5. Turn off GitHub Pages

1. Repo **Settings → Pages** → disable (or unpublish)
2. Commit on `main`: remove `CNAME` (stop GitHub claiming the domain)

---

## After (separate yes)

- Store **password off** — checkout for guests who don’t use `/cart/c/…`; also exposes default Online Store on `*.myshopify.com`
- **`shopify theme publish`** — still no unless we want Dawn live
- Collabs links: `https://fizzyleaf.com/discount/CODE?redirect=/shop&dt_id=…`
- Point Oxygen at `main` only; no `hydrogen` branch left

---

## Out of scope

- Doing any of 1–5 without a yes on that step
- Theme publish / password off in this plan
- Delivery page (PR #8)
- Emailing Christian
- Changing variant / selling-plan ids / token unless checkout fails
- Redeploying from `hydrogen` (production is `main` after step 1)
