# Architecture

AnnLite is one product monorepo. Features share one web app and design language; applications do not maintain separate copies of payment or data-access logic.

```text
apps/
     web/                 Vite/React experience; public UI and local-only preview state
     mobile/              placeholder for reviewed mobile application import
     admin/               placeholder for reviewed administration application import
backend/               future API boundary; only service permitted to access the database
database/              future schema, migrations, and seeds
content/               future licensed and editorial content source
design-system/         future shared package; web styles are currently app-local
payments/
     core/                implemented state, webhook, idempotency, and chain-verification primitives
     celoht/               placeholder; no provider connection
     cards/                placeholder; no card provider connection
tests/                  future cross-service suites
```

## Current runtime boundaries

- The web app calls no production API and has no database connection.
- Bible excerpts are a small, cited selection from the public-domain World English Bible. A complete Bible and licensed translations are not bundled.
- Bookmarks, reading history, notes, prayer-journal entries, preferences, and daily progress are stored in the current browser only. They are not encrypted, uploaded, or synchronized between devices. Avoid using the private journal on shared devices.
- Community, charity, account, and production donation services are not connected. Their empty states describe this explicitly; no live data is simulated.

## Future service boundaries

- **Frontend → backend:** send validated requests to a documented API. Never connect a browser directly to the production database.
- **Backend → database:** only the backend may hold database credentials. Schema changes use reviewed migrations.
- **Provider → backend:** accept webhooks only after HMAC verification, timestamp/replay validation, and atomic idempotency checks.
- **Chain → backend:** verify transaction receipt, recipient, asset, amount, and confirmations server-side through an injected chain reader.
- **Administration:** isolate privileged actions behind server-side RBAC and audit logging before enabling an admin UI.

## Payment lifecycle

The shared primitive defines `created → pending → confirmed | failed | expired` and `confirmed → refunded` in `payments/core/src/stateMachine.ts`. A UI event is never proof of payment. Production persistence and provider integrations are not implemented yet.
