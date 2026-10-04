# Security overview

## Current preview

- The web app has no backend connection, authentication, analytics, donation processing, or public community feed.
- Personal preferences, bookmarks, notes, prayer-journal entries, reading history, and progress are stored in browser `localStorage`. They are not uploaded, encrypted, or protected from other people with access to the same browser profile. Users can export or delete this data in the app.
- Only cited public-domain Scripture excerpts and clearly labeled original prayer copy are included. Other content integrations are not connected.
- No production payment provider, blockchain RPC, or private key is configured.

## Required before production

- Keep database credentials and provider secrets on the backend; never expose them through frontend environment variables.
- Use server-authoritative payment state, atomic idempotency, webhook HMAC verification, timestamp tolerance, and replay protection.
- Verify Celo receipts server-side. Do not treat client success or an unconfirmed transaction as a donation.
- Integrate cards only through a compliant hosted/secure provider flow; AnnLite must not collect raw card numbers or CVV.
- Add reviewed rate limits, RBAC, audit logging, privacy retention rules, dependency/security scanning, and safe community reporting/moderation before enabling those features.
- Do not deploy unaudited contracts to mainnet. No mainnet deployment is claimed.

AnnLite never promises salvation or a place in heaven in exchange for platform use or donations. Report vulnerabilities privately using [GitHub Security Advisories](https://github.com/AnnLite/AnnLite/security/advisories/new).
