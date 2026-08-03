---
name: accessibility
description: >-
  Enforces WCAG 2.1 AA for the TuriaFestNoticias portal: colour contrast, visible focus, minimal ARIA,
  keyboard navigation and descriptive alt text. Use when building or reviewing any UI, when adding
  interactive controls, images or forms, or when running an accessibility audit before merge.
---

# ♿ Accessibility (a11y)

WCAG 2.1 AA compliance for the **TuriaFestNoticias** portal.

## Purpose

Ensure every user — including those using screen readers, keyboard navigation, or with visual impairments — can browse festivals, read line-ups, and use filters.

## Checklist

- **Semantic HTML**: `<nav>`, `<main>`, `<article>`, `<section>` instead of `<div>` soup.
- **Headings hierarchy**: single `<h1>` per route, no skipped levels.
- **Color contrast**: ≥ 4.5:1 for body, ≥ 3:1 for large text. Tokens defined in [[theming-styling]].
- **Focus states**: visible outlines, never `outline: none` without replacement.
- **Keyboard**: every interactive element reachable via `Tab`; modals trap focus.
- **ARIA**: only when semantic HTML is insufficient. Prefer `aria-label`, `aria-current`, `aria-expanded`.
- **Live regions**: search results count announced via `aria-live="polite"`.
- **Alt text**: festival posters get descriptive alt (`"Cartel de FIB 2026"`), decorative images get `alt=""`.
- **Forms**: every input has an associated `<label>`.

## Automated Checks

- `axe-core` integrated into the Playwright suite.
- `astro check` catches basic template/type issues; there is no JSX-based lint layer — semantic-HTML and ARIA discipline in `.astro` markup is enforced by this skill and by code review, not by an ESLint a11y plugin.

---

## Examples

### Semantic HTML — NavBar.astro markup

```astro
---
// ✅ DO — semantic landmarks, aria-current, aria-label from i18n, computed in frontmatter
import { ES_TRANSLATIONS } from '@i18n/translations';
import { t } from '@i18n/index';

const currentPath = Astro.url.pathname;
---

<header>
  <nav aria-label={t('nav.aria.primary', ES_TRANSLATIONS)}>
    <a href="/" aria-current={currentPath === '/' ? 'page' : undefined}>
      {t('nav.home', ES_TRANSLATIONS)}
    </a>
    <a href="/festivales" aria-current={currentPath.startsWith('/festivales') ? 'page' : undefined}>
      {t('nav.festivals', ES_TRANSLATIONS)}
    </a>
  </nav>
</header>

<main id="main-content">
  <slot />
</main>
```

```astro
<!-- ❌ DON'T — div soup, no landmarks, aria-label hardcoded in Spanish, click handled inline -->
<div class="nav" aria-label="Navegación">
  <div class="link" onclick="location.href='/'">Inicio</div>
</div>
```

### Focus ring — SCSS (never `outline: none`)

```scss
// src/styles/_mixins.scss — already defined, use this everywhere
@mixin focus-ring {
  outline: none;
  box-shadow: 0 0 0 2px var(--fv-accent-violet);
}

// In a component
.fv-button {
  &:focus-visible {
    @include focus-ring;
  }
  // Never: &:focus { outline: none; }
}
```

### Live region — search result count

```astro
<!-- Announced to screen readers when the news-search island updates the DOM -->
<p aria-live="polite" aria-atomic="true" class="sr-only" data-testid="search-results-count"></p>
```

```ts
// src/scripts/news-search.ts — the island writes the count, never inline markup interpolation
import { translateKey } from './i18n';

function updateResultsCount(count: number): void {
  const el = document.querySelector<HTMLElement>('[data-testid="search-results-count"]');
  if (!el) return;
  el.textContent = translateKey('search.results.count', { count });
}
```

```scss
/* sr-only utility in _reset.scss */
```

```scss
// src/styles/_reset.scss
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### axe-core in Playwright E2E

```ts
// e2e/accessibility.spec.ts
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test('home page passes WCAG 2.1 AA', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('festival detail passes WCAG 2.1 AA', async ({ page }) => {
  await page.goto('/festivales/fib-benicassim');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

## Related skills

- [[ui-components]]
- [[theming-styling]]
- [[design-responsive-validation]]
- [[testing-patterns]]
