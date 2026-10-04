# Architecture
```
User ── Web / Mobile ──▶ Backend API ──┬─ Database (PostgreSQL + Prisma)
                         ▲             ├─ Content (multilingual: ht / fr / en)
                    Admin (RBAC)       └─ Payments ─┬─ CeloHT dApp (CELO / USDm)
                                                    └─ Cards (Visa / Mastercard via provider)
```
## Trust boundaries
- **Browser/mobile → API:** untrusted. All input validated (zod). Rate limited.
- **API → DB:** only the backend holds `DATABASE_URL`.
- **Provider → API (webhooks):** accepted only with a valid HMAC signature + fresh timestamp; processed once (idempotency key).
- **Chain → API:** a donation is "confirmed" only after the backend re-reads the transaction (`payments/core/src/celo.ts`): status, recipient, asset, amount, confirmations.
- **Admin:** separate app, RBAC, MFA where implemented, every sensitive action audit-logged.
## Payment lifecycle
`created → pending → confirmed | failed | expired`, `confirmed → refunded` (see `payments/core/src/stateMachine.ts`). Amounts/status change **server-side only**.
