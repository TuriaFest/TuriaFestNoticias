# Token reference (primitives, semantics, scales)

> Reference for the [[theming-styling]] skill — extracted from `SKILL.md` for progressive disclosure.

## Primitive palette (raw, never used directly in components)

```scss
// Neutrals — deep navy bias, not pure black
$fv-gray-950: #07070C;   // canvas
$fv-gray-900: #0B0B14;   // surface
$fv-gray-850: #11111D;   // elevated
$fv-gray-800: #181826;   // overlay base
$fv-gray-700: #232336;
$fv-gray-600: #2F2F47;
$fv-gray-500: #4A4A66;
$fv-gray-400: #6B6E85;
$fv-gray-300: #9CA0B5;
$fv-gray-200: #C9CCDB;
$fv-gray-100: #E7E9F2;
$fv-gray-50:  #F4F4FA;

// Brand — Mediterranean blue primary
$fv-blue-500:   #4E8CFF;
$fv-blue-400:   #6BA1FF;

// Mediterranean canvas (nav / light surfaces)
$fv-sand-50:      #F8F5F0; // light page canvas, nav background
$fv-navy-950:     #0F172A; // deep navy text on sand
$fv-coral-500:    #FF4D4D; // Mediterranean accent
$fv-orange-400:   #FF8A3D; // Mediterranean accent
$fv-med-blue-500: #2D9CDB; // Mediterranean accent

// Accent — green is reserved for live/success
$fv-green-500:  #4ADE9D;
$fv-green-400:  #6BE8B0;

// States
$fv-red-500:    #FF5C7A;
$fv-amber-500:  #F5B544;
```

---

## Semantic tokens (these are what components use)

Exposed as CSS custom properties at `:root`:

```scss
:root {
  // Surfaces
  --fv-bg-canvas:        #{$fv-gray-950};
  --fv-bg-surface:       #{$fv-gray-900};
  --fv-bg-elevated:      #{$fv-gray-850};
  --fv-bg-overlay:       rgba(24, 24, 38, 0.6);   // translucent glass

  // Borders — hairline, used everywhere
  --fv-border-subtle:    rgba(255, 255, 255, 0.06);
  --fv-border-default:   rgba(255, 255, 255, 0.10);
  --fv-border-strong:    rgba(255, 255, 255, 0.16);
  --fv-border-accent:    rgba(124, 92, 255, 0.40);

  // Text
  --fv-text-primary:     #{$fv-gray-50};
  --fv-text-secondary:   #{$fv-gray-300};
  --fv-text-muted:       #{$fv-gray-400};
  --fv-text-inverse:     #{$fv-gray-950};

  // Accents
  --fv-accent-blue:        #{$fv-blue-500};
  --fv-accent-med-blue:    #{$fv-med-blue-500};  // Mediterranean accent
  --fv-accent-coral:       #{$fv-coral-500};     // Mediterranean accent
  --fv-accent-orange:      #{$fv-orange-400};    // Mediterranean accent
  --fv-accent-green:       #{$fv-green-500};   // ONLY for live/success indicators
  --fv-accent-danger:      #{$fv-red-500};

  // Gradients
  --fv-gradient-brand:
    linear-gradient(135deg, #{$fv-med-blue-500} 0%, #{$fv-blue-500} 100%);
  --fv-gradient-text:
    linear-gradient(135deg, #{$fv-gray-50} 0%, #{$fv-blue-400} 100%);
  --fv-gradient-hero-glow:
    radial-gradient(60% 50% at 50% 0%,
      rgba(45, 156, 219, 0.22) 0%,
      rgba(78, 140, 255, 0.10) 35%,
      transparent 70%);
  --fv-gradient-card-sheen:
    linear-gradient(180deg,
      rgba(255, 255, 255, 0.04) 0%,
      transparent 40%);

  // Shadows — soft, atmospheric, never harsh
  --fv-shadow-card:
    0 1px 2px rgba(0, 0, 0, 0.35),
    0 8px 24px rgba(0, 0, 0, 0.25);
  --fv-shadow-elevated:
    0 2px 4px rgba(0, 0, 0, 0.4),
    0 20px 48px rgba(0, 0, 0, 0.45);
  --fv-shadow-focus:
    0 0 0 2px var(--fv-bg-canvas),
    0 0 0 4px var(--fv-accent-blue);
  --fv-shadow-glow-blue:
    0 0 40px rgba(78, 140, 255, 0.25);
}
```

---

## Spacing scale

4 px base unit, exponential where useful:

```scss
:root {
  --fv-space-0:  0;
  --fv-space-1:  4px;
  --fv-space-2:  8px;
  --fv-space-3:  12px;
  --fv-space-4:  16px;
  --fv-space-5:  24px;
  --fv-space-6:  32px;
  --fv-space-7:  48px;
  --fv-space-8:  64px;
  --fv-space-9:  96px;
  --fv-space-10: 128px;
}
```

---

## Radii

```scss
:root {
  --fv-radius-sm:   8px;   // small chips, badges
  --fv-radius-md:   12px;  // buttons, inputs
  --fv-radius-lg:   16px;  // cards
  --fv-radius-xl:   24px;  // hero panels, modals
  --fv-radius-2xl:  32px;
  --fv-radius-pill: 999px;
}
```

Never mix more than two radii in a single view.

---

## Typography

Font families are tokenized in `_fonts.scss` (see that partial for the role mapping). Sizes, line-heights, and tracking live here:

```scss
:root {
  --fv-text-xs:      12px;
  --fv-text-sm:      14px;
  --fv-text-base:    16px;
  --fv-text-lg:      18px;
  --fv-text-xl:      20px;
  --fv-text-2xl:     24px;
  --fv-text-3xl:     32px;
  --fv-text-4xl:     44px;
  --fv-text-display: 64px;

  --fv-leading-tight:   1.15;
  --fv-leading-snug:    1.3;
  --fv-leading-normal:  1.5;
  --fv-leading-relaxed: 1.65;

  --fv-tracking-tight: -0.02em;
  --fv-tracking-snug:  -0.01em;
  --fv-tracking-wide:   0.08em;
  --fv-tracking-wider:  0.14em;
}
```

### Font families (tokenized in `_fonts.scss`)

| Token                  | Family          | Use                                 |
| ---------------------- | --------------- | ----------------------------------- |
| `--fv-font-ui`         | Inter           | Body, UI text, default              |
| `--fv-font-data`       | Inter           | Data display, structured content    |
| `--fv-font-heading`    | Sora            | Section titles, component headings  |
| `--fv-font-brand`      | Sora            | Brand-level usage                   |
| `--fv-font-hero`       | Inter           | Hero text (default)                 |
| `--fv-font-hero-emphasis` | Sora         | Hero text with emphasis             |
| `--fv-font-mono`       | JetBrains Mono  | Dates, IDs, code, technical values  |

### Type roles

| Role             | Font token              | Size                | Weight | Tracking              |
| ---------------- | ----------------------- | ------------------- | ------ | --------------------- |
| Display          | `--fv-font-hero-emphasis` | `--fv-text-display` | 600    | `--fv-tracking-tight` |
| H1               | `--fv-font-heading`     | `--fv-text-4xl`     | 600    | `--fv-tracking-tight` |
| H2               | `--fv-font-heading`     | `--fv-text-3xl`     | 600    | `--fv-tracking-snug`  |
| H3               | `--fv-font-heading`     | `--fv-text-2xl`     | 500    | `--fv-tracking-snug`  |
| Body             | `--fv-font-ui`          | `--fv-text-base`    | 400    | normal                |
| Body small       | `--fv-font-ui`          | `--fv-text-sm`      | 400    | normal                |
| Eyebrow / label  | `--fv-font-ui`          | `--fv-text-xs`      | 500    | `--fv-tracking-wider`, `text-transform: uppercase` |
| Code             | `--fv-font-mono`        | `--fv-text-sm`      | 400    | normal                |

Wide tracking only for eyebrows and small caps labels. Body text is never letter-spaced.

---

## Motion

```scss
:root {
  --fv-duration-fast: 150ms;
  --fv-duration-base: 240ms;
  --fv-duration-slow: 400ms;

  --fv-ease-standard:   cubic-bezier(0.2, 0.8, 0.2, 1);
  --fv-ease-emphasized: cubic-bezier(0.16, 1, 0.3, 1);
  --fv-ease-in:         cubic-bezier(0.4, 0, 1, 1);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Breakpoints

Mobile-first only. Exposed as a SCSS map (consumed by `@include from(...)`), not as CSS variables — media queries cannot read custom properties.

```scss
$fv-breakpoints: (
  sm:  640px,
  md:  768px,
  lg:  1024px,
  xl:  1280px,
  2xl: 1440px
);

@mixin from($bp) {
  @media (min-width: map.get($fv-breakpoints, $bp)) { @content; }
}
```

Usage: `@include from(md) { ... }`.

---
