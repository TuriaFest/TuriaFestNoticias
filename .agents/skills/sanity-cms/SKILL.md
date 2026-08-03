---
name: sanity-cms
description: >-
  Roadmap: reads the future festival catalogue from Sanity (hosted headless CMS) with
  @sanity/client at Astro build time: GROQ queries, a build-time-only client confined to src/data,
  Zod validation at the boundary. Today the catalogue is a local TS module with no CMS. Use when
  fetching or shaping festival, artist, or venue content, writing a GROQ query, or mapping a Sanity
  document to a domain model.
---

# 🛰️ Sanity CMS

**Roadmap.** The festival catalogue (festivals, artists, venues, line-ups) is planned to live in **Sanity**, a hosted headless CMS, per `CLAUDE.md`'s stack table (`Content` row: "Sanity remains a roadmap option"). It is **not wired up today** — the only live content source is the local `NewsArticle` catalogue in `src/data/news.catalogue.ts`, which has no CMS involvement at all. This skill defines how the Astro app will talk to Sanity once that phase starts.

## Purpose

Give a single, typed, build-time path from a Sanity document to a `Festival` (or `Artist`) domain object, so no page or island ever deals with a raw CMS payload.

## When to use

- Fetching festival / artist / venue data for a page or `getStaticPaths()`, once Sanity is introduced.
- Writing or changing a **GROQ** query.
- Mapping a Sanity document shape to a Zod-validated domain model.
- Adding or changing a Sanity-backed field, image asset reference, or projection.

## When NOT to use

- For non-catalogue data (ticketing APIs, Spotify, etc.) — use [[api-integration]] directly.
- For generic data-access/caching patterns — those live in [[api-integration]]; this skill only covers the Sanity-specific surface.
- For editing content — that happens in Sanity Studio, not in this repo.
- For anything in the **current** codebase — today's news catalogue is a plain TS module; do not introduce `@sanity/client` until this phase actually starts.

## Instructions (for when this phase starts)

1. **The client is created and used only inside `src/data/`, at Astro build time — never in a `.astro` component's markup section, a layout, or a client island.** Astro is `output: 'static'`, so every Sanity read happens once, during `astro build` (inside frontmatter or `getStaticPaths()`), and the result is baked into static HTML. There is no server runtime to query Sanity per-request.

   ```ts
   // src/data/sanity.client.ts (roadmap)
   import { createClient } from '@sanity/client';
   import { SANITY_PROJECT_ID, SANITY_DATASET } from '@lib/site';

   export const sanityClient = createClient({
     projectId: SANITY_PROJECT_ID,
     dataset: SANITY_DATASET,
     apiVersion: '2024-01-01',
     useCdn: true, // build-time reads only — freshness matters less than a fast, cheap build
     perspective: 'published',
   });
   ```

   Connection values come from `src/lib/site.ts` (the same module that owns `SITE_BASE_URL`, `BASE_URL`) — **never hardcode** `projectId` or dataset inline (see `CLAUDE.md` § Configuration).

2. **Query with GROQ, project exactly the domain shape.** Ask Sanity for the field names the Zod schema expects so the mapping is a pass-through.

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

3. **Validate at the boundary with Zod.** Parse the raw result through the `Festival` schema colocated in `src/data/festival.model.ts` (the single source of truth — see [[api-integration]]). A CMS field rename must never reach a page as `any`.

   ```ts
   const raw = await sanityClient.fetch(FESTIVAL_BY_SLUG, { slug });
   return FestivalSchema.parse(raw); // throws during astro build -> caught by error-handling
   ```

4. **Keep slugs immutable.** `slug.current` is the SEO-critical key; renames are coordinated by **performance** with a redirect entry in `astro.config.mjs` (see [[routing-navigation]] and `CLAUDE.md`).

5. **Build-time only, by construction.** `@sanity/client` uses `fetch`, which Node supports natively — no SSR adapter or platform-specific shim is needed since the call only ever runs during `astro build`, not in the browser.

6. **Errors flow through [[error-handling]].** Wrap failures into the `FestivalError` shape at the call site; surface any user-facing copy via [[internationalization]].

## Examples

A `getStaticPaths()` that loads every festival for `/festivales/:slug` (roadmap):

```ts
// src/pages/festivales/[slug].astro frontmatter
import { listFestivals, getFestivalBySlug } from '@data/festival.repository'; // wraps sanityClient

export async function getStaticPaths() {
  const festivals = await listFestivals();
  return festivals.map((festival) => ({ params: { slug: festival.slug } }));
}

const { slug } = Astro.params;
const festival = await getFestivalBySlug(slug ?? '');
if (!festival) throw new Error(`Festival route is missing catalogue data: ${slug}`);
```

## Notes

- Sanity schemas (in Sanity Studio, once created) **must mirror** the Zod schemas in `src/data/*.model.ts`. When a Studio field changes, update the matching Zod schema in the same commit (owned by **content** + **systems**).
- `useCdn: true` trades freshness for speed and cost; since every read happens once at build time anyway, this is almost always the right setting — use `false` only for a preview/draft build variant, if one is ever introduced.
- Cloudflare Workers' free tier caps at ~1 MB gz for the deployed **static assets** — `@sanity/client` runs only at build time on the CI machine and never ships to the browser, so it does not count against that budget; keep it lean anyway to keep build times short.

## Related skills

- [[api-integration]]
- [[internationalization]]
- [[error-handling]]
- [[routing-navigation]]
