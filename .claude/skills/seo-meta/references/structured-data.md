# Structured data rules

Scope: Schema.org entities for festivals, breadcrumbs and the site. Owner: **performance**; verified
facts and wording: **content**; typed builder and SSR lifecycle: **systems**; tests: **testing**.

## General contract

1. JSON-LD MUST be serialized into the server/prerendered `<head>` as
   `<script type="application/ld+json">`.
2. It MUST reflect visible, verified page content. Hidden SEO-only properties are forbidden.
3. Builders MUST accept typed domain data and omit unknown optional properties. They MUST NOT invent
   defaults for dates, price, availability, performers, venue, coordinates or status.
4. Every entity URL and `@id` MUST be an absolute TuriaFestNoticias canonical URL, not the festival’s official
   site. The official URL MAY appear as `sameAs` or an offer URL when appropriate.
5. Route transitions MUST leave one graph for the active route; stale scripts MUST be removed.
6. User reviews/ratings MUST NOT be marked up unless they are visible, authentic, policy-compliant and
   traceable. TuriaFestNoticias MUST NOT mark third-party or editorial ratings as user aggregate ratings.

## Festival pages: `MusicEvent`

Valid `/festivales/:slug` pages SHOULD emit `MusicEvent` (a subtype of `Event`). Use `Event` only when
the content is genuinely not a music event.

### Required TuriaFestNoticias properties

- `@context`, `@type`, stable `@id`
- `name`
- `startDate` and `endDate` when officially confirmed
- `eventStatus`
- `eventAttendanceMode` when confirmed
- `location` as `Place` with verified name and address/locality
- `url` equal to the TuriaFestNoticias canonical
- at least one crawlable representative `image`
- factual `description` matching visible copy

### Recommended, only when verified

- `performer` as `MusicGroup` or `Person`, in visible line-up order
- `organizer`
- `offers` with official URL, numeric `price`, `priceCurrency: "EUR"`, `availability`, `validFrom`
- `previousStartDate` when rescheduled
- `sameAs` for the official festival page
- `location.geo` when the coordinates identify the visible venue

If confirmed dates are unavailable, the page MAY remain indexable as an informational page, but it
MUST omit misleading Event date markup and SHOULD NOT emit an incomplete `MusicEvent` solely for rich
results.

```ts
// Compliant mapping: every mutable value comes from a validated, source-backed Festival.
const canonicalUrl = `${baseUrl}/festivales/${festival.slug}`;
const musicEvent = {
  '@context': 'https://schema.org',
  '@type': 'MusicEvent',
  '@id': `${canonicalUrl}#event-${verifiedEditionId}`,
  name: festival.nombre,
  startDate: festival.fechaInicio,
  endDate: festival.fechaFin,
  eventStatus: verifiedEventStatus,
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: verifiedVenue.name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: festival.ciudad,
      addressRegion: festival.provincia,
      addressCountry: 'ES',
    },
  },
  url: canonicalUrl,
  image: [absoluteUrl(festival.poster.src)],
} as const;
```

`verifiedEditionId`, `verifiedEventStatus` and `verifiedVenue` MUST be validated source-backed fields,
not implementation defaults. The example MUST NOT be copied as evidence that any facts remain current.

Non-compliant:

```json
{
  "@type": "MusicEvent",
  "startDate": "2026-07-01",
  "performer": [{ "@type": "MusicGroup", "name": "Rumoured Artist" }],
  "offers": { "price": 0, "availability": "https://schema.org/InStock" },
  "url": "https://official-festival.example/"
}
```

## Event lifecycle

Visible content and JSON-LD MUST change together:

| State | Required schema behavior |
| --- | --- |
| Scheduled | `EventScheduled`; current confirmed dates |
| Postponed, new date unknown | `EventPostponed`; retain original `startDate`; do not guess new dates |
| Rescheduled | `EventRescheduled`; update dates and include `previousStartDate` when known |
| Cancelled | `EventCancelled`; retain identifying dates/location; visible cancellation notice |
| Completed | Keep truthful historic page and dates; no fake ticket availability; remove/close offers as supported by source |

Changing only metadata while the visible page says something else MUST fail review. “Completed” has no
dedicated Google event-status value; the page MUST rely on past dates and accurate offer state rather
than inventing a schema URL.

## Breadcrumbs

Indexable detail and landing pages SHOULD emit one `BreadcrumbList` matching visible navigation.
Positions MUST start at `1`, increase without gaps and use canonical URLs.

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://example.tld/" },
    { "@type": "ListItem", "position": 2, "name": "Festivales", "item": "https://example.tld/festivales" },
    { "@type": "ListItem", "position": 3, "name": "Arenal Sound" }
  ]
}
```

Non-compliant: adding province breadcrumbs that are neither visible nor navigable merely to target a
keyword.

## Site-wide entities

- Home SHOULD emit one `Organization` for TuriaFestNoticias with stable `@id`, logo, canonical URL and only
  verified official social profiles in `sameAs`.
- Home SHOULD emit one `WebSite` whose `publisher` references that Organization.
- `SearchAction` MUST NOT be emitted until a public search URL accepts the declared query and returns
  meaningful results.
- Festival organizers MUST be separate Organization entities; TuriaFestNoticias MUST NOT present itself as the
  event organizer unless it actually is.
- Artist pages MAY emit `MusicGroup` or `Person` at roadmap launch when their identity is verified.

## Validation

Every template change MUST pass JSON parsing, schema-level assertions and the Schema.org validator.
Google Rich Results Test MUST be run for types eligible for Google features. A valid parser result alone
is insufficient: **content** MUST compare every fact against visible copy and its official source.

MVP: `MusicEvent`, `BreadcrumbList`, `Organization` and `WebSite` are required where applicable.
Roadmap: artist entities, localized graphs and search actions activate only with their corresponding
features.

Related: [Content, local and international SEO](content-local-international.md),
[Testing and DoD](testing-definition-of-done.md), [Sanity CMS](../../sanity-cms/SKILL.md).
