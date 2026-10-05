# Payment provider configuration

AnnLite supports a production-ready provider abstraction and a sandbox fallback for local and staging work.

## Required production credentials

For a live card checkout, configure the provider that will handle payment intents, card network processing, webhooks, and refunds.

Typical provider fields:

- `CARD_PROVIDER` — provider name, for example `stripe` or `adyen`
- `CARD_PUBLISHABLE_KEY` — public key for browser-side checkout
- `CARD_SECRET_KEY` — secret key used only on the server-side
- `CARD_WEBHOOK_SECRET` — verifies webhook signatures
- `CARD_API_BASE_URL` — provider API base URL
- `CARD_REFUND_API_KEY` — used for refund operations
- `CARD_LOG_DESTINATION` — audit logging target

The web app expects the provider to expose:

- payment intent creation
- secure checkout session creation
- success and cancellation callbacks
- webhook verification
- payment status lookup
- idempotency keys
- refund and audit logging

## Sandbox fallback

When no production credentials are configured, AnnLite uses the included sandbox mode. This keeps the checkout UX realistic without storing raw card data, CVV, or payment secrets in the browser.

The sandbox flow records:

- payment intent
- checkout status
- approval or cancellation state
- webhook event metadata
- idempotency key
- audit trail label

## Security rules

- Never store raw card numbers or CVV in the browser or repository.
- Verify every webhook signature on the server with a secret stored in environment variables.
- Reuse idempotency keys to prevent duplicate processing.
- Keep provider credentials in a secure runtime secret manager, not in Git.
- Log only minimal payment metadata and transaction identifiers.
