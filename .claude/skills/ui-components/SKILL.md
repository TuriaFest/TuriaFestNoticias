---
name: ui-components
description: >-
  The reusable presentational component library (FestivalCard, FestivalHero, LineupGrid,
  FilterChip and friends): standalone, OnPush, token-driven, dumb components. Use when creating or
  changing a shared presentational component.
---

# 🧩 UI Components

Reusable presentational component library for **TuriaFestNoticias**.

## Purpose

Provide a consistent, accessible, composable set of building blocks for the dark, premium portal surface defined in [[theming-styling]] and the [[views]] agent.

## Core components

| Component                   | Location                  | Role                                                            |
| --------------------------- | ------------------------- | --------------------------------------------------------------- |
| `NavBarComponent`           | `layout/nav-bar/`         | Top navigation, glass panel, brand mark + primary nav + CTA.    |
| `FooterComponent`           | `layout/footer/`          | Site footer, secondary nav, attribution.                        |
| `ButtonComponent`           | `@shared/ui/button/`      | Variants: `primary` (gradient), `secondary` (glass), `ghost`.   |
| `BadgeComponent`            | `@shared/ui/badge/`       | Variants: `neutral`, `violet`, `live` (green, with pulse).      |
| `FestivalCardComponent`     | `@shared/ui/festival-card/` | Poster, dates, ciudad chip, géneros, precio desde, hover-lift. |
| `SearchBarComponent`        | `@shared/ui/search-bar/`  | Debounced input with leading icon and clear affordance.         |
| `DateRangeBadgeComponent`   | `@shared/ui/date-range-badge/` | Formatted Spanish dates (`"12 – 16 jul 2026"`).            |
| `EmptyStateComponent`       | `@shared/ui/empty-state/` | Illustration slot + heading + body + optional action.           |
| `SkeletonLoaderComponent`   | `@shared/ui/skeleton-loader/` | Pulsing block; respects `prefers-reduced-motion`.           |
| `FestivalToastComponent`    | `@shared/ui/festival-toast/` | Transient notification, slides up from bottom-right.         |
| `FormErrorComponent`        | `@shared/ui/form-error/`  | Reads control state, outputs i18n error message ([[forms-validation]]). |
| `FestivalHeroComponent`     | `festival-detail/ui/`     | Full-bleed banner for detail pages, radial glow backdrop.       |
| `LineupGridComponent`       | `festival-detail/ui/`     | Tier-based typography for headliners → mid → emerging.          |
| `FilterChipComponent`       | `festival-list/ui/`       | Toggleable chip; selected state uses `--accent-violet-soft`.    |

## Variants and tokens

- **Buttons** use `--radius-md`, height 40 px (default) / 48 px (large), `--duration-base` transitions.
- **Cards** use `--radius-lg` (16 px), `--shadow-card` resting, `--shadow-elevated` on hover, 2 px upward translate.
- **Badges** use `--radius-pill`, `--text-xs`, `--tracking-wider`, uppercase.
- **Glass panels** apply the `glass()` mixin only when content sits over a colored or textured backdrop (hero, modal overlay).

## Where components live

Per the feature-sliced structure (see [[project-structure]]):

- **Shared primitives** reused by ≥ 2 features → `@shared/ui/<name>/` (`button`, `badge`, `festival-card`, `search-bar`, `empty-state`, `skeleton-loader`, `festival-toast`, `form-error`).
- **Feature-local presentational components** → `features/<feature>/ui/<name>/` (`festival-hero` and `lineup-grid` live in `festival-detail/ui/`; filter widgets live in `festival-list/ui/`).
- **Shell chrome** (nav, footer) → `layout/`.

A component starts feature-local and moves to `@shared/ui/` the moment a second feature imports it — never anticipatorily.

## Composition rules

- All components are **standalone**, `OnPush`, signal `input()` / `output()`.
- **Presentational components never inject services or stores.** Smart pages (in `features/*/feature/`) inject `data-access/` and pass data down via inputs. Inside a feature, `ui/` may not import from `data-access/`.
- No hardcoded strings — every label goes through the i18n pipe (see [[internationalization]]).
- No hardcoded values for color, spacing, radius, shadow, or motion — only tokens from [[theming-styling]].
- Selector prefix `fv-` (e.g. `fv-festival-card`).
- One folder per component, four files only (Angular 21 convention, no `.component` suffix):
  ```
  <location>/<name>/
  ├── <name>.ts
  ├── <name>.html
  ├── <name>.scss
  └── <name>.spec.ts
  ```

## Interaction baseline

- Hover: subtle background brighten (`--bg-elevated` → mix with 4 % white) and border step (`--border-subtle` → `--border-default`).
- Active: scale `0.98` over `--duration-fast`.
- Focus: `--shadow-focus` ring, never `outline: none` without replacement.
- Disabled: `opacity: 0.5`, no pointer events, no focus ring.

## States

Every list/detail surface ships with these three states designed before being marked done:

- **Loading** — skeleton with the same outer shape.
- **Empty** — `EmptyStateComponent` with a helpful next action.
- **Error** — message + retry CTA, copy via [[internationalization]].

---

## Examples

### FestivalCard — standalone component (canonical pattern)

```ts
// src/app/shared/ui/festival-card/festival-card.ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import type { Festival } from '@shared/domain/festival.model';

@Component({
  selector: 'fv-festival-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage, TranslatePipe],
  templateUrl: './festival-card.html',
  styleUrl: './festival-card.scss',
})
export class FestivalCardComponent {
  readonly festival = input.required<Festival>();
}
```

```html
<!-- festival-card.html -->
<article class="festival-card">
  <a [routerLink]="['/festivales', festival().slug]" class="festival-card__link">
    <div class="festival-card__poster">
      <img
        [ngSrc]="festival().poster.src"
        [alt]="festival().poster.alt"
        width="400" height="560"
      />
    </div>
    <div class="festival-card__body">
      <h3 class="festival-card__name">{{ festival().nombre }}</h3>
      <p class="festival-card__city">{{ festival().ciudad }}</p>
      <p class="festival-card__price">
        {{ 'festival.card.priceFrom' | t : { price: festival().precioDesde } }}
      </p>
    </div>
  </a>
</article>
```

```scss
// festival-card.scss — tokens only, never hardcoded values
.festival-card {
  border-radius: var(--fv-radius-lg);
  background: var(--fv-bg-surface);
  border: 1px solid var(--fv-border-subtle);
  overflow: hidden;
  transition: transform var(--fv-duration-base) var(--fv-ease-standard),
              box-shadow var(--fv-duration-base) var(--fv-ease-standard);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--fv-shadow-elevated);
  }

  &__link { display: block; color: inherit; text-decoration: none; }
  &__name  { font-family: var(--fv-font-heading); color: var(--fv-text-primary); }
  &__city  { color: var(--fv-text-secondary); font-size: var(--fv-text-sm); }
  &__price { color: var(--fv-accent-violet); font-size: var(--fv-text-sm); }
}
```

### Loading / Empty / Error states — pattern in a page

```html
<!-- Smart page orchestrates the three states -->
@defer (when catalogue.loaded()) {
  @if (festivals().length > 0) {
    <ul class="festival-grid">
      @for (f of festivals(); track f.slug) {
        <li><fv-festival-card [festival]="f" /></li>
      }
    </ul>
  } @else {
    <fv-empty-state
      icon="calendar-x"
      [title]="'festivals.empty.title' | t"
      [body]="'festivals.empty.body' | t"
    />
  }
} @loading {
  <ul class="festival-grid">
    @for (_ of [1,2,3,4,5,6]; track $index) {
      <li><fv-skeleton-loader variant="card" /></li>
    }
  </ul>
} @error {
  <fv-empty-state
    icon="wifi-off"
    [title]="'errors.network.message' | t"
    [action]="'errors.retry' | t"
    (actionClick)="reload()"
  />
}
```

### Output — event emitted from a presentational component

```ts
// Presentational components never call stores or services.
// They emit events upward via output().
@Component({ selector: 'fv-filter-chip', /* ... */ })
export class FilterChipComponent {
  readonly label    = input.required<string>();
  readonly selected = input(false);
  readonly toggled  = output<boolean>();

  toggle(): void {
    this.toggled.emit(!this.selected());
  }
}
```

```html
<!-- Parent smart page handles the event -->
<fv-filter-chip
  [label]="'Valencia'"
  [selected]="filters.provincia() === 'Valencia'"
  (toggled)="filters.setProvincia($event ? 'Valencia' : null)"
/>
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
