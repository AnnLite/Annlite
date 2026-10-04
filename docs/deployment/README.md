# Deployment

The `apps/web` preview builds as a static Vite site with `pnpm --filter @annlite/web build`. It includes an installable PWA shell and a service worker that caches the built app shell; it does not make remote APIs or the full content catalog available offline. The published artifact includes `apps/web/public/CNAME` for the custom domain `annlite.com` and emits a `404.html` fallback for client-side routes.

GitHub Pages deploys through Actions after quality gates pass. The canonical URL is `https://annlite.com/`; `https://annlite.github.io/Annlite/` remains an alternate Pages URL.

Configure these DNS records at the domain registrar for the apex domain:

| Type | Host | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

Optionally add GitHub's recommended AAAA records for IPv6. To serve `www.annlite.com`, add a CNAME record for `www` targeting `annlite.github.io` (hostname only). Once DNS resolves, set `annlite.com` under **Repository Settings → Pages** and enable **Enforce HTTPS**. DNS does not currently resolve from this environment, so registrar setup is still required before the custom URL will work.

Production hosting, release environments, API deployment, database operations, backups, and runtime monitoring are not configured. Do not infer a production deployment from the presence of a successful local build or CI run. Configure hosting and secrets only after the infrastructure and backend are reviewed.

Keep secrets in the hosting platform's secret manager, never in Git or client-visible variables. Do not deploy unaudited contracts to mainnet; no mainnet deployment is claimed.
