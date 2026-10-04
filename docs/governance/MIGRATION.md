# Migration map (inventory verified from public GitHub pages, Oct 2026)

Sources: `github.com/AnnLite` (org page), `AnnLite/Ann-Lite` (meta-repo), `AnnLite/annlite-backend`.
Private repos / content not visible publicly were **not inspected** — verify before archiving.

| OLD repository | NEW directory | Notes |
|---|---|---|
| annlite-web (public site) | apps/web | |
| annlite-mobile (Android/iOS) | apps/mobile | |
| annlite-admin | apps/admin | RBAC / audit logic must be kept as-is |
| annlite-backend (Express, Prisma, zod, jest, pino, JWT) | backend | "only service that talks to the DB" — keep this rule |
| annlite-database (PostgreSQL + Prisma) | database | keep migrations |
| annlite-content | content | check Bible licensing before publishing |
| annlite-payments (payment abstraction) | payments/cards | |
| annlite-celoht (CeloHT integration) | payments/celoht | integration only — CeloHT ≠ AnnLite |
| annlite-design-system | design-system | |
| annlite-security | security | |
| annlite-infrastructure | infrastructure | |
| annlite-docs | docs/legacy-docs | merge into docs/ |
| annlite-invest-book | docs/governance/invest-book | review claims before keeping public |
| Ann Lite (landing/discovery) | merged into README | |
| .github | stays as AnnLite/.github | |
| ann-lite-web (Next.js), ann-lite-api (Fastify), ann-lite-contracts (Solidity), ann-lite-content, ann-lite-admin, ann-lite-docs | legacy/ (contracts → payments/celoht/contracts) | **A second repo family exists with overlapping scope. Decide per module which implementation wins.** |

## Open ambiguities (do not hide)
1. Two parallel generations of repos (`annlite-*` and `ann-lite-*`) — overlapping web/admin/content/backend(api).
2. Frontend stack differs between them (Next.js in `ann-lite-web`; unknown for `annlite-web`). Backend: Express vs Fastify.
3. Org README currently references repos by the lowercase `ann-lite` org name — links may be broken.
4. Principle change: the meta-repo says "one responsibility per repository"; this migration deliberately replaces it with a monorepo (see docs/architecture/adr/0001-monorepo.md).
5. `ann-lite-contracts` is described as **pre-audit, not for mainnet**. Do not deploy to mainnet before an independent audit.

## How to import with history
`./scripts/import-legacy.sh --dry-run`, then `./scripts/import-legacy.sh`.
Archive old repos **only after** web/mobile/admin/backend build and payment flows are verified.
