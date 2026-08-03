---
name: api-integration
description: >-
  Typed data-fetching for TuriaFestNoticias: today a local, framework-agnostic catalogue in
  src/data; when remote sources arrive, DTOs are validated once with Zod at the boundary inside a
  data-access module, using the platform fetch API — no HttpClient, no interceptors. Use when
  adding or changing a catalogue module, a remote fetch, a DTO contract, or a getStaticPaths data
  source.
---

# 🌐 API Integration

Patterns for how **TuriaFestNoticias** obtains the data it renders.

## Purpose

Standardize data access for the portal — today the **local news catalogue** (`src/data/news.catalogue.ts`), and on the roadmap, remote sources: a headless CMS for the festival catalogue (see [[sanity-cms]]), artist line-ups, venue information, and (future) ticketing partners like Dice or Ticketmaster.

## Current state (MVP)

There is **no HTTP layer today**. `NEWS_ARTICLES` in `src/data/news.catalogue.ts` is a hand-authored, typed, in-memory array (`readonly NewsArticle[]`) matching the `NewsArticle` interface in `src/data/news-article.model.ts`. Pages call `getNewsArticleBySlug(slug)` from the catalogue at **build time** — inside `.astro` frontmatter or a `getStaticPaths()` — and Astro bakes the result into static HTML. There is no client-side fetch, no loading state, no error boundary to design for yet.

## Scope (for when remote data arrives)

- A typed **data-access module** per resource, colocated under `src/data/` (e.g. a future `src/data/festival.repository.ts`).
- Strongly-typed DTOs and their inferred domain types in the same module as the model they describe (`<name>.model.ts`), mirroring the current `news-article.model.ts` pattern.
- **Runtime boundary validation with Zod** — every payload that crosses the network is parsed before the rest of the app (pages, layouts, islands) ever sees it.
- Plain platform `fetch`, called only at **build time** (inside `.astro` frontmatter, `getStaticPaths()`, or a Node build script under `scripts/`) since the site is fully static (`output: 'static'`) — never from a client island, which would defeat prerendering and leak a remote origin into the client bundle.
- No interceptors, no `HttpClient`: Astro has neither. Cross-cutting concerns (error normalization, caching) are plain functions the data-access module calls explicitly.

## Recommended approach

- One module per resource: `src/data/festival.repository.ts`, `src/data/artist.repository.ts` (naming mirrors the existing `news.catalogue.ts` convention — `<domain>.catalogue.ts` for fully local data, `<domain>.repository.ts` once a module talks to a remote source).
- Export plain async functions (`listFestivals(): Promise<Festival[]>`, `getFestivalBySlug(slug): Promise<Festival | undefined>`) — no classes required unless the module needs to memoize a client instance (as `sanityClient` will, see [[sanity-cms]]).
- Centralize any remote base URL or project ID in `src/lib/site.ts` alongside `SITE_BASE_URL` — never hardcode it inside a data-access module.
- Because everything resolves at build time, "caching" means: fetch once per `astro build` invocation, not per request. A module-level `let cache: Festival[] | undefined` guarded by the function is enough — there is no multi-request server process to worry about staleness within.

## Zod at the boundary

The **only** place Zod runs is at the fetch boundary, inside the data-access module. Once a payload is parsed, the inferred TypeScript type is trusted everywhere downstream — no defensive validation in pages, layouts, or islands.

### Pattern

Each model file declares the Zod schema **and** exports the inferred type, exactly like `news-article.model.ts` exports `NewsArticle` today — except a remote-backed model additionally exports the schema used to validate it.

```ts
// src/data/festival.model.ts (roadmap)
import { z } from 'zod';

export const ProvinciaSchema = z.enum(['Valencia', 'Alicante', 'Castellón']);

export const FestivalSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  nombre: z.string().min(1),
  provincia: ProvinciaSchema,
  ciudad: z.string(),
  fechaInicio: z.string().datetime(),
  fechaFin: z.string().datetime(),
  generos: z.array(z.string()),
  cabezasDeCartel: z.array(z.string()),
  precioDesde: z.number().nonnegative(),
  urlOficial: z.string().url(),
  estado: z.enum(['anunciado', 'entradas-abiertas', 'sold-out', 'en-curso']),
});

export type Festival = z.infer<typeof FestivalSchema>;
```

### Data-access module usage

```ts
// src/data/festival.repository.ts (roadmap)
import { z } from 'zod';
import { FestivalSchema, type Festival } from './festival.model';
import { CMS_BASE_URL } from '@lib/site';

let cache: Festival[] | undefined;

export async function listFestivals(): Promise<Festival[]> {
  if (cache) return cache;
  const response = await fetch(`${CMS_BASE_URL}/festivals`);
  const raw: unknown = await response.json();
  cache = z.array(FestivalSchema).parse(raw);
  return cache;
}

export async function getFestivalBySlug(slug: string): Promise<Festival | undefined> {
  const all = await listFestivals();
  return all.find((festival) => festival.slug === slug);
}
```

### Rules

- **Parse, never validate** — use `.parse()` (or `.safeParse()` when the failure is a build-time concern you want to report gracefully rather than crash `astro build`). A failed parse during the build is a build error, by design — it is cheaper to fail CI than to ship bad data as static HTML.
- **Schemas live next to types**, in the resource's model file under `src/data/`. Never inside a page's frontmatter.
- **One schema per DTO**. Compose with `.extend(...)`, never duplicate.
- **Never re-validate downstream**. Once parsed in the data-access module, the type is trusted by every page/island that imports it.
- **Coerce, don't convert**: use `z.coerce.date()` for ISO strings that need to become `Date` at the boundary; never do `new Date(x)` later inside a page.
- **Discriminated unions** for polymorphic payloads (`z.discriminatedUnion('tipo', [...])`).

### Error mapping

A failed `.parse()` throws `ZodError` during `astro build`. Wrap the call site in a helper that maps it to the shared `FestivalError` shape (see [[error-handling]]) before logging, so the build failure carries a `code` and message key instead of a raw stack trace.

## Conventions (roadmap, once a CMS or ticketing API is wired)

- A `list*()` function per resource collection, called from a page's frontmatter or a `getStaticPaths()`.
- A `get*BySlug()` function per detail page, used the same way `getNewsArticleBySlug()` is used in `src/pages/noticias/[slug].astro` today.
- All remote payloads carry ISO-8601 dates; `z.string().datetime()` at the boundary, formatted later by [[internationalization]] via `Intl`/precomputed labels.

## Error handling

Delegated to [[error-handling]]: a shared `toFestivalError()` helper normalizes both fetch failures and `ZodError`s into the `FestivalError` shape, called explicitly from each data-access function — there is no interceptor to register it in globally, since Astro has no HTTP client pipeline.

---

## Examples

### Local catalogue lookup — today's actual pattern

```ts
// src/data/news.catalogue.ts (excerpt)
import type { NewsArticle } from './news-article.model';

export const NEWS_ARTICLES: readonly NewsArticle[] = [
  /* ... typed article objects ... */
];

export function getNewsArticleBySlug(slug: string): NewsArticle | undefined {
  return NEWS_ARTICLES.find((article) => article.slug === slug);
}
```

```astro
---
// src/pages/noticias/[slug].astro
import { NEWS_ARTICLES, getNewsArticleBySlug } from '@data/news.catalogue';

export function getStaticPaths() {
  return NEWS_ARTICLES.map((article) => ({ params: { slug: article.slug } }));
}

const { slug } = Astro.params;
const article = getNewsArticleBySlug(slug ?? '');
if (!article) throw new Error(`News article route is missing catalogue data: ${slug}`);
---
```

### Remote data-access module with Zod (roadmap pattern)

```ts
// src/data/festival.repository.ts (roadmap — see above for the full listing)
export async function getFestivalBySlug(slug: string): Promise<Festival | undefined> {
  const all = await listFestivals();
  return all.find((festival) => festival.slug === slug);
}
```

```astro
---
// src/pages/festivales/[slug].astro (roadmap)
import { listFestivals, getFestivalBySlug } from '@data/festival.repository';

export async function getStaticPaths() {
  const festivals = await listFestivals();
  return festivals.map((festival) => ({ params: { slug: festival.slug } }));
}

const { slug } = Astro.params;
const festival = await getFestivalBySlug(slug ?? '');
if (!festival) throw new Error(`Festival route is missing catalogue data: ${slug}`);
---
```

## Related skills

- [[state-management]]
- [[error-handling]]
- [[sanity-cms]]
- [[project-structure]]
