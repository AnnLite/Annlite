# Deployment

The `apps/web` preview builds as a static Vite site with `pnpm --filter @annlite/web build`. It includes an installable PWA shell and a service worker that caches the built app shell; it does not make remote APIs or the full content catalog available offline. The artifact includes `CNAME` for `annlite.com` and a `404.html` fallback for client-side routes.

The two origins are built and deployed separately so neither depends on redirecting to the other:

- `https://annlite.github.io/Annlite/` uses the `/Annlite/` asset base and GitHub Pages metadata.
- `https://annlite.com/` uses the root asset base and custom-domain metadata, deployed as a Cloudflare Pages project named `annlite`.

GitHub Pages deploys after CI passes. The independent Cloudflare deployment also runs after CI, but is safely skipped until repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are configured. Create a Cloudflare Pages project named `annlite` and attach `annlite.com` before enabling those secrets.

To keep the two origins independent, point the domain's DNS only at Cloudflare; do not add GitHub Pages apex A records. Delegate the domain's nameservers to Cloudflare, add `annlite.com` as a custom domain on the Cloudflare Pages project, and use the DNS records Cloudflare assigns. Configure `www.annlite.com` with the CNAME target Cloudflare provides if the `www` host is needed. Enable HTTPS after Cloudflare validates DNS. DNS currently has no records, so registrar access and Cloudflare project setup are required before `annlite.com` can resolve.

Production hosting, release environments, API deployment, database operations, backups, and runtime monitoring are not configured. Do not infer a production deployment from the presence of a successful local build or CI run. Configure hosting and secrets only after the infrastructure and backend are reviewed.

Keep secrets in the hosting platform's secret manager, never in Git or client-visible variables. Do not deploy unaudited contracts to mainnet; no mainnet deployment is claimed.
