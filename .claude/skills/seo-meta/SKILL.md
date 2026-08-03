---
name: seo-meta
description: >-
  Enforceable organic-search standard for TuriaFestNoticias: Astro static prerendering, route
  metadata, canonicals, structured data, local and international SEO, editorial quality,
  validation and DoD. Use for every indexable route, content update, metadata change, redirect,
  sitemap or SEO audit.
---

# SEO & Meta

This skill is the canonical SEO contract for **TuriaFestNoticias**. It is an engineering standard, not a
generic optimization guide. RFC keywords `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT` and `MAY` are
normative.

## Outcome

Every indexable TuriaFestNoticias URL MUST return useful Spanish HTML without requiring browser JavaScript,
represent verified festival information, expose one internally consistent canonical identity, and
remain fast and accessible on a mobile connection.

## Non-negotiable principles

1. Festival dates, performers, prices, venues, locations, ticket availability and event status
   **MUST come from a current official source**. Agents MUST NOT invent or infer these facts. Any
   unavoidable inference MUST be labelled as an inference and MUST NOT enter structured data.
2. A published slug MUST NOT change without a documented permanent redirect from every historic URL.
3. Metadata and JSON-LD MUST be present in the prerendered HTML. Client-only injection is insufficient.
4. Structured data MUST describe visible page content and MUST NOT be used to add hidden claims.
5. Indexable routes MUST return meaningful HTML with the correct HTTP status. Error content rendered
   with status `200` is a soft 404 and MUST NOT ship.
6. Canonical, Open Graph, sitemap and `hreflang` URLs MUST be absolute HTTPS production URLs derived
   from `BASE_URL`/`absoluteUrl()` in `src/lib/site.ts`; they MUST NOT be hardcoded in a page.
7. Hidden content, keyword stuffing, doorway pages, cloaking and artificial link schemes MUST NOT be
   used.
8. Astro-native build-time helpers (`src/lib/seo.ts`, `src/layouts/BaseLayout.astro`, Astro's
   `getStaticPaths`/file-based routing) MUST be preferred; a new SEO dependency requires a
   measured need and approval from **performance**.

Reason: search engines and users must see the same accurate page identity. Conflicting signals create
indexing failures and false festival information can cause real travel or purchase harm.

## Required reading by task

| Task | Mandatory reference |
| --- | --- |
| Prerendering, indexability, statuses, redirects, robots, sitemap, filters | [Technical SEO](references/technical-seo.md) |
| Title, description, OG, Twitter, canonical, fallbacks | [Route metadata](references/route-metadata.md) |
| `NewsArticle`/`Event`, breadcrumbs and site entities | [Structured data](references/structured-data.md) |
| Festival, artist, geography, internal links, locales | [Content, local and international SEO](references/content-local-international.md) |
| Core Web Vitals, images, fonts and editorial SEO | [Performance and editorial SEO](references/performance-editorial.md) |
| Automated checks, release gates, evidence and final report | [Testing and Definition of Done](references/testing-definition-of-done.md) |

Agents MUST read every reference relevant to the touched surface. A route launch normally requires all
six.

## Phase matrix

| Requirement | MVP | Roadmap |
| --- | :---: | :---: |
| Static prerender, correct status, unique metadata, canonical, robots and sitemap | MUST | Maintain |
| `NewsArticle` on every article page | MUST | Maintain |
| `Event` schema on verified festival detail pages | Not live | MUST when `/festivales/:slug` launches |
| Province/city landings | MAY only with unique value | Expand from demand evidence |
| Artist profiles | Not live | MUST when `/artistas/:slug` launches |
| Spanish `es-ES` canonical content | MUST | Maintain |
| Valencian and English locale URLs + reciprocal `hreflang` | MUST NOT advertise before launch | MUST at locale go-live |
| Search Console, field CWV and seasonal content operations | SHOULD during launch | MUST in production operations |

“Roadmap” does not lower the quality bar. It means the feature is not emitted until all of its rules
can pass together.

## Ownership

| Area | Accountable owner | Required collaborators |
| --- | --- | --- |
| SEO policy, canonicals, schema, sitemap, robots, CWV | **performance** | systems, testing |
| Static routes, HTTP statuses, redirects, canonical origin (`site.ts`) | **systems** | performance |
| Verified facts, official names, meta copy, freshness | **content** | performance |
| Templates, headings, images, alt text, layout stability | **views** | content, performance |
| Unit/E2E/a11y/build checks and release evidence | **testing** | performance, systems |

The feature owning a route owns its route-specific metadata source. Cross-route mechanics belong in
`src/lib/` (e.g. `seo.ts`, `site.ts`); reusable pure builders belong there only after two real
route uses. Placement MUST follow [project-structure](../project-structure/SKILL.md).

## Canonical implementation direction

TuriaFestNoticias is a fully static Astro build (`output: 'static'`). Every route's metadata is computed at
build time — inside the page's frontmatter (calling `buildListingSeo`/`buildArticleSeo` from
`src/lib/seo.ts`) — so the response written to `dist/` already contains the final head and visible
body; there is no server request to resolve data against. Every indexable route MUST be a static
page. CSR-only rendering is allowed only for non-indexable, user-specific experiences with a
documented reason.

```html
<!-- Compliant server output for /noticias/arenal-sound-2027-fechas -->
<title>Arenal Sound 2027: fechas y aforo confirmados | TuriaFestNoticias</title>
<meta name="description" content="Consulta la información verificada y las novedades oficiales de Arenal Sound 2027.">
<link rel="canonical" href="https://turiafestnoticias.es/noticias/arenal-sound-2027-fechas">
```

```html
<!-- Non-compliant: placeholder identity, relative canonical and unverified sales claim -->
<title>TuriaFestNoticias</title>
<meta name="description" content="Compra ya las últimas entradas al mejor precio">
<link rel="canonical" href="/noticias/arenal-sound-2027-fechas?ref=home">
```

## Existing implementation audit baseline (2026-08-03)

The following are known implementation gaps, not approved conventions:

- Only `/noticias` and `/noticias/:slug` are implemented; `/festivales/:slug` and `/artistas/:slug`
  are roadmap, so `Event` structured data does not exist yet.
- `public/robots.txt` and `public/sitemap.xml` do not yet exist — `public/` currently holds only
  `assets/`, `favicon.ico`, `fonts/` and `turiafest-favicon.ico`.
- `src/lib/site.ts` sets `SITE_BASE_URL` to the production origin
  (`https://turiafestnoticias.es`); canonicals, Open Graph and JSON-LD derive from it. The
  Cloudflare deploy must serve the site on that custom domain.
- Locale infrastructure (`src/i18n`, `src/assets/i18n`) exists for `es`/`ca`/`en`, but no localized
  route URLs or `hreflang` alternates are emitted yet — activation is a roadmap phase, not a
  current behavior.

Documentation changes do not authorize fixes to those files. Application work requires a separate
implementation task.

## Compliant decision example

If the official Arenal Sound site confirms dates but does not publish a price:

- The visible page MAY say “Precio pendiente de confirmación”.
- The description MUST omit price.
- JSON-LD MUST omit `offers`.
- The agent MUST record the official source and verification date.
- The agent MUST NOT derive a price from a prior year or third-party reseller.

## Related project standards

- [Performance optimization](../performance-optimization/SKILL.md)
- [Accessibility](../accessibility/SKILL.md)
- [Internationalization](../internationalization/SKILL.md)
- [Testing patterns](../testing-patterns/SKILL.md)
- [Project structure](../project-structure/SKILL.md)
- [Asset organization](../asset-organization/SKILL.md)

## Primary external specifications

- [Astro static output and prerendering](https://docs.astro.build/en/guides/deploy/)
- [Google Search JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google Event structured data](https://developers.google.com/search/docs/appearance/structured-data/event)
- [Schema.org NewsArticle](https://schema.org/NewsArticle)
- [Schema.org Event](https://schema.org/Event)
