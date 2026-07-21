---
name: design-responsive-validation
description: >-
  Mandatory UI gate: bans generic AI-looking layouts, demands a distinctive TuriaFestNoticias identity and
  enforces responsive checks across desktop, laptop, tablet and mobile down to 320px, ending with
  a Design and Responsive Validation Report. Use for every UI, layout, styling, component or page
  change.
---

# Design & Responsive Validation

**MANDATORY** skill for any UI, layout, styling, component, page, or design-related change in **TuriaFestNoticias**.

## Purpose

Guarantee two things on every UI task:

1. **Visual identity** — the result does not look like a generic AI-generated website; it feels handcrafted and aligned with the Mediterranean / festival identity of the Valencian Community.
2. **Responsive integrity** — the result works correctly across desktop, laptop, tablet, and mobile breakpoints, with mobile-first as the floor.

This skill is the contract behind both the design originality check and the final validation report attached to every UI-task completion.

## When to apply

Apply this skill **before, during, and after** any change that affects what the user sees:

- Templates (`.html`) of any component or page
- Component or global SCSS
- Layout decisions (grid, flex, spacing, breakpoints)
- New presentational components (in a feature's `ui/` or in `shared/ui/`)
- Theming or token changes that have visible effect
- Image, icon, motion, or accessibility-visible work

If the change is purely backend / data-access / config / docs, the skill does not apply.

Collaborates with: **views** (owner), **performance** (CLS / responsive perf), **content** (microcopy fitting the design), and the [[theming-styling]], [[ui-components]], [[accessibility]] skills.

---

## Part 1 — Design originality

TuriaFestNoticias must not look like a generic AI-generated website. Every new page, section, or component must carry a distinctive visual identity aligned with the TuriaFestNoticias brand.

### Requirements

1. **Avoid generic SaaS layouts**, stock AI-looking interfaces, and predictable component arrangements (centered hero + 3-column features + testimonial slider + CTA strip).
2. **Prioritize custom composition** — visual hierarchy, spacing, alignment, and layout decisions should be deliberate, not template defaults.
3. **Strong sense of place** — designs must feel inspired by festivals, music, culture, energy, and the Mediterranean identity of the Valencian Community (sun, sand, coast, crowds, nightlife).
4. **No default ornaments** — never ship default linear gradients, vanilla hero sections, or untouched card grids. Customize composition, ratios, and treatments.
5. **Intentional sections** — each major section must have a clear visual purpose and feel deliberately designed, not space-filling.
6. **Creative tools** — use asymmetry, layered imagery, off-grid spacing, rotated/clipped frames, blended typography, and custom interactions where they earn their place.
7. **Handcrafted feel** — the UI must read as the work of a designer, not a template.
8. **Pre-implementation check** — before coding, ask yourself: "would a reasonable observer call this an AI-generated website?" If yes, redesign it.

### Anti-patterns to avoid

- Centered hero with bullet list + two pill buttons (the default LLM layout).
- 3-card row with identical icon + title + 2 lines of body.
- "Trusted by" logo strip without an editorial reason.
- Gradient buttons with default Bootstrap-like rounded corners and no context.
- Full-bleed `<section>` blocks stacked without rhythm changes.
- Generic FAQ accordions, generic pricing tables, generic testimonial cards.

### Design grounding for TuriaFestNoticias

Anchor every decision in at least one of these:

- **Place**: Valencia / Alicante / Castellón coastline, summer light, festival venues.
- **Music**: line-ups, headliner hierarchy, scene energy.
- **Calendar**: temporality (days, months, "this summer"), countdowns, seasonality.
- **Catalogue**: the festival list as the spine of the product — never bury it.

When a screen does not anchor in any of these, it probably is too generic.

---

## Part 2 — Responsive validation

After completing any UI-related task, perform a responsive review **before** considering the task finished.

### Required breakpoints

| Tier    | Width        | What to check                                                |
| ------- | ------------ | ------------------------------------------------------------ |
| Desktop | ≥ 1440 px    | Editorial layout breathes; no orphaned whitespace.           |
| Laptop  | 1024–1439 px | Grid still works at the project's `lg` breakpoint.           |
| Tablet  | 768–1023 px  | Layout transition is intentional, not a squashed desktop.    |
| Mobile  | 320–480 px   | Mobile-first floor — 320 px must work without horizontal scroll. |

### Validation checklist

All items must pass at every breakpoint above:

- **No horizontal scrolling** at any breakpoint (`overflow-x` clean).
- **No overlapping elements** (z-index, positioning, sticky headers).
- **Images scale correctly** (`object-fit`, `aspect-ratio`, `NgOptimizedImage` `sizes` matches reality).
- **Typography readable** — minimum 14 px body on mobile; line-length ≤ 70ch on prose.
- **Navigation usable** — primary nav reachable; hamburger has visible affordance.
- **Touch targets ≥ 44 × 44 px** on mobile per WCAG.
- **Layout maintains visual quality** — no broken grid, no clipped content, no decorative element fighting copy.
- **Spacing and alignment consistent** — same `--fv-space-*` rhythm across breakpoints.
- **All content accessible and visible** — no copy hidden behind `display: none` that is required for understanding.

### Mobile-first principle

When in doubt, prioritize the mobile experience. Every new UI must work correctly on screens as small as **320 px wide**. Breakpoints up are progressive enhancements, never the default.

### How to validate

- **Cheap**: resize the browser through the four tiers, scrolling end-to-end at each.
- **Better**: use Chrome DevTools device toolbar at 320 / 480 / 768 / 1024 / 1440 px.
- **Best**: drive the running app with the `/verify` skill or Playwright at each viewport, and visually inspect.

The validation must be performed against the **running app**, not against the source code alone.

---

## Part 3 — Completion requirement

Every UI-related task must end with a **Design & Responsive Validation Report** in this exact format:

```
Design Originality: ✅ / ❌
Desktop (1440px+):  ✅ / ❌
Laptop (1024px+):   ✅ / ❌
Tablet (768px+):    ✅ / ❌
Mobile (320–480px): ✅ / ❌
Issues Found:
Fixes Applied:
```

Rules for the report:

- A task is **not considered complete** until both design originality **and all four breakpoints** are marked ✅.
- If any row is ❌, the task is unfinished — fix it, then re-run validation and re-emit the report.
- `Issues Found:` and `Fixes Applied:` must be filled in with concrete bullets, or written as `None.` when truly empty. Never omit them.
- The report appears in the final message of the task, after the summary of changes.

---

## Quick reference

| Step | Action |
| --- | --- |
| 1 | Before designing, ground the screen in place / music / calendar / catalogue. |
| 2 | Sketch composition (asymmetry, hierarchy, intentional sections). Reject generic templates. |
| 3 | Implement using `--fv-*` tokens and the `from()` breakpoint mixin. |
| 4 | Run the app and walk the four breakpoints. |
| 5 | Fix anything that fails the checklist. |
| 6 | Emit the Design & Responsive Validation Report. |

---

## Examples

### Mobile-first SCSS with the `from()` mixin

```scss
// ✅ Mobile-first: base styles are for 320 px, each breakpoint enhances upward.
.festival-grid {
  display: grid;
  gap: var(--fv-space-4);

  // Mobile default: single column, full width
  grid-template-columns: 1fr;

  // Tablet (768 px+): two columns
  @include from(md) {
    grid-template-columns: repeat(2, 1fr);
  }

  // Desktop (1024 px+): three columns, wider gap
  @include from(lg) {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--fv-space-6);
  }
}

// ❌ DON'T — desktop-first with max-width overrides
.festival-grid {
  grid-template-columns: repeat(3, 1fr);
  @media (max-width: 768px) { grid-template-columns: 1fr; }
}
```

### Touch target — minimum 44×44 px on mobile

```scss
// ✅ Filter chips and icon buttons must be large enough on touch devices
.fv-filter-chip {
  min-height: 44px;
  padding: var(--fv-space-2) var(--fv-space-4);

  @include from(lg) {
    min-height: 36px;  // relaxed on pointer devices
  }
}
```

### Playwright — responsive validation across viewports

```ts
// e2e/responsive.spec.ts — run against the live dev server
import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'mobile',   width: 320,  height: 667  },
  { name: 'tablet',   width: 768,  height: 1024 },
  { name: 'laptop',   width: 1024, height: 768  },
  { name: 'desktop',  width: 1440, height: 900  },
];

for (const vp of VIEWPORTS) {
  test(`festival list — no horizontal scroll at ${vp.name} (${vp.width}px)`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/festivales');

    const scrollWidth  = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth  = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
}
```

## Related skills

- [[theming-styling]]
- [[ui-components]]
- [[accessibility]]
