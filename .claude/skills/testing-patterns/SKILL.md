---
name: testing-patterns
description: >-
  Testing layers (Vitest, Angular Testing Library, Playwright), HTTP mocking, data-testid
  conventions, axe-core a11y and the mandatory pre-commit gate. Use when adding or fixing tests,
  or when validating a change before commit.
---

# 🧪 Testing Patterns

Conventions for unit, component, and end-to-end tests in **TuriaFestNoticias**, and the **pre-commit gate** that enforces them.

## Layers

| Layer        | Tooling                       | Scope                                   | Runs on commit | Runs on CI |
| ------------ | ----------------------------- | --------------------------------------- | :------------: | :--------: |
| Unit         | Vitest                        | Services, pipes, stores, pure functions |       ✅       |     ✅     |
| Component    | Angular Testing Library       | Component DOM + interaction             |       ✅       |     ✅     |
| E2E          | Playwright                    | Full user journeys                      |       ❌       |     ✅     |
| Accessibility | axe-core inside Playwright    | WCAG 2.1 AA on critical routes          |       ❌       |     ✅     |
| Visual       | Storybook + Chromatic (opt.)  | Design-system regressions               |       ❌       |     ✅     |

**Vitest** is the only unit/component runner. Jasmine is **not** used.

---

## The pre-commit gate (NON-NEGOTIABLE)

Every commit that touches code in `src/` MUST pass the following gate **before** `git commit` is invoked. This applies to humans, Claude, and CI alike.

### The gate

```bash
npm run lint && npm test -- --run
```

- `npm run lint` — must exit `0`. Warnings allowed only if listed in the ignore file; new warnings fail.
- `npm test -- --run` — Vitest single-pass (no watch). Must exit `0`.

E2E and visual tests do **not** run pre-commit (too slow). They run on CI for every PR and must be green before merge to `main`.

### What "fail" means

If either command exits non-zero:

1. **Do not commit.** Period.
2. **Fix the underlying cause.** Either:
   - The production code change broke a test → fix the production code, or fix the test if its expectation was wrong.
   - The test itself is broken → fix the test.
3. **Re-run the gate.** Only commit when it is green.

If the fix is large enough that it cannot be done in the same session:

- **Revert the offending change** (`git restore <file>` or `git stash`).
- Do not leave broken tests committed on `main`.

### What "don't commit" means specifically

- **Never commit a failing test.** A red test in the repo is a lie — it tells contributors "this used to be true." Either green or deleted.
- **Never `--no-verify`** to bypass the hook. The hook exists because rules need teeth.
- **Never disable tests to make the gate pass.** If a test must be skipped, see "Skipping" below.

### Skipping (with discipline)

You may mark a test as `.skip` **only** with:

1. A reason in the test description.
2. An expiry condition (date, PR number, or issue) in a comment.

```ts
it.skip('handles SSR hydration of map markers — expires 2026-08-01, see issue #142', () => {
  // ...
});
```

The agent **testing** scans for `it.skip(`/`describe.skip(` and surfaces any past-expiry skips in its weekly health report. Skips without an expiry are a bug.

---

## Authoring rules

- **One spec file per source file**, co-located: `festival.service.ts` → `festival.service.spec.ts`.
- **Mock `HttpClient`** with `provideHttpClientTesting()`. **Never** hit real endpoints — not even Sanity.
- **Mock Sanity** via the same interceptor pattern; never let the test suite touch the network.
- **Assert against `data-testid`**, never against translated strings — Spanish copy will change with [[internationalization]].
- **Every component**: at least one render test and one interaction test.
- **Every service public method**: at least one test of the happy path and one of the failure path.
- **Every Zod schema** (see [[api-integration]]): a `parse` test with a valid fixture and a `safeParse` test with a malformed one.

### `data-testid` naming convention

- Kebab-case, two-segment minimum: `<component>-<role>`.
- Examples: `festival-card`, `festival-card-cta`, `search-bar-input`, `filter-chip-active`.
- For lists, append the unique identifier: `festival-card-fib-benicassim`.
- The attribute is stripped from production builds via an Angular build optimizer rule (configured later in `angular.json`).

### Deterministic tests

- No `setTimeout`, no real timers. Use `vi.useFakeTimers()`.
- No `Math.random()`. Inject a seedable RNG.
- No `new Date()` without a fixed clock. Inject `Clock` or use `vi.setSystemTime()`.
- No network. No filesystem. No `localStorage` writes that survive the test.

### Coverage targets

- Services: **≥ 90 %**
- Components: **≥ 70 %**
- Overall: **≥ 80 %**

Coverage is enforced in CI, not pre-commit (too slow). A drop below threshold fails the PR.

---

## E2E smoke suite

Runs in CI for every PR. The suite below must stay green at all times.

1. Load home → see at least one featured festival.
2. Open `/festivales` → filter by *Provincia: Castellón* → result includes FIB.
3. Open FIB detail → line-up section renders headliners.
4. Search by artist name (`"Rosalía"`) → matching festival appears within 500 ms.
5. Open festival detail on mobile viewport (375 × 667) → layout renders without horizontal scroll.
6. Tab through home → focus ring visible at every step.

Adding new critical flows means adding new entries here.

---

## Pre-commit hook setup (recipe)

When implementation begins, wire the gate with **Husky + lint-staged**. Do not commit code before this is configured.

### `package.json` additions

```jsonc
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "src/**/*.{ts,html}": ["eslint --max-warnings=0"],
    "src/**/*.spec.ts": ["vitest related --run"]
  },
  "devDependencies": {
    "husky": "^9.1.0",
    "lint-staged": "^16.0.0"
  }
}
```

### `.husky/pre-commit`

```bash
#!/usr/bin/env sh
npx lint-staged
npm test -- --run --changed
```

- `lint-staged` lints only staged files (fast).
- `vitest --changed` re-runs only specs affected by staged files (fast).
- The final `npm test -- --run` ensures the whole project still compiles cleanly.

### Why this exact setup

- **Husky** is the standard pre-commit hook manager for npm projects.
- **lint-staged** prevents the gate from scanning the whole repo on every commit — only what changed.
- **Vitest's `--changed`** flag uses Git to find affected specs; fast for incremental work.
- The full `npm test -- --run` at the end catches cross-file regressions that `--changed` would miss.

---

## When CI must run the full suite

- On every PR opened against `main`.
- On every push to `main` after merge.
- Nightly on `main` for flaky detection.

A green CI run is the merge gate; the pre-commit hook is the commit gate. Both must be green for code to land.

---

## Anti-patterns

- ❌ Committing with `--no-verify`.
- ❌ `it.only` or `describe.only` left in the suite.
- ❌ Commented-out tests. Either delete or skip with expiry.
- ❌ Snapshot tests of full DOM trees. Snapshot small, intentional outputs only.
- ❌ Tests that assert against rendered Spanish copy.
- ❌ Tests that depend on test execution order.
- ❌ Sleeping in tests (`await new Promise(r => setTimeout(r, 100))`).

---

## Examples

Worked examples: a Vitest service test, an Angular Testing Library component test, and a Zod schema test.

➡️ Moved to [`references/examples.md`](references/examples.md) to keep this SKILL.md lean.

## Related skills

- [[project-structure]]
- [[accessibility]]
