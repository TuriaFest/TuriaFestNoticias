---
name: project-structure
description: >-
  Canonical, non-negotiable feature-sliced architecture with lint-enforced module boundaries, path
  aliases and placement rules. Use before creating, moving or renaming any file or folder under
  src/app.
---

# 🗂️ Project Structure

Canonical, **non-negotiable** architecture for the **TuriaFestNoticias** Angular application. The project uses a **feature-sliced** structure with **enforced module boundaries** — the professional standard for Angular apps that need to scale past a handful of routes.

## Purpose

Guarantee that the project layout remains identical across every feature, contributor, and AI-assisted change. The structure optimizes for four things, in order:

1. **Lazy-loading by default** — every feature is a self-contained chunk; nothing leaks into the initial bundle.
2. **Cognitive locality** — everything a feature needs lives in one folder.
3. **Safe deletion** — removing a feature is `rm -rf` plus one route line.
4. **Enforced boundaries** — ESLint stops the architecture from rotting over time.

This skill is **MANDATORY**. Consult it before creating, moving, or renaming any file. The structure is a contract; deviations are documented here or they do not happen.

---

## Mental model: three layers

```
core / layout   →   reusable, app-wide, loaded eagerly
features/*      →   vertical slices, loaded lazily, isolated from each other
shared/*        →   horizontal toolbox, imported by features, never imports them
```

The dependency rule is one-directional and absolute:

```
features  →  shared  →  (nothing)
   │            ▲
   └──→ core ───┘
features  →  core
layout    →  shared, core
```

- A **feature never imports another feature**.
- **shared never imports a feature or layout**.
- **core never imports a feature, layout, or shared/ui** (core is the lowest layer).

---

## Top-level layout

```
TuriaFestNoticias/
├── .claude/                   # AI-assisted development (agents + skills) — do not move
├── docs/                      # project documentation (documentacion.md) — update on every structural commit
├── sanity/                    # (CMS phase — not created yet; will be reintroduced when Sanity Studio launches)
│   └── schemas/               # content schemas, mirror the Zod schemas in @shared/domain
├── scripts/                   # Node build scripts (WebP converter — see [[performance-optimization]])
├── src/
│   ├── app/                   # application code (see below)
│   ├── assets/
│   │   ├── images/            # generated WebP output — committed, never hand-edited
│   │   ├── images-src/        # source PNG/JPEG — committed, never shipped to the user
│   │   ├── icons/             # SVG icon set (additional to Lucide)
│   │   ├── i18n/              # translation files: es.json (source) + additional locale JSON files
│   │   └── maps/              # MapLibre style JSON (see [[maps]])
│   ├── environments/          # environment.ts, environment.prod.ts
│   ├── styles/                # global SCSS, including the styles.scss entry point (see "Global styles" below)
│   ├── index.html
│   ├── main.ts
│   ├── main.server.ts
│   └── server.ts
├── public/                    # static files served as-is (favicon, runtime fonts, festival-detail-*.json;
│                              #  robots.txt and sitemap.xml will arrive with [[seo-meta]])
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── README.md
└── CLAUDE.md
```

Festival posters live in **Sanity**, not in `src/assets/`. See [[performance-optimization]] for the image source split.

---

## `src/app/` — feature-sliced application

```
src/app/
├── app.ts / app.html / app.scss   # root component
├── app.config.ts                  # providers, LOCALE_ID, interceptors, hydration
├── app.routes.ts                  # top-level routes → lazy-load each feature's routes
│
├── core/                          # cross-cutting singletons, provided once at root
│   ├── interceptors/              # HttpInterceptors: auth, error, cache, Zod-validation
│   ├── handlers/                  # ErrorHandler → Sentry (see [[error-handling]])
│   ├── notifications/             # NotificationService (signal) consumed by shared/ui notification-banner
│   ├── initializers/              # APP_INITIALIZER factories (locale, theme, store hydration) + Transloco loader
│   ├── tokens/                    # InjectionTokens
│   └── platform/                  # SSR helpers (isPlatformBrowser wrappers, window guards)
│
├── layout/                        # the app shell, loaded eagerly
│   ├── shell/                     # hosts <router-outlet>, nav, progress bar, footer
│   ├── nav-bar/
│   ├── nav-progress-bar/          # slow-navigation indicator driven by PageTransitionService
│   └── footer/
│
├── features/                      # ── lazy chunk boundary ──
│   ├── home/
│   │   ├── feature/               # the smart, route-bound page component
│   │   │   └── home.page.{ts,html,scss,spec.ts}
│   │   ├── ui/                    # presentational components used ONLY by home
│   │   ├── data-access/           # stores + services + Zod schemas local to home
│   │   └── home.routes.ts         # the feature's ONLY public surface
│   ├── festival-list/
│   │   ├── feature/festival-list.page.*
│   │   ├── ui/                    # festival-list-filters/, festival-list-grid/
│   │   ├── data-access/           # festivals.store.ts, filters.store.ts
│   │   └── festival-list.routes.ts
│   ├── festival-detail/
│   │   ├── feature/festival-detail.page.*
│   │   ├── ui/                    # festival-hero/, lineup-grid/, venue-map/
│   │   ├── data-access/           # festival-detail.store.ts, festival-detail.resolver.ts
│   │   └── festival-detail.routes.ts
│   ├── artist-detail/
│   ├── search/
│   └── about/
│
└── shared/                        # reused across ≥ 2 features; imports nothing from features
    ├── ui/                        # primitives: button/, badge/, festival-card/, empty-state/, ...
    ├── data-access/               # SanityClientService, SearchService (MiniSearch), AnalyticsService
    ├── domain/                    # models + Zod schemas: festival.model.ts, artist.model.ts, ...
    ├── pipes/                     # generic pipes: locale-date.pipe.ts, truncate.pipe.ts
    ├── directives/                # generic directives
    ├── util/                      # pure functions, zero Angular dependencies
    └── testing/                   # test helpers reused across specs
```

### Anatomy of a feature

Every feature has the same four parts. This shape is **fixed**:

| Part               | Contains                                                        | Rules                                                              |
| ------------------ | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| `feature/`         | The smart page component bound to the route.                   | Injects stores/services, orchestrates `ui/`. One page per folder. |
| `ui/`              | Dumb presentational components local to this feature.          | No HTTP, no store injection. Data in via `input()`, events via `output()`. |
| `data-access/`     | Stores (Signals/SignalStore), services, resolvers, schemas.    | The only place this feature talks to the network or holds state.  |
| `<feature>.routes.ts` | The lazy route config.                                      | **The feature's only public export.** Nothing else is imported from outside. |

A feature is loaded exactly once, lazily, from `app.routes.ts`:

```ts
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,        // from @layout/shell
    children: [
      { path: '', loadChildren: () => import('@features/home/home.routes').then(m => m.HOME_ROUTES) },
      { path: 'festivales', loadChildren: () => import('@features/festival-list/festival-list.routes').then(m => m.FESTIVAL_LIST_ROUTES) },
      { path: 'festivales/:slug', loadChildren: () => import('@features/festival-detail/festival-detail.routes').then(m => m.FESTIVAL_DETAIL_ROUTES) },
      { path: 'artistas/:slug', loadChildren: () => import('@features/artist-detail/artist-detail.routes').then(m => m.ARTIST_DETAIL_ROUTES) },
      { path: 'buscar', loadChildren: () => import('@features/search/search.routes').then(m => m.SEARCH_ROUTES) },
      { path: 'sobre-nosotros', loadChildren: () => import('@features/about/about.routes').then(m => m.ABOUT_ROUTES) },
    ],
  },
];
```

### Per-component folder

Every component — in `features/*/ui/`, `features/*/feature/`, `layout/`, or `shared/ui/` — has **exactly** this shape (Angular 21 convention, no `.component` suffix):

```
<name>/
├── <name>.ts
├── <name>.html
├── <name>.scss
└── <name>.spec.ts
```

Route-bound pages use the `.page` suffix on the class file: `home.page.ts`. No `index.ts` barrel files anywhere — they defeat tree-shaking and obscure the import graph.

A feature may omit `ui/` or `data-access/` while it has nothing to put in them (e.g. `festival-list`, `calendar`): empty scaffolds are not created ahead of need.

---

## Global styles

```
src/styles/
├── styles.scss                # entry point (the only file angular.json's "styles" references)
├── _tokens.scss               # primitive tokens (raw palette)
├── _semantic.scss             # semantic tokens (--bg-canvas, --text-primary, --accent-violet)
├── _safari-compat.scss        # Safari-specific compatibility layer (see [[cross-device-compat]])
├── _typography.scss           # font families, type ramp, line-heights, tracking
├── _fonts.scss                # @font-face for the self-hosted variable fonts
├── _spacing.scss              # 4 px base scale
├── _radii.scss                # border radii
├── _shadows.scss              # elevation system (optional partial)
├── _motion.scss               # easing curves, durations, prefers-reduced-motion
├── _breakpoints.scss          # sm 640, md 768, lg 1024, xl 1280
├── _mixins.scss               # glass, focus-ring, container, truncate, line-clamp
├── _animations.scss           # keyframes (fade-up, pulse-soft, live-dot)
├── _reset.scss                # opinionated reset
└── utilities/
    └── _liquid-glass.scss     # liquid-glass mixin + .glass-* classes (see [[liquid-glass]])
```

`src/styles/styles.scss` is the only file that `@use`s these partials. Component SCSS imports tokens via `@use 'styles/mixins' as *;` (resolved through `stylePreprocessorOptions.includePaths: ["src"]` in `angular.json`). See [[theming-styling]].

---

## Path aliases

Configured in `tsconfig.json`. **Imports must always use an alias** — never a relative path that climbs out of the current folder.

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@core/*":               ["src/app/core/*"],
      "@layout/*":             ["src/app/layout/*"],
      "@features/*":           ["src/app/features/*"],
      "@shared/ui/*":          ["src/app/shared/ui/*"],
      "@shared/data-access/*": ["src/app/shared/data-access/*"],
      "@shared/domain/*":      ["src/app/shared/domain/*"],
      "@shared/util/*":        ["src/app/shared/util/*"],
      "@shared/pipes/*":       ["src/app/shared/pipes/*"],
      "@shared/directives/*":  ["src/app/shared/directives/*"],
      "@shared/testing/*":     ["src/app/shared/testing/*"],
      "@env/*":                ["src/environments/*"],
      "@assets/*":             ["src/assets/*"]
    }
  }
}
```

There is **no TS alias for styles**: component SCSS resolves `@use 'styles/...'` through `stylePreprocessorOptions.includePaths: ["src"]` in `angular.json`. `@assets/*` is registered in `eslint-plugin-boundaries` as the `asset` element; only `shared` may import it.

Inside a single feature, relative imports (`./ui/festival-hero/...`) are fine — they never climb above the feature root. Crossing any layer boundary requires an alias.

---

## Naming rules

- **Folders**: kebab-case (`festival-card`, `festival-list`).
- **Page classes**: `<feature>.page.ts` → `HomePageComponent`, `FestivalListPageComponent`.
- **Components**: `<name>.ts` → `FestivalCardComponent`. Selector prefix `fv-` (e.g. `fv-festival-card`).
- **Services**: `<name>.service.ts` → `FestivalService`.
- **Stores**: `<name>.store.ts` → `FestivalsStore` (PascalCase, `Store` suffix).
- **Models + schemas**: `<name>.model.ts` → exports both the Zod schema (`FestivalSchema`) and the inferred type (`Festival`).
- **Guards / resolvers**: `<name>.guard.ts` / `<name>.resolver.ts`, functional.
- **Route files**: `<feature>.routes.ts`, exporting `UPPER_SNAKE_ROUTES`.
- **SCSS partials**: leading underscore (`_tokens.scss`).
- **Festival slugs**: kebab-case, lowercase, ASCII (`fib-benicassim`). Immutable once published.
- **i18n keys**: dotted path, lowercase (`festival.detail.lineup.title`).

---

## Placement decision tree

When creating a new file, ask in order — stop at the first **yes**:

1. Is it a global singleton, interceptor, error handler, initializer, or SSR/platform helper? → `core/<subfolder>/`.
2. Is it part of the app shell (nav, footer, outlet host)? → `layout/`.
3. Does it belong to exactly **one** feature?
   - The route-bound page? → `features/<feature>/feature/`.
   - A presentational component? → `features/<feature>/ui/<name>/`.
   - A store, service, resolver, or schema? → `features/<feature>/data-access/`.
4. Is it reused by **two or more** features?
   - A presentational component? → `shared/ui/<name>/`.
   - A service or store? → `shared/data-access/`.
   - A model/schema? → `shared/domain/`.
   - A pipe / directive? → `shared/pipes/` or `shared/directives/`.
   - A pure helper? → `shared/util/`.
5. None of the above? → **Stop and discuss.** Do not invent a new top-level folder.

**The "three uses" rule does not apply to `shared/` promotion — the threshold is two.** A component used by a single feature stays in that feature. The moment a second feature needs it, it moves to `shared/ui/`. Anticipatory placement in `shared/` is forbidden: do not put something in `shared/` because you *think* another feature will use it.

---

## Hard rules (NEVER violate)

1. **A feature never imports from another feature.** Shared code goes to `shared/`.
2. **`shared/` never imports from `features/` or `layout/`.**
3. **`core/` never imports from `features/`, `layout/`, or `shared/ui/`.**
4. Inside a feature, **`ui/` never imports runtime values from `data-access/`.** Presentational components receive data via inputs; `import type` from `data-access/` is allowed solely to type those inputs.
5. **A feature's only public surface is its `<feature>.routes.ts`.** Never deep-import `features/x/ui/...` or `features/x/data-access/...` from outside the feature.
6. **No NgModules.** Every component, directive, and pipe is standalone.
7. **No `index.ts` barrel files.**
8. **No HTTP calls outside a `data-access/` folder** (feature-local or `shared/data-access/`). Only exception: infrastructure loaders in `core/` required by `app.config.ts` providers (e.g. the `TranslocoHttpLoader`).
9. **No state mutations outside a store.**
10. **No relative import that climbs above a feature root.** Use a path alias instead.
11. **No new top-level folder under `src/app/`** without updating this document.
12. **No hardcoded strings, colors, or spacing** in components — i18n keys and design tokens only.

Rules 1–5 and 10 are enforced automatically — see below.

---

## Enforcing boundaries (ESLint)

The full `eslint-plugin-boundaries` configuration that makes the dependency rule a build error.

➡️ Moved to [`references/eslint-boundaries.md`](references/eslint-boundaries.md) to keep this SKILL.md lean.

## Why this structure is optimal

- **Maximal code-splitting** — each feature (UI + store + services) is one lazy chunk. The initial bundle carries only `core` + `layout` + the landing feature.
- **Deletion is trivial** — `rm -rf features/x/` plus removing one line in `app.routes.ts` removes a feature cleanly, with zero orphaned files elsewhere.
- **Ownership is obvious** — a person or agent owns `features/x/` end to end.
- **Tests run faster** — `vitest --changed` re-runs only the touched feature's specs (see [[testing-patterns]]).
- **SSR is per-feature** — the pre-render decision lives in each `<feature>.routes.ts`, not in one global list.
- **Refactors are local** — changing how `festival-detail` fetches data touches only `features/festival-detail/data-access/`.
- **The boundary lint makes it self-healing** — accidental coupling fails CI instead of silently accumulating.

---

## When the structure must evolve

A new feature is just a new `features/<name>/` folder with the four standard parts — that is **not** an evolution, it is normal use.

A genuine structural change (a new top-level layer, a new `core/` subfolder) requires:

1. Propose it in the PR description.
2. Add it to this document with its purpose and a placement rule.
3. Update the decision tree and hard rules above.
4. Update the path aliases in `tsconfig.json` and the boundaries config.
5. Update `CLAUDE.md` so all agents see the new convention.

**No silent additions.** The structure is a contract.

## Related skills

- [[state-management]]
- [[api-integration]]
- [[testing-patterns]]
