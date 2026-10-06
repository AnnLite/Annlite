# AnnLite Backend

This backend layer is the server-authoritative boundary for AnnLite. It is intentionally minimal and explicit: it exposes health and status endpoints, defines the runtime configuration contract, and keeps all provider integration logic out of the public web client.

## Current scope

- Health endpoint: `/health`
- Status endpoint: `/api/v1/status`
- Structured logging via a shared logger
- CORS and environment-aware config
- Payment provider flag gating for future provider integration

## Security posture

- No secrets are committed to the repo.
- Only the backend may talk to provider or database services.
- Client-side apps must never receive signed webhook secrets or private keys.
- Provider activation remains gated behind explicit configuration and production review.

## Planned API domains

- Auth and user identity
- Donations and charitable giving
- Charity and beneficiary admin records
- Content publishing and moderation
- Webhook processing and provider reconciliation
- Audit logging and report exports

## Local work

```bash
cd backend
pnpm install
pnpm dev
```

Then test:

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/v1/status
```
