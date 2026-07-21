# SEO testing, release gates and Definition of Done

Scope: mandatory evidence for SEO changes. Owner: **testing**; sign-off: **performance**; SSR/status
support: **systems**; fact sign-off: **content**.

## Test layers

### Unit and integration

Metadata/canonical/schema builders MUST have deterministic Vitest coverage for:

- complete verified entity;
- each missing optional fact;
- malicious/invalid URL or malformed date rejection at the validated boundary;
- canonical normalization and query removal policy;
- event scheduled, postponed, rescheduled, cancelled and completed behavior;
- cleanup on route transition and no duplicate tags;
- locale selection and no `hreflang` for unavailable translations.

Tests MUST assert semantic head values, not translated prose snapshots. HTTP/data access MUST be mocked
per [testing-patterns](../../testing-patterns/SKILL.md).

```ts
// Compliant assertion intent
expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
expect(canonical?.href).toBe(`${productionBaseUrl}/festivales/arenal`);
```

```ts
// Non-compliant: only proves a browser-side method was called
expect(metaService.apply).toHaveBeenCalled();
```

### SSR/prerender HTML

For every touched route type, tests or release scripts MUST request the raw built response with scripts
disabled and verify:

1. correct HTTP status and redirect chain;
2. useful visible `<h1>` and primary content;
3. exactly one title, description and canonical;
4. canonical/OG/JSON-LD/sitemap host agreement;
5. parseable, factually matching JSON-LD;
6. correct `robots` directive;
7. no placeholder, localhost, preview host or stale-route metadata;
8. hydration completes without mismatch/error.

Inspecting DevTools Elements after client execution is NOT sufficient evidence.

Example local evidence after implementation:

```bash
npm run build
npm run serve:ssr:TuriaFestNoticias
curl -fsS -D /tmp/fv-headers.txt http://localhost:4000/festivales/arenal \
  -o /tmp/fv-arenal.html
```

Temporary evidence files MUST remain outside the repository. The exact output path/port MAY follow the
current Angular build, but reported commands MUST be reproducible.

### Crawl assets and links

- A link checker MUST crawl canonical internal links from raw rendered HTML and report broken links,
  redirect chains and orphan indexable URLs.
- `robots.txt` MUST return `200`, parse cleanly, reference the correct absolute sitemap and allow all
  assets required for rendering.
- `sitemap.xml` MUST be well-formed XML; every `<loc>` MUST be unique, absolute, canonical, indexable and
  return `200`.
- Sitemap count MUST equal the expected validated catalogue/route count. Unexpected additions or
  removals MUST block release.
- External official/ticket links SHOULD be checked at editorial publication and before major seasonal
  releases; authentication/bot blocks require manual evidence, not deletion of the test.

## Structured-data validation

1. Unit tests MUST parse JSON-LD and assert the typed mapping.
2. Each changed template MUST be validated with Schema.org Validator.
3. Google Rich Results Test MUST be run when the type is eligible.
4. A screenshot/link or recorded output MUST identify the tested production/preview URL and date.
5. Warnings MUST be triaged; “optional” does not permit a known verified property to be omitted without
   reason.

Validation success MUST NOT override factual review. A syntactically valid invented price is a failure.

## Performance and accessibility gates

- Lighthouse mobile MUST score Performance ≥ 90 and SEO ≥ 95 on touched route types unless an approved
  baseline exception names the regression owner and expiry.
- LCP/INP/CLS MUST meet the targets in [performance and editorial SEO](performance-editorial.md).
- The audit MUST use a production build with consistent throttling; before/after results SHOULD be
  attached for performance-sensitive changes.
- Axe/keyboard/semantic heading checks MUST pass because inaccessible hidden or image-only content is
  not an SEO solution.
- Search Console URL Inspection and Core Web Vitals reports MUST be checked after production release;
  they are post-release operations and cannot be fabricated in local evidence.

## Commit and release gates

Documentation-only SEO changes:

```bash
npm run sync:codex:check
```

SEO application changes touching `src/` MUST pass the repository gate, in this order:

```bash
npm run lint && npm test -- --run
```

They MUST additionally pass:

```bash
npm run build
npm run i18n:check
```

If the project does not yet provide automated sitemap, link, SSR-head or Lighthouse scripts, the agent
MUST report those checks as **not automated / outstanding**. It MUST NOT claim a gate passed by naming a
tool that is not installed. New dependencies require separate approval; simple Node/Angular-native
checks SHOULD be preferred.

Pre-release MUST also verify:

- production `environment.baseUrl` is the intended public canonical host;
- preview/staging is not indexable;
- redirects and error statuses work at the deployed edge;
- `robots.txt` and sitemap use the same host;
- a representative URL from every route template passes raw-HTML and schema review;
- no unsupported locale is advertised;
- official facts were reverified by **content**.

## SEO Definition of Done

An SEO-related task is **PASS** only when every applicable item is evidenced. “Not applicable” MUST
include a reason.

- [ ] Scope lists touched route templates, entities and phase (MVP/roadmap).
- [ ] Official sources and verification timestamps exist for every changed mutable fact.
- [ ] Raw HTML contains meaningful content and final metadata without client JavaScript.
- [ ] Status/redirect behavior is correct; no soft 404.
- [ ] One absolute self-canonical agrees with internal links, OG, JSON-LD and sitemap.
- [ ] Title/description/OG/Twitter are unique, accurate and free of unsupported claims.
- [ ] Structured data matches visible content and passes applicable validators.
- [ ] Robots and sitemap inclusion/exclusion are correct.
- [ ] Spanish URL/slug policy is preserved; slug changes have permanent redirect evidence.
- [ ] Locale canonical/`hreflang` sets are reciprocal, or unsupported alternates are absent.
- [ ] Heading hierarchy, crawlable links and alt text pass accessibility review.
- [ ] Mobile layout and LCP/INP/CLS targets pass with recorded environment.
- [ ] Unit, SSR, broken-link and build gates pass; commands and exit codes are recorded.
- [ ] Remaining limitations and post-release Search Console checks are explicitly assigned.

Any unchecked applicable item is **FAIL**. The task MUST NOT be reported complete.

## Standard final SEO validation report

Every SEO task final response MUST include this compact report:

```md
## SEO Validation Report

- Scope / phase: <routes and MVP|roadmap>
- Owners consulted: <performance, systems, content, views, testing>
- Facts verified: <official sources + dates, or “no content facts changed”>
- Rendering / status: <SSR|prerender, tested URLs, HTTP results>
- Metadata / canonical: <PASS|FAIL + evidence>
- Structured data: <PASS|FAIL|N/A + validator>
- Robots / sitemap / links: <PASS|FAIL|N/A + counts>
- Performance / mobile / a11y: <scores/metrics/viewports or limitation>
- Commands: `<command>` → exit <code>
- Remaining work: <owner + concrete follow-up, or “none”>
- Overall: PASS|FAIL
```

Non-compliant report: “SEO optimized; Lighthouse looks good.” It contains no route, source, raw HTML,
metric, command or pass/fail evidence.

## Current repository limitations

As of 2026-07-17, sitemap/robots/link/Lighthouse SEO scripts are not present and complete route metadata
is not implemented. Documentation validation can pass without them; an application SEO release cannot.

Related: [Technical SEO](technical-seo.md), [Route metadata](route-metadata.md),
[Structured data](structured-data.md).

