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

The web app is a local-first preview: personal entries stay in browser storage and there is no backend sync. Do not put real secrets in `.env` or frontend environment variables. Before importing an application repository, review the migration notes and run `scripts/import-legacy.sh --dry-run`; imports preserve Git history and require an explicit source review.
