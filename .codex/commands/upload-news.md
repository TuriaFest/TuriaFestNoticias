# Publish news on TuriaFestNoticias

Add one or more news articles to the `/noticias` section without inventing information and while respecting the project's architecture, design, and editorial policy.

## Goal

Publish verifiable journalistic content about festivals in the Valencian Community. The task is complete when the article appears correctly in the listing, its detail page is accessible when applicable, and all applicable validations pass.

This command **does not create commits or push** unless the user explicitly asks.

## Required information

Before editing, collect for each article:

- Title.
- Brief summary.
- Publication date and time in ISO 8601.
- Full body or an official source to draft from.
- Related festival, artist, province, or category.
- Official source URL.
- Author or responsible entity, if known.
- Cover image, alt text, provenance, and usage permission.

If a fact that materially changes the content is missing, stop and ask the user. Do not invent dates, line-ups, prices, statements, locations, sources, or names.

## Mandatory review

Read before modifying:

- `AGENTS.md`.
- The current implementation in `src/app/features/news/`.
- The skills `content`, `project-structure`, `internationalization`, `asset-organization`, `seo-meta`, `accessibility`, `theming-styling`, `design-responsive-validation`, and `testing-patterns`.

Also consult `docs/documentacion.md` if publishing requires creating, moving, or deleting files.

## Workflow

### 1. Audit the current implementation

Verify:

- How the `news` feature obtains data.
- Whether a catalogue, service, schema, or detail route already exists.
- Which fields and components existing articles use.
- Whether Sanity is actually configured for news.

Do not create a second data source. Use the source that already exists.

If no news source exists yet:

1. Keep everything inside `src/app/features/news/`.
2. Create the minimal model, schema, or catalogue in `data-access/`.
3. Validate external data with Zod at the boundary.
4. Do not connect Sanity or another API without real project configuration and credentials.
5. Do not create empty folders or `index.ts` barrels.

### 2. Validate the article

Verify:

- The slug is `kebab-case`, ASCII, descriptive, and immutable once published.
- The date is valid and does not contradict the source.
- The title and summary do not exaggerate or add unconfirmed facts.
- The official URL uses HTTPS.
- The body clearly distinguishes facts, quotes, and editorial context.
- The article does not duplicate an existing entry.

### 3. Prepare images

When there is a cover image:

- Follow `asset-organization`.
- Keep the original in `src/assets/images-src/news/<slug>/`.
- Publish the optimized version in `src/assets/images/news/<slug>/`.
- Use WebP for raster assets and kebab-case names.
- Record real dimensions and a descriptive `alt`.
- Do not use images without provenance or usage permission.
- Do not distort or crop text, logos, or editorial line-up artwork.

If there is no valid image, use the no-cover visual state defined by the design. Do not reuse another festival's image as filler.

### 4. Add content

- Keep the listing at `/noticias`.
- Use `/noticias/:slug` for detail when an article page exists.
- Sort by publication date descending.
- Keep components standalone, OnPush, and lazy-loaded.
- Pass data from the smart page to presentational components via inputs.
- Do not make HTTP calls from components.
- Do not hardcode copy in HTML or TypeScript.

During development, add or modify copy only in `src/assets/i18n/es.json`. `ca` and `en` translations sync when running `/autocommit`, per `i18n-commit-policy`.

### 5. Update the empty state

- If there are still no articles, keep the empty state.
- When publishing the first article, show the listing and hide the empty state via data — not by manually deleting required markup.
- Remove `noindex, follow` when real indexable editorial content exists.
- Do not leave metadata from a previous article when navigating between routes.

### 6. SEO

For each indexable article configure:

- A specific `<title>`.
- Meta description faithful to the summary.
- Canonical URL.
- Open Graph and Twitter Card.
- Appropriate social image when available.
- JSON-LD `NewsArticle` with headline, dates, author, image, and URL.

Do not publish incomplete schema or invented values. Published slugs are not renamed without a 301 redirect.

### 7. Accessibility and responsive

Verify:

- One `h1` per page.
- Correct heading hierarchy.
- Date inside `<time datetime="…">`.
- Links with comprehensible purpose.
- Correct `alt` on images; decorative images with `alt=""`.
- Visible focus and keyboard navigation.
- WCAG 2.1 AA contrast in light and dark themes.
- No horizontal scroll or clipped content at 320, 768, 1024, and 1440 px.

### 8. Tests and validation

Add or update tests for:

- Article or card render.
- Chronological order.
- Detail link.
- Empty state with zero articles.
- Metadata and schema when added.
- Invalid data when a Zod schema exists.

Run:

```bash
npm run lint
npm test -- --run
npm run build
```

Visually verify `/noticias` and, if it exists, `/noticias/:slug` in light and dark at 320, 768, 1024, and 1440 px.

## Editorial safety

Never publish:

- Rumours without an official source.
- Unnecessary personal data.
- Credentials, tokens, or private URLs.
- Images without clear rights.
- Text copied verbatim from third parties without permission.
- Purchase links that are not official.

## Final report

Summarize:

- Articles added and slugs.
- Official sources used.
- Assets created or modified.
- Routes and metadata updated.
- Tests, lint, build, and responsive validation.
- Pending information or decisions requiring human review.
