# Audit TuriaFestNoticias Architecture

Automated architecture auditor for the TuriaFestNoticias Angular project.

Read-only. Strict. Objective. Reports — never modifies.

## Goal

Determine whether the current project state honors the contract defined in `CLAUDE.md`, the rules in `.claude/agents/*.md`, and the patterns in `.claude/skills/*/`. Output a structured report that a developer can act on without further clarification.

This command must not write code, create files, run migrations, or apply fixes. Its only output is the report described below.

## Scope of analysis

The audit must cover, in order:

1. **Project structure** — folder layout under `src/app/` and `src/styles/`, presence and placement of `core/`, `layout/`, `features/`, `shared/` and their sub-folders (`feature/`, `ui/`, `data-access/`, `domain/`, `pipes/`, `directives/`, `util/`, `testing/`).
2. **Architecture compliance** — feature-sliced boundaries, standalone components, lazy loading, unidirectional data flow, path aliases (`@core`, `@layout`, `@features`, `@shared/*`), Zod validation at HTTP boundary.
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
- `angular.json` — styles entry, budgets, locale, prerender config
- `tsconfig.json` — path aliases
- `eslint.config.*` or `.eslintrc*` — boundary rules
- `package.json` — declared stack vs. CLAUDE.md canonical table

### 2. Walk the tree

Enumerate `src/`, `public/`, `src/app/**`, `src/styles/**`, `src/assets/**`, `src/environments/**`, `docs/`, `.claude/`. Use `find`/`ls`/`Read` — never write.

For each folder, check:

- Does it exist where `CLAUDE.md` says it should?
- Are there extraneous folders not declared in the contract?
- Are there empty folders that should hold real files at this phase?
- Are `.gitkeep` files still present in folders that already contain real files (redundant)?

### 3. Inspect files for architectural violations

For every `.ts` file under `src/app/`:

- **Feature isolation**: does any `features/<a>/**` import from `features/<b>/**`? Flag every occurrence.
- **Public surface**: does anything outside a feature import from inside it without going through `<feature>.routes.ts`?
- **Path aliases**: any relative import (`../../`) that climbs above a feature root? Flag.
- **HttpClient placement**: any component, page, pipe, or directive that imports `HttpClient` directly? It must live only under `data-access/`.
- **Business logic in components**: components longer than ~150 lines with non-trivial branching, data transformation, or persistence calls. Flag as candidate for extraction into a store or service.
- **Standalone**: any `@NgModule` declarations in new code? Flag (only allowed in legacy areas, which this project has none of).
- **Lazy loading**: every feature listed in `app.routes.ts` must use `loadChildren` pointing at `<feature>.routes.ts`. Flag eagerly-imported features.
- **DTO validation**: `data-access/` files that call `HttpClient` without piping through a Zod `parse`/`safeParse`. Flag.
- **Hardcoded strings in templates**: visible user-facing copy not routed through the i18n pipe. Flag with file:line.

### 4. Inspect SCSS for design-system violations

For every `.scss` file under `src/app/**` and component-level styles:

- Literal hex/rgb/hsl colors → must be `var(--fv-*)` or a token.
- Literal `font-family` declarations → must use `var(--fv-font-*)` or the `fvFont` directive/pipe.
- Literal pixel/rem spacings outside of breakpoints → must use spacing tokens (when defined).
- `@import` of partials by relative path instead of `stylePreprocessorOptions.includePaths`.

Cross-check that the tokens referenced actually exist in `src/styles/*.scss`. Flag references to undefined tokens.

### 5. Skills compliance matrix

For each skill, produce one row: **applied / partially applied / not yet applied / bypassed**.

- `api-integration` — at least one `data-access/` service with Zod DTO parsing.
- `state-management` — Signals or SignalStore used; no manual `BehaviorSubject` state where a Signal would do.
- `routing-navigation` — Spanish slugs (`/festivales/:slug`, `/artistas/:slug`, `/provincia/:provincia`), functional guards, resolvers.
- `performance-optimization` — `ChangeDetectionStrategy.OnPush` on standalone components, `@defer` on below-the-fold blocks, `NgOptimizedImage` on `<img>`.
- `error-handling` — global `ErrorHandler` registered, HTTP interceptor mapping to `FestivalError`.
- `theming-styling` — token files present and consumed.
- `internationalization` — `es-ES` source-of-truth keys, no diverging keys vs. `ca`/`en`.
- `accessibility` — visible focus styles, semantic landmarks, alt text on images, color contrast tokens.
- `testing-patterns` — Vitest specs colocated, `data-testid` used, no `xit`/`xdescribe` without expiry comment.

A skill is **bypassed** when code clearly contradicts it (e.g. `HttpClient` in a component, hex color in a template).

### 6. Documentation sync check

- Every folder/file present in `src/` must appear in the tree diagrams of `docs/documentacion.md`.
- Every entry in `docs/documentacion.md` must point to a real folder/file.
- Recent structural changes must have a row in the structural changes history table (`Historial de cambios estructurales`).

Flag drift in both directions.

## Output format

Emit one report, in this exact order, in Markdown. No preamble, no closing pleasantries.

### A. Summary

- **Health score**: 0–100. Deduct as follows (cap at 0):
  - Critical violation (feature-to-feature import, `HttpClient` in component, missing top-level folder): **−15**
  - Architecture warning (relative-path climb, undocumented folder, hardcoded color/font, missing Zod parse): **−5**
  - Style/skill nit (empty folder, stale `.gitkeep`, missing `OnPush`, missing `data-testid`): **−1**
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
