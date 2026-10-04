# Roadmap
Status labels: ✅ done · 🔄 in progress · 📝 planned. Nothing here is a promise of dates.

## v0.1 — Foundation ✅
- Monorepo structure, docs, CI/security automation, payments core (tested), legacy import script.

## v0.2 — Consolidation 🔄
- Import legacy repositories with history; reconcile `annlite-*` vs `ann-lite-*`.
- Green CI for web, backend, admin, database.

## v0.3 — Payments hardening 📝
- Connect a card provider in sandbox; end-to-end webhook tests.
- CeloHT flow verified on testnet using `payments/core`.

## v0.4 — Security & compliance 📝
- Independent audit of Celo smart contracts.
- Threat model review, dependency and secret scanning in CI, incident-response runbook.

## v1.0 — Production 📝
- Production deployment, monitoring, backups, public transparency reporting.
