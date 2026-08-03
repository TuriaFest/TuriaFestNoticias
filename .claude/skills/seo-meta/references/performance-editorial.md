# Performance and editorial SEO rules

Scope: Core Web Vitals, images, fonts, island hydration, mobile validation, search intent and
on-page content. Owners: **performance** (budgets/measurement), **views** (UI), **content**
(editorial), **testing** (validation).

## Core Web Vitals contract

At the 75th percentile of mobile field data, indexable route groups MUST target:

- LCP ≤ 2.5 s;
- INP ≤ 200 ms;
- CLS ≤ 0.1.

Until representative field data exists, Lighthouse mobile lab checks MUST be used as a diagnostic
proxy and MUST NOT be described as field CWV. There is no `angular.json`-style bundle budget file
in this Astro project — keep the static output lean by hand and watch the Cloudflare Workers
**1 MB gzipped** asset limit. Older Angular-era gzipped targets in prose (initial/lazy chunk sizes)
MUST NOT be treated as binding; the operative discipline is "does this route ship any JS at all,
and how much."

## LCP and images

1. The route's likely LCP image MUST use a plain `<img>` with `fetchpriority="high"`, correct
   intrinsic `width` and `height`, a responsive `sizes`/`srcset`, and a source sized for the
   viewport. There is no `NgOptimizedImage` doing this automatically — every attribute is explicit.
2. Only the true above-the-fold LCP candidate SHOULD use `fetchpriority="high"`; indiscriminate
   high-priority hints compete with critical CSS/fonts.
3. Raster delivery MUST follow [performance-optimization](../../performance-optimization/SKILL.md)
   and [asset-organization](../../asset-organization/SKILL.md): WebP baseline, optional AVIF with
   fallback, never runtime `images-src` assets.
4. Share images and content images MUST be crawlable and MUST NOT be blocked by robots or
   authentication.
5. `loading="lazy"` MUST NOT be applied to the LCP image (and MUST NOT be combined with
   `fetchpriority="high"`). Below-fold galleries SHOULD lazy load.

```html
<!-- Compliant -->
<img src="/assets/images/festivals/medusa/cartel-medusa-2026-800.webp"
     width="800" height="1000" sizes="(min-width: 1024px) 42vw, 100vw" fetchpriority="high"
     alt="Cartel oficial de Medusa Festival 2026">
```

```html
<!-- Non-compliant: layout shift, oversized transfer and vague alt -->
<img src="/assets/images-src/festivals/medusa/source.png" loading="lazy" alt="festival">
```

## CLS, fonts and static rendering

- Images, embeds, maps, ads and lazily-mounted island placeholders MUST reserve stable
  dimensions/aspect ratio.
- Every route is prerendered static HTML, so there is no server/client rendering mismatch to
  guard against for the initial paint; a client island mounting later MUST still reserve its final
  space up front so it does not shift layout when it activates.
- Self-hosted fonts SHOULD be subset where licensing allows, use `font-display: swap`, and preload
  only the smallest critical face. Fallback metrics SHOULD minimize text reflow.
- Cookie/theme/language UI (the `src/scripts/i18n.ts` switcher, the theme toggle) MUST NOT insert
  unsized content above the main heading after it mounts.
- A lazily-mounted island MAY protect the initial page weight, but its placeholder MUST reserve
  final space and the deferred content MUST NOT contain the only indexable facts or links — those
  MUST already be in the prerendered HTML.

## INP and JavaScript

- Filters, search and any island interaction SHOULD update in under 200 ms without long
  main-thread tasks.
- Expensive map, playlist, gallery and search code MUST stay out of any route's default page
  weight and load only as a lazily-mounted island when not required above the fold.
- Island event handlers MUST NOT synchronously rebuild the entire news/festival catalogue;
  computation SHOULD be minimal client-side work over a prebuilt index (see [[search]]'s MiniSearch
  usage) and be measured on a mid-tier mobile profile.
- Third-party scripts MUST require a documented user and business purpose, load after critical
  content, and be removed if their cost is disproportionate.
- Island mount errors, duplicate data fetching and repeated re-mounting on navigation MUST fail
  release validation.

## Mobile-first validation

Every SEO-facing template change MUST be tested at 320, 375, 768, 1024 and 1440 CSS px as required
by the design validation standard. At 320 px, primary heading, date/place facts and canonical
navigation MUST be readable without horizontal scrolling. Mobile HTML/content MUST remain
equivalent to desktop; mobile MUST NOT hide essential facts for ranking or users.

## Editorial search intent

Before creating or materially rewriting an indexable page, **content + performance** MUST record:

1. primary user task (discover, compare, plan, verify line-up, find official ticket link);
2. entity and geography served;
3. why the page is distinct from existing routes;
4. official sources and verification date;
5. intended internal links and update trigger.

Keyword research MAY inform wording, but copy MUST answer the task naturally. A keyword density
target, synonym lists inserted for ranking, invisible text and repetitive place-name blocks MUST
NOT be used.

Compliant intent: `/noticias` helps users track confirmed festival news and dates as they are
announced. Non-compliant intent: create twenty near-identical “mejores festivales baratos en
[town]” pages that all point to `/noticias`.

## Headings and page content

- Each route MUST have one descriptive visible `<h1>` aligned with the title but not required to
  match character-for-character.
- Heading levels MUST form a semantic outline and MUST NOT be chosen for styling. See
  [accessibility](../../accessibility/SKILL.md).
- Festival detail (roadmap) SHOULD organize verified dates/location, line-up, price/tickets,
  venue/travel and official links under useful `<h2>` sections.
- Important text MUST be HTML text, not only embedded in a poster image, map or iframe.
- Boilerplate MUST NOT dominate unique route content.

## Editorial quality and links

1. Copy MUST be original, concise, grammatically correct Spanish and transparent about
   uncertainty.
2. Critical mutable facts MUST be cross-checked with an official source immediately before
   publication.
3. External links MUST resolve to the relevant official page; generic home links SHOULD NOT
   replace a known ticket/event page.
4. Internal links MUST support the user journey and use descriptive anchor text.
5. `dateModified` MUST represent a material reviewed update (`NewsArticle.modifiedAt` in
   `src/lib/seo.ts`); auto-touching dates is forbidden.
6. Outdated information MUST be corrected, explicitly archived or removed under the status rules;
   it MUST NOT remain live because it attracts traffic.

## Alt text

- Informative images MUST have concise context-specific alt text in the active locale.
- A festival poster alt SHOULD identify official poster + festival + edition when visible and
  verified.
- Decorative atmospheric images MUST use `alt=""`.
- Alt text MUST not start with “imagen de”, repeat nearby captions unnecessarily or list SEO
  keywords.
- Text contained only in a poster that is essential to the page MUST also be present as accessible
  HTML.

MVP: all rules above apply to live routes (`/noticias`, `/noticias/:slug`). Roadmap additions
(third-party scripts, richer galleries, localized assets, the festival catalogue) inherit the same
budgets and require new measurements, not exemptions.

Related: [Content, local and international SEO](content-local-international.md),
[Testing and DoD](testing-definition-of-done.md),
[design responsive validation](../../design-responsive-validation/SKILL.md).
