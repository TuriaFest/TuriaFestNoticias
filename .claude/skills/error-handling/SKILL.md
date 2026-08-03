---
name: error-handling
description: >-
  Normalised FestivalError shape, framework-agnostic error helpers (no HttpInterceptor, no
  ErrorHandler — Astro has neither), the static 404 page, and Sentry as a roadmap reporting
  target. Use when handling build-time or client-island failures, surfacing errors to users, or
  wiring error monitoring.
---

# 🛑 Error Handling

Unified error capture, presentation, and reporting for **TuriaFestNoticias**.

## Purpose

Make failures (build-time data errors, client-island runtime errors) predictable for the user and observable for the developer, without an Angular-style interceptor/`ErrorHandler` pipeline — Astro has no such runtime to hook into.

## Layers

1. **Build-time data errors** — a missing catalogue entry, or (roadmap) a failed Zod `.parse()` on remote data, is a **build failure**, by design: `astro build` throws and CI fails before bad data ever ships as static HTML. `src/pages/noticias/[slug].astro` already does this today:
   ```ts
   const article = getNewsArticleBySlug(slug ?? '');
   if (!article) throw new Error(`News article route is missing catalogue data: ${slug}`);
   ```
   Roadmap: a shared `toFestivalError()` helper (see below) wraps a caught `ZodError` before the `throw`, so the console output carries a `code` and message key instead of a raw Zod stack.
2. **Client-island runtime errors** — an island (`src/scripts/*.ts`) that fails (e.g. a `fetch` to load a locale JSON file, see `src/scripts/i18n.ts`) must fail **silently to a safe default**, never crash the page: the static HTML already rendered is the content: an island's job is progressive enhancement, so a caught error there should log to `console.error` and leave the server-rendered Spanish content in place rather than blanking anything out.
3. **Route errors** — a single static `src/pages/404.astro` with friendly Spanish messaging; Astro serves it automatically for unmatched routes in a static build. There is no dynamic `/error` route — a static site has no request pipeline to intercept mid-navigation.
4. **Form errors** (roadmap) — surfaced inline via the [[forms-validation]] skill once forms exist.

The shared shape, unchanged in intent from the pre-migration model, lives as a plain TypeScript type (not yet created — introduce it in `src/lib/festival-error.ts` when the first consumer needs it):

```ts
// src/lib/festival-error.ts (introduce on first real use)
export interface FestivalError {
  code: 'NETWORK' | 'NOT_FOUND' | 'BUILD' | 'VALIDATION';
  message: string;        // i18n key
  issues?: { path: string; message: string }[];  // populated for Zod failures
}
```

## User-Facing Messages

- Never expose stack traces in rendered markup.
- Always provide a recovery action ("Reintentar", "Volver a portada") via an i18n key, following the pattern already used on `404.astro`.
- Roadmap: a `<fv-toast>` `.astro`/island component for transient client-side errors (e.g. search index failing to build) once one is needed.

## Observability

- **Sentry** is the roadmap frontend error monitor (see `CLAUDE.md`'s stack table) — not installed yet. When introduced, initialize it from a small client island loaded on every page, gated by a build-time env flag (there is no `environment.production` object; Astro exposes `import.meta.env.PROD`).
- Tag every event with the current route (`Astro.url.pathname` at build time, or `window.location.pathname` from an island) and locale.
- Source maps would be uploaded at build time via the Sentry CLI in the Cloudflare Workers deploy step (`npm run deploy`).
- Until Sentry lands, `console.error` in islands and build-time thrown `Error`s are the only observability surface — keep messages specific (include the slug/key that failed) so they are actionable in CI logs.

---

## Examples

### Build-time guard — today's actual pattern

```astro
---
// src/pages/noticias/[slug].astro
import { getNewsArticleBySlug } from '@data/news.catalogue';

const { slug } = Astro.params;
const article = getNewsArticleBySlug(slug ?? '');
if (!article) throw new Error(`News article route is missing catalogue data: ${slug}`);
---
```

### Roadmap: `toFestivalError()` — normalize a caught ZodError at the fetch boundary

```ts
// src/lib/festival-error.ts (roadmap)
import { ZodError } from 'zod';
import type { FestivalError } from './festival-error.model';

export function toFestivalError(err: unknown): FestivalError {
  if (err instanceof ZodError) {
    return {
      code: 'VALIDATION',
      message: 'errors.validation.message',
      issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    };
  }
  if (err instanceof TypeError) {
    return { code: 'NETWORK', message: 'errors.network.message' };
  }
  return { code: 'BUILD', message: 'errors.build.message' };
}
```

```ts
// src/data/festival.repository.ts (roadmap) — used at the fetch boundary
import { toFestivalError } from '@lib/festival-error';

export async function listFestivals() {
  try {
    const response = await fetch(`${CMS_BASE_URL}/festivals`);
    const raw: unknown = await response.json();
    return z.array(FestivalSchema).parse(raw);
  } catch (err) {
    throw toFestivalError(err);
  }
}
```

### Island failing safely to the server-rendered default

```ts
// src/scripts/i18n.ts (excerpt pattern) — a failed locale fetch must not blank the page
export async function getDictionary(lang: LangCode) {
  try {
    const response = await fetch(`/assets/i18n/${lang}.json`);
    if (!response.ok) throw new Error(`Locale fetch failed: ${lang}`);
    return await response.json();
  } catch (err) {
    console.error('[TuriaFestNoticias] locale switch failed, keeping es-ES markup', err);
    return null; // caller keeps the server-rendered Spanish [data-i18n] content untouched
  }
}
```

### 404 page — the only dedicated error route

```astro
---
// src/pages/404.astro
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout seo={{ title: 'Página no encontrada', robots: 'noindex, nofollow' } as never}>
  <p data-i18n="errors.notFound.message">No hemos podido encontrar esta página.</p>
  <a href="/noticias" data-i18n="errors.notFound.action">Volver a portada</a>
</BaseLayout>
```

## Related skills

- [[api-integration]]
- [[internationalization]]
