---
name: forms-validation
description: >-
  ROADMAP SPEC — no forms exist in the app yet. Plain HTML forms with vanilla-TS client-island
  validation for search, filtering and future auth flows: custom validators (DNI, date and price
  ranges) with error messages routed through i18n keys. Use when building or validating any form
  or input control; treat this as the design contract for that future work.
---

# 📝 Forms & Validation

Patterns for plain HTML forms used in search, filtering, and (future) authentication flows.

## Purpose

Centralize form construction, validation, and error messaging for **TuriaFestNoticias**.

## Use Cases

- Festival search bar (text, debounce 300 ms) — the only one partially implemented today, for the news hub (`src/scripts/news-search.ts`).
- Multi-criteria filter form (`provincia`, `mes`, `genero`, price range) — roadmap.
- Future: registration, login, profile, newsletter subscription, festival reviews.

## Conventions

- **Plain HTML forms** (`<form>`, native `<input>`/`<select>`) — there is no UI framework, so there is no Reactive Forms module. Validation logic lives in a vanilla-TS client island under `src/scripts/`, mirroring the pattern already used by `src/scripts/news-search.ts` and `src/scripts/i18n.ts`.
- Form state is read directly off the DOM (`FormData`, `element.value`) inside the island — there are no typed `FormGroup`/`FormControl` wrappers. Where stronger typing is useful, define a plain interface for the parsed values (e.g. `interface FilterFormValues { provincia: Provincia | null; mes: number | null; genero: string | null; precioMax: number | null }`) and a pure function that reads `FormData` into it.
- Validator functions are pure, framework-free, and shared from `src/lib/validators/` (mirrors the placement of other framework-agnostic helpers in `src/lib`). Each validator takes a raw value and returns an error key (or `null`).
- Async validation (e.g. checking a value against the catalogue) is a plain `async function` — no `debounceTime`/`distinctUntilChanged` operators; debouncing is done by hand with `setTimeout`/`clearTimeout` inside the island (see the debounce pattern below).

## Custom Validators (planned)

- `validateDni` — Spanish DNI/NIE format.
- `validateDateRange` — `desde <= hasta`.
- `validatePriceRange` — non-negative, `min <= max`.

## Error Display

- A single small rendering helper (e.g. `renderFieldError(fieldEl, errorKey)`) reads the validator's result and writes the translated message into an adjacent `<span class="form-error" role="alert" data-i18n="...">` node, following the same `data-i18n` contract as the rest of the site (see [[internationalization]]).
- Errors shown only after the field has been blurred once (`touched`) or the form has been submitted — tracked with a plain `Set<string>` of touched field names inside the island, since there is no framework form-state object to read `touched`/`dirty` from.

---

## Examples

### Reading form values — filter form (roadmap)

```html
<!-- src/pages/festivales/index.astro (roadmap) -->
<form id="filter-form" data-testid="filter-form">
  <label for="provincia" data-i18n="filters.provincia.label">Provincia</label>
  <select id="provincia" name="provincia">
    <option value="">-- </option>
    <option value="Valencia">Valencia</option>
    <option value="Alicante">Alicante</option>
    <option value="Castellón">Castellón</option>
  </select>

  <label for="precioMax" data-i18n="filters.precioMax.label">Precio máximo</label>
  <input id="precioMax" name="precioMax" type="number" min="0" max="500" />
  <span class="form-error" role="alert" data-testid="precioMax-error" hidden></span>

  <button type="submit" data-i18n="filters.apply">Aplicar</button>
</form>
```

```ts
// src/scripts/festival-filters.ts (roadmap)
import type { Provincia } from '@data/festival.model';
import { validatePriceRange } from '@lib/validators/price-range';
import { translateKey } from './i18n';

interface FilterFormValues {
  provincia: Provincia | null;
  mes: number | null;
  genero: string | null;
  precioMax: number | null;
}

function readFilterForm(form: HTMLFormElement): FilterFormValues {
  const data = new FormData(form);
  return {
    provincia: (data.get('provincia') as Provincia) || null,
    mes: data.get('mes') ? Number(data.get('mes')) : null,
    genero: (data.get('genero') as string) || null,
    precioMax: data.get('precioMax') ? Number(data.get('precioMax')) : null,
  };
}

export function initFilterForm(): void {
  const form = document.querySelector<HTMLFormElement>('#filter-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const values = readFilterForm(form);

    const priceError = validatePriceRange(values.precioMax, 0, 500);
    const errorEl = form.querySelector<HTMLElement>('[data-testid="precioMax-error"]');
    if (errorEl) {
      errorEl.hidden = priceError === null;
      if (priceError) errorEl.textContent = translateKey(priceError);
    }
    if (priceError) return;

    applyFilters(values); // updates the query string / re-filters server-rendered cards
  });
}
```

### Custom validator — price range

```ts
// src/lib/validators/price-range.ts
export function validatePriceRange(
  value: number | null,
  min: number,
  max: number,
): string | null {
  if (value === null) return null;
  if (value < min) return 'validation.precio.min';
  if (value > max) return 'validation.precio.max';
  return null;
}
```

### Debounced search input — the pattern already shipped for news

```ts
// src/scripts/news-search.ts (excerpt — see the search skill for the full flow)
function readActiveQuery(): string {
  return new URLSearchParams(window.location.search).get('buscar')?.trim() ?? '';
}

let debounceHandle: ReturnType<typeof setTimeout> | undefined;

input.addEventListener('input', () => {
  clearTimeout(debounceHandle);
  debounceHandle = setTimeout(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('buscar', input.value.trim());
    history.replaceState(null, '', url);
    apply(); // re-filters server-rendered article cards against the MiniSearch index
  }, 300);
});
```

## Related skills

- [[internationalization]]
- [[accessibility]]
- [[search]]
