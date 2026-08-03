---
name: testing-patterns
description: >-
  Testing layers (Vitest + jsdom, Playwright), HTTP/network mocking, data-testid
  conventions, axe-core a11y and the mandatory pre-commit gate. Use when adding or fixing tests,
  or when validating a change before commit.
---

# 🧪 Testing Patterns

Conventions for unit, DOM/island, and end-to-end tests in **TuriaFestNoticias** (Astro 7, static output), and the **pre-commit gate** that enforces them.

## Layers

| Layer          | Tooling                     | Scope                                                              | Runs on commit | Runs on CI |
| -------------- | ---------------------------- | ------------------------------------------------------------------- | :------------: | :--------: |
| Unit           | Vitest                        | `src/data`, `src/lib`, `src/i18n` — framework-agnostic domain logic |       ✅       |     ✅     |
| DOM / island   | Vitest + jsdom                 | Client islands in `src/scripts/*` (theme, i18n switch, nav, search) |       ✅       |     ✅     |
| E2E            | Playwright                    | Full user journeys against the built static site                    |       ❌       |     ✅     |
| Accessibility  | axe-core inside Playwright     | WCAG 2.1 AA on critical routes                                       |       ❌       |     ✅     |
| Visual         | Storybook + Chromatic (opt.)   | Design-system regressions                                            |       ❌       |     ✅     |

**Vitest** (with `environment: 'jsdom'`, configured in `vitest.config.mts`) is the only unit/DOM test runner. There is no Angular Testing Library, no `TestBed`, no Jasmine.

Specs import test globals explicitly — **globals are not enabled**:

```ts
import { describe, it, expect } from 'vitest';
```

---

## The pre-commit gate (NON-NEGOTIABLE)

Every commit that touches code in `src/` MUST pass the following gate **before** `git commit` is invoked. This applies to humans, Claude, and CI alike.

### The gate

```bash
npm run lint && npm test -- --run
```

- `npm run lint` — runs `astro check` (type-checking + Astro template diagnostics). Must exit `0`.
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
it.skip('handles the language-switcher island under a flaky matchMedia mock — expires 2026-08-01, see issue #142', () => {
  // ...
});
```

The agent **testing** scans for `it.skip(`/`describe.skip(` and surfaces any past-expiry skips in its weekly health report. Skips without an expiry are a bug.

---

## Authoring rules

- **One spec file per source file**, co-located: `news-search.ts` → `news-search.spec.ts`, `theme.ts` → `theme.spec.ts`.
- **Never hit the real network.** Domain modules under `src/data` / `src/lib` / `src/i18n` are pure TypeScript today — no HTTP calls to mock. When a remote endpoint (Sanity or otherwise) is introduced per [[api-integration]], mock `fetch` (e.g. with `vi.stubGlobal('fetch', ...)` or `msw`) — never let a spec touch a real origin.
- **Mock browser globals explicitly** for island tests: `window.matchMedia`, `localStorage`, `document.documentElement` — see the `theme.spec.ts` pattern below. Always restore the real global in `afterEach` so mocks never leak across specs.
- **Assert against `data-testid`**, never against translated strings — Spanish copy will change with [[internationalization]]. Exception: pure i18n-resolver tests (`src/i18n/index.spec.ts`) legitimately assert against known dictionary values because the resolver itself is under test.
- **Every island / DOM-touching module**: at least one render/initialization test and one interaction test.
- **Every exported function in `src/data`, `src/lib`, `src/i18n`**: at least one happy-path test and one edge-case/failure test.
- **Every Zod schema** (see [[api-integration]], roadmap once remote DTOs land): a `parse` test with a valid fixture and a `safeParse` test with a malformed one.

### `data-testid` naming convention

- Kebab-case, two-segment minimum: `<component>-<role>`.
- Examples: `news-card`, `news-card-cta`, `search-bar-input`, `filter-chip-active`.
- For lists, append the unique identifier: `news-card-zevra-2026-presale`.
- Set the attribute directly in `.astro` markup; it ships in the static HTML (no build-time stripping step exists yet — do not rely on one).

### Deterministic tests

- No `setTimeout`, no real timers. Use `vi.useFakeTimers()`.
- No `Math.random()`. Inject a seedable RNG.
- No `new Date()` without a fixed clock. Use `vi.setSystemTime()`.
- No network. No filesystem. No `localStorage` writes that survive the test — clear it in `beforeEach`/`afterEach` (see `theme.spec.ts`).
- Restore any patched global (`window.matchMedia`, `document.documentElement` attributes) in `afterEach`.

### Coverage targets

- `src/data` / `src/lib` / `src/i18n` (domain modules): **≥ 90 %**
- `src/scripts` (client islands, DOM-dependent): **≥ 70 %**
- Overall: **≥ 80 %**

Coverage is enforced in CI, not pre-commit (too slow). A drop below threshold fails the PR.

---

## E2E smoke suite

Runs in CI for every PR (Playwright, against the built static site — `astro build` + `astro preview` or the deployed preview). The suite below must stay green at all times.

1. Load `/noticias` → at least one news card renders.
2. Open a news article detail (`/noticias/:slug`) → headline, dateline, and body render.
3. Use the news search island → querying an artist or city name (e.g. `"Alicante"`) filters the list within 500 ms, diacritic-insensitive.
4. Toggle the theme switcher → `data-theme` on `<html>` updates and persists across reload.
5. Switch language via the language-switcher island → `data-i18n` anchors re-resolve to the new locale.
6. Open a news article on mobile viewport (375 × 667) → layout renders without horizontal scroll.
7. Tab through `/noticias` → focus ring visible at every step.

When the roadmap festival catalogue (`/festivales`, `/festivales/:slug`) ships, extend this suite with the equivalent browse → filter → detail journeys described in `.claude/agents/testing.md`.

Adding new critical flows means adding new entries here.

---

## Vitest config reference

`vitest.config.mts` is the source of truth for aliases and test discovery:

```ts
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const alias = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@data': alias('./src/data'),
      '@i18n': alias('./src/i18n'),
      '@lib': alias('./src/lib'),
      '@assets': alias('./src/assets'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
  },
});
```

Use the `@data` / `@i18n` / `@lib` / `@assets` aliases in specs, matching production imports — never deep relative climbs.

---

## When CI must run the full suite

- On every PR opened against `main`.
- On every push to `main` after merge.
- Nightly on `main` for flaky detection.

A green CI run is the merge gate; the pre-commit gate (`npm run lint && npm test -- --run`) is the commit gate. Both must be green for code to land.

---

## Anti-patterns

- ❌ Committing with `--no-verify`.
- ❌ `it.only` or `describe.only` left in the suite.
- ❌ Commented-out tests. Either delete or skip with expiry.
- ❌ Snapshot tests of full DOM trees. Snapshot small, intentional outputs only.
- ❌ Tests that assert against rendered Spanish copy (outside the i18n resolver itself).
- ❌ Tests that depend on test execution order.
- ❌ Sleeping in tests (`await new Promise(r => setTimeout(r, 100))`).
- ❌ Leaking a mocked `window.matchMedia` / `localStorage` state into the next spec — always restore in `afterEach`.

---

## Examples

Worked examples: a pure-domain Vitest unit test, a jsdom island test with mocked browser globals, and a Zod schema test (roadmap, once remote DTOs land).

➡️ Moved to [`references/examples.md`](references/examples.md) to keep this SKILL.md lean.

## Related skills

- [[project-structure]]
- [[accessibility]]
