# Changelog
All notable changes to this project are documented here. Format: [Keep a Changelog](https://keepachangelog.com/), versioning: [SemVer](https://semver.org/).

## [0.1.0] - 2026-10-03
### Added
- Monorepo foundation consolidating the AnnLite ecosystem (apps, backend, database, content, payments, design system, security, infrastructure, tests, docs).
- `payments/core`: payment state machine, webhook HMAC-SHA256 verification with replay window, idempotency guard, and server-side CELO/ERC-20 (USDm) donation verification. 7 automated tests.
- `scripts/import-legacy.sh`: imports existing repositories with Git history preserved.
- Migration map, architecture overview, ADR 0001 (monorepo decision), payments/security/development/deployment docs.
- Brand assets (logo, project owner photo), CI, CodeQL, Dependabot, dependency review.
### Known limitations
- Legacy application code not yet imported; `apps/*`, `backend`, `database` are placeholders.
- No live card provider connected; Celo smart contract not audited (not for mainnet).
