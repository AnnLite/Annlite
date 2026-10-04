# Contributing to AnnLite
Thank you for helping! 
1. Fork the repo and create a branch: `feat/<short-name>` or `fix/<short-name>`.
2. Run `pnpm install`, then `pnpm lint && pnpm typecheck && pnpm test`.
3. Use [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat(payments): ...`).
4. Open a Pull Request using the template.

Rules: never commit secrets; payment status changes happen server-side only; only the backend accesses the database; respect licensing for Bible/content material.
Security issues: do **not** open a public issue — see [SECURITY.md](SECURITY.md).
