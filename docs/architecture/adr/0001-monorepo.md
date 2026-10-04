# ADR 0001 — Consolidate into one monorepo
**Status:** accepted (owner decision). **Replaces:** "one responsibility per repository" + git-submodule meta-repo.
**Why:** one place for atomic changes across web/mobile/admin/backend/payments, shared types, one CI, one security policy.
**Trade-offs:** larger repo, shared release cadence. Mitigated with path-filtered CI, CODEOWNERS and clear package boundaries.
**Kept rule:** only `backend` talks to the database; frontends never hold secrets.
