# Development
Requirements: Node ≥ 22, pnpm ≥ 9, Git.
```
pnpm install
pnpm test        # runs every package's tests via Turborepo
pnpm typecheck
```
Quick check of the payment core without installing anything: `cd payments/core && npm test`.
Import legacy repos (with history): `./scripts/import-legacy.sh --dry-run`.
