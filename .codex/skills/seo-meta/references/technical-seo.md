# Technical SEO rules

Scope: Angular rendering, crawlability, indexability, statuses, redirects, canonicalization,
`robots.txt`, XML sitemap, filtered URLs and JavaScript limitations. Owner: **performance** with
**systems**; validation owner: **testing**.

## Rendering and crawlability

1. Every public discovery route (`/`, `/festivales`, valid `/festivales/:slug`, `/calendario` and
   future artist/local pages) MUST use `RenderMode.Prerender` or `RenderMode.Server`.
2. The server response MUST contain the route’s final `<h1>`, primary facts, internal links, title,
   description, canonical and applicable JSON-LD before hydration.
3. `RenderMode.Client` MAY be used only for private/user-specific roadmap routes. Route data MUST
   record `seo: { indexable: false, renderingReason: '...' }` and the response MUST be `noindex`.
4. SEO-critical content MUST NOT be hidden behind interaction, `afterNextRender`, a browser-only API or
   an `@defer` trigger. Below-the-fold enhancement MAY be deferred when an HTML text equivalent exists.
5. Browser APIs MUST be guarded as required by
   [performance-optimization](../../performance-optimization/SKILL.md). SSR failures MUST fail the
   release; silently falling back to an empty shell is non-compliant.

Reason: crawlers can render JavaScript, but rendering is delayed and not guaranteed. TuriaFestNoticias controls
the initial HTML and therefore MUST provide the complete search identity at first response.

```html
<!-- Compliant: useful without JS -->
<main><h1>Festivales en Valencia</h1><article><a href="/festivales/bigsound">BIGSOUND Festival</a></article></main>
```

```html
<!-- Non-compliant: crawler receives an empty application shell -->
<main><fv-festival-list></fv-festival-list></main>
```

## HTTP status contract

| Situation | Required response |
| --- | --- |
| Valid canonical page | `200` |
| Published slug replaced by another URL | `301` or `308` to the one canonical successor |
| Temporary maintenance or short-lived relocation | `302` or `307`, with an owner and expiry |
| Unknown or permanently removed festival with no equivalent | `404` or `410` plus useful HTML |
| Upstream failure that prevents truthful content | `5xx`; MUST NOT cache/index an empty `200` |

- Client-side `Router.navigate()` MUST NOT substitute for an HTTP redirect or status.
- A not-found component with HTTP `200` MUST NOT ship.
- Removed festival pages SHOULD use `410` only when removal is intentional and permanent; otherwise
  use `404`.
- Error HTML SHOULD link to `/festivales` and search, but MUST NOT canonicalize to home.

```ts
// Compliant Angular server-route intent for a known permanent path migration.
// The exact Cloudflare/Angular implementation is owned by systems.
{ path: 'festivales/old-slug', redirectTo: '/festivales/new-slug', status: 301 }
```

```ts
// Non-compliant: unknown slug appears successful and hides the error.
return router.createUrlTree(['/']);
```

## Canonicalization and duplicates

1. Every indexable HTML page MUST expose exactly one self-referencing `<link rel="canonical">`.
2. Canonicals MUST be absolute, HTTPS, production-host URLs, without fragments, tracking parameters,
   default-port noise or a trailing-slash variant inconsistent with routing.
3. Internal links, redirects, sitemap `<loc>`, Open Graph `og:url` and JSON-LD `url` MUST agree with the
   canonical.
4. A canonical MUST be a `<link>` element created through `DOCUMENT`; Angular `Meta` MUST NOT be used
   to create `rel="canonical"` because `Meta` manages `<meta>`, not `<link>`.
5. HTTP and alternate host variants MUST redirect to the chosen HTTPS host. Canonical alone is not a
   replacement for redirects when TuriaFestNoticias controls the duplicate.
6. A page MUST NOT canonicalize to unrelated content (for example, every missing festival to `/`).

For `/festivales?provincia=Valencia&mes=7` in the MVP:

- The filtered URL MAY remain shareable.
- It MUST canonicalize to `/festivales` unless **performance** approves an indexable landing page with
  unique demand and content.
- Sorting, view mode and tracking parameters MUST never create indexable variants.
- Filter combinations MUST NOT appear in the sitemap.

Pagination, if introduced, MUST give each useful page a self-canonical and crawlable anchor links.
Page 2 MUST NOT canonicalize to page 1 when its festival set is materially different. Infinite scroll
MUST have paginated URLs accessible without scrolling or JavaScript.

## `robots.txt`

MVP MUST publish UTF-8 `/robots.txt` from `public/` with:

```txt
User-agent: *
Allow: /
Sitemap: https://<production-host>/sitemap.xml
```

- The actual production host MUST replace the placeholder before release.
- `robots.txt` MUST NOT block CSS, JS, images, indexable routes or locale assets needed to render.
- `Disallow` MUST NOT be used for canonicalization or removal. Sensitive/private content requires
  authorization, not robots exclusion.
- `/admin` and `/api/` MAY be disallowed when they exist; nonexistent roadmap paths SHOULD NOT be
  cargo-culted into the file.
- Staging environments MUST be protected outside `robots.txt` and MUST emit `noindex`; a public
  staging site is a release blocker.

Non-compliant:

```txt
User-agent: *
Disallow: /assets/
Disallow: /festivales?
```

## XML sitemap

1. MVP MUST generate `/sitemap.xml` at build or content-publish time from the same validated catalogue
   that drives routes. Hand-maintained festival URL lists MUST NOT become a second source of truth.
2. The sitemap MUST contain only canonical, absolute, indexable URLs that return `200`.
3. It MUST omit redirects, errors, `noindex` routes, filter/sort/search URLs and future locale URLs.
4. `<lastmod>` MAY be emitted only from a trustworthy material-content update timestamp. Build time or
   “today” MUST NOT be used as a substitute.
5. `/robots.txt` MUST reference it and production ownership MUST submit it in Search Console.
6. At multilingual go-live, localized URLs MAY be expressed in the sitemap only if the same reciprocal
   alternate set is maintained consistently; HTML `hreflang` remains the chosen TuriaFestNoticias mechanism.

```xml
<!-- Compliant -->
<url><loc>https://example.tld/festivales/arenal</loc><lastmod>2026-06-20</lastmod></url>
```

```xml
<!-- Non-compliant: relative, filtered and timestamp invented at build -->
<url><loc>/festivales?provincia=Valencia</loc><lastmod>2026-07-17T12:01:03Z</lastmod></url>
```

## MVP / roadmap gate

- MVP MUST implement SSR/prerender, correct status handling, one canonical per indexable route,
  `robots.txt` and sitemap.
- Faceted indexation, paginated lists and locale sitemaps are roadmap capabilities and MUST remain off
  until their dedicated rules and tests pass.

Related: [Route metadata](route-metadata.md), [Testing and DoD](testing-definition-of-done.md),
[routing-navigation](../../routing-navigation/SKILL.md).

