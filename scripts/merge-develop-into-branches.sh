#!/usr/bin/env bash
# merge-develop-into-branches.sh
#
# Simple pass: merge the latest `develop` into every remote feature branch
# and push. Stops on the first merge conflict. Never touches `main`.
#
# Usage:
#   bash scripts/merge-develop-into-branches.sh
#   npm run branches:merge-develop-into-all

set -euo pipefail

BASE_BRANCH="develop"

echo "Fetching latest changes..."
git fetch --all --prune

echo "Updating local ${BASE_BRANCH}..."
git checkout "$BASE_BRANCH"
git pull origin "$BASE_BRANCH"

REMOTE_BRANCHES=()
while IFS= read -r branch; do
  [[ -z "$branch" ]] && continue
  case "$branch" in
    main|develop|HEAD) continue ;;
    *) REMOTE_BRANCHES+=("$branch") ;;
  esac
done < <(
  git branch -r \
    | grep 'origin/' \
    | sed 's|^[[:space:]]*origin/||' \
    | sort -u
)

for branch in "${REMOTE_BRANCHES[@]}"; do
  echo ""
  echo "========================================="
  echo "Updating branch: $branch"
  echo "========================================="

  if ! git show-ref --verify --quiet "refs/heads/$branch"; then
    git checkout -b "$branch" "origin/$branch"
  else
    git checkout "$branch"
    git pull origin "$branch"
  fi

  git merge "$BASE_BRANCH" --no-edit
  git push origin "$branch"
done

git checkout "$BASE_BRANCH"
echo ""
echo "✅ All branches updated from ${BASE_BRANCH}"
