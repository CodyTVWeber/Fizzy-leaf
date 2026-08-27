# Plan: Hydrogen app at repo root (Oxygen default)

**Date:** 2026-08-27  
**Branch:** `cursor/hydrogen-to-repo-root-ab48`  
**Status:** Implementing

Shopify Oxygen / Hydrogen GitHub deploy is simplest when the Hydrogen app is the **repository root** (`package.json`, `server.js`, `app/`, `public/`). Today it lives in `storefront/` with leftover GitHub Pages `*.html` / `*.js` / `*.css` at root. Move the app up; delete Pages leftovers.

This is **layout only**. Do not change DNS, store password, theme publish, or Shopify product/variant/token constants.

---

## Why root

| Today | After |
|---|---|
| Oxygen workflow `working-directory: storefront` | `npx shopify hydrogen deploy` from repo root |
| Hydrogen Admin **App root** = `storefront` | App root = `/` (repo root) — change in Admin after merge |
| `shopify hydrogen dev --path storefront` | `npm run dev` / `./scripts/run-local.sh` at root |

Hydrogen does not require a `storefront/` folder. Shopify’s default `hydrogen init` is repo-root.

---

## Move (preserve git history)

`git mv` every Hydrogen file **out of** `storefront/` to repo root:

| From | To |
|------|----|
| `storefront/app/` | `app/` |
| `storefront/public/` | `public/` |
| `storefront/guides/` | `guides/` |
| `storefront/package.json` + `package-lock.json` | root |
| `storefront/{server,vite.config,eslint.config,react-router.config}.js` | root |
| `storefront/{jsconfig,tsconfig}.json` | root |
| `storefront/{env.d.ts,.env.example,.graphqlrc.js,CHANGELOG.md,README.md}` | root (README: merge — see below) |

Then `rmdir storefront` (must be empty). Do **not** copy/rewrite app source; this is a path move.

**Do not** move Hydrogen into a nested path other than root. Do **not** leave a stub `storefront/` folder.

---

## Delete leftover Pages files at repo root

Hydrogen already ports this UI. Delete:

**HTML:** `index.html` `shop.html` `locations.html` `contact.html`  
**CSS:** `index.css`  
**JS:** `nav.js` `util.js` `cart-api.js` `contact.js` `locations.js` `shop.js`

Also delete leftover Pages **assets** that Hydrogen does not serve:

- Root `img/` (duplicate of `public/img/`)
- Root `Fizzyleaf2.jpg` `Fizzyleaf3.jpg` `Fizzyleaf4.jpg`
- `CNAME` (GitHub Pages domain claim; live site is Oxygen)
- `PLAN.md` (old Pages merge plan)

**Keep:** `docs/` `scripts/` `LICENSE` `CLAUDE.md` `.github/` `.gitignore` (merged)

---

## Merge configs

### `.gitignore`

Union of root + `storefront/.gitignore`. After merge, ignore:

- `node_modules/` `.shopify/` `.env` `.env.*` `!.env.example`
- `dist/` `build/` `.react-router/` `.cache/` `*.tsbuildinfo`
- `customer-accountapi.generated.d.ts` `storefrontapi.generated.d.ts` `app/routes/+types/`
- existing scratch: `tmp/` `image.png` `.vscode` `.DS_Store` etc.

Drop `storefront/.env` / `storefront/node_modules` paths. Hydrogen `.env` is repo-root `.env`.

### `README.md`

Replace Pages README with a short Hydrogen README: Fizzy Leaf, `npm install && npm run dev`, `./scripts/run-local.sh`, Node 22/24. Do not keep Formspark/GitHub Pages setup as if it were the live site.

Keep `guides/` and Hydrogen `CHANGELOG.md` as-is.

### `.github/workflows/oxygen-deployment-1000172614.yml`

Remove both `working-directory: storefront` lines so install + `npx shopify hydrogen deploy` run at repo root. Keep the token secret name.

### `scripts/run-local.sh`

Point at repo root: `.env.example` → `.env` at root, `cd "$ROOT"`, `npm run dev`. Drop `STOREFRONT="$ROOT/storefront"`.

### `package.json`

Keep Hydrogen scripts. `"name"` may stay `storefront` or become `fizzy-leaf` — either is fine; do not change dependency versions.

---

## Docs (path updates only)

Update every live doc that says Hydrogen lives in `storefront/`:

| File | Change |
|------|--------|
| `CLAUDE.md` | One surface: Hydrogen at repo root. `npm run dev` / `./scripts/run-local.sh`. Drop Pages leftover run instructions. Red lines: still no DNS / password off / theme publish / push `main`. Drop “root HTML no bundler” (that surface is gone). |
| `docs/architecture.md` | Live = Hydrogen at root on Oxygen. Delete the two-surface table / leftover Pages chrome. Images: `public/img/`. |
| `docs/shopify.md` | Paths `app/lib/product.js`, `.env`, `app/routes/discount.$code.jsx`. Oxygen app root = repo root. Note leftover Pages cart section can go. |
| `docs/styling.md` | CSS under `app/styles/…`, loaded from `app/root.jsx`. |
| `docs/behaviors.md` | Drop “Pages leftover” section. Hydrogen section only; paths without `storefront/`. |
| `docs/animations.md` | Drop `nav.js` / `shop.html` / `util.js` as current sources; describe Hydrogen motion. |
| `docs/images.md` | Canonical dir `public/img/`. |
| Historical plans (`2026-08-22`, `2026-08-23`, `2026-08-26`) | One-line note at top: Hydrogen later moved to repo root (this plan). Do not rewrite history. |

Do not invent new styling tokens or change Shopify constants.

---

## Out of scope

- DNS / store password / `theme publish` / pushing `main`
- Changing variant, selling-plan, token, API version
- Shopify Admin click-ops (after merge, set Hydrogen **App root** from `storefront` to `/`)
- App behavior, CSS look, new routes
- Mass-refactor of untouched Hydrogen files

---

## Verify

```bash
npm install
npm run lint
npm run build
./scripts/run-local.sh   # or npm run dev
```

- No `storefront/` directory left
- No root `*.html` / leftover Pages JS/CSS
- `package.json` + `server.js` + `app/` at repo root
- Oxygen workflow has no `working-directory: storefront`
- Dev server still serves `/` `/shop` `/locations` `/delivery` `/contact`

---

## Git

Branch: `cursor/hydrogen-to-repo-root-ab48` only. Never commit/push `main`.  
Commit message shape: `cursor/hydrogen-to-repo-root-ab48: 1. … 2. …`
