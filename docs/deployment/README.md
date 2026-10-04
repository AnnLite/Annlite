# Deployment

The `apps/web` preview builds as a static Vite site with `pnpm --filter @annlite/web build`. GitHub Pages is configured for Actions deployment at `https://annlite.github.io/Annlite/`; the Pages build sets `ANNLITE_PAGES=true` so assets, routes, PWA scope, and metadata use the `/Annlite/` project base. The build emits a `404.html` fallback for client-side routes. It includes an installable PWA shell and a service worker that caches the built app shell; it does not make remote APIs or the full content catalog available offline.

Production hosting, release environments, API deployment, database operations, backups, and runtime monitoring are not configured. Do not infer a production deployment from the presence of a successful local build or CI run. Configure hosting and secrets only after the infrastructure and backend are reviewed.

Keep secrets in the hosting platform's secret manager, never in Git or client-visible variables. Do not deploy unaudited contracts to mainnet; no mainnet deployment is claimed.
