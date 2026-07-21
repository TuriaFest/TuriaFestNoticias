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

- `axe-core` integrated into Playwright suite.
- ESLint plugin `eslint-plugin-jsx-a11y` adapted for Angular templates via `@angular-eslint/template`.

---

## Examples

### Semantic HTML — nav-bar template

```html
<!-- ✅ DO — semantic landmarks, aria-current, aria-label from i18n -->
<header>
  <nav [attr.aria-label]="'nav.aria.primary' | t">
    <a routerLink="/"
       [attr.aria-current]="(currentUrl$ | async) === '/' ? 'page' : null">
      {{ 'nav.home' | t }}
    </a>
    <a routerLink="/festivales"
       [attr.aria-current]="(currentUrl$ | async)?.startsWith('/festivales') ? 'page' : null">
      {{ 'nav.festivals' | t }}
    </a>
  </nav>
</header>

<main id="main-content">
  <router-outlet />
</main>
```

```html
<!-- ❌ DON'T — div soup, no landmarks, aria-label hardcoded in Spanish -->
<div class="nav" aria-label="Navegación">
  <div class="link" (click)="go('/')">Inicio</div>
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

```html
<!-- Announced to screen readers when results change -->
<p aria-live="polite" aria-atomic="true" class="sr-only">
  {{ 'search.results.count' | t : { count: results().length } }}
</p>

<!-- sr-only utility in _reset.scss -->
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
