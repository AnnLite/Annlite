# Payments

AnnLite is designed for one donation contract with modular providers. **Payments are not enabled: no card provider or CeloHT production connection is configured, and no donations are currently accepted.**

## Planned providers

- **CeloHT:** CELO and USDm. The future backend must verify chain receipts, recipient, asset, amount, and confirmations. `payments/celoht/` is currently a placeholder.
- **Cards:** Visa and Mastercard through a compliant third-party provider. Card details must be collected by that provider, never by AnnLite. `payments/cards/` is currently a placeholder.

## Implemented shared primitives

`payments/core/` contains a payment state machine, webhook HMAC verification with a replay window, an idempotency-store contract, and injected-reader chain verification. These are primitives, not a connected payment service. Production persistence, provider adapters, webhooks, and end-to-end payment flows remain unimplemented.

The web app therefore displays disabled/coming-soon payment states, no donation form, and no fabricated totals or transactions. Do not describe a payment as successful until a trusted backend confirms it. Never place private keys or provider secrets in frontend code.

See [the migration map](../governance/MIGRATION.md) and [security overview](../security/README.md).
