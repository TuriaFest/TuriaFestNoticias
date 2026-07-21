---
name: sanity-cms
description: >-
  Reads the festival catalogue from Sanity (hosted headless CMS) with @sanity/client: GROQ
  queries, the read-only client confined to data-access, Zod validation at the boundary and the
  environment.sanity config block. Use when fetching or shaping festival, artist or venue content,
  writing a GROQ query, or mapping a Sanity document to a domain model.
---

# 🛰️ Sanity CMS

The festival catalogue (festivals, artists, venues, line-ups) lives in **Sanity**, a hosted
headless CMS. TuriaFestNoticias is a **read-only consumer** of that content at runtime; editors curate the
data in Sanity Studio. This skill defines how the Angular app talks to Sanity.

## Purpose

Give a single, typed, SSR-safe path from a Sanity document to a `Festival` (or `Artist`) domain
object, so the rest of the app never deals with raw CMS payloads.

## When to use

- Fetching festival / artist / venue data for a page, resolver or store.
- Writing or changing a **GROQ** query.
- Mapping a Sanity document shape to a Zod-validated domain model.
- Adding or changing a Sanity-backed field, image asset reference or projection.

## When NOT to use

- For non-catalogue HTTP (ticketing APIs, Spotify, etc.) — use [[api-integration]] directly.
- For generic service/interceptor/caching patterns — those live in [[api-integration]]; this skill
  only covers the Sanity-specific surface.
- For editing content — that happens in Sanity Studio, not in this repo.

## Instructions

1. **Client lives in `data-access`, never in a component.** Create the client from the canonical
   factory and inject it only inside a `data-access/` service (see [[project-structure]]).

   ```ts
   import { createClient } from '@sanity/client';
   import { environment } from '@env/environment';

   export const sanityClient = createClient({
     projectId: environment.sanity.projectId,
     dataset: environment.sanity.dataset,
     apiVersion: environment.sanity.apiVersion,
     useCdn: environment.sanity.useCdn, // true in prod (cached), false in dev
     perspective: 'published',
   });
   ```

   All connection values come from `environment.sanity` — **never hardcode** `projectId` or dataset
   (see `CLAUDE.md` § Configuration).

2. **Query with GROQ, project exactly the domain shape.** Ask Sanity for the field names the Zod
   schema expects so the mapping is a pass-through.

   ```ts
   const FESTIVAL_BY_SLUG = `*[_type == "festival" && slug.current == $slug][0]{
     "slug": slug.current, nombre, provincia, ciudad,
     "fechaInicio": fechaInicio, "fechaFin": fechaFin,
     generos, precioDesde, urlOficial,
     "poster": { "src": poster.asset->url, "alt": poster.alt },
     "ubicacion": { "lat": ubicacion.lat, "lng": ubicacion.lng },
     "cartel": cartel[]->{ "slug": slug.current, nombre, tier }
   }`;
   ```

3. **Validate at the boundary with Zod.** Parse the raw result through the `Festival` schema in
   `@shared/domain` (the single source of truth — see [[api-integration]]). A CMS field rename must
   never reach a component as `any`.

   ```ts
   const raw = await sanityClient.fetch(FESTIVAL_BY_SLUG, { slug });
   return FestivalSchema.parse(raw); // throws -> normalized via error-handling
   ```

4. **Keep slugs immutable.** `slug.current` is the SEO-critical key; renames are coordinated by
   **performance** with a 301 (see [[routing-navigation]] and `CLAUDE.md`).

5. **SSR-safe.** `@sanity/client` uses `fetch`, which works under Angular Universal. Resolve catalogue
   data in a route resolver so it is fetched once during prerender / SSR, not on the client.

6. **Errors flow through [[error-handling]].** Wrap failures into `FestivalError`; surface user copy
   via [[internationalization]].

## Examples

A resolver that loads one festival for `/festivales/:slug`:

```ts
export const festivalResolver: ResolveFn<Festival> = (route) => {
  const repo = inject(FestivalRepository); // data-access service owning sanityClient
  return repo.bySlug(route.paramMap.get('slug')!);
};
```

## Notes

- Sanity schemas (in Sanity Studio / `studio/`) **must mirror** the Zod schemas in `@shared/domain`.
  When a Studio field changes, update the matching Zod schema in the same commit (owned by
  **content** + **systems**).
- `useCdn: true` in production trades freshness for speed and cost; the CDN lags published edits by
  a short window. Use `false` for preview/draft flows only.
- Cloudflare Workers free tier caps at ~1 MB gz — keep `@sanity/client` usage lean and avoid pulling
  large unused query helpers (see [[performance-optimization]]).

## Related skills

- [[api-integration]]
- [[internationalization]]
- [[error-handling]]
- [[routing-navigation]]
