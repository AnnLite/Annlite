# Threat model (initial, STRIDE-style) — to be refined with the legacy `annlite-security` content
| Asset | Threat | Mitigation | Status |
|---|---|---|---|
| Payment status / charity totals | Forged "success" from client | Server-side verification only; status changes via signed webhook or on-chain check | Implemented in `payments/core` (tested) |
| Webhook endpoint | Spoofing, replay | HMAC-SHA256 + timestamp tolerance | Implemented (tested) |
| Webhook endpoint | Duplicate delivery → double credit | Idempotency key, atomic claim | Interface + in-memory impl (production store must be a DB unique constraint) |
| Donations (crypto) | Wrong recipient/asset/amount, reverted tx, reorg | Re-read receipt, check recipient/asset/amount, min confirmations | Implemented (tested) |
| User accounts | Credential stuffing, brute force | Rate limiting, hashed passwords, JWT expiry | Verify in imported backend |
| Admin | Privilege escalation | RBAC, audit logs, MFA where implemented | Verify in imported admin |
| Database | Direct access from clients | Only backend holds `DATABASE_URL` | Architectural rule |
| Secrets | Leak via Git | `.gitignore`, `.env.example`, secret scanning | Configure on GitHub |
| Smart contracts | Logic bugs | Independent audit before mainnet | **Not done** |
