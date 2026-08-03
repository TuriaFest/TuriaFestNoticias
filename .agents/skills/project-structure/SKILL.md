---
name: project-structure
description: >-
  Canonical, non-negotiable Astro folder layout, naming rules, placement decision tree and path
  aliases. Use before creating, moving or renaming any file under src/.
---

# 🗂️ Project Structure

Canonical, **non-negotiable** architecture for the **TuriaFestNoticias** Astro application. The project uses Astro's conventional layout — file-based routing under `src/pages/`, document shells in `src/layouts/`, reusable `.astro` components, and a strict separation between build-time markup and framework-agnostic domain logic.

## Purpose

Guarantee that the project layout remains identical across every route, contributor, and AI-assisted change. The structure optimizes for four things, in order:

1. **Static-first by default** — every page is prerendered (`output: 'static'`); nothing needs a runtime server.
2. **Cognitive locality** — domain logic, i18n, and SEO helpers live in small, framework-agnostic modules that are trivial to test without Astro.
3. **Safe deletion** — removing a route is deleting its `.astro` file (and, if orphaned, its catalogue entries).
4. **Enforced boundaries** — a one-directional dependency rule keeps `.astro` markup from leaking into domain modules.

This skill is **MANDATORY**. Consult it before creating, moving, or renaming any file. The structure is a contract; deviations are documented here or they do not happen.

---

## Mental model: three layers

```
pages / layouts / components   →   build-time markup, Astro-only
scripts                        →   client-side islands, vanilla TS
data / lib / i18n              →   framework-agnostic domain logic, imported by both
```

The dependency rule is one-directional and absolute:

```
pages → layouts → components
   │        │          │
   └────────┴──────────┴──→ data / lib / i18n
scripts → data / lib / i18n   (never → components/*.astro)
data / lib / i18n → (nothing Astro-specific)
```

- **`data / lib / i18n` never import a `.astro` file.** They are plain TypeScript, unit-testable in isolation.
- **`scripts/*` (client islands) never import `.astro` components.** They read/write the DOM the component already rendered and call into `data / lib / i18n`.
- **`pages` may import `layouts`, `components`, and `data / lib / i18n`.** `layouts` and `components` may import `data / lib / i18n` but not `pages`.

---

## Top-level layout

```
TuriaFestNoticias/
├── .claude/                   # AI-assisted development (agents + skills) — do not move
├── docs/                      # project documentation (documentacion.md) — update on every structural commit
├── scripts/                   # Node build scripts (i18n-sync.mjs, WebP converter — see [[performance-optimization]])
├── src/
│   ├── pages/                 # file-based routes → static HTML (see below)
│   ├── layouts/                # document shells (BaseLayout.astro: <head>, SEO, nav + footer)
│   ├── components/            # reusable .astro components (NavBar, Footer) + colocated SCSS partials
│   ├── scripts/                # client-side islands, vanilla TS: theme.ts, i18n.ts, nav.ts, news-search.ts
│   ├── data/                   # typed content catalogue + models + framework-agnostic search logic
│   ├── lib/                    # framework-agnostic helpers: seo.ts, site.ts, theme.ts
│   ├── i18n/                    # runtime translation resolver (index.ts: t(), LANGUAGES) + translations.ts
│   ├── styles/                  # global SCSS design system (see "Global styles" below)
│   └── assets/
│       ├── i18n/                # translation source JSON: es.json (source of truth) + ca.json, en.json
│       └── images-src/          # source images — committed, never shipped raw to the user
├── public/                    # static files served as-is: branding, optimized assets/images, favicon
│                              #  (assets/i18n is populated here at build time by the copy:i18n script;
│                              #   robots.txt and sitemap.xml will arrive with [[seo-meta]])
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── vitest.config.mts
├── README.md
└── CLAUDE.md
```

Festival posters and other future remote content will live wherever [[sanity-cms]] or another CMS is introduced, not hand-copied into `src/assets/`. See [[performance-optimization]] for the image source split.

---

## `src/` — Astro application

```
src/
├── pages/                          # ── route boundary ──
│   ├── noticias/
│   │   ├── index.astro             # /noticias — news hub
│   │   └── [slug].astro            # /noticias/:slug — article detail (getStaticPaths)
│   └── 404.astro
│
├── layouts/
│   └── BaseLayout.astro            # <head>, SEO meta injection, anti-flicker theme script, nav + footer slots
│
├── components/
│   ├── NavBar.astro                # + NavBar.scss (or colocated partial)
│   └── Footer.astro                # + Footer.scss
│
├── scripts/                        # ── client island boundary ──
│   ├── theme.ts                    # theme toggle island (reads/writes @lib/theme)
│   ├── i18n.ts                     # language-switcher island (fetches locale JSON, re-resolves [data-i18n])
│   ├── nav.ts                      # nav interactions (mobile menu, scroll state)
│   └── news-search.ts              # wires @data/news-search into the news hub DOM
│
├── data/                           # framework-agnostic domain + content
│   ├── news-article.model.ts       # NewsArticle, NewsArticleImage, NewsArticleSection types
│   ├── news.catalogue.ts           # NEWS_ARTICLES: readonly NewsArticle[] + getNewsArticleBySlug()
│   └── news-search.ts              # NewsSearchService (MiniSearch wrapper)
│
├── lib/                             # framework-agnostic helpers
│   ├── seo.ts                       # buildListingSeo(), buildArticleSeo() — canonical, OG, JSON-LD
│   ├── site.ts                      # SITE_BASE_URL, BASE_URL, SITE_LANG, absoluteUrl()
│   └── theme.ts                     # ThemeMode/ResolvedTheme helpers shared by the anti-flicker script and the island
│
├── i18n/
│   ├── index.ts                     # t(), LANGUAGES, LangCode, resolveKey(), interpolate()
│   └── translations.ts              # ES_TRANSLATIONS (source of truth) + TranslationKey type
│
├── styles/                          # see "Global styles" below
│
└── assets/
    ├── i18n/                        # es.json, ca.json, en.json — copied to public/assets/i18n at build
    └── images-src/                  # source images, per-route subfolders (e.g. images-src/news/<slug>/)
```

### Anatomy of a route

Every indexable route follows the same shape:

| Part          | Contains                                                         | Rules                                                                 |
| ------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `pages/*.astro` | The route file. Static params come from `getStaticPaths()`.     | Imports the catalogue from `@data`, builds SEO via `@lib/seo`, renders through a layout. |
| `layouts/`      | The document shell (`<head>`, nav, footer).                     | One layout can serve many routes; do not fork it per-route without cause. |
| `components/`   | Reusable presentational `.astro` partials used by pages/layouts. | No direct catalogue/network access — receive data via props.         |
| `data/`         | Typed catalogue, domain models, framework-agnostic search/index logic. | The only place that "knows" the content shape. Imported by pages and islands alike. |
| `scripts/`      | Client islands wired via `<script>` in the relevant `.astro` file. | Vanilla TS, DOM-only, no `.astro` imports.                            |

A new page is a new `.astro` file under `src/pages/` (optionally with a `getStaticPaths()` export) plus, if it needs new data, a model + catalogue entry under `src/data/`. There is no separate "feature" folder layer — Astro's file-based routing **is** the route boundary.

### Naming rules

- **Route files**: kebab-case matching the URL segment; dynamic segments use Astro's `[param]` bracket syntax (`[slug].astro`).
- **Components**: PascalCase (`NavBar.astro`, `Footer.astro`).
- **Client islands**: kebab-case matching their concern (`news-search.ts`, `theme.ts`).
- **Domain models**: `<name>.model.ts` → exports the `interface`/`type` (e.g. `news-article.model.ts` → `NewsArticle`).
- **Catalogues**: `<domain>.catalogue.ts` → exports `<DOMAIN>_ITEMS: readonly T[]` plus a `get<Domain>BySlug()` lookup.
- **i18n keys**: dotted path, lowercase (`news.article.breadcrumbLabel`).
- **Slugs**: kebab-case, lowercase, ASCII, immutable once published (SEO-critical).
- **SCSS partials**: leading underscore (`_tokens.scss`), colocated with the component they style or under `src/styles/` for global tokens.

---

## Global styles

```
src/styles/
├── styles.scss                # entry point (imported once, e.g. from BaseLayout.astro)
├── _tokens.scss               # primitive tokens (raw palette)
├── _semantic.scss             # semantic tokens (--fv-bg-page, --fv-text-primary, ...)
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

Component SCSS resolves shared partials via `@use 'styles/mixins' as *;`, resolved through the Vite `css.preprocessorOptions.scss.loadPaths: ['src']` block in `astro.config.mjs` (Dart Sass `modern-compiler` API). See [[theming-styling]].

---

## Path aliases

Configured in **both** `astro.config.mjs` (Vite `resolve.alias`) and `tsconfig.json` (`compilerOptions.paths`) — the two must be kept in sync.

```js
// astro.config.mjs
export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '@data': alias('./src/data'),
        '@i18n': alias('./src/i18n'),
        '@lib': alias('./src/lib'),
        '@assets': alias('./src/assets'),
      },
    },
  },
});
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@data/*": ["src/data/*"],
      "@i18n/*": ["src/i18n/*"],
      "@lib/*": ["src/lib/*"],
      "@assets/*": ["src/assets/*"]
    }
  }
}
```

There is no alias for `pages`, `layouts`, `components`, or `scripts` — these are always imported by relative path from within the routing/markup layer (e.g. `../../layouts/BaseLayout.astro`), which never climbs above `src/`.

---

## Placement decision tree

When creating a new file, ask in order — stop at the first **yes**:

1. Is it a new route (URL) or a dynamic-route generator? → `src/pages/<path>.astro` (or `[param].astro` with `getStaticPaths()`).
2. Is it a document shell reused across routes? → `src/layouts/`.
3. Is it a reusable presentational `.astro` partial (nav, footer, card)? → `src/components/`.
4. Is it client-side interactivity (toggle, search, menu)? → `src/scripts/<name>.ts`, wired via a `<script>` tag in the `.astro` file that needs it.
5. Is it typed content, a domain model, or catalogue/lookup logic? → `src/data/`.
6. Is it a framework-agnostic helper (SEO, site constants, theme resolution) shared by pages **and** islands? → `src/lib/`.
7. Is it a translation key, dictionary, or i18n resolver? → `src/i18n/` (runtime logic) or `src/assets/i18n/*.json` (locale content).
8. None of the above? → **Stop and discuss.** Do not invent a new top-level folder.

**Promote only on real duplication.** A helper stays inline in the one `.astro` file that needs it until a second file needs the same logic — then it moves to `src/lib/` or `src/data/`. Anticipatory extraction is forbidden.

---

## Hard rules (NEVER violate)

1. **`data / lib / i18n` never import a `.astro` file.** They must stay unit-testable without Astro (Vitest + jsdom only).
2. **`scripts/*` never import `.astro` components.** Islands operate on the rendered DOM and on `data / lib / i18n`.
3. **No remote fetch outside `data/` (or a future feature-specific data module).** Today the catalogue is local and typed; when remote data arrives, validate it once at the edge (see [[api-integration]]).
4. **No state mutations outside the module that owns the state** (e.g. only `@lib/theme` functions mutate `data-theme`; the island calls them, it does not reimplement them).
5. **No relative import that climbs above `src/`.** Use a path alias (`@data`, `@lib`, `@i18n`, `@assets`) for anything crossing into those layers.
6. **No new top-level folder under `src/`** without updating this document.
7. **No hardcoded strings, colors, or spacings** in `.astro` markup or `scripts/` — i18n keys (`data-i18n` anchors + `t()`) and design tokens only.
8. **Slugs are immutable once published** — renames are coordinated with **performance** via a redirect entry in `astro.config.mjs`.

---

## Why this structure is optimal

- **Zero client JS by default** — every route ships as static HTML; a `<script>` island is an explicit, auditable opt-in.
- **Deletion is trivial** — removing a route is deleting its `.astro` file; removing a catalogue entry (with its images) removes the content cleanly.
- **Domain logic is framework-free** — `data / lib / i18n` run under plain Vitest, no Astro test harness needed.
- **SEO is centralized** — `src/lib/seo.ts` is the single place that builds canonical URLs, Open Graph tags, and JSON-LD; no page hand-rolls its own `<head>` logic.
- **Refactors are local** — changing how news articles resolve SEO copy touches only `src/lib/seo.ts` and `src/data/news.catalogue.ts`.
- **i18n is uniform** — every page renders Spanish server-side with `data-i18n` anchors; the language-switcher island is the only place that re-resolves them.

---

## When the structure must evolve

A new route under an existing folder (`src/pages/noticias/nueva-vista.astro`) is not an evolution — it is normal use.

A genuine structural change (a new top-level `src/` folder, a new alias) requires:

1. Propose it in the PR description.
2. Add it to this document with its purpose and a placement rule.
3. Update the decision tree and hard rules above.
4. Update the path aliases in **both** `astro.config.mjs` and `tsconfig.json`.
5. Update `CLAUDE.md` so all agents see the new convention.

**No silent additions.** The structure is a contract.

## Related skills

- [[state-management]]
- [[api-integration]]
- [[testing-patterns]]
