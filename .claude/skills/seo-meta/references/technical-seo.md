# Technical SEO rules

Scope: Astro static prerendering, crawlability, indexability, statuses, redirects, canonicalization,
`robots.txt`, XML sitemap, filtered URLs and JavaScript limitations. Owner: **performance** with
**systems**; validation owner: **testing**.

## Rendering and crawlability

1. Every public discovery route (`/noticias`, every `/noticias/:slug`, and the roadmap
   `/festivales`, valid `/festivales/:slug`, `/calendario`) MUST build to static HTML via Astro's
   default `output: 'static'` prerendering. There is no server-render mode to opt into or out of —
   `astro.config.mjs` has no per-route rendering toggle in this project; a route is either a page
   under `src/pages/` (static) or it does not exist.
2. The built HTML in `dist/` MUST contain the route's final `<h1>`, primary facts, internal links,
   title, description, canonical and applicable JSON-LD — this is emitted directly in the page's
   Astro frontmatter/markup at build time, so there is no hydration gap to worry about.
3. A route with no indexable content MUST NOT be added to `src/pages/`. Non-indexable,
   user-specific roadmap experiences (if ever introduced) MUST record `noindex` in their own head
   metadata and MUST be documented as an explicit exception.
4. SEO-critical content MUST NOT be hidden behind interaction, a client island's mount timing, or a
   browser-only API. Below-the-fold enhancement (e.g. a lazy-mounted island) MAY be deferred when
   an HTML text equivalent exists in the prerendered markup.
5. Browser-only APIs (`window`, `document`, `localStorage`) MUST be guarded inside `src/scripts/*`
   client islands as required by
   [performance-optimization](../../performance-optimization/SKILL.md); `.astro` frontmatter runs
   in Node at build time and MUST NOT assume a browser exists. A build failure MUST fail the
   release; silently falling back to an empty page MUST NOT ship.

Reason: crawlers can render JavaScript, but rendering is delayed and not guaranteed. Because
TuriaFestNoticias ships fully static HTML by construction, this risk is structurally avoided as long as
no route quietly depends on client-side JS to produce its primary content.

```html
<!-- Compliant: useful without JS, present in the built dist/ HTML -->
<main><h1>Últimas noticias de festivales</h1><article><a href="/noticias/arenal-sound-2027-fechas">Arenal Sound 2027: fechas y aforo</a></article></main>
```

```html
<!-- Non-compliant: primary content only appears after a client island mounts -->
<main><div id="news-list-root"></div></main>
```

## HTTP status contract

| Situation | Required response |
| --- | --- |
| Valid canonical page | `200` |
| Published slug replaced by another URL | `301` (via `astro.config.mjs` `redirects`, or the Cloudflare Worker) |
| Temporary maintenance or short-lived relocation | `302`/`307` at the Cloudflare Worker level, with an owner and expiry |
| Unknown or permanently removed article/festival with no equivalent | `404` (Astro's `src/pages/404.astro`) plus useful HTML |
| Upstream failure that prevents truthful content | `5xx` at the edge; MUST NOT cache/index an empty `200` |

- Client-side navigation (a `<script>` doing `location.href = ...`) MUST NOT substitute for a real
  HTTP redirect or status. Static hosting means redirects are declared data
  (`astro.config.mjs` `redirects`, or `wrangler.jsonc`/Worker routes), not runtime logic.
- `src/pages/404.astro` MUST render with HTTP `404`, not `200`; verify this at the Cloudflare Worker
  that serves `dist/`, since a misconfigured static host can silently serve the 404 page's HTML
  with a `200` status.
- Removed article/festival pages SHOULD use `410` only when removal is intentional and permanent
  and the Worker is configured to return it; otherwise use `404`.
- Error HTML SHOULD link to `/noticias` and search, but MUST NOT canonicalize to home.

```js
// astro.config.mjs — compliant intent for a known permanent path migration
export default defineConfig({
  output: 'static',
  redirects: {
    '/': '/noticias',
    '/noticias/old-slug': '/noticias/new-slug',
  },
});
```

```js
// Non-compliant: redirect implemented as client-side JS instead of build-time/edge config
// <script>location.replace('/noticias')</script>
```

## Canonicalization and duplicates

1. Every indexable HTML page MUST expose exactly one self-referencing `<link rel="canonical">`,
   built from `SeoHead.canonical` in `src/lib/seo.ts` and rendered by
   `src/layouts/BaseLayout.astro`.
2. Canonicals MUST be absolute, HTTPS, production-host URLs (via `BASE_URL`/`absoluteUrl()` in
   `src/lib/site.ts`), without fragments, tracking parameters, default-port noise or a
   trailing-slash variant inconsistent with routing.
3. Internal links, redirects, sitemap `<loc>`, Open Graph `og:url` and JSON-LD `url`/`@id` MUST
   agree with the canonical.
4. A canonical MUST be emitted as a `<link>` element in `BaseLayout.astro`'s `<head>`, built at
   Astro's compile time — not injected by a client island after the page loads.
5. HTTP and alternate host variants MUST redirect to the chosen HTTPS host at the Cloudflare Worker
   level. Canonical alone is not a replacement for redirects when TuriaFestNoticias controls the
   duplicate.
6. A page MUST NOT canonicalize to unrelated content (for example, every missing article to `/`).

For the roadmap `/festivales?provincia=Valencia&mes=7`:

- The filtered URL MAY remain shareable.
- It MUST canonicalize to `/festivales` unless **performance** approves an indexable landing page
  with unique demand and content.
- Sorting, view mode and tracking parameters MUST never create indexable variants.
- Filter combinations MUST NOT appear in the sitemap.

Pagination, if introduced, MUST give each useful page a self-canonical and crawlable anchor links
generated via `getStaticPaths`. Page 2 MUST NOT canonicalize to page 1 when its article/festival
set is materially different. Infinite scroll (a client island) MUST have paginated static URLs
accessible without scrolling or JavaScript.

## `robots.txt`

MVP MUST publish UTF-8 `/robots.txt` from `public/` (served verbatim by Astro's static output)
with:

```txt
User-agent: *
Allow: /
Sitemap: https://<production-host>/sitemap.xml
```

- The actual production host MUST replace the placeholder before release. As of this audit,
  `src/lib/site.ts` still points at a Cloudflare Workers subdomain, not a final production domain.
- `robots.txt` MUST NOT block CSS, JS, images, indexable routes or locale assets needed to render.
- `Disallow` MUST NOT be used for canonicalization or removal. Sensitive/private content requires
  authorization, not robots exclusion.
- `/admin` and `/api/` MAY be disallowed when they exist; nonexistent roadmap paths SHOULD NOT be
  cargo-culted into the file.
- Staging/preview Cloudflare deployments MUST be protected outside `robots.txt` and MUST emit
  `noindex`; a public staging site is a release blocker.

Non-compliant:

```txt
User-agent: *
Disallow: /assets/
Disallow: /noticias?
```

## XML sitemap

1. MVP MUST generate `/sitemap.xml` at `astro build` time from the same validated catalogue
   (`src/data/news.catalogue.ts`, and the roadmap festival catalogue) that drives `src/pages/`
   routes. Hand-maintained URL lists MUST NOT become a second source of truth.
2. The sitemap MUST contain only canonical, absolute, indexable URLs that return `200`.
3. It MUST omit redirects, errors, `noindex` routes, filter/sort/search URLs and future locale URLs.
4. `<lastmod>` MAY be emitted only from a trustworthy material-content update timestamp (e.g. an
   article's `modifiedAt`). Build time or “today” MUST NOT be used as a substitute.
5. `/robots.txt` MUST reference it and production ownership MUST submit it in Search Console.
6. At multilingual go-live, localized URLs MAY be expressed in the sitemap only if the same
   reciprocal alternate set is maintained consistently; HTML `hreflang` remains the chosen
   TuriaFestNoticias mechanism.

```xml
<!-- Compliant -->
<url><loc>https://example.tld/noticias/arenal-sound-2027-fechas</loc><lastmod>2026-08-01</lastmod></url>
```

```xml
<!-- Non-compliant: relative, filtered and timestamp invented at build -->
<url><loc>/noticias?categoria=arenal</loc><lastmod>2026-08-03T12:01:03Z</lastmod></url>
```

## MVP / roadmap gate

- MVP MUST implement static prerendering, correct status handling, one canonical per indexable
  route, `robots.txt` and sitemap.
- Faceted indexation, paginated lists and locale sitemaps are roadmap capabilities and MUST remain
  off until their dedicated rules and tests pass.

Related: [Route metadata](route-metadata.md), [Testing and DoD](testing-definition-of-done.md),
[routing-navigation](../../routing-navigation/SKILL.md).
