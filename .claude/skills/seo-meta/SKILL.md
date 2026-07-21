---
name: seo-meta
description: >-
  Enforceable organic-search standard for TuriaFestNoticias: Angular SSR/prerender, route metadata,
  canonicals, structured data, local and international SEO, editorial quality, validation and DoD.
  Use for every indexable route, content update, metadata change, redirect, sitemap or SEO audit.
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
3. Metadata and JSON-LD MUST be present in SSR/prerendered HTML. Client-only injection is insufficient.
4. Structured data MUST describe visible page content and MUST NOT be used to add hidden claims.
5. Indexable routes MUST return meaningful HTML with the correct HTTP status. Error content rendered
   with status `200` is a soft 404 and MUST NOT ship.
6. Canonical, Open Graph, sitemap and `hreflang` URLs MUST be absolute HTTPS production URLs derived
   from `environment.baseUrl`; they MUST NOT be hardcoded in a feature.
7. Hidden content, keyword stuffing, doorway pages, cloaking and artificial link schemes MUST NOT be
   used.
8. Angular native APIs (`Title`, `Meta`, `DOCUMENT`, route data and `@angular/ssr`) MUST be preferred;
   a new SEO dependency requires a measured need and approval from **performance**.

Reason: search engines and users must see the same accurate page identity. Conflicting signals create
indexing failures and false festival information can cause real travel or purchase harm.

## Required reading by task

| Task | Mandatory reference |
| --- | --- |
| Rendering, indexability, statuses, redirects, robots, sitemap, filters | [Technical SEO](references/technical-seo.md) |
| Title, description, OG, Twitter, canonical, fallbacks | [Route metadata](references/route-metadata.md) |
| `MusicEvent`, breadcrumbs and site entities | [Structured data](references/structured-data.md) |
| Festival, artist, geography, internal links, locales | [Content, local and international SEO](references/content-local-international.md) |
| Core Web Vitals, images, fonts and editorial SEO | [Performance and editorial SEO](references/performance-editorial.md) |
| Automated checks, release gates, evidence and final report | [Testing and Definition of Done](references/testing-definition-of-done.md) |

Agents MUST read every reference relevant to the touched surface. A route launch normally requires all
six.

## Phase matrix

| Requirement | MVP | Roadmap |
| --- | :---: | :---: |
| SSR/prerender, correct status, unique metadata, canonical, robots and sitemap | MUST | Maintain |
| `MusicEvent` on verified festival detail pages | MUST | Maintain |
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
| SSR routes, HTTP statuses, redirects, environment base URL | **systems** | performance |
| Verified facts, official names, meta copy, freshness | **content** | performance |
| Templates, headings, images, alt text, layout stability | **views** | content, performance |
| Unit/E2E/a11y/SSR checks and release evidence | **testing** | performance, systems |

The feature owning a route owns its route-specific metadata source. Cross-route mechanics belong in
`core/platform/`; reusable pure builders belong in `shared/util/` only after two real feature uses.
Placement MUST follow [project-structure](../project-structure/SKILL.md).

## Canonical implementation direction

TuriaFestNoticias currently uses Angular 21 hybrid rendering. Route data MUST be resolved before metadata is
applied so the server response contains the final head and visible body. Static routes SHOULD use
prerender; content that must be fresh per request MAY use SSR. CSR is allowed only for non-indexable,
user-specific experiences with a documented reason.

```html
<!-- Compliant server output for /festivales/arenal -->
<title>Arenal Sound: guía del festival | TuriaFestNoticias</title>
<meta name="description" content="Consulta la información verificada y las novedades oficiales de Arenal Sound.">
<link rel="canonical" href="https://festival.rngheru.workers.dev/festivales/arenal">
```

```html
<!-- Non-compliant: placeholder identity, relative canonical and unverified sales claim -->
<title>TuriaFestNoticias</title>
<meta name="description" content="Compra ya las últimas entradas al mejor precio">
<link rel="canonical" href="/festivales/arenal?mes=7">
```

## Existing implementation audit baseline (2026-07-17)

The following are known implementation gaps, not approved conventions:

- `src/app/app.routes.server.ts` SSR-renders `/festivales/:slug` and prerenders `**`; unknown festival
  slugs currently redirect to `/`, so a true `404` response remains required.
- `HreflangService` currently emits `es`, `ca`, `en` and `x-default` to the same non-localized URL at
  bootstrap. Those alternates MUST be disabled until distinct, translated, indexable locale URLs exist.
- Only `/noticias` sets route metadata; indexable routes do not yet have a complete metadata service,
  canonical links or structured data.
- `public/robots.txt` and `public/sitemap.xml` do not yet exist.
- `environment.prod.ts` currently uses a Workers URL. The production custom domain MUST replace it
  before canonical URLs, sitemap or `hreflang` are released.

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
- [Routing and navigation](../routing-navigation/SKILL.md)
- [Testing patterns](../testing-patterns/SKILL.md)
- [Project structure](../project-structure/SKILL.md)
- [Asset organization](../asset-organization/SKILL.md)
- [Sanity CMS](../sanity-cms/SKILL.md)

## Primary external specifications

- [Angular server-side and hybrid rendering](https://angular.dev/guide/prerendering)
- [Google Search JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google Event structured data](https://developers.google.com/search/docs/appearance/structured-data/event)
- [Schema.org MusicEvent](https://schema.org/MusicEvent)
