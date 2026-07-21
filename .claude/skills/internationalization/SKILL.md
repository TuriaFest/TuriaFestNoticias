---
name: internationalization
description: >-
  Multi-language support with Transloco: es-ES as the source of truth, dotted keys, ICU
  MessageFormat, and ca / en locales kept in parity. Use when adding or changing copy, i18n keys,
  pluralization or locale handling.
---

# 🌍 Internationalization (i18n)

Multi-language support for **TuriaFestNoticias**.

## Purpose

Although the primary language is **Spanish (es-ES)**, the architecture must accommodate additional locale files for every supported market without drifting in key structure.

## Strategy

- **Transloco** for runtime language switching — `@angular/localize` is rejected because it requires one build per locale, which clashes with our Cloudflare Pages deploy model.
- Translation files live in `src/assets/i18n/*.json`.
- Keys follow dotted paths: `festival.detail.lineup.title`.

## Date and number formatting

- **Dates** use **date-fns** with the active locale (`date-fns/locale/es`, `date-fns/locale/ca`, `date-fns/locale/en-GB`). A small `LocaleDatePipe` wraps `format()` so templates stay clean.
  - Festival date ranges follow the canonical pattern: `"12 – 16 jul 2026"` (en-dash, lowercase month, no leading zero).
  - Same-month ranges collapse the first month (`"12 – 16 jul"`); cross-month ranges spell both (`"30 jun – 4 jul"`).
- **Currency** in **EUR** via Angular's `CurrencyPipe` bound to `LOCALE_ID`.
- **Pluralization** via ICU MessageFormat through Transloco.

## Rules

- No hardcoded strings in templates or TS files.
- Date formatting **never** uses `Intl.DateTimeFormat` directly or `new Date().toLocaleString()` — always go through `date-fns` so output is identical across SSR and CSR.
- Currency through `CurrencyPipe`, never string interpolation with `€`.
- Locale files must stay in sync (every key present in `es.json`, even if non-Spanish locales hold placeholders). Owned by the **content** agent.

## Default Locale

`es-ES` is registered in `app.config.ts`:

```ts
registerLocaleData(localeEs);
```

---

## Examples

### Translate pipe — template usage

```html
<!-- ✅ Simple key -->
<h1>{{ 'home.hero.title' | t }}</h1>

<!-- ✅ With interpolation (ICU not needed for simple values) -->
<p>{{ 'festival.detail.price' | t : { price: festival.precioDesde } }}</p>

<!-- ✅ aria-label from i18n -->
<button [attr.aria-label]="'nav.aria.search' | t">
  <lucide-icon name="search" />
</button>

<!-- ❌ DON'T — hardcoded string in template -->
<h1>Descubre los festivales</h1>
```

### Translate in TypeScript — via TranslationService

```ts
// When you need a translated string inside a service or component (not a template)
@Component({ /* ... */ })
export class FestivalToastComponent {
  private readonly i18n = inject(TranslationService);

  showNetworkError(): void {
    const msg = this.i18n.t('errors.network.message');
    this.toast.show(msg);
  }
}
```

### ICU pluralization — es.json key

```json
// src/assets/i18n/es.json
{
  "search": {
    "results": {
      "count": "{count, plural, =0 {Sin resultados} one {# festival encontrado} other {# festivales encontrados}}"
    }
  }
}
```

```html
<!-- Template — pass the count variable to the pipe -->
<p aria-live="polite">
  {{ 'search.results.count' | t : { count: results().length } }}
</p>
```

### LocaleDatePipe — festival date range

```ts
// src/app/shared/pipes/locale-date.pipe.ts
import { Pipe, PipeTransform, LOCALE_ID, inject } from '@angular/core';
import { format } from 'date-fns';
import { es, ca, enGB } from 'date-fns/locale';

const LOCALES: Record<string, Locale> = { 'es-ES': es, 'ca': ca, 'en-GB': enGB };

@Pipe({ name: 'localeDate', standalone: true, pure: true })
export class LocaleDatePipe implements PipeTransform {
  private readonly localeId = inject(LOCALE_ID);

  transform(iso: string, pattern = 'd MMM yyyy'): string {
    return format(new Date(iso), pattern, {
      locale: LOCALES[this.localeId] ?? es,
    });
  }
}
```

```html
<!-- Output: "12 jul 2026" -->
<time [attr.datetime]="festival.fechaInicio">
  {{ festival.fechaInicio | localeDate : 'd MMM yyyy' }}
</time>
```

## Related skills

- [[i18n-commit-policy]]
- [[seo-meta]]
- [[forms-validation]]
