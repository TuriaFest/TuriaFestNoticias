---
name: theming-styling
description: >-
  SCSS architecture and the design-token system: primitive and semantic tokens in the --fv-*
  namespace, the premium dark surface identity, and the no-hardcoded-values rule. MANDATORY
  when creating any new UI — every surface must adapt to the light / dark / system themes via
  semantic tokens (see references/theme-adaptation.md). Use for any SCSS, token, colour,
  spacing, typography or theming change.
---

# 🎨 Theming & Styling

SCSS architecture and design tokens for **TuriaFestNoticias**.

## Purpose

Provide a single source of truth for colors, spacing, typography, radii, shadows, and motion. The visual identity is a **premium dark product surface** — deep navy/black canvas, Mediterranean blue accent identity, restrained glassmorphism, generous spacing, and intentional micro-interactions.

This skill defines the **what** (token values) and the **how** (where they live, how they are consumed). Components never inline literal values.

---

## Namespace

All design tokens are exposed as CSS custom properties under the `--fv-*` prefix. The prefix:

- Avoids collisions with third-party CSS that uses unprefixed variables.
- Makes greppable "is this a TuriaFestNoticias token?" trivially answerable.
- Matches the existing `--fv-font-*` family already in production.

SCSS primitive variables keep a `$fv-` prefix where they are exported, raw scalars otherwise.

---

## File layout

```
src/styles/
├── styles.scss          # entry point — the only file BaseLayout.astro imports globally
├── _reset.scss          # opinionated reset (margin, box-sizing, focus)
├── _tokens.scss         # primitive tokens (raw palette, raw scales) — SCSS only
├── _semantic.scss       # semantic tokens exposed as `--fv-*` CSS custom properties
├── _typography.scss     # type ramp, font sizes, line-heights, tracking
├── _fonts.scss          # @font-face + font-family tokens (Inter, Sora, JetBrains Mono)
├── _spacing.scss        # 4 px base spacing scale
├── _radii.scss          # radius scale
├── _shadows.scss        # elevation system
├── _motion.scss         # easing curves and durations
├── _breakpoints.scss    # media query helpers (sm/md/lg/xl via from()/until())
├── _mixins.scss         # reusable mixins (glass, focus-ring, container)
├── _safari-compat.scss  # backdrop-filter / color-mix() fallback reference (see [[cross-device-compat]])
├── _animations.scss     # keyframes (fade-up, glow-pulse)
└── utilities/
    └── _liquid-glass.scss  # `.liquid-glass-*` utility classes (see [[liquid-glass]])
```

`styles.scss` `@use`s these partials at the global scope and is imported once, in `src/layouts/BaseLayout.astro`, via `<style lang="scss" is:global>@use '../styles/styles';</style>` (SCSS `loadPaths`/aliases are configured in `astro.config.mjs` and mirrored in `tsconfig.json`). Component-level SCSS partials (colocated next to their `.astro` file, e.g. `src/components/_nav-bar.scss`) import mixins and breakpoints via `@use '../styles/mixins' as *;` and `@use '../styles/breakpoints' as *;` — never `@use '../styles/tokens'` or `@use '../styles/semantic'` directly. Components consume only the resulting `--fv-*` CSS variables.

---

## Token catalogue

The complete primitive palette, semantic `--fv-*` tokens, spacing / radii / typography / motion / breakpoint scales.

➡️ Moved to [`references/tokens.md`](references/tokens.md) to keep this SKILL.md lean.

## Reusable mixins

```scss
// Glass panel — translucent surface with hairline border and blur
@mixin glass($alpha: 0.6) {
  background: rgba(17, 17, 29, $alpha);
  border: 1px solid var(--fv-border-subtle);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
}

// Focus ring — used by all interactive elements
@mixin focus-ring {
  &:focus-visible {
    outline: none;
    box-shadow: var(--fv-shadow-focus);
    transition: box-shadow var(--fv-duration-fast) var(--fv-ease-standard);
  }
}

// Container — max-width with consistent gutters
@mixin container {
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: var(--fv-space-5);

  @include from(md) { padding-inline: var(--fv-space-6); }
  @include from(lg) { padding-inline: var(--fv-space-7); }
}
```

---

## Hard rules

1. Components **never** reference primitive SCSS variables directly. Always semantic `--fv-*` CSS variables.
2. Components **never** hardcode colors, radii, spacings, durations, or font families.
3. `--fv-accent-green` is reserved for live/success states. Never decorative.
4. Glass surfaces require depth behind them. Never apply `glass()` to a full-screen background.
5. No more than **two accent hues** per view (blue + warning/coral is the default pair).
6. No heavy drop shadows (`rgba(0,0,0,0.5)` with 30 px blur). Shadows are atmospheric.
7. **Theming is active (light + dark + system).** The base `:root` is the LIGHT theme
   (the current Mediterranean light surfaces — keep it pixel-identical). Dark mode flips
   only the themeable "chrome" semantic tokens (`--fv-bg-page`, `--fv-bg-nav`,
   `--fv-text-nav`, `--fv-border-nav`, `--fv-bg-nav-icon-hover`, `--fv-bg-card-light`,
   `--fv-bg-tile-dark`, and the `--fv-*-footer*` set) inside `:root[data-theme="dark"]`
   **and** `@media (prefers-color-scheme: dark) { :root:not([data-theme]) { … } }`.
   Primitives never change. The "dark canvas" tokens (`--fv-bg-canvas/surface/elevated`,
   `--fv-text-primary/secondary/inverse`) are theme-independent — they stay dark for
   elements that are always dark (hero overlay text, poster tiles). Never hardcode a
   per-theme color in a component; add the override to `_semantic.scss`.

---

## Theme adaptation (light / dark / system) — MANDATORY for new UI

Every new surface must look intentional in both resolved themes. The full gate — token
categories (themeable chrome vs theme-independent dark canvas vs shared accents), the
decision tree for new surfaces, the Theme Adaptation Checklist, hard rules, and worked
examples.

➡️ Lives in [`references/theme-adaptation.md`](references/theme-adaptation.md) (formerly the standalone `light-dark-mode` skill).

## Theme switching

States: `light | dark | system` (default `system`). `src/lib/theme.ts` is the framework-agnostic
single source of truth: it exports `applyTheme()`, `resolveTheme()`, `readStoredMode()` and
`watchDarkModePreference()` — pure functions with no Astro/DOM-framework dependency, unit-testable
in isolation. Two consumers call into it:

- An **inline blocking script** in `src/layouts/BaseLayout.astro`'s `<head>` reads the stored mode
  and applies `data-theme` on `<html>` synchronously, before first paint, to avoid FOUC.
- The **`theme.ts` island** (`src/scripts/theme.ts`) re-runs the same resolution after hydration,
  watches `prefers-color-scheme` changes live, and keeps the header toggle button in sync
  (`aria-pressed`, i18n `aria-label` via `nav.theme.toDark` / `nav.theme.toLight`).

`data-theme` set explicitly wins; removing it (the `system` state) lets the
`prefers-color-scheme` media query govern. The choice persists in `localStorage` under the
`fv-theme` key. The header toggle lives in `NavBar.astro` (`[data-testid="nav-btn-tema"]`) and
switches light↔dark with a sun/moon icon.

## Related skills

- [[ui-components]]
- [[design-responsive-validation]]
- [[accessibility]]
