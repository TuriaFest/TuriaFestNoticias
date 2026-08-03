# Audit TuriaFestNoticias Architecture

Automated architecture auditor for the TuriaFestNoticias Astro project.

Read-only. Strict. Objective. Reports — never modifies.

## Goal

Determine whether the current project state honors the contract defined in `CLAUDE.md`, the rules in `.claude/agents/*.md`, and the patterns in `.claude/skills/*/`. Output a structured report that a developer can act on without further clarification.

This command must not write code, create files, run migrations, or apply fixes. Its only output is the report described below.

## Scope of analysis

The audit must cover, in order:

1. **Project structure** — folder layout under `src/` (`pages/`, `layouts/`, `components/`, `scripts/`, `data/`, `lib/`, `i18n/`, `styles/`, `assets/`) and their expected placement per [[project-structure]].
2. **Architecture compliance** — file-based routing, static generation (`output: 'static'`, `getStaticPaths`), unidirectional data flow (`data/lib/i18n` never importing `.astro`; `scripts/` never importing `.astro` components), path aliases (`@data`, `@i18n`, `@lib`, `@assets`) matching in both `astro.config.mjs` and `tsconfig.json`, Zod validation at any remote-data boundary (roadmap).
3. **Design system** — fonts, colors, spacing tokens defined as CSS custom properties or SCSS variables under `src/styles/`. No hardcoded literal colors, font families, or spacings in component SCSS when a token exists.
4. **Skills compliance** — patterns from `.claude/skills/` actually present in code (api-integration, state-management, routing-navigation, performance-optimization, error-handling, theming-styling, internationalization, accessibility, testing-patterns).
5. **Documentation sync** — `docs/documentacion.md` reflects the current tree (no orphan entries, no missing files).

## Steps

### 1. Load the contract

Read in this order — do not skip:

- `CLAUDE.md` (project contract)
- `docs/documentacion.md` (canonical tree)
- `.claude/skills/project-structure/` (folder rules)
- `.claude/skills/theming-styling/` (token rules)
- `.claude/skills/api-integration/` (DTO + Zod rules)
- `.claude/skills/state-management/`, `sanity-cms/`, `routing-navigation/`, `performance-optimization/`, `error-handling/`, `internationalization/`, `accessibility/`, `testing-patterns/`, `ui-components/`, `forms-validation/`, `search/`, `maps/`, `seo-meta/` — as available
- `.claude/agents/*.md` — for agent ownership boundaries
- `astro.config.mjs` — output mode, redirects, Vite aliases, SCSS `loadPaths`
- `tsconfig.json` — path aliases (must match `astro.config.mjs`)
- `package.json` — declared stack vs. CLAUDE.md canonical table, and the `lint`/`test`/`build`/`deploy` scripts

### 2. Walk the tree

Enumerate `src/`, `public/`, `src/pages/**`, `src/layouts/**`, `src/components/**`, `src/scripts/**`, `src/data/**`, `src/lib/**`, `src/i18n/**`, `src/styles/**`, `src/assets/**`, `docs/`, `.claude/`. Use `find`/`ls`/`Read` — never write.

For each folder, check:

- Does it exist where `CLAUDE.md` says it should?
- Are there extraneous folders not declared in the contract?
- Are there empty folders that should hold real files at this phase?
- Are `.gitkeep` files still present in folders that already contain real files (redundant)?

### 3. Inspect files for architectural violations

For every `.ts` file under `src/data/`, `src/lib/`, `src/i18n/`, and `src/scripts/`, and every `.astro` file under `src/pages/`, `src/layouts/`, `src/components/`:

- **Domain isolation**: does any file under `src/data/`, `src/lib/`, or `src/i18n/` import a `.astro` file? Flag every occurrence — these must stay framework-agnostic and Vitest-testable without Astro.
- **Island isolation**: does any file under `src/scripts/` import a `.astro` component? Flag — islands operate on the rendered DOM and on `data/lib/i18n`, never on Astro component source.
- **Path aliases**: any relative import (`../../../`) that climbs unreasonably far, where a `@data`/`@lib`/`@i18n`/`@assets` alias should have been used instead? Flag.
- **Alias parity**: do `astro.config.mjs`'s Vite `resolve.alias` and `tsconfig.json`'s `compilerOptions.paths` declare the same alias set? Flag any drift.
- **Fetch placement**: any `fetch()` call inside `.astro` frontmatter or `src/scripts/` that reaches a remote origin without going through a `src/data/` module (once remote data exists)? Flag.
- **Business logic in markup**: `.astro` files with long frontmatter blocks doing non-trivial data transformation that belongs in `src/data/` or `src/lib/`. Flag as candidate for extraction.
- **Static generation**: does every dynamic route (`[param].astro`) export a `getStaticPaths()`? Flag any that don't, since `output: 'static'` requires it.
- **DTO validation**: any `src/data/` module reading remote JSON without piping it through a Zod `.parse()`/`.safeParse()` (once remote sources exist). Flag.
- **Hardcoded strings in markup**: visible user-facing copy not routed through a `data-i18n` anchor + the `t()` resolver. Flag with file:line.

### 4. Inspect SCSS for design-system violations

For every `.scss` file under `src/styles/**` and component-colocated partials:

- Literal hex/rgb/hsl colors → must be `var(--fv-*)` or a token.
- Literal `font-family` declarations → must use `var(--fv-font-*)`.
- Literal pixel/rem spacings outside of breakpoints → must use spacing tokens (when defined).
- `@use`/`@import` of partials by relative path instead of the Vite `css.preprocessorOptions.scss.loadPaths` resolution configured in `astro.config.mjs`.

Cross-check that the tokens referenced actually exist in `src/styles/*.scss`. Flag references to undefined tokens.

### 5. Skills compliance matrix

For each skill, produce one row: **applied / partially applied / not yet applied / bypassed**.

- `api-integration` — the local catalogue pattern (`src/data/*.catalogue.ts` + `*.model.ts`) followed consistently; any remote fetch, if present, goes through Zod DTO parsing.
- `state-management` — theme/language state resolved through `src/lib/theme.ts` and `src/i18n/index.ts`, not reimplemented ad hoc inside an island.
- `routing-navigation` — Spanish slugs (`/noticias/:slug`, and roadmap `/festivales/:slug`, `/artistas/:slug`, `/provincia/:provincia`), `getStaticPaths()` present on every dynamic route, redirects centralized in `astro.config.mjs`.
- `performance-optimization` — static prerendering intact, minimal client islands, responsive `<img>`/`srcset` usage, lazy `loading` on below-the-fold images.
- `error-handling` — build-time guards (`throw new Error(...)`) present on every `getStaticPaths()`/detail-page lookup that can miss; islands fail safely to the server-rendered default rather than crashing.
- `theming-styling` — token files present and consumed.
- `internationalization` — `es` source-of-truth keys in `src/i18n/translations.ts`, no diverging keys vs. `ca`/`en` JSON under `src/assets/i18n/`.
- `accessibility` — visible focus styles, semantic landmarks, alt text on images, color contrast tokens.
- `testing-patterns` — Vitest specs colocated (`*.spec.ts`), `data-testid` used, no `it.skip`/`describe.skip` without an expiry comment.

A skill is **bypassed** when code clearly contradicts it (e.g. a `fetch()` in `src/scripts/` reaching a remote origin directly, hex color in markup).

### 6. Documentation sync check

- Every folder/file present in `src/` must appear in the tree diagrams of `docs/documentacion.md`.
- Every entry in `docs/documentacion.md` must point to a real folder/file.
- Recent structural changes must have a row in the structural changes history table (`Historial de cambios estructurales`).

Flag drift in both directions.

## Output format

Emit one report, in this exact order, in Markdown. No preamble, no closing pleasantries.

### A. Summary

- **Health score**: 0–100. Deduct as follows (cap at 0):
  - Critical violation (domain module importing `.astro`, remote fetch bypassing `src/data/`, missing top-level folder): **−15**
  - Architecture warning (unreasonable relative-path climb, undocumented folder, hardcoded color/font, missing Zod parse on remote data, missing `getStaticPaths`): **−5**
  - Style/skill nit (empty folder, stale `.gitkeep`, missing `data-testid`, missing lazy-loading attribute): **−1**
- **Status**:
  - `OK` if score ≥ 85 and 0 critical
  - `WARNING` if score 60–84 or ≤ 3 critical
  - `CRITICAL` if score < 60 or > 3 critical

State counts: `X critical, Y warnings, Z nits`.

### B. Issues found

Three sub-sections. Each issue: `path:line — short description — rule violated`. Sort by severity, then by path.

- **Architecture violations** (critical + relevant warnings)
- **Structural inconsistencies** (folder/tree/doc drift)
- **Design system violations** (tokens, hardcoded values)

If a section has no findings, write `None.` — do not omit the section.

### C. Recommendations

Concrete, file-level. One bullet per recommendation. Format: `path — action — rationale (one line)`.

Prioritize: criticals first, then warnings, then nits. Do not bundle unrelated fixes into a single bullet.

### D. Clean structure proposal

Only emit this section when at least one critical or two warnings concern folder layout. Otherwise write `Not needed.`.

When emitted, show the proposed tree as a fenced code block, annotated with `← move from <old>` / `← new` / `← delete` markers on changed lines only. Do not redraw the entire tree without annotations.

### E. Skills compliance matrix

A table:

| Skill | Status | Evidence (path or note) |
| --- | --- | --- |

One row per skill listed in step 5.

## Rules

- **Read-only**: no `Edit`, no `Write`, no `git add`, no `npm install`, no code generation. Bash is allowed only for read operations (`find`, `ls`, `grep`, `cat`, `git status`, `git log`, `git diff`).
- **No assumptions**: if a rule is ambiguous, state the ambiguity in the report rather than guessing.
- **No fluff**: every line of the report must be actionable or factual.
- **Cite locations**: every finding cites `path` or `path:line`.
- **Scope to the repo**: do not propose adopting libraries outside the canonical stack in `CLAUDE.md`. Flag any drift from that stack as a finding instead.
- **One report per invocation**: do not stream partial findings; emit the full report at the end.
- **No memory writes**: this command does not update `MEMORY.md` or any memory files.

## Style

Technical. Concise. No emojis. No marketing tone. Imperative voice in recommendations ("Move `X` to `Y`", not "You could consider moving…").

When in doubt between brevity and completeness, choose completeness for findings (the developer needs full context) and brevity for recommendations (one sentence each).
