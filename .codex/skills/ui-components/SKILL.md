---
name: ui-components
description: >-
  The reusable presentational component library (NavBar, Footer, FestivalCard, LineupGrid,
  FilterChip and friends): .astro, token-driven, dumb components with colocated SCSS. Use when
  creating or changing a shared presentational component.
---

# 🧩 UI Components

Reusable presentational component library for **TuriaFestNoticias**.

## Purpose

Provide a consistent, accessible, composable set of `.astro` building blocks for the dark, premium portal surface defined in [[theming-styling]] and the [[views]] agent.

## Core components

| Component            | Location                          | Role                                                            |
| --------------------- | ---------------------------------- | --------------------------------------------------------------- |
| `NavBar.astro`        | `src/components/NavBar.astro`      | Sticky header, brand mark (light/dark logo swap), primary nav, language switcher, theme toggle. |
| `Footer.astro`        | `src/components/Footer.astro`      | Site footer, secondary nav, social links, attribution.          |
| `_news-page.scss`     | `src/components/_news-page.scss`   | News hub layout partial (search input, article grid).           |
| `_news-article-page.scss` | `src/components/_news-article-page.scss` | Article detail layout partial (hero, byline, prose body). |

Roadmap components (not implemented yet, follow this pattern when they land):

| Component            | Location (planned)          | Role                                                            |
| --------------------- | ---------------------------- | ----------------------------------------------------------------- |
| `Button.astro`        | `src/components/Button.astro` | Variants: `primary` (gradient), `secondary` (glass), `ghost`.   |
| `Badge.astro`         | `src/components/Badge.astro`  | Variants: `neutral`, `violet`, `live` (green, with pulse).      |
| `FestivalCard.astro`  | `src/components/FestivalCard.astro` | Poster, dates, ciudad chip, géneros, precio desde, hover-lift. |
| `SearchBar.astro`     | `src/components/SearchBar.astro` | Input with leading icon + clear affordance, wired to a `news-search.ts`-style island. |
| `EmptyState.astro`    | `src/components/EmptyState.astro` | Illustration slot + heading + body + optional action.           |
| `SkeletonLoader.astro`| `src/components/SkeletonLoader.astro` | Pulsing block; respects `prefers-reduced-motion`. Server-rendered as static markup — no client spinner, since content is already in the static build. |
| `FestivalHero.astro`  | `src/components/FestivalHero.astro` | Full-bleed banner for detail pages, radial glow backdrop.       |
| `LineupGrid.astro`    | `src/components/LineupGrid.astro` | Tier-based typography for headliners → mid → emerging.          |
| `FilterChip.astro`    | `src/components/FilterChip.astro` | Toggleable chip; selected state uses `--accent-violet-soft`; toggling is a tiny island since it's pure client interaction. |

## Variants and tokens

- **Buttons** use `--fv-radius-md`, height 40 px (default) / 48 px (large), `--fv-duration-base` transitions.
- **Cards** use `--fv-radius-lg` (16 px), `--fv-shadow-card` resting, `--fv-shadow-elevated` on hover, 2 px upward translate.
- **Badges** use `--fv-radius-pill`, `--fv-text-xs`, `--fv-tracking-wider`, uppercase.
- **Glass panels** apply the `glass()` mixin only when content sits over a colored or textured backdrop (hero, modal overlay).

## Where components live

Per the Astro file-based structure (see [[project-structure]]):

- **Shell chrome** (`NavBar`, `Footer`) and any component reused across ≥ 2 routes → `src/components/<Name>.astro` with a colocated `_<kebab-name>.scss` partial.
- **Page-specific presentational partials** (layout SCSS for a single route, e.g. `_news-page.scss`, `_news-article-page.scss`) live in `src/components/` next to the page they style, imported from the corresponding `src/pages/**/*.astro` file.
- A component starts page-local (its SCSS partial only imported by one page) and is promoted to a shared, reusable `.astro` file the moment a second page needs it — never anticipatorily.

## Composition rules

- All components are `.astro` files — no client-side component classes, no UI framework (React/Vue/Svelte) islands.
- **Presentational components never fetch data or import from `src/data`/`src/lib` for content they don't own.** Pages (`src/pages/**/*.astro`) read the catalogue and pass data down via Astro component props. A component's frontmatter may still import small formatting helpers (e.g. `@lib/site`), but never the catalogue itself unless the component *is* the page.
- No hardcoded strings — every label goes through the `data-i18n` anchor + `t()` resolver (see [[internationalization]]).
- No hardcoded values for color, spacing, radius, shadow, or motion — only tokens from [[theming-styling]].
- **Wrapper root class instead of `:host`**: every component wraps its markup in a single element carrying a `fv-<name>-root` class (`.fv-nav-root`, `.fv-footer-root`) so SCSS partials imported `is:global` can target it predictably without leaking into sibling markup.
- One `.astro` file per component, with a colocated SCSS partial and (when the component drives an island) a matching script in `src/scripts/`:
  ```
  src/components/<Name>.astro
  src/components/_<kebab-name>.scss
  src/scripts/<kebab-name>.ts        # only if the component needs client interactivity
  ```

## Interaction baseline

- Hover: subtle background brighten (`--fv-bg-elevated` → mix with 4 % white) and border step (`--fv-border-subtle` → `--fv-border-default`).
- Active: scale `0.98` over `--fv-duration-fast`.
- Focus: `--fv-shadow-focus` ring, never `outline: none` without replacement.
- Disabled: `opacity: 0.5`, no pointer events, no focus ring.

## States

Every list/detail surface ships with these three states designed before being marked done. Because the site is static-first, "loading" and "error" are design states baked into the prerendered markup (e.g. an empty-catalogue branch), not runtime UI reacting to a pending fetch:

- **Loading** — skeleton with the same outer shape (used only for genuinely client-driven UI, e.g. search-as-you-type results).
- **Empty** — an `EmptyState`-style block with a helpful next action, rendered server-side when the catalogue/query yields nothing.
- **Error** — message + retry link, copy via [[internationalization]], rendered server-side (e.g. `404.astro`) or by the client island for network-backed islands.

---

## Examples

### NavBar — real component (canonical pattern)

```astro
---
// src/components/NavBar.astro
import { ES_TRANSLATIONS } from '@i18n/translations';
import { t, LANGUAGES } from '@i18n/index';
---

<div class="fv-nav-root">
  <header class="nav-bar">
    <div class="nav-bar__inner">
      <a
        class="nav-bar__brand"
        href="/"
        data-i18n="nav.home"
        data-i18n-attr="aria-label"
        aria-label={t('nav.home', ES_TRANSLATIONS)}
      >
        <img
          class="nav-bar__brand-img nav-bar__brand-img--light"
          src="/assets/branding/festi-val-logo.webp"
          width="800" height="580"
          alt="TuriaFest"
        />
        <img
          class="nav-bar__brand-img nav-bar__brand-img--dark"
          src="/assets/branding/festi-val-logo-dark.webp"
          width="800" height="580"
          alt=""
          aria-hidden="true"
        />
      </a>

      <nav
        class="nav-bar__nav"
        data-i18n="nav.aria.primary"
        data-i18n-attr="aria-label"
        aria-label={t('nav.aria.primary', ES_TRANSLATIONS)}
      >
        <ul class="nav-bar__nav-list">
          <li>
            <a class="nav-bar__nav-link" data-testid="nav-link-noticias" href="/noticias" data-i18n="nav.news">
              {t('nav.news', ES_TRANSLATIONS)}
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</div>

<style lang="scss" is:global>
  @use '../styles/breakpoints' as *;
  @use '../styles/mixins' as *;
  @use './_nav-bar.scss';
</style>

<script>
  import { initTheme } from '@scripts/theme';
  import { initNav } from '@scripts/nav';
  initTheme();
  initNav();
</script>
```

```scss
// src/components/_nav-bar.scss — tokens only, never hardcoded values
.nav-bar {
  position: sticky;
  top: 0;
  z-index: 40;
  background: var(--fv-bg-nav);
  border-bottom: 1px solid var(--fv-border-nav);
  color: var(--fv-text-nav);
}

.nav-bar__inner {
  @include container;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.nav-bar__nav-link {
  color: inherit;
  font-family: var(--fv-font-ui);
  font-size: var(--fv-text-sm);
  text-decoration: none;
  transition: color var(--fv-duration-fast) var(--fv-ease-standard);

  &:hover { color: var(--fv-accent-blue); }

  &:focus-visible {
    outline: none;
    box-shadow: var(--fv-shadow-focus);
  }
}
```

### Loading / Empty / Error states — static-first pattern in a page

```astro
---
// src/pages/noticias/index.astro
import BaseLayout from '@layouts/BaseLayout.astro';
import { NEWS_ARTICLES } from '@data/news.catalogue';

const articles = NEWS_ARTICLES;
---

<BaseLayout title="Noticias">
  {articles.length > 0 ? (
    <ul class="news-grid">
      {articles.map((article) => (
        <li>
          <a class="news-card" href={`/noticias/${article.slug}`}>
            <h3>{article.title}</h3>
          </a>
        </li>
      ))}
    </ul>
  ) : (
    <div class="empty-state">
      <p data-i18n="news.empty.title">No hay noticias todavía.</p>
    </div>
  )}
</BaseLayout>
```

There is no `@loading` branch here — the catalogue is resolved at build time, so the "loading" state simply never reaches the client. Reserve a genuine loading skeleton for an island that fetches or filters client-side (e.g. `news-search.ts` while MiniSearch narrows results as the user types).

### Client island — event handling stays out of markup

```ts
// src/scripts/nav.ts — presentational .astro never wires its own event listeners inline
export function initNav(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-testid="nav-toggle"]');
  const menu = document.querySelector<HTMLElement>('[data-testid="nav-menu"]');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    menu.toggleAttribute('data-open', !expanded);
  });
}
```

```astro
<!-- Component only renders the markup + data-testid hooks; nav.ts owns the behaviour -->
<button
  class="nav-bar__toggle"
  data-testid="nav-toggle"
  aria-expanded="false"
  aria-controls="nav-menu"
>
  <span class="sr-only" data-i18n="nav.aria.toggle">Abrir menú</span>
</button>
```

## Hard rule — genre/category chips

**Never add genre or category badge chips (e.g. "ELECTRÓNICA", "REGGAETON") to any UI unless the user explicitly requests them.**

These are decorative pill-shaped labels with colored text on a dark/tinted background. They add visual noise and were flagged by the product owner as unwanted default decoration. The pattern to avoid:

```scss
// ❌ Do NOT add this kind of chip unprompted
.some-genre-chip {
  background: rgba(78, 140, 255, 0.12);
  color: var(--fv-accent-blue);
  border-radius: var(--fv-radius-pill);
  font-size: var(--fv-text-xs);
  font-weight: 700;
  letter-spacing: var(--fv-tracking-wider);
  text-transform: uppercase;
}
```

If genre information needs to be displayed, use plain text (e.g. within a metadata list) rather than a styled chip, unless the user explicitly asks for a chip treatment.

## Related skills

- [[theming-styling]]
- [[accessibility]]
- [[design-responsive-validation]]
