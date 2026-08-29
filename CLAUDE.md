# Fizzy Leaf — site guide

Marketing + commerce for Fizzy Leaf sparkling hibiscus tea (Middle TN).

## Live storefront

**Hydrogen** (React Router) at the **repository root** — deployed on Oxygen, live at fizzyleaf.com.

## Run / verify

```bash
./local-run.sh
# same as: npm install && npm run dev
npm run build && npm run lint
```

`./local-run.sh` copies `.env.example` → `.env` if needed, then starts Hydrogen at http://localhost:3000/.

## Red lines
- **Do not** turn store password off or `shopify theme publish` without an explicit yes. DNS cutover is **done** — do not change `fizzyleaf.com` records unless asked.
- **Don't touch Shopify constants** (variant/selling-plan ids, token, API version) without intent — [docs/shopify.md](docs/shopify.md).
- Images: WebP, wire new ones, downscale first.
- **Git:** commit + push on feature branches. **Never** commit or push to `main`/`master` (local or origin). See [docs/rules/git-workflow.md](docs/rules/git-workflow.md).
- **Clean code** on new + touched lines: [docs/rules/clean-code.md](docs/rules/clean-code.md).

## Detailed references
| Topic | Doc |
|-------|-----|
| Structure | [docs/architecture.md](docs/architecture.md) |
| Palette, tokens, typography | [docs/styling.md](docs/styling.md) |
| Motion | [docs/animations.md](docs/animations.md) |
| Behaviors | [docs/behaviors.md](docs/behaviors.md) |
| Cart / `/discount` / Oxygen | [docs/shopify.md](docs/shopify.md) |
| Images | [docs/images.md](docs/images.md) |
| Hydrogen port plan | [docs/plans/2026/08/2026-08-22_hydrogen-storefront.md](docs/plans/2026/08/2026-08-22_hydrogen-storefront.md) |
| Oxygen / DNS cutover | [docs/plans/2026/08/2026-08-23_hydrogen-oxygen-cutover.md](docs/plans/2026/08/2026-08-23_hydrogen-oxygen-cutover.md) |
| Post-launch checkout domain | [docs/plans/2026/08/2026-08-28_post-launch-checkout-domain.md](docs/plans/2026/08/2026-08-28_post-launch-checkout-domain.md) |
| Git commit / push | [docs/rules/git-workflow.md](docs/rules/git-workflow.md) |
| Clean-code floor | [docs/rules/clean-code.md](docs/rules/clean-code.md) |
