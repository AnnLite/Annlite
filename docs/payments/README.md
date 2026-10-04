# Payments
Two channels, one backend contract:
1. **CeloHT dApp** — CELO and USDm (stablecoin). Verified on-chain by the backend. Code: `payments/celoht/`.
2. **Visa / Mastercard** — through a card provider. AnnLite never stores raw card data. Code: `payments/cards/`.

Shared, tested primitives: `payments/core` (state machine, webhook HMAC verification with replay window, idempotency, on-chain donation verification).
**Status:** no live provider connected and no mainnet deployment is claimed. See SECURITY.md and docs/governance/MIGRATION.md.
