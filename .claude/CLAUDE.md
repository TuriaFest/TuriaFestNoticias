# CLAUDE.md — TuriaFestNoticias

**TuriaFestNoticias** is an **Astro** web application that serves as an information portal for the main music festivals in the Valencian Community (Valencia, Alicante, and Castellón provinces of Spain). Users can discover festivals and consult dates, locations, music genres, artist line-ups, starting prices, and official links. The primary UI language is **Spanish (es-ES)**, with Valencian (`ca-ES-valencia`) and English (`en-GB`) on the roadmap.

> **Migration note.** The project was ported from Angular 21 to Astro. The live surface today is the **news portal** (`/noticias`, `/noticias/:slug`), rendered fully static; the festival catalogue, filters, map and other views described below remain roadmap. Interactivity is delivered as small client-side islands (`src/scripts/*`) instead of Angular components, and framework-agnostic domain/SEO/i18n/theme logic lives under `src/data`, `src/lib` and `src/i18n`.

## Technologies

Core framework and language:

- **Astro 7** (`.astro` components, file-based routing, static output, client islands)
- **TypeScript** 5.x/6.x (strict mode — `astro/tsconfigs/strict`)
- **HTML5** semantic markup
- **SCSS** with design tokens and CSS custom properties (Dart Sass, `modern-compiler` API)
- **Astro CLI** (`astro dev` / `astro build` / `astro check`) for tooling
- **Vitest** for unit tests (jsdom environment)
- **Playwright** planned for E2E
- **Static site generation (SSG)** — every SEO-critical route is prerendered at build time

Project stack (canonical choices — agents must respect these):

| Layer            | Technology                          | Notes                                                                 |
| ---------------- | ----------------------------------- | --------------------------------------------------------------------- |
| Framework        | Astro 7 (SSG, `output: 'static'`)   | `.astro` components + vanilla-TS client islands, no UI framework      |
| Icons            | Inline SVG                          | Icons are inlined in `.astro` markup; no icon package                 |
| Dates            | Native `Intl` / precomputed labels  | Date copy is authored as i18n keys (`news.*` labels). Owned by **content** |
| Validation       | **Zod** (roadmap)                   | Boundary validation for future remote DTOs. Owned by **systems**     |
| Maps             | **MapLibre GL JS** + Protomaps tiles | Reserved for the interactive map `/mapa` (roadmap). `maplibre-gl` will be installed when `/mapa` launches |
| Search           | **MiniSearch**                      | Client-side fuzzy search (news feed), field boosts, diacritic-stripping |
| Content          | Local TS catalogue (`src/data`)     | News/festival data is authored in typed modules; Sanity (headless CMS) remains a roadmap option |
| Hosting          | **Cloudflare Workers**              | Static assets served from `./dist` (see `wrangler.jsonc`); watch the 1 MB gz limit on the free plan |
| Analytics        | **Cloudflare Web Analytics**        | Privacy-friendly, no cookies, no GDPR banner                        |
| Error monitoring | **Sentry** (roadmap)                | Frontend errors                                                       |

Adoption phasing:

- **MVP** — everything in the table.
- **Personalization phase** — service worker (PWA) + `idb-keyval` for persistent favourites.
- **User accounts phase** — evaluate Supabase Auth or Better Auth.
- **Multilingual phase** — go-live of `ca-ES-valencia` and `en-GB` with hreflang. Base infrastructure (locale JSON in `src/assets/i18n` + the language-switcher island + `scripts/i18n-sync.mjs`) is already integrated from MVP; this phase activates the additional locales.
- **Ticketing phase** — direct Dice / Ticketmaster APIs, no intermediary library.

Explicitly **out of scope**: Nx/Turborepo, Tailwind, Material/PrimeNG, Algolia/Typesense, GraphQL, Redis, Stripe. Any proposal to add them must be justified against this table.

## Project scripts

- To start the dev server: `npm start` / `npm run dev` (runs `astro dev`, serves on `http://localhost:4321`).
- To build for production: `npm run build` (runs `astro build`, artifacts in `dist/`).
- To preview the production build: `npm run preview` (`astro preview`).
- To run unit tests: `npm test` (Vitest; use `npm test -- --run` for a single non-watch pass).
- To lint / type-check: `npm run lint` (runs `astro check`).
- To deploy: `npm run deploy` (`astro build` + `wrangler deploy`).

**Do not** invoke `ng serve --open` in unattended sessions: it opens the user's browser and is unnecessary for programmatically validating changes. For visual verification, use the `/verify` skill which follows the project's steps.

## Agent workspace routing

When working as Claude Code, use the `.claude/` folder as the source of truth for agents, skills, and commands.
When working as Codex, use the `.codex/` folder as the source of truth for agents, skills, and commands.

## Pre-commit gate (MANDATORY)

Any commit that touches `src/` **must** pass the following two commands in order, both exiting `0`, **before** `git commit` is invoked:

```bash
npm run lint && npm test -- --run
```

If either fails:

1. **Do not commit.**
2. Fix the underlying cause — production code, or the test itself.
3. If the fix is not feasible in the session, **revert** (`git restore` / `git stash`). Never leave broken tests on `main`.
4. Re-run the gate. Only commit when green.

**Never** bypass with `--no-verify`. **Never** disable a test to make the gate pass. Skipping is allowed only with an expiry per the rules in [[testing-patterns]].

The agent **testing** owns this gate. Pure documentation changes (no files under `src/`) are the only exception.

## Documentation rule (STRUCTURAL CHANGES ONLY)

When making significant structural changes (new features, major refactors, architectural shifts) that add or remove folders/files, update `docs/documentacion.md`:

- Add the new folder or file to the corresponding tree diagram.
- Describe its purpose in Spanish (per `docs/documentacion.md` convention).
- Add an entry to the structural changes history table (`Historial de cambios estructurales`) at the bottom.

Routine commits (bug fixes, small refactors, skill reorganization) do not require historial updates. **An outdated tree is worse than a delayed update.** Keep the tree current but not obsessively — semantic git history is the source of truth.

## Markdown review rule (MANDATORY)

Before making any modification, agents **must** review the applicable project `.md` files:

- Always read `CLAUDE.md` for the project contract.
- Read `docs/documentacion.md` before structural changes.
- Read the relevant `.claude/agents/*.md` and `.claude/skills/*/SKILL.md` files for the touched area.

If no specific agent or skill applies, still review `CLAUDE.md` and any nearby `.md` that documents the files being changed.

## Configuration

- Build/runtime configuration lives in `astro.config.mjs` (output mode, redirects, path aliases, SCSS `loadPaths`). Path aliases are mirrored in `tsconfig.json`. Keep the two in sync.
- Site-wide constants (canonical origin, default `<html lang>`, `absoluteUrl`) live in `src/lib/site.ts` — never hardcode base URLs elsewhere.
- The default locale is `es-ES` (`SITE_LANG` in `src/lib/site.ts`); the page is server-rendered in Spanish with `data-i18n` anchors, and the language-switcher island (`src/scripts/i18n.ts`) re-resolves them at runtime.
- Translations live in `src/assets/i18n/*.json` (`es.json` is the source of truth; every locale file must stay in key parity — see the **content** agent). A `copy:i18n` prebuild step copies them into `public/assets/i18n` so the client island can fetch them.
- Astro has no built-in bundle budgets; keep the static output lean by hand (inline SVG icons, no UI framework, lazy `loading` on below-the-fold images). Watch the Cloudflare 1 MB gz asset limit.

## Agents

To keep the architecture scalable and responsibilities clear, the project defines five specialized agents in `.claude/agents/`:

- **`testing`** 🧪 — Unit tests (Vitest + jsdom), DOM/island tests, E2E (Playwright), `axe-core` for a11y, pre-merge validation. Consult it whenever domain modules, islands, pages, or critical flows are touched.
- **`systems`** 🏗️ — Architecture, domain/data layer, client islands, routing (`src/pages`), build config (`astro.config.mjs`), SSG/prerender, path aliases, DTO contracts. Consult it when a change crosses a component boundary or touches data flow.
- **`views`** 🎨 — Presentational components, design system, theming, SCSS, responsive layout, animations, visual accessibility. Consult it for any change to templates, styles, or visual experience.
- **`content`** 📝 — Internationalization, festival catalogue curation (slugs, dates, line-up, prices), UX microcopy, editorial style guide. Consult it whenever copy or i18n keys are added or festival data is updated (Bigsound, Latin Fest, Medusa, Arenal Sound, Reve, Zevra…).
- **`performance`** ⚡ — Core Web Vitals (LCP, CLS, INP), bundles, SSR / prerendering, JSON-LD `Event` schema, sitemap, canonicals, Open Graph, hreflang. Consult it for any change that could move metrics or affect SEO.

Each agent explicitly declares who it collaborates with to avoid overlapping responsibilities.

## Skills

The project defines reusable skills in `.claude/skills/` that document patterns specific to this application. It is **imperative** to consult the matching skill before touching the area it covers:

- **`project-structure`** 🗂️ — **MANDATORY.** Canonical folder layout, naming rules, placement decision tree, path aliases. Consult **before** creating, moving, or renaming any file. The structure is a contract that must remain stable.
- **`state-management`** — Signal patterns, NgRx SignalStore, persistence of filters and favourites.
- **`api-integration`** — Typed HTTP services, DTOs, interceptors, caching.
- **`sanity-cms`** — Festival catalogue from Sanity (headless CMS) via `@sanity/client`: GROQ queries, read-only client in `data-access`, Zod validation at the boundary.
- **`routing-navigation`** — Spanish URL schema (`/festivales/:slug`), lazy loading, resolvers, functional guards.
- **`ui-components`** — Catalogue of reusable components (`FestivalCard`, `FestivalHero`, `LineupGrid`, `FilterChip`…).
- **`forms-validation`** — **Roadmap spec** (no forms built yet). Typed Reactive Forms, custom validators (DNI, date/price ranges), errors via i18n.
- **`internationalization`** — `es-ES` by default, dotted keys, ICU MessageFormat, `ca` and `en` locales on the roadmap.
- **`performance-optimization`** — OnPush, `@defer`, `NgOptimizedImage`, budgets, SSR.
- **`testing-patterns`** — Testing layers, HTTP mocking, `data-testid`, coverage.
- **`accessibility`** — WCAG 2.1 AA, contrast, visible focus, minimal ARIA, keyboard navigation.
- **`asset-organization`** — **MANDATORY when touching images or image folders.** Folder structure, naming rules, duplicate cleanup, and audit expectations for repository assets.
- **`theming-styling`** 🌓 — **MANDATORY when creating any new UI.** Primitive and semantic tokens (`--fv-*` namespace), premium Mediterranean light surfaces with a deep-navy dark theme. **Theming is active**: `light / dark / system` via `data-theme` on `<html>` + `prefers-color-scheme`, owned by the `ThemeService` (`@core/platform/`). Its `references/theme-adaptation.md` (formerly the `light-dark-mode` skill) is the mandatory gate ensuring every new surface adapts to both themes via semantic tokens — never hardcoded per-theme colors in components.
- **`liquid-glass`** — Premium Liquid Glass visual system: semi-transparent surfaces with soft blur, layered depth, edge glow, and atmospheric effects. Use when implementing glassmorphic components, overlays, or translucent surfaces requiring premium appearance.
- **`cross-device-compat`** — Cross-browser and cross-device compatibility layer: browser targets (`.browserslistrc`), `-webkit-backdrop-filter` rule, `color-mix()` fallback strategy with the `@compat` marker, hover guards for touch, `prefers-reduced-motion`, touch targets. Consulted automatically by the autocommit gate (B.10–B.11). Use whenever touching SCSS that uses `backdrop-filter`, `color-mix()`, animations, or hover effects.
- **`seo-meta`** — Title/description per route, JSON-LD `Event`, canonicals, sitemap, Open Graph.
- **`error-handling`** — Normalized `FestivalError`, `HttpInterceptor` + global `ErrorHandler`, user-facing messages via i18n.
- **`search`** — **Roadmap spec** (MiniSearch not installed yet). Client-side fuzzy search with MiniSearch, field boosts, diacritic-stripping for Spanish.
- **`maps`** — MapLibre GL JS + Protomaps tiles, lazy-loaded, SSR-safe, accessible with text equivalents.
- **`design-responsive-validation`** 🎨 — **MANDATORY for every UI task.** Bans generic AI-looking layouts, requires a distinctive TuriaFestNoticias identity, enforces responsive checks across desktop / laptop / tablet / mobile (320 px floor), and demands a Design & Responsive Validation Report at task completion.
- **`i18n-commit-policy`** 🌍 — **MANDATORY at commit time.** During normal development only `es.json` is edited; at commit / finalization the matching keys are propagated to every supported locale (`ca`, `en`), JSON parity is verified with `npm run i18n:check`, and an i18n Commit Translation Report is emitted before `git commit` runs.
- **`angular-developer`** — Official Angular Team reference skill (Google LLC). Angular 21 API docs: signals, linkedSignal, resource, DI, routing, forms, SSR, ARIA, animations, CLI, migrations, MCP server. Use when you need to look up Angular internals or best practices. Adapted for this project: Tailwind removed, E2E via Playwright, gate is `npm run lint && npm test -- --run`.

## Architecture

The project uses Astro's conventional layout with a clean separation between build-time markup (`.astro`), framework-agnostic domain logic (`src/data`, `src/lib`, `src/i18n`) and client islands (`src/scripts`). The full contract — folder layout, naming rules, placement decision tree and path aliases — lives in the [[project-structure]] skill. Current tree:

```
src/
├── pages/        # file-based routes → static HTML (noticias/index, noticias/[slug], 404)
├── layouts/      # document shells (BaseLayout.astro: <head>, SEO, nav + footer)
├── components/   # reusable .astro components (NavBar, Footer) + their SCSS partials
├── scripts/      # client-side islands, vanilla TS — theme, i18n switch, nav, news-search
├── data/         # typed content catalogue + models + client-agnostic search (news.*)
├── lib/          # framework-agnostic helpers — seo, site (canonical origin), theme
├── i18n/         # runtime translation resolver (t, LANGUAGES) + typed dictionaries
├── styles/       # SCSS design system: tokens, semantic layer, mixins, utilities
└── assets/       # i18n JSON (source of truth) + image sources (images-src)
```

`public/` holds pre-processed static assets served verbatim (branding, fonts, optimized `assets/images`, and the runtime-copied `assets/i18n`). Path aliases (`@data`, `@i18n`, `@lib`, `@assets`) are defined in both `astro.config.mjs` and `tsconfig.json`.

Dependency rule (one-directional): `pages → layouts → components`; all of them may read from `data / lib / i18n`. Domain modules (`data / lib / i18n`) are framework-agnostic and must **never** import `.astro` files. Client islands (`scripts`) may import from `data / lib / i18n` but not from `.astro` components.

### Architectural principles

- **Static-first**: every route is prerendered (`output: 'static'`). Reach for a client island only for genuine interactivity (theme, language, search).
- **Islands, not global JS**: interactive behaviour is isolated in `src/scripts/*` and wired via `<script>` in the relevant `.astro` file — keep islands small and dependency-free.
- **Framework-agnostic domain**: content, SEO and i18n logic is plain TypeScript in `data / lib / i18n`, unit-testable without Astro.
- **Typing + validation at the boundary**: when remote data is introduced, validate it once with a Zod schema at the edge (see [[api-integration]]). Today the catalogue is local and typed.
- **Path aliases always**: `@data`, `@i18n`, `@lib`, `@assets`. Avoid deep relative climbs.
- **Strings never hardcoded**: all copy flows through i18n keys (`data-i18n` anchors + the `t()` resolver).
- **Tokens never hardcoded**: no literal colors or spacings; always design tokens. See [[theming-styling]].

### The domain

The **live** domain today is the `NewsArticle` entity in `src/data/news-article.model.ts`, served by the local catalogue `src/data/news.catalogue.ts` and indexed by `src/data/news-search.ts`. The `Festival` entity below is the **roadmap** shape for the festival catalogue (to be added under `src/data` and, when remote, validated with Zod — see [[api-integration]]):

```ts
interface Festival {
  slug: string;            // "bigsound" — stable, indexed by search engines
  nombre: string;          // "Bigsound Festival" — official name, not translated
  provincia: 'Valencia' | 'Alicante' | 'Castellón';
  ciudad: string;
  fechaInicio: string;     // ISO-8601, converted to Date at the boundary
  fechaFin: string;
  generos: string[];       // ['indie', 'electrónica'] — lowercase
  cartel: Artist[];        // ordered by tier (headliners → emerging)
  precioDesde: number;     // EUR
  urlOficial: string;
  poster: { src: string; alt: string };
  ubicacion: { lat: number; lng: number };
}
```

Slugs are **immutable once published** — breaking them breaks SEO. Any renaming is coordinated by **performance** with a 301 redirect.

### URL schema

Currently implemented: `/` → **301 redirect to `/noticias`** (see `astro.config.mjs`), `/noticias` (news hub) and `/noticias/:slug` (article detail), plus a `404`. The rest are roadmap:

| Route                       | View                                            |
| --------------------------- | ----------------------------------------------- |
| `/noticias`                 | News hub (implemented)                          |
| `/noticias/:slug`           | News article detail (implemented)               |
| `/`                         | Home with featured festivals                    |
| `/festivales`               | Listing + filters (province, month, genre)      |
| `/festivales/:slug`         | Festival detail                                 |
| `/festivales/:slug/cartel`  | Full line-up                                    |
| `/calendario`               | Calendar timeline by day                        |
| `/artistas/:slug`           | Artist profile                                  |
| `/provincia/:provincia`     | Listing filtered by province                    |
| `/mapa`                     | Interactive festival map (MapLibre)             |
| `/sobre-nosotros`           | Static page                                     |

URL paths remain in Spanish on purpose — they are user-facing, shareable, and SEO-relevant for Spanish queries.

## The application

TuriaFestNoticias is a **public information portal**, not transactional: it does not sell tickets and does not require registration in its first phase. The typical user is a music lover from the Valencian Community who wants to decide which festival to attend this summer and needs to quickly compare dates, prices, and line-ups from a mobile device.

### Festivals in the initial catalogue

The home carousel (`featured-festivals`), the `home.featured.cards.*` i18n keys, and the
`src/assets/images/festivals/<slug>/` folders are the source of truth for this seed catalogue:

- **Bigsound Festival** (`bigsound`) — Valencia.
- **Latin Fest** (`latin-fest`) — Valencia (también Benidorm) — latin, reggaeton.
- **Medusa Festival** (`medusa`) — Cullera, Valencia — electronic.
- **Arenal Sound** (`arenal`) — Burriana, Castellón — pop, urbano, electrónica.
- **Reve Festival** (`reve`) — Valencia (Roig Arena).
- **Zevra Festival** (`zevra`) — Cullera, Valencia.
- (… expandable season by season by the **content** agent)

### Roadmap (high level)

The portal will evolve in these phases:

1. **Information MVP** — catalogue, search, filters, detail pages. No auth.
2. **Personalization** — persisted favourites, dark mode, installable PWA.
3. **User accounts** — registration, login, ratings, comments.
4. **Integrations** — Spotify (preview artists), ticketing (Dice, Ticketmaster), interactive yearly calendar.
5. **Multilingual** — `ca-ES-valencia` and `en-GB` live with hreflang.

Each phase will open new areas (auth, user persistence, admin panel) that **may require additional agents** (`seguridad`, `devops`); they will be evaluated when they arrive.
