---
name: cross-device-compat
description: >-
  Cross-browser and cross-device compatibility for TuriaFestNoticias: browser targets via .browserslistrc,
  CSS vendor prefix rules, color-mix() fallback strategy, hover guards for touch devices,
  prefers-reduced-motion compliance, and the @compat marker convention.
  Consulted automatically by the autocommit gate (Method B checks B.10–B.11).
---

# 💻 Cross-Device Compatibility

Single source of truth for cross-browser and cross-device compatibility in **TuriaFestNoticias**.

## Purpose

Ensure the TuriaFestNoticias portal works correctly and looks premium across all major browsers
and devices — desktop Chrome/Firefox/Edge/Safari, iOS Safari, and Android Chrome —
without sacrificing the modern CSS features that define the design system.

This skill **does not redefine** the design system. It adds a compatibility layer on top.

---

## Browser Targets

The project targets browsers defined in `.browserslistrc` at the repository root:

```
last 2 Chrome versions
last 2 Firefox versions
last 2 Edge versions
Safari >= 16.2
iOS >= 16.2
not dead
```

**Safari 16.2** (December 2022) is the floor because it is the first Safari version with:
- `color-mix(in srgb, …)` support
- Full `backdrop-filter` without quirks
- `aspect-ratio` stability

**Rule:** `.browserslistrc` must always exist. The autocommit gate verifies this.
If the floor changes, update both `.browserslistrc` and `_safari-compat.scss`.

---

## CSS Feature Compatibility Matrix

| Feature                    | Chrome | Firefox | Edge | Safari floor |
|----------------------------|--------|---------|------|-------------|
| `backdrop-filter`          | 76+    | 103+    | 17+  | 9+ (`-webkit-`) |
| `color-mix(in srgb, …)`   | 111+   | 113+    | 111+ | **16.2+** |
| `aspect-ratio`             | 88+    | 89+     | 88+  | 15+         |
| `gap` in flexbox           | 84+    | 63+     | 84+  | 14.1+       |
| `inset` shorthand          | 87+    | 87+     | 87+  | 14.1+       |
| `text-wrap: balance`       | 114+   | 121+    | 114+ | 17.5+       |
| `@supports`                | 28+    | 22+     | 12+  | 9+          |
| `filter: drop-shadow()`    | 18+    | 35+     | 13+  | 9.1+        |
| `color-mix()` in filter    | 111+   | 113+    | 111+ | **16.2+**   |

---

## Rule 1 — backdrop-filter Vendor Prefix (MANDATORY)

**Every** `backdrop-filter:` declaration must be preceded by `-webkit-backdrop-filter:` in the
same file. Safari has required the `-webkit-` prefix since version 9 and continues to need it
for consistent behavior on older iOS devices within the target range.

```scss
// ✓ Correct — always pair
-webkit-backdrop-filter: blur(var(--fv-glass-blur)) saturate(var(--fv-glass-saturate));
backdrop-filter: blur(var(--fv-glass-blur)) saturate(var(--fv-glass-saturate));

// ✗ Wrong — glass effect invisible in many Safari versions
backdrop-filter: blur(16px);
```

**Preferred:** use the `glass()` mixin from `_mixins.scss` — it already includes both.
Only write `backdrop-filter` directly when the mixin is not suitable.

**Autocommit gate checks:** B.10 verifies this. Any `.scss` file with `backdrop-filter:`
that does not also contain `-webkit-backdrop-filter:` blocks the commit.

---

## Rule 2 — color-mix() Fallback Strategy (MANDATORY)

`color-mix(in srgb, …)` is invalid in Safari < 16.2. Since it's used heavily in the
design system for semi-transparent variants of semantic tokens, every `color-mix()` declaration
in a component SCSS file must be paired with a static fallback.

### Pattern A — CSS Cascade (simple property values)

Declare the static `rgba()` fallback **before** the `color-mix()` on the same property.
In Safari < 16.2 the `color-mix()` declaration is invalid → ignored → the `rgba()` stays.
In modern browsers the `color-mix()` overrides it (last valid wins).

Mark every fallback line with `// @compat` so the autocommit gate allows it:

```scss
// ✓ Correct
color: rgba(15, 23, 42, 0.65); // @compat
color: color-mix(in srgb, var(--fv-text-nav) 65%, transparent);

border: 1px solid rgba(15, 23, 42, 0.10); // @compat
border: 1px solid color-mix(in srgb, var(--fv-text-nav) 10%, transparent);

// ✗ Wrong — no fallback
color: color-mix(in srgb, var(--fv-text-nav) 65%, transparent);
```

### Pattern B — @supports (dynamic CSS variables)

When `color-mix()` references a **dynamic CSS custom property** (e.g. `--festival-color`,
`--festival-tone` set per-component), there is no meaningful static equivalent. Use
`@supports` to gate the modern declaration:

```scss
// ✓ Correct — flat value as base, color-mix gated by @supports
background: var(--fv-bg-nav); // flat fallback for all browsers

@supports (color: color-mix(in srgb, red 50%, blue)) {
  background:
    radial-gradient(circle at 22% 28%, color-mix(in srgb, var(--festival-tone) 30%, transparent) 0%, transparent 42%),
    var(--fv-bg-nav);
}

// ✗ Wrong — no guard on dynamic variable
background: color-mix(in srgb, var(--festival-tone) 30%, transparent);
```

### Hex Reference Table

Use these values when writing `rgba()` fallbacks. Keep in sync with `_tokens.scss` and `_safari-compat.scss`.

**Dark canvas tokens:**

| CSS token            | Hex value  | rgba() form               |
|----------------------|------------|---------------------------|
| `--fv-bg-canvas`     | `#07070C`  | `rgba(7, 7, 12, α)`       |
| `--fv-bg-surface`    | `#0B0B14`  | `rgba(11, 11, 20, α)`     |
| `--fv-bg-elevated`   | `#11111D`  | `rgba(17, 17, 29, α)`     |
| `--fv-text-primary`  | `#F4F4FA`  | `rgba(244, 244, 250, α)`  |
| `--fv-accent-blue`   | `#4E8CFF`  | `rgba(78, 140, 255, α)`   |

**Light / Mediterranean canvas tokens:**

| CSS token               | Hex value  | rgba() form               |
|-------------------------|------------|---------------------------|
| `--fv-bg-nav`           | `#F8F5F0`  | `rgba(248, 245, 240, α)`  |
| `--fv-text-nav`         | `#0F172A`  | `rgba(15, 23, 42, α)`     |
| `--fv-bg-card-light`    | `#ffffff`  | `rgba(255, 255, 255, α)`  |
| `--fv-accent-med-blue`  | `#2D9CDB`  | `rgba(45, 156, 219, α)`   |
| `--fv-accent-coral`     | `#FF4D4D`  | `rgba(255, 77, 77, α)`    |
| `--fv-accent-orange`    | `#FF8A3D`  | `rgba(255, 138, 61, α)`   |
| `--fv-accent-warning`   | `#F5B544`  | `rgba(245, 181, 68, α)`   |

---

## Rule 3 — The @compat Marker

Any `rgba()`, `rgb()`, or hex value used as a browser-compatibility fallback in a component
SCSS file **must** be annotated with `// @compat` on the same line:

```scss
// ✓ Correct
background: rgba(255, 255, 255, 0.97); // @compat
background: color-mix(in srgb, var(--fv-bg-card-light) 97%, transparent);

// ✓ Also accepted (existing Safari comments are equivalent)
color: rgba(15, 23, 42, 0.65); // Safari < 16.2 fallback

// ✗ Wrong — raw rgba() without any marker
background: rgba(255, 255, 255, 0.97);
```

**Why?** The autocommit gate (B.3) bans raw color values in component SCSS to enforce
the design token system. `// @compat` and `// Safari` are the machine-readable signals
that distinguish intentional cross-browser fallbacks from lazy hardcoded colors.

---

## Rule 4 — Hover Guards for Touch Devices

CSS `:hover` styles on interactive elements must be wrapped in a media query that checks
for a fine pointer. Without this guard, mobile browsers trigger hover styles on tap and
the state gets "stuck", creating a broken UX on touch devices.

```scss
// ✓ Correct — desktop-only hover
@media (hover: hover) and (pointer: fine) {
  .button:hover {
    transform: translateY(-2px);
    background: var(--fv-accent-blue);
  }
}

// ✗ Wrong — applies on tap in iOS Safari, state gets stuck
.button:hover {
  transform: translateY(-2px);
}
```

**Exception:** hover styles that are purely decorative and reset naturally (e.g. `opacity`)
can be applied without the guard, but the default "stuck hover" behavior on iOS must be verified.

---

## Rule 5 — prefers-reduced-motion (MANDATORY)

All CSS animations and transitions must respect the user's `prefers-reduced-motion` setting.
The global reset in `_motion.scss` handles this for keyframe animations. Component-level
`transition:` must also be disabled:

```scss
// ✓ In _motion.scss — already handles animations globally
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}

// ✓ Also good: explicit component reset for complex animations
@media (prefers-reduced-motion: reduce) {
  .featured-festivals__track {
    animation: none;
    transform: none;
  }
}
```

---

## Rule 6 — filter: blur() Transitions

When transitioning `blur()` off (e.g. a card appearing from blurred state), always use
`blur(0px)` — not `blur(0)` — for smoother rendering in Safari:

```scss
// ✓ Correct
.card--active { filter: blur(0px); }

// ✗ May produce a GPU layer stutter in Safari during transition
.card--active { filter: blur(0); }
```

---

## Rule 7 — Touch Targets

Interactive elements (buttons, links, icon buttons) must have a minimum touch target of **44×44px**,
as required by WCAG 2.5.5 and expected by iOS Safari's tap recognition:

```scss
// ✓ Correct — explicit minimum
.nav-bar__icon-btn {
  width: var(--nav-icon-size-sm);   // 36px visual, but padding extends tap area
  height: var(--nav-icon-size-sm);
  padding: var(--fv-space-2);       // 8px padding → 52px total tap area
}

// ✗ Wrong — too small for comfortable tapping
.small-btn {
  width: 24px;
  height: 24px;
}
```

---

## Autocommit Gate Checks

The following checks run automatically in the autocommit workflow (Method B):

### B.3 — No raw colors in component SCSS

```bash
! grep -rn -E "rgb\(|rgba\(|hsl\(|#[0-9a-fA-F]{3,6}" src/app --include="*.scss" \
  | grep -v "var(--\|color-mix" \
  | grep -v -E ":[0-9]+:\s*//" \
  | grep -v "[Ss]afari\|@compat" \
  | grep -v -E "[0-9]+%[,)]?\s*$"
```

Allows: semantic tokens (`var(--`), `color-mix()`, comment-only lines,
lines marked `// @compat` or `// Safari`, and gradient color stop lines.

### B.10 — backdrop-filter must have -webkit- prefix

```bash
grep -rln "backdrop-filter:" src/ --include="*.scss" | while read -r file; do
  grep -q "\-webkit-backdrop-filter:" "$file" \
    || echo "MISSING -webkit-backdrop-filter in: $file"
done | grep . && exit 1 || true
```

### B.11 — .browserslistrc must exist

```bash
[ -f .browserslistrc ] \
  || { echo "MISSING: .browserslistrc — define browser targets"; exit 1; }
```

---

## Related Skills

- [[liquid-glass]] — Liquid Glass surfaces use `backdrop-filter`; Safari compat rules apply
- [[theming-styling]] — Design token system; `rgba()` hex reference aligned with `_tokens.scss`
- [[accessibility]] — Touch target and keyboard navigation rules overlap
- [[performance-optimization]] — `backdrop-filter` and `filter` rendering cost on mobile
