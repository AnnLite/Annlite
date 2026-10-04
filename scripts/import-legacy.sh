#!/usr/bin/env bash
# Imports the existing AnnLite repositories INTO this monorepo, preserving Git history
# (git subtree). Run from the repo root, with network access, on a clean working tree.
#   ./scripts/import-legacy.sh           # import everything that is reachable
#   ./scripts/import-legacy.sh --dry-run # only print what would happen
# Missing/private repos are skipped and reported. Review docs/governance/MIGRATION.md first.
set -uo pipefail
ORG="${ORG:-AnnLite}"; BRANCH="${BRANCH:-main}"; DRY=0
[[ "${1:-}" == "--dry-run" ]] && DRY=1

# "legacy-repo:target-directory"  (annlite-* family, from the Ann-Lite meta-repo)
MAP=(
  "annlite-web:apps/web"
  "annlite-mobile:apps/mobile"
  "annlite-admin:apps/admin"
  "annlite-backend:backend"
  "annlite-database:database"
  "annlite-content:content"
  "annlite-payments:payments/cards"
  "annlite-celoht:payments/celoht"
  "annlite-design-system:design-system"
  "annlite-security:security"
  "annlite-infrastructure:infrastructure"
  "annlite-docs:docs/legacy-docs"
  "annlite-invest-book:docs/governance/invest-book"
  # ann-lite-* family (older/parallel generation) — imported to legacy/ for manual merge:
  "ann-lite-web:legacy/ann-lite-web"
  "ann-lite-api:legacy/ann-lite-api"
  "ann-lite-contracts:payments/celoht/contracts"
  "ann-lite-content:legacy/ann-lite-content"
  "ann-lite-admin:legacy/ann-lite-admin"
  "ann-lite-docs:legacy/ann-lite-docs"
)

ok=(); skipped=()
for entry in "${MAP[@]}"; do
  repo="${entry%%:*}"; dir="${entry##*:}"; url="https://github.com/${ORG}/${repo}.git"
  if [[ -e "$dir/.imported" ]]; then skipped+=("$repo (already imported)"); continue; fi
  if ! git ls-remote --exit-code "$url" "$BRANCH" >/dev/null 2>&1; then skipped+=("$repo (unreachable/private/no $BRANCH)"); continue; fi
  echo "→ $repo  =>  $dir"
  if [[ $DRY -eq 0 ]]; then
    rm -f "$dir/.gitkeep"
    if git subtree add --prefix="$dir" "$url" "$BRANCH" -m "chore(migration): import $repo into $dir (history preserved)"; then
      ok+=("$repo"); echo "$repo@$(date -u +%FT%TZ)" > "$dir/.imported"
      git add "$dir/.imported" && git commit -qm "chore(migration): mark $repo imported"
    else skipped+=("$repo (subtree failed)"); fi
  else ok+=("$repo (dry-run)"); fi
done
echo; echo "Imported:"; printf '  %s\n' "${ok[@]:-none}"
echo "Skipped:";  printf '  %s\n' "${skipped[@]:-none}"
echo; echo "NEXT: reconcile duplicates (annlite-* vs ann-lite-*), then run pnpm install && pnpm test."
