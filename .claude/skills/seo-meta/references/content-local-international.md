# Festival, artist, local and international SEO rules

Scope: entity pages, geographic landings, internal links, freshness and locale variants. Owners:
**content** for facts/copy, **performance** for search policy, **systems** for locale routing.

## Verified festival content

Every festival detail page MUST expose, when officially available:

- official name and edition/year;
- confirmed start/end dates using semantic `<time datetime="…">`;
- venue, city and province with consistent spelling;
- verified line-up, preserving announced names and tiers;
- price context (`desde`, fee inclusion and verification date) and official ticket link;
- official festival link and a visible “last verified” or materially updated date where useful.

Unknown data MUST be stated as pending or omitted. A previous edition MUST remain clearly labelled and
MUST NOT be silently republished as the current edition.

```html
<!-- Compliant -->
<p>Cartel 2027 pendiente de confirmación oficial.</p>
```

```html
<!-- Non-compliant -->
<p>Cartel 2027: los artistas más esperados llegarán seguro.</p>
```

Sources SHOULD be first-party: official festival/organizer/venue, official ticket vendor, municipal
authority or artist announcement. Third-party sources MAY corroborate but MUST NOT override a current
official source without an explicit discrepancy note. Each mutable fact MUST carry a source URL and
verification timestamp in the editorial workflow, even if not all provenance is rendered publicly.

## Stable entities and slugs

1. Festival and artist slugs MUST be lowercase ASCII kebab-case and immutable after publication.
2. Editorial renaming MUST change the visible official name, not the slug.
3. If a legal rebrand makes a new slug unavoidable, **performance** MUST approve the mapping and
   **systems** MUST implement a permanent server redirect before the new URL is published.
4. Historic internal links, canonical, sitemap, JSON-LD and locale alternates MUST be migrated in the
   same release.

Compliant: `/festivales/arenal` remains stable while the page heading adopts the verified edition name.
Non-compliant: changing it annually to `/festivales/arenal-sound-2027` without a deliberate edition-URL
strategy and redirects.

## Artist profiles

At roadmap launch, `/artistas/:slug` MUST provide unique value beyond a copied biography:

- verified official/stage name and entity type;
- original concise editorial context;
- linked TuriaFestNoticias festivals and confirmed dates;
- official/verified external profiles;
- clear separation between upcoming and past appearances.

An artist URL MUST return `404` when the entity does not exist. Thin profiles containing only a name
and a link MUST remain unlaunched or `noindex`. Performer claims MUST be removed or marked cancelled
when official line-ups change.

## Province and city landings

Canonical province names are `Valencia`, `Alicante` and `Castellón`. City/municipality names MUST use
one editorially chosen official form consistently in headings, breadcrumbs, filters, address and
schema; aliases MAY appear naturally in explanatory copy.

- `/provincia/:provincia` MAY be indexable only when it has demand evidence, a useful current list,
  unique introductory/local context and internal navigation value.
- A city landing MAY launch only with multiple relevant entities or substantial unique guidance.
- Pages generated for every town/genre/month permutation MUST NOT be indexed.
- Two local pages MUST NOT differ only by substituting the place name.
- Unsupported local pages MUST return `404`, not a generic list with `200`.

Reason: local pages should help users choose and travel, not act as doorway pages.

```text
Compliant: /provincia/castellon with a current festival list, city/venue context and calendar links.
Non-compliant: /festivales-baratos-en-cada-pueblo generated from one duplicated paragraph.
```

Venue content SHOULD include verified venue name, locality, province, country and accessible “Cómo
llegar” information. Coordinates MAY be included in visible maps and schema only when they identify
the stated venue. TuriaFestNoticias MUST NOT create or claim a Google Business Profile for festivals/venues it
does not operate.

## Internal linking

1. Links MUST be crawlable `<a href>`/`routerLink` elements, not click handlers on `<div>`.
2. Festival pages SHOULD link to their artists, province/city context, calendar date and full line-up
   when those routes exist and add value.
3. Artist pages SHOULD link back to verified upcoming/past festival appearances.
4. Province/city pages SHOULD link to included canonical festival URLs; calendar entries SHOULD link to
   detail pages.
5. Anchor text MUST describe the destination naturally. Repeated exact-match keyword anchors and
   artificial footer blocks are forbidden.
6. External links SHOULD point to official sources and ticket vendors. Paid/affiliate relationships
   MUST be disclosed and use the appropriate link qualification when introduced.

## Seasonal freshness

- **Content** MUST review current-edition dates, venue, line-up, price and status at season start,
  after official announcements and immediately after postponement/cancellation notices.
- Material updates SHOULD expose `dateModified`; trivial builds, punctuation changes and automated
  daily timestamps MUST NOT refresh it.
- Outdated pages MUST either become accurate historic resources, redirect to a true successor, or
  return `404/410`. They MUST NOT silently swap edition facts while preserving misleading headings.
- Completed events MAY remain indexable when useful; sales calls to action and `InStock` claims MUST be
  removed when no longer true.

## International SEO

### MVP

- Spanish `es-ES` is the only live source locale and MUST be the only advertised indexable language.
- Official festival, venue and artist names MUST remain untranslated. Surrounding labels, descriptions,
  headings and editorial text MUST be Spanish.
- Placeholder `ca.json`/`en.json` parity is an implementation aid, not evidence that localized pages
  exist. MVP MUST NOT emit `ca` or `en` `hreflang` to untranslated or identical URLs.

### Multilingual roadmap gate

Valencian (`ca-ES-valencia` content; search-compatible hreflang chosen with **content/performance**)
and English (`en-GB`) MAY launch only when:

1. each language has a distinct, crawlable URL and substantially translated main content;
2. each URL has a locale-specific self-canonical;
3. every alternate set is reciprocal and includes itself plus `x-default`;
4. alternate URLs are absolute and return `200`;
5. `<html lang>`, visible language, title, description, OG copy and structured-data text agree;
6. missing translations fall back visibly without advertising a false localized alternate;
7. automatic IP or `Accept-Language` redirects do not prevent users/crawlers selecting a locale.

```html
<!-- Compliant only after distinct locale routes exist -->
<link rel="alternate" hreflang="es" href="https://example.tld/es/festivales/arenal">
<link rel="alternate" hreflang="ca" href="https://example.tld/ca/festivales/arenal">
<link rel="alternate" hreflang="en-gb" href="https://example.tld/en/festivals/arenal">
<link rel="alternate" hreflang="x-default" href="https://example.tld/es/festivales/arenal">
```

```html
<!-- Non-compliant: three labels claim one Spanish URL is three languages -->
<link rel="alternate" hreflang="es" href="https://example.tld/festivales/arenal">
<link rel="alternate" hreflang="ca" href="https://example.tld/festivales/arenal">
<link rel="alternate" hreflang="en" href="https://example.tld/festivales/arenal">
```

Translation key parity MUST follow [internationalization](../../internationalization/SKILL.md) and
[i18n commit policy](../../i18n-commit-policy/SKILL.md). It does not replace human editorial parity:
dates, line-up, status, links and source timestamps MUST match across locales.

Related: [Structured data](structured-data.md), [Technical SEO](technical-seo.md),
[Accessibility](../../accessibility/SKILL.md).

