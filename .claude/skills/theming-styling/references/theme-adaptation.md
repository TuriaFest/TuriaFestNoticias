
# Theme Adaptation (light / dark / system)

Reference of the [theming-styling skill](../SKILL.md). Formerly the standalone `light-dark-mode` skill; merged here because the semantic-token system IS the theming mechanism.

Mandatory gate for **any new visual work** in TuriaFestNoticias. The app ships with three theme
states (`light | dark | system`, default `system`). Every surface you add must look
intentional in **both** resolved themes without manual toggling hacks in components.

---

## How theming works (do not reinvent)

| Layer | Owner | Mechanism |
| ----- | ----- | --------- |
| Runtime | `ThemeService` (`@core/platform/theme.service.ts`) | Sets `data-theme="light\|dark"` on `<html>` for explicit choices; removes it for `system` so CSS governs |
| Anti-FOUC | Inline script in `src/index.html` | Applies stored choice before first paint |
| Token overrides | `src/styles/_semantic.scss` | Mixin `fv-theme-dark` redefines chrome tokens in `:root[data-theme='dark']` **and** `@media (prefers-color-scheme: dark) { :root:not([data-theme]) { … } }` |
| Persistence | `localStorage('fv-theme')` | User preference survives reloads |

**Never** duplicate theme logic in components. Components consume tokens; `_semantic.scss`
owns per-theme values.

---

## Token categories — pick the right one

### 1. Themeable chrome (auto-flip light ↔ dark)

Use these for page shells, nav-adjacent UI, cards on sand/dark canvas, footer, and any
surface that should follow the user's theme:

| Token | Light role | Dark role |
| ----- | ---------- | --------- |
| `--fv-bg-page` | Mediterranean sand canvas | Deep navy page canvas |
| `--fv-bg-nav` | Sand nav bar | Dark elevated nav |
| `--fv-bg-footer` | Warm off-white footer | Dark footer |
| `--fv-bg-card-light` | White elevated card | Dark elevated card |
| `--fv-bg-tile-dark` | Dark tile inside light card | Darker tile inside dark card |
| `--fv-text-nav` | Navy on sand | Light gray on dark |
| `--fv-text-footer` / `-muted` / `-faint` | Navy hierarchy | Light gray hierarchy |
| `--fv-border-nav` / `--fv-border-footer` | Subtle navy hairlines | Subtle light hairlines |
| `--fv-bg-nav-icon-hover` / `--fv-bg-footer-hover` | Dark wash on light | Light wash on dark |

### 2. Theme-independent dark canvas (always dark)

Use for hero overlays, poster tiles, cinematic sections, and text floating over photos:

- `--fv-bg-canvas`, `--fv-bg-surface`, `--fv-bg-elevated`, `--fv-bg-overlay`
- `--fv-text-primary`, `--fv-text-secondary`, `--fv-text-muted`, `--fv-text-inverse`
- `--fv-border-subtle`, `--fv-border-default`, `--fv-border-strong`

These **do not flip** with theme — by design. Do not force them to adapt unless the
design explicitly moves that section into chrome territory.

### 3. Shared accents & effects (same in both modes)

- `--fv-accent-*`, `--fv-gradient-brand`, `--fv-shadow-focus`, `--fv-glass-*`
- Accents stay readable on both canvases; verify contrast in [[accessibility]].

---

## Decision tree (new surface)

```
Is this surface part of the page chrome (background, card on page, nav/footer zone)?
├─ YES → use themeable chrome tokens (--fv-bg-page, --fv-bg-card-light, --fv-text-nav…)
└─ NO  → is it a cinematic / hero / poster / always-dark block?
         ├─ YES → use theme-independent dark canvas tokens
         └─ NO  → does it sit ON TOP of a photo or gradient?
                  ├─ YES → dark canvas tokens + glass mixin if needed ([[liquid-glass]])
                  └─ NO  → default to themeable chrome tokens
```

Need a color that doesn't exist? **Add a semantic token** to `_semantic.scss` inside
`fv-theme-dark`, not a `[data-theme]` block in a component.

---

## Creation checklist (mandatory before marking done)

Copy and complete:

```
Theme Adaptation Checklist:
- [ ] No hardcoded hex/rgb/hsl in component SCSS (only --fv-* tokens)
- [ ] Page/card backgrounds use themeable tokens, not #fff / #0F172A literals
- [ ] Text on chrome surfaces uses --fv-text-nav or --fv-text-footer*, not --fv-text-primary
- [ ] Borders/hover washes use --fv-border-nav or --fv-border-footer, not one-off rgba
- [ ] Hero/poster blocks correctly use theme-independent tokens (if applicable)
- [ ] Glass surfaces use glass() / --fv-glass-* ([[liquid-glass]]), not fixed rgba backgrounds
- [ ] Safari fallbacks use @compat literals that match BOTH resolved themes ([[cross-device-compat]])
- [ ] Contrast ≥ 4.5:1 body / ≥ 3:1 large text in light AND dark ([[accessibility]])
- [ ] Visually verified at data-theme="" (system), data-theme="light", data-theme="dark"
- [ ] No component-level [data-theme] selectors or .dark-mode classes
```

---

## Hard rules

1. **Components never branch on theme in SCSS.** No `:root[data-theme='dark'] .my-card { … }`.
   Overrides live exclusively in `_semantic.scss`.
2. **Components rarely branch in TypeScript.** Inject `ThemeService` only when behavior
   (not appearance) depends on theme — e.g. swapping a MapLibre style JSON, choosing
   between two assets. Use `resolvedTheme()`, never read `localStorage` directly.
3. **Never assume light-only.** `#ffffff`, `#F8F5F0`, `rgba(15, 23, 42, …)` in component
   SCSS are bugs unless marked `// @compat` with a token-first line above.
4. **Never assume dark-only** for chrome. `--fv-bg-canvas` on a full page body will look
   wrong in light mode.
5. **Images & SVGs**: prefer CSS `currentColor` / token fills. If an asset is theme-specific,
   suffix `-light` / `-dark` and swap via `resolvedTheme()` — do not ship two `<img>` tags
   in the template without reason.
6. **Third-party embeds** (MapLibre, charts): provide a dark style by default; add a light
   variant when the embed sits on `--fv-bg-page` chrome, not on a hero.

---

## Examples

### Page section on the main canvas

```scss
// ✅ DO — adapts automatically
.home-section {
  background: var(--fv-bg-page);
  color: var(--fv-text-nav);
  border-bottom: 1px solid var(--fv-border-nav);
}

.home-section__card {
  background: var(--fv-bg-card-light);
  box-shadow: var(--fv-shadow-card);
}
```

```scss
// ❌ DON'T — frozen to light mode
.home-section {
  background: #f8f5f0;
  color: #0f172a;
}
```

### Hero overlay (always dark)

```scss
// ✅ DO — cinematic block stays dark in both themes
.hero__overlay {
  background: var(--fv-bg-overlay);
  color: var(--fv-text-primary);
}
```

### TypeScript — only when behavior differs

```ts
// ✅ DO — MapLibre style swap (appearance owned by JSON, not CSS tokens)
readonly #theme = inject(ThemeService);
readonly mapStyle = computed(() =>
  this.#theme.resolvedTheme() === 'dark'
    ? '/assets/maps/festival-dark.json'
    : '/assets/maps/festival-light.json',
);
```

```ts
// ❌ DON'T — styling concern leaked into TS
readonly isDark = computed(() => this.#theme.resolvedTheme() === 'dark');
// template: [class.card--dark]="isDark()"
```

### Adding a new themeable token

```scss
// src/styles/_semantic.scss — light default in :root { … }
:root {
  --fv-bg-callout: #{$fv-sand-50};
  --fv-text-callout: #{$fv-navy-950};
}

@mixin fv-theme-dark {
  // …existing overrides…
  --fv-bg-callout: #{$fv-gray-850};
  --fv-text-callout: #{$fv-gray-50};
}
```

---

## Validation

Include a **Theme Adaptation** subsection in the Design & Responsive Validation Report
([[design-responsive-validation]]):

1. Toggle theme via nav-bar sun/moon control.
2. Set `localStorage.setItem('fv-theme', 'system')`, reload, compare against OS preference.
3. Confirm no illegible text, invisible borders, or clashing card backgrounds.
4. Run `npm test -- --run` — existing `ThemeService` specs must stay green; add component
   tests only when TS theme branching is introduced.

---

## Related skills

- [[ui-components]] — component conventions and token consumption
- [[accessibility]] — contrast requirements per theme
- [[liquid-glass]] — translucent surfaces that must work over both canvases
- [[cross-device-compat]] — `@compat` fallbacks that must track token values in both themes
- [[design-responsive-validation]] — mandatory validation report template
