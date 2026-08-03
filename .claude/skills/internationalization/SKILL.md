---
name: internationalization
description: >-
  Multi-language support with a framework-free runtime resolver: es as the source of truth, dotted
  keys, ICU-flavoured pluralization via es/ca/en message strings, and locale JSON kept in parity.
  Use when adding or changing copy, i18n keys, pluralization or locale handling.
---

# 🌍 Internationalization (i18n)

Multi-language support for **TuriaFestNoticias**.

## Purpose

Although the primary language is **Spanish (es-ES)**, the architecture must accommodate additional locale files for every supported market without drifting in key structure.

## Strategy

- **No framework** — `@angular/localize` and Transloco are both rejected. Angular is gone; the site is static Astro output, and per-locale rebuilds would clash with the Cloudflare Pages/Workers deploy model.
- Pages are **server-rendered in Spanish** at build time. Every translatable node carries a `data-i18n="dotted.key"` anchor (attributes via `data-i18n-attr="aria-label,placeholder"`, interpolation params via `data-i18n-params='{"query":"..."}'`).
- The language-switcher island (`src/scripts/i18n.ts`) fetches the selected locale's JSON on demand, re-resolves every `[data-i18n]` node in the DOM, updates `<html lang>`, the nav flag and the SEO copy, then dispatches a `fv:langchange` event so dependent islands (e.g. news search) rebuild against the new language.
- Translation files live in `src/assets/i18n/*.json` (`es.json`, `ca.json`, `en.json`). A `copy:i18n` prebuild step copies them into `public/assets/i18n` so the client island can `fetch()` them at runtime.
- Typed dictionaries are declared in `src/i18n/translations.ts` (`Translations`, `TranslationKey`); the runtime resolver lives in `src/i18n/index.ts` (`t(key, dict, params?)`, `resolveKey`, `interpolate`, `LANGUAGES`, `getLanguage`, `isLangCode`, `DEFAULT_LANG`).
- Keys follow dotted paths: `festival.detail.lineup.title`, `news.search.results`.

## Date and number formatting

- **Dates** are authored as precomputed i18n label strings per locale (`news.*` date copy) rather than formatted client-side with a date library. When a date must be computed at runtime, use native `Intl.DateTimeFormat` scoped to the active `localeTag` (`es-ES`, `ca-ES-valencia`, `en-GB`) from `LANGUAGES` in `src/i18n/index.ts` — never `new Date().toLocaleString()` with no explicit locale, so output stays deterministic between build and client.
  - Festival date ranges follow the canonical pattern: `"12 – 16 jul 2026"` (en-dash, lowercase month, no leading zero).
  - Same-month ranges collapse the first month (`"12 – 16 jul"`); cross-month ranges spell both (`"30 jun – 4 jul"`).
- **Currency** in **EUR**, formatted as a plain i18n string (`"desde {{ price }} €"`) with the `{{ price }}` placeholder resolved via `interpolate()` — never a currency-formatting library.
- **Pluralization** uses ICU-style message strings resolved by hand inside `t()`/`resolveKey()` — no external ICU runtime. Author plural variants as sibling keys (see example below) and pick the right one at render time, or embed a compact ICU-like expression in the string and interpolate the `count` placeholder.

## Rules

- No hardcoded strings in `.astro` templates or client-island TS files — every piece of copy goes through a `data-i18n` anchor or the `t()` resolver.
- Date formatting **never** calls `Intl.DateTimeFormat`/`toLocaleString()` without pinning the locale explicitly — output must be identical between the server-rendered Spanish page and the client re-resolution.
- Currency is never built with ad-hoc string concatenation of `€` outside an i18n string — the `€` symbol and spacing live inside the translated string itself (`"desde 89 €"`).
- Locale files must stay in sync (every key present in `es.json`, even if non-Spanish locales hold placeholders). Owned by the **content** agent.

## Default Locale

`es` is the `DEFAULT_LANG` in `src/i18n/index.ts`, and `SITE_LANG` in `src/lib/site.ts` drives the server-rendered `<html lang="es-ES">` on every page.

---

## Examples

### `data-i18n` anchors — Astro template usage

```astro
<!-- ✅ Simple key: text content replaced on the client if the user switches language -->
<h1 data-i18n="home.hero.title">Descubre los festivales</h1>

<!-- ✅ With interpolation params -->
<p
  data-i18n="festival.detail.price"
  data-i18n-params={JSON.stringify({ price: festival.precioDesde })}
>
  {t('festival.detail.price', ES_TRANSLATIONS, { price: festival.precioDesde })}
</p>

<!-- ✅ aria-label from i18n -->
<button data-i18n="nav.aria.search" data-i18n-attr="aria-label" aria-label={t('nav.aria.search', ES_TRANSLATIONS)}>
  <svg aria-hidden="true"><!-- inline search icon --></svg>
</button>

<!-- ❌ DON'T — hardcoded string with no data-i18n anchor -->
<h1>Descubre los festivales</h1>
```

Server-side, the Spanish string is resolved once at build time with the shared `t()` helper so the page is correct with JavaScript disabled; the `data-i18n` attribute is what lets the client island re-resolve it after a language switch.

### Resolving a key in a client island

```ts
// src/scripts/news-search.ts (excerpt)
import { getActiveLang, interpolate, translateKey } from './i18n';

summaryText.textContent = interpolate(translateKey('news.search.results'), { query });
```

`translateKey()` (in `src/scripts/i18n.ts`) reads from the cached dictionary for the currently active language and falls back to the raw key if the dictionary hasn't loaded yet — components never call `MiniSearch`, `fetch`, or a translation library directly.

### Pluralization — es.json key

```json
// src/assets/i18n/es.json
{
  "search": {
    "results": {
      "empty": "Sin resultados",
      "one": "# festival encontrado",
      "other": "# festivales encontrados"
    }
  }
}
```

```ts
// Pick the right plural key by hand before interpolating the count
function pluralKey(count: number): string {
  if (count === 0) return 'search.results.empty';
  return count === 1 ? 'search.results.one' : 'search.results.other';
}

const label = interpolate(translateKey(pluralKey(results.length)), { count: results.length });
```

### `t()` — the framework-free resolver

```ts
// src/i18n/index.ts
export function t(
  key: TranslationKey,
  dict: Translations,
  params?: Record<string, unknown>,
): string {
  return interpolate(resolveKey(dict, key) ?? key, params);
}
```

```ts
// Runtime re-resolution after a language switch — src/scripts/i18n.ts
async function switchLanguage(lang: LangCode): Promise<void> {
  const dict = await getDictionary(lang); // fetch('/assets/i18n/{lang}.json'), cached
  if (!dict) return;
  applyTranslations(dict); // walks every [data-i18n] node and re-resolves it
  document.documentElement.lang = getLanguage(lang).localeTag;
  window.dispatchEvent(new CustomEvent('fv:langchange'));
}
```

```astro
<!-- Output on the server-rendered page: "12 jul 2026" -->
<time datetime={festival.fechaInicio} data-i18n="festival.detail.startDate">
  {formattedStartDate}
</time>
```

## Related skills

- [[i18n-commit-policy]]
- [[seo-meta]]
- [[forms-validation]]
