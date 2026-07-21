# Merge Develop Into Branches

Simple, direct merge of the latest `develop` into every remote feature branch.

Run from the repository root with `git_write` and `full_network` permissions.

**Script:** `scripts/merge-develop-into-branches.sh` (`BASE_BRANCH="develop"` at the top).

## Goal

Update all feature branches with `develop` in one straight pass: fetch, pull
`develop`, merge into each remote branch, push.

## Run

```bash
bash scripts/merge-develop-into-branches.sh
```

Or:

```bash
npm run branches:merge-develop-into-all
```

## What it does

1. `git fetch --all --prune`
2. `git checkout develop && git pull origin develop`
3. List every `origin/*` branch except `main`, `develop`, `HEAD`
4. For each branch:
   - Print a `=========================================` header
   - Create local tracking branch if missing, else checkout + pull
   - `git merge develop --no-edit`
   - `git push origin <branch>`
5. Return to `develop`
6. Print `✅ All branches updated from develop`

## On conflict

The script uses `set -e` — the **first merge conflict stops the run** on that
branch with a non-zero exit. Resolve manually:

```bash
git status
git diff --name-only --diff-filter=U
# fix files, then:
git add <resolved-files>
git commit --no-edit
git push origin <branch>
bash scripts/merge-develop-into-branches.sh   # continue with remaining branches
```

Or abort: `git merge --abort` and `git checkout develop`.

## Hard rules

- **Never** modify or push to `main`
- **Never** force-push
- Prefer a **clean working tree** before running (uncommitted changes can interfere)

## Usage example

```text
/merge-develop-into-branches
```

## Related

- `/autocommit` — semantic commits for feature work
