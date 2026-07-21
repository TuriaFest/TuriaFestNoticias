# Route metadata rules

Scope: title, description, Open Graph, Twitter Cards, canonical generation, ownership, Spanish URLs,
fallbacks and SSR verification. Owner: route feature + **performance**; copy owner: **content**;
platform mechanics: **systems**.

## Metadata contract per route

Every route MUST declare one of two explicit states:

- `indexable`: unique metadata, self-canonical and meaningful server HTML are required.
- `non-indexable`: an SSR-visible `robots` policy and reason are required; it MUST be excluded from
  sitemap and organic landing navigation.

An indexable route MUST provide:

| Field | Rule |
| --- | --- |
| `<title>` | Unique, descriptive, normally ≤ 60 characters; brand suffix once |
| `description` | Accurate route summary, normally ≤ 155 characters; no unsupported claims |
| canonical | Exactly one absolute self-reference |
| `robots` | `index, follow` may be implicit; errors/empty hubs MUST be explicit `noindex, follow` |
| Open Graph | `og:title`, `og:description`, `og:type`, `og:url`, absolute `og:image`, `og:image:alt` |
| Twitter | `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, image alt |
| language | `<html lang>` matching visible locale |

Length figures are editorial guardrails, not a licence to truncate meaning. **Content** SHOULD put
the differentiating entity and intent early.

## Templates

Templates MUST be adapted to verified facts; optional facts MUST disappear cleanly.

| Route | Recommended Spanish pattern |
| --- | --- |
| `/` | `Festivales de música en la Comunitat Valenciana | TuriaFestNoticias` |
| `/festivales` | `Festivales en Valencia, Alicante y Castellón | TuriaFestNoticias` |
| `/festivales/:slug` | `{Nombre} {año}: cartel, fechas y entradas | TuriaFestNoticias` |
| `/artistas/:slug` | `{Artista}: festivales y fechas en la Comunitat Valenciana | TuriaFestNoticias` |
| `/provincia/:provincia` | `Festivales en {Provincia} {año} | TuriaFestNoticias` |
| `/calendario` | `Calendario de festivales {año} | TuriaFestNoticias` |

“Entradas” MUST be removed when no verified official ticket link or availability context exists.
Official festival and artist names MUST retain their registered spelling and MUST NOT be translated.

```ts
// Compliant: route-specific fields come from the verified catalogue.
title.setTitle(`${festival.nombre}${verifiedYear ? ` ${verifiedYear}` : ''}: cartel y fechas | TuriaFestNoticias`);
meta.updateTag({
  name: 'description',
  content: buildVerifiedFestivalDescription(festival),
});
```

```html
<!-- Non-compliant: duplicated, stuffed and unverifiable -->
<title>Festivales Valencia | Festivales Valencia baratos | TuriaFestNoticias</title>
<meta name="description" content="El mejor festival, entradas más baratas garantizadas y cartel increíble.">
```

## Architecture and ownership

1. The route feature MUST own the typed metadata input/factory for its content.
2. A single app-wide service in `core/platform/` SHOULD upsert/remove head elements and normalize URLs.
3. Data needed for metadata MUST be resolved before render. A second metadata-only HTTP request MUST
   NOT duplicate the route’s content request.
4. Route transitions MUST replace stale tags; they MUST NOT append duplicates.
5. `Title` and `Meta` MAY manage `<title>` and `<meta>`. Canonical and alternate links MUST be managed
   with `DOCUMENT` because they are `<link>` elements.
6. All reusable visible/meta copy MUST flow from the Spanish source catalogue/i18n policy. Names and
   verified data fields remain domain data, not translations.

```ts
// Compliant shape; exact implementation is an application-code task.
type SeoRouteMeta = Readonly<{
  title: string;
  description: string;
  canonicalPath: string;
  image?: Readonly<{ url: string; alt: string; width: number; height: number }>;
  indexable: boolean;
}>;
```

Non-compliant ownership: a presentational `festival-hero` component injects `Meta`, invents a price
fallback and appends tags in `ngOnInit`.

## Open Graph and Twitter

- `og:url` MUST equal canonical.
- `og:type` SHOULD be `website` for TuriaFestNoticias pages unless a tested consumer requires another valid
  type. JSON-LD, not a non-standard OG type, carries event semantics.
- Share images MUST be crawlable absolute URLs. A dedicated 1200×630 image is preferred; an official
  poster MAY be used when its crop remains legible.
- `og:image:alt` and `twitter:image:alt` MUST describe the image, not repeat keywords.
- `twitter:card` SHOULD be `summary_large_image` when a suitable image exists, otherwise `summary`.
- Twitter fields MAY reuse accurate OG copy, but required tags MUST still be emitted explicitly.
- Social metadata MUST NOT claim “sold out”, “last tickets” or a price unless the current official
  source supports it.

```html
<!-- Compliant -->
<meta property="og:url" content="https://example.tld/festivales/zevra">
<meta property="og:image" content="https://example.tld/assets/images/festivals/zevra/cartel-zevra-2026.webp">
<meta property="og:image:alt" content="Cartel oficial de Zevra Festival">
<meta name="twitter:card" content="summary_large_image">
```

## Canonical and Spanish URL rules

- MVP paths MUST remain Spanish and lowercase ASCII: `/festivales`, `/calendario`, `/noticias`.
- Slugs MUST be lowercase kebab-case and immutable after publication.
- A route MUST NOT translate its Spanish path merely because visible copy changes language. The final
  locale URL strategy is a multilingual roadmap decision owned by **performance + systems + content**.
- Base URLs MUST come from `environment.baseUrl`, without a trailing slash. The release gate MUST fail
  if the value is localhost, `.example`, a preview host or an unintended Workers hostname.

## Fallbacks and missing data

Fallbacks MUST reduce specificity, never fabricate it:

| Missing value | Compliant fallback | Forbidden fallback |
| --- | --- | --- |
| Year/date | Omit year/date phrase | Use current year |
| Price | Omit price; optionally “precio por confirmar” visibly | Previous-year or minimum guessed price |
| Line-up | “Cartel pendiente de confirmación” visibly | Name rumoured performers |
| Share image | TuriaFestNoticias default social card | Broken URL or unrelated festival poster |
| Description source | Route-type fallback with verified place/name | Same generic description on all pages |

If the primary entity does not exist, metadata fallback MUST NOT turn the error into an indexable page.

## SSR evidence

For every touched indexable route, **testing** MUST inspect the raw server HTML (not browser DOM only)
and prove:

1. one final title, description and canonical;
2. correct absolute OG/Twitter URLs;
3. no previous-route tags;
4. no placeholder/localhost host;
5. metadata equals visible verified facts.

MVP MUST pass this contract for every live route. Locale-specific metadata and alternates are roadmap
requirements that become mandatory together at locale launch.

Related: [Technical SEO](technical-seo.md), [Structured data](structured-data.md),
[internationalization](../../internationalization/SKILL.md).
