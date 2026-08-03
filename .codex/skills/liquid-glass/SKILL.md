---
name: liquid-glass
description: >-
  Premium Liquid Glass visual system for TuriaFestNoticias: semi-transparent surfaces with soft blur,
  layered depth, edge glow, and accessibility. Use when implementing glassmorphic components,
  card overlays, panels, or any translucent surface requiring premium appearance.
---

# 🌊 Liquid Glass

Premium Liquid Glass visual system for **TuriaFestNoticias**.

## Purpose

Define how translucent, premium glass surfaces must be designed and implemented across the entire TuriaFestNoticias application. The Liquid Glass system creates depth, atmospheric lighting, and a premium festival experience while remaining consistent with the existing design system.

This skill **builds on top of** the TuriaFestNoticias design system (not replaces it). All colors, tokens, and effects are sourced from existing design tokens in `_tokens.scss` and `_semantic.scss`.

---

## Design Principles

### Glass Surface

- **Semi-transparent surfaces** with controlled opacity
- **Soft background blur** using `backdrop-filter`
- **Layered depth** through elevation and stacking
- **Premium appearance** via subtle refinement
- **Smooth edges** with consistent border radius
- **Subtle reflections** using highlight overlays

### Lighting

- **Soft edge glow** sourced from brand colors
- **Internal highlights** creating light refraction feeling
- **Atmospheric depth** through shadow and blur layering
- **Restrained brightness** avoiding harsh white overlays

### Visual Consistency

- **Consistent border radius** across all glass components
- **Consistent spacing** following the TuriaFestNoticias spacing scale
- **Consistent elevation system** with semantic tokens
- **Consistent shadows** from the design system

### Restrictions

**Avoid:**

- Fake glossy Apple-style reflections
- Excessive blur (max 16px)
- Strong white overlays (max 0.04 opacity)
- Cheap glassmorphism effects
- Random gradients outside the design system
- Flat black blocks without translucency
- Neon colors or arbitrary hues

---

## Color System Rules (MANDATORY)

Liquid Glass components **MUST** use ONLY colors defined in the TuriaFestNoticias Design System.

**Never introduce:**

- New accent colors
- RGB experiments outside the token system
- Random gradients
- Tailwind palettes
- Designer-created colors

### Allowed Colors

#### Primary Brand (Core Glass Sources)

- `#4E8CFF` — Primary Blue
- `#6BA1FF` — Secondary Blue
- `--fv-gradient-brand` — Linear gradient (Mediterranean + Primary Blue)

#### Neutral Palette

All colors defined in `_tokens.scss` and `_semantic.scss`:

```scss
$fv-gray-950: #07070C;    // canvas
$fv-gray-900: #0B0B14;    // surface
$fv-gray-850: #11111D;    // elevated
$fv-gray-800: #181826;    // overlay base
$fv-gray-700: #232336;
$fv-gray-600: #2F2F47;
$fv-gray-500: #4A4A66;
// ... and lighter grays
```

#### State Colors

- `#4ADE9D` — Success / Live indicators only
- `#FF5C7A` — Danger / Error
- `#F5B544` — Warning

#### Mediterranean Accent Colors

- `#FF4D4D` — Coral (reserved for future use)
- `#FF8A3D` — Orange (reserved for future use)
- `#2D9CDB` — Mediterranean Blue (secondary glass source)

### Preferred Liquid Glass Glow Sources (in order of preference)

1. `#4E8CFF` (Primary Blue — most common)
2. `#6BA1FF` (Secondary Blue)
3. `--fv-gradient-brand` (Brand gradient)
4. `--fv-gradient-hero-glow` (Hero radial glow)

### Forbidden Colors

**Never use:**

- Purple
- Magenta
- Pink
- Neon cyan
- Neon green
- Random gradients
- Colors not defined in `_tokens.scss`
- Colors not defined in `_semantic.scss`

The Liquid Glass implementation must always feel like a native part of TuriaFestNoticias's visual identity.

---

## Before Implementation: Color Question (MANDATORY)

Before implementing any new Liquid Glass feature, ask the user:

**"Which festiVal accent should drive the glass effect?"**

Available options:

1. **Primary Blue** (`#4E8CFF`) — **Default**
2. **Secondary Blue** (`#6BA1FF`)
3. **Brand Gradient** (`--fv-gradient-brand`)
4. **Mediterranean Blue** (`#2D9CDB`)

If no color is specified, always use:

- **`#4E8CFF`** (Primary Blue) as the default accent

---

## CSS / SCSS Guidelines

### Reusable Design Tokens

Create reusable design tokens for the following properties. Add them to `src/styles/_semantic.scss` under a `/* --- Liquid Glass --- */` section:

```scss
// Glass base opacity and blur
--fv-glass-alpha:        0.6;      // 60% opacity
--fv-glass-blur:         16px;     // backdrop blur
--fv-glass-saturate:     140%;     // color saturation boost

// Glass borders and overlays
--fv-glass-border:       1px solid var(--fv-border-subtle);
--fv-glass-highlight:    rgba(255, 255, 255, 0.04);

// Glass shadows and elevation
--fv-glass-shadow-sm:    0 4px 12px rgba(0, 0, 0, 0.2);
--fv-glass-shadow-md:    0 8px 24px rgba(0, 0, 0, 0.3);
--fv-glass-shadow-lg:    0 16px 40px rgba(0, 0, 0, 0.4);

// Glow effects (by accent color)
--fv-glass-glow-blue:    0 0 20px rgba(78, 140, 255, 0.2);
--fv-glass-glow-med:     0 0 20px rgba(45, 156, 219, 0.2);
```

### Prefer CSS Variables and Semantic Tokens

**Always:**

- Use CSS variables (`--fv-*`)
- Use semantic tokens from `_semantic.scss`
- Reference design tokens in `_tokens.scss`
- Keep values DRY and maintainable

**Never:**

- Hardcode color values in components
- Hardcode blur or opacity values
- Duplicate SCSS across components
- Use magic numbers for spacing or radius

---

## Utility File

Create or update: **`src/styles/utilities/_liquid-glass.scss`**

This file contains reusable utility classes for glass effects. Each utility should be minimal, composable, and prefix-namespaced with `.liquid-glass-*`.

### Base Utilities

```scss
// --- Liquid Glass Base Effect ---

.liquid-glass {
  background: rgba($fv-gray-850, var(--fv-glass-alpha));
  border: var(--fv-glass-border);
  backdrop-filter: blur(var(--fv-glass-blur)) saturate(var(--fv-glass-saturate));
  -webkit-backdrop-filter: blur(var(--fv-glass-blur)) saturate(var(--fv-glass-saturate));
}

// --- Liquid Glass Card ---
// Use for elevated card surfaces, modals, popovers

.liquid-glass-card {
  @extend .liquid-glass;
  border-radius: var(--fv-radius-2);
  box-shadow: var(--fv-glass-shadow-md);
  padding: var(--fv-space-4);
}

// --- Liquid Glass Button ---
// Use for interactive glass buttons with hover states

.liquid-glass-button {
  @extend .liquid-glass;
  border-radius: var(--fv-radius-1);
  padding: var(--fv-space-3) var(--fv-space-4);
  cursor: pointer;
  transition: 
    background-color var(--fv-duration-fast) var(--fv-ease-standard),
    box-shadow var(--fv-duration-fast) var(--fv-ease-standard);
  
  &:hover {
    background: rgba($fv-gray-850, calc(var(--fv-glass-alpha) + 0.05));
    box-shadow: var(--fv-glass-glow-blue);
  }
  
  &:focus-visible {
    outline: none;
    box-shadow: var(--fv-shadow-focus);
  }
}

// --- Liquid Glass Panel ---
// Use for information panels, sidebar sections, detail views

.liquid-glass-panel {
  @extend .liquid-glass;
  border-radius: var(--fv-radius-2);
  box-shadow: var(--fv-glass-shadow-sm);
  padding: var(--fv-space-5);
}

// --- Liquid Glass Map Overlay ---
// Use for overlays on maps, full-screen backgrounds (with depth layer behind)

.liquid-glass-map-overlay {
  @extend .liquid-glass;
  border-radius: var(--fv-radius-2);
  box-shadow: var(--fv-glass-shadow-lg);
  position: absolute;
  backdrop-filter: blur(var(--fv-glass-blur)) saturate(var(--fv-glass-saturate));
}

// --- Glow Variants (Add to any glass utility) ---

.liquid-glass--glow-blue {
  box-shadow: var(--fv-glass-glow-blue);
}

.liquid-glass--glow-med {
  box-shadow: var(--fv-glass-glow-med);
}

// --- Highlight Layer (Premium shine effect) ---

.liquid-glass::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: var(--fv-glass-highlight);
  border-radius: inherit;
  pointer-events: none;
}
```

Import this utility file in `src/styles/styles.scss`:

```scss
@use 'utilities/liquid-glass';
```

---

## Astro Rules

When implementing Liquid Glass in an `.astro` component:

### Component Structure

```astro
<!-- ✓ DO: Use utility classes directly in markup -->
<div class="liquid-glass-card">
  <h3>Festival Lineup</h3>
  <p>Artists for this year's event</p>
</div>

<!-- ✓ DO: Extend utilities with BEM modifiers -->
<button class="liquid-glass-button liquid-glass--glow-blue">
  View Details
</button>
```

```scss
// ✗ DON'T: Create component-specific styles that duplicate the utility
// src/components/_my-panel.scss
.my-custom-glass {
  background: rgba(17, 17, 29, 0.6);
  backdrop-filter: blur(16px);
  // — duplicates .liquid-glass, use the utility class instead
}
```

### Best Practices

- **Reuse utility classes** — avoid duplicating `.liquid-glass` across components; apply the class directly in the `.astro` markup.
- **Reuse design tokens** — never hardcode values.
- **Prefer shared utilities** — if a glass style is used on multiple pages/components, add it to `_liquid-glass.scss` rather than to a page-local partial.
- **Avoid component-specific SCSS** — unless absolutely necessary for layout or positioning; keep that layout-only SCSS in the component's colocated `_<name>.scss` partial (see [[project-structure]]) and let `.liquid-glass-*` own the visual effect.
- **Follow existing project architecture** — shared, reusable glass components live in `src/components/` per [[ui-components]]; page-specific glass panels can stay in the page's own colocated SCSS partial as long as they compose the shared `.liquid-glass-*` utility rather than reimplementing it.

---

## Accessibility Rules

**Always:**

- Maintain **WCAG 2.1 AA** contrast ratios
- Preserve **readability** over visual effects
- Keep **focus indicators visible** and prominent
- Support **keyboard navigation** for all interactive glass elements
- Test with screen readers for glass overlays / modals

### Contrast Checking

If a glass surface reduces text contrast:

1. **Increase opacity** of the glass background
2. **Reduce blur** amount
3. **Adjust text color** (use `--fv-text-primary` for primary text)
4. **Add a background layer** behind text if necessary

**Accessibility always takes priority over visual effects.**

### Testing

- Use `axe-core` to verify contrast
- Test with zoom levels 200% and 400%
- Verify focus states are clearly visible
- Test with keyboard navigation only
- Test with screen reader (VoiceOver, NVDA, Jaws)

---

## Safari Compatibility

Liquid Glass uses `backdrop-filter` and sometimes `color-mix()` — both require explicit Safari handling.

### backdrop-filter (MANDATORY)

**Always** declare `-webkit-backdrop-filter` before `backdrop-filter`:

```scss
// ✓ Correct
-webkit-backdrop-filter: blur(var(--fv-glass-blur)) saturate(var(--fv-glass-saturate));
backdrop-filter: blur(var(--fv-glass-blur)) saturate(var(--fv-glass-saturate));

// ✗ Wrong — glass effect invisible in Safari
backdrop-filter: blur(16px);
```

The `glass()` mixin in `_mixins.scss` already handles this. Use it whenever possible instead of writing `backdrop-filter` directly.

### color-mix() fallbacks

`color-mix(in srgb, …)` requires Safari 16.2+. When using it inside Liquid Glass components, always declare a static `rgba()` fallback on the same property **before** the `color-mix()` line:

```scss
// ✓ Correct cascade pattern — last valid rule wins
background: rgba(17, 17, 29, 0.6);   // Safari < 16.2 fallback
background: color-mix(in srgb, var(--fv-bg-elevated) 60%, transparent); // modern

// ✓ For dynamic CSS variables (--var inside color-mix) use @supports
background: var(--fv-bg-elevated);   // flat fallback

@supports (color: color-mix(in srgb, red 50%, blue)) {
  background: color-mix(in srgb, var(--fv-bg-elevated) 60%, transparent);
}
```

Use the hex reference table in `src/styles/_safari-compat.scss` to find the static rgba values for each semantic token.

### filter: blur() transition

When transitioning `blur()` off, use `blur(0px)` not `blur(0)` for smoother Safari rendering:

```scss
// ✓ Correct
.card--active { filter: blur(0px); }

// ✗ May stutter in Safari
.card--active { filter: blur(0); }
```

---

## Performance Rules

Avoid expensive rendering. Liquid Glass effects rely on `backdrop-filter`, which is hardware-accelerated but can be costly if overused.

### Rules

- **Use backdrop-filter sparingly** — limit to 3–4 glass layers on screen at once
- **Blur only important surfaces** — use lower blur values (12px instead of 20px) for less critical elements
- **Never animate blur values** — animate only `transform` and `opacity` instead
- **Animate transform and opacity** — these properties use GPU acceleration
- **Test on desktop and mobile** — verify performance on low-end devices
- **Avoid stacking many glass layers** — 2–3 layers max in any viewport

### Performance Checklist

- [ ] Run Lighthouse on deployed page
- [ ] Verify no jank on `blur` application
- [ ] Test on mobile (iOS Safari, Chrome Android)
- [ ] Measure FCP, LCP, CLS with performance tools
- [ ] Ensure bundle size doesn't increase

Liquid Glass must remain performant and smooth.

---

## Implementation examples

Five worked examples (festival card, map overlay, filter panel, hero overlay, `.astro` component) with full templates and SCSS.

➡️ Moved to [`references/examples.md`](references/examples.md) to keep this SKILL.md lean.

---

## Do / Don't Examples

### DO

- ✓ Use layered translucent surfaces with depth
- ✓ Use subtle blue edge glow from the design system
- ✓ Use semantic design tokens (`--fv-*`)
- ✓ Use consistent spacing from `--fv-space-*`
- ✓ Use consistent radius values from `--fv-radius-*`
- ✓ Reuse utility classes from `_liquid-glass.scss`
- ✓ Follow TuriaFestNoticias branding (blue, navy, Mediterranean)
- ✓ Test accessibility and performance
- ✓ Document custom modifications in component comments

### DON'T

- ✗ Use pure black cards without translucency
- ✗ Use strong white overlays (alpha > 0.1)
- ✗ Use random colors outside the design system
- ✗ Use random gradients or hand-crafted colors
- ✗ Use excessive blur (> 20px)
- ✗ Use neon palettes or bright accents
- ✗ Duplicate `.liquid-glass` styles across components
- ✗ Hardcode colors, spacing, or radius values
- ✗ Animate `backdrop-filter` blur
- ✗ Stack more than 3 glass layers in a viewport

---

## Final Review Checklist

Before completing any Liquid Glass implementation, verify:

- [ ] **Uses only festiVal colors** — all colors sourced from `_tokens.scss` or `_semantic.scss`
- [ ] **Uses shared utility classes** — no duplication of `.liquid-glass` patterns
- [ ] **Uses design tokens** — no hardcoded values for colors, spacing, or radius
- [ ] **Uses semantic variables** — all CSS variables follow the `--fv-*` namespace
- [ ] **Maintains accessibility** — WCAG 2.1 AA contrast verified
- [ ] **Maintains performance** — tested on desktop and mobile, no jank observed
- [ ] **Matches premium aesthetic** — translucent depth, soft glow, refined appearance
- [ ] **Matches existing UI** — consistent with other glass components
- [ ] **Does not introduce new visual language** — uses only existing patterns
- [ ] **Feels consistent with festiVal identity** — blue, navy, Mediterranean theme

---

## Related Skills

- [[theming-styling]] — Design tokens, primitive and semantic variables, color system
- [[ui-components]] — Reusable component catalogue
- [[design-responsive-validation]] — Responsive checks, visual consistency across breakpoints
- [[accessibility]] — WCAG compliance, contrast, keyboard navigation
- [[performance-optimization]] — Core Web Vitals, bundle size, rendering performance
