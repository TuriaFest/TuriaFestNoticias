#!/usr/bin/env bash
# update-branches-from-develop.sh
#
# Merge the latest `develop` into every remote feature branch.
# Never modifies `main`. Requires a clean working tree.
#
# Usage:
#   bash scripts/update-branches-from-develop.sh
#   npm run branches:update-from-develop

set -euo pipefail

readonly EXCLUDED=(main develop HEAD)  # documented in Skipped report; filtered in is_excluded

log()  { printf '%s\n' "$*"; }
fail() { printf '%s\n' "$*" >&2; exit 1; }

# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

git rev-parse --git-dir >/dev/null 2>&1 \
  || fail "Not a git repository."

if [[ -n "$(git status --porcelain)" ]]; then
  log "❌ Working tree is not clean."
  log "Commit or stash your changes before running this command."
  exit 1
fi

ORIGINAL_BRANCH="$(git branch --show-current)"
UPDATED=()
SKIPPED=(main develop)
CONFLICT_BRANCH=""
RESULT="✅ Success"

restore_original_branch() {
  git checkout "$ORIGINAL_BRANCH" >/dev/null 2>&1 || true
}

print_report() {
  log ""
  log "========================================="
  log "Branch Update Report"
  log "========================================="
  log ""
  log "Updated:"
  if ((${#UPDATED[@]})); then
    for b in "${UPDATED[@]}"; do
      log "- $b"
    done
  else
    log "- none"
  fi
  log ""
  log "Skipped:"
  for b in "${SKIPPED[@]}"; do
    log "- $b"
  done
  log ""
  log "Conflicts:"
  if [[ -n "$CONFLICT_BRANCH" ]]; then
    log "- $CONFLICT_BRANCH"
  else
    log "- none"
  fi
  log ""
  log "Original branch restored:"
  log "- $ORIGINAL_BRANCH"
  log ""
  log "Result:"
  log "$RESULT"
}

abort_on_conflict() {
  local branch="$1"
  CONFLICT_BRANCH="$branch"
  RESULT="⚠️ Awaiting agent resolution"
  log ""
  log "❌ Conflict detected in branch: $branch"
  log ""
  log "Conflicted files:"
  git diff --name-only --diff-filter=U | while read -r f; do
    log "  - $f"
  done
  log ""
  log "Agent: resolve conflicts per .claude/commands/update-branches-from-develop.md"
  log "  git add <resolved-files>"
  log "  git commit --no-edit"
  log "  git push origin $branch"
  log "  bash scripts/update-branches-from-develop.sh"
  # Leave merge in progress on $branch — do not abort or restore.
  exit 2
}

is_excluded() {
  local name="$1"
  case "$name" in
    main|develop|HEAD|origin) return 0 ;;
    *) return 1 ;;
  esac
}

# ---------------------------------------------------------------------------
# Step 1 — current branch already saved
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Step 2 — fetch
# ---------------------------------------------------------------------------

log "Fetching latest changes..."
git fetch --all --prune

# ---------------------------------------------------------------------------
# Step 3 — verify develop
# ---------------------------------------------------------------------------

git show-ref --verify --quiet refs/heads/develop \
  || fail "Local branch 'develop' does not exist. Aborting."

if ! git ls-remote --heads origin develop | grep -q .; then
  fail "Remote branch 'origin/develop' does not exist. Aborting."
fi

# ---------------------------------------------------------------------------
# Step 4 — update develop
# ---------------------------------------------------------------------------

log "Updating develop..."
git checkout develop
git pull origin develop

# ---------------------------------------------------------------------------
# Step 5 — list remote branches (exclude main, develop, HEAD)
# ---------------------------------------------------------------------------

REMOTE_BRANCHES=()
while IFS= read -r name; do
  [[ -z "$name" ]] && continue
  is_excluded "$name" && continue
  REMOTE_BRANCHES+=("$name")
done < <(
  git for-each-ref 'refs/remotes/origin/**' --format='%(refname:short)' \
    | sed 's|^origin/||' \
    | sort -u
)

if ((${#REMOTE_BRANCHES[@]} == 0)); then
  log "No feature branches to update."
  restore_original_branch
  print_report
  exit 0
fi

log ""
log "Updating all branches from develop..."

# ---------------------------------------------------------------------------
# Step 6 — process each branch
# ---------------------------------------------------------------------------

for branch in "${REMOTE_BRANCHES[@]}"; do
  log ""
  log "→ $branch"

  if git show-ref --verify --quiet "refs/heads/$branch"; then
    git checkout "$branch"
    git pull origin "$branch"
  else
    git checkout -b "$branch" "origin/$branch"
  fi

  if ! git merge develop --no-edit; then
    abort_on_conflict "$branch"
  fi

  git push origin "$branch"
  UPDATED+=("$branch")
  log "✓ $branch"
done

# ---------------------------------------------------------------------------
# Completion — restore original branch
# ---------------------------------------------------------------------------

restore_original_branch

log ""
log "Done."

print_report
