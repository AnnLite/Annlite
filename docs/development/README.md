# Development

Requirements: Node.js 22 or newer, pnpm 9, and Git.

```sh
pnpm install --frozen-lockfile
pnpm --filter @annlite/web dev
```

Run the repository quality gates from the root:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The web package also supports focused commands such as `pnpm --filter @annlite/web test`. Its tests cover route navigation, local Bible and prayer interactions, theme/language changes, quiz logic, truthful charity states, and basic axe accessibility checks.

## Browser E2E

Install Playwright's browser engines and host dependencies once, then run the full browser suite from the repository root:

```sh
pnpm exec playwright install --with-deps chromium firefox webkit
pnpm test:e2e
```

The suite covers Chromium, Firefox, and WebKit at desktop sizes; Chromium and WebKit mobile emulation; and Chromium and WebKit tablet emulation. It checks all listed desktop, mobile, and tablet viewport sizes. Playwright writes its HTML report to `playwright-report/` and failure traces, screenshots, and videos to `test-results/`. GitHub Actions uploads both after every E2E run and blocks deployment if the suite fails.

This repository currently has no authentication backend, admin API, campaign service, card processor, or payment webhook endpoint. E2E covers the implemented guest/local-first journeys and the donation page's explicitly labeled local sandbox states; it does not simulate or claim real provider checkout, payment settlement, webhook idempotency, authenticated progress sync, or campaign donations. The CeloHT check verifies the configured external URL without submitting a transaction.

The web app is a local-first preview: personal entries stay in browser storage and there is no backend sync. Do not put real secrets in `.env` or frontend environment variables. Before importing an application repository, review the migration notes and run `scripts/import-legacy.sh --dry-run`; imports preserve Git history and require an explicit source review.
