---
name: routing-navigation
description: >-
  Astro file-based routing conventions: the Spanish URL schema (/festivales/:slug), static route
  generation via getStaticPaths, redirects in astro.config.mjs, and 404 handling. Use when adding
  or changing routes, navigation, or route-level data loading.
---

# 🧭 Routing & Navigation

Conventions for Astro's file-based routing across **TuriaFestNoticias**.

## Purpose

Define a predictable, SEO-friendly URL structure and static-generation strategy for the festival portal.

## URL Schema

Currently implemented: `/` (301 redirect to `/noticias`), `/noticias`, `/noticias/:slug`, `404`. The rest are roadmap, to be added as new files under `src/pages/` following the same pattern:

| Route                           | View                                           | Status      |
| -------------------------------- | ----------------------------------------------- | ----------- |
| `/`                               | 301 redirect to `/noticias`                     | Implemented |
| `/noticias`                       | News hub                                        | Implemented |
| `/noticias/:slug`                 | News article detail                             | Implemented |
| `/festivales`                     | Full listing + filters                          | Roadmap     |
| `/festivales/:slug`               | Festival detail                                 | Roadmap     |
| `/festivales/:slug/cartel`        | Full line-up                                    | Roadmap     |
| `/artistas/:slug`                 | Artist profile                                  | Roadmap     |
| `/provincia/:provincia`           | Filtered by Valencia / Alicante / Castellón     | Roadmap     |
| `/sobre-nosotros`                 | Static page                                     | Roadmap     |

## Patterns

Routing is **file-based**, matching Astro's convention (see [[project-structure]]):

- **A route is a file** under `src/pages/`. `src/pages/noticias/index.astro` serves `/noticias`; `src/pages/noticias/[slug].astro` serves every `/noticias/:slug`.
- **Static params come from `getStaticPaths()`.** For a fully local catalogue, this is a synchronous map over the catalogue array; for a future remote source, it is an `async function getStaticPaths()` that awaits the data-access module (see [[api-integration]]).
  ```ts
  // src/pages/noticias/[slug].astro frontmatter
  import { NEWS_ARTICLES } from '@data/news.catalogue';

  export function getStaticPaths() {
    return NEWS_ARTICLES.map((article) => ({ params: { slug: article.slug } }));
  }
  ```
- **Redirects** are declared once, centrally, in `astro.config.mjs`'s `redirects` map — not as a page-level trick.
  ```js
  // astro.config.mjs
  export default defineConfig({
    redirects: { '/': '/noticias' },
  });
  ```
- **404** is a plain static page at `src/pages/404.astro`; Astro serves it automatically for unmatched routes in a static build.
- **No resolvers, no guards.** Astro has neither — data loading happens in frontmatter/`getStaticPaths()` at build time, and there is no per-request auth to gate (the portal has no accounts yet; when the User accounts phase lands, gating will be evaluated against whatever runtime Astro is deployed under at that point).
- Slugs are kebab-case and stable: `arenal-sound-2027-fechas-preventa-abonos`, `bigsound`, `medusa-festival`.

## Scroll & History

- Browser-native scroll restoration is sufficient for a static site; no router-level configuration is needed.
- Roadmap filter state (once `/festivales` ships) should live in the URL's query string so pages stay shareable — read it in frontmatter for the initial static render and let a client island (see [[state-management]]) refine it without a full reload only if genuinely needed.

---

## Examples

### Redirect + static routes — `astro.config.mjs`

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  redirects: {
    '/': '/noticias',
  },
});
```

### Static route generation — `getStaticPaths` over a local catalogue

```astro
---
// src/pages/noticias/[slug].astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import { NEWS_ARTICLES, getNewsArticleBySlug } from '@data/news.catalogue';
import { buildArticleSeo } from '@lib/seo';

export function getStaticPaths() {
  return NEWS_ARTICLES.map((article) => ({ params: { slug: article.slug } }));
}

const { slug } = Astro.params;
const article = getNewsArticleBySlug(slug ?? '');
if (!article) throw new Error(`News article route is missing catalogue data: ${slug}`);

const seo = buildArticleSeo(article, { /* ...seo copy... */ } as never);
---

<BaseLayout seo={seo}>
  <article data-testid="news-article-detail">
    <h1>{article.titleKey}</h1>
  </article>
</BaseLayout>
```

### Roadmap: `getStaticPaths` over a remote data-access module

```astro
---
// src/pages/festivales/[slug].astro (roadmap)
import { listFestivals, getFestivalBySlug } from '@data/festival.repository';

export async function getStaticPaths() {
  const festivals = await listFestivals();
  return festivals.map((festival) => ({ params: { slug: festival.slug } }));
}

const { slug } = Astro.params;
const festival = await getFestivalBySlug(slug ?? '');
if (!festival) throw new Error(`Festival route is missing catalogue data: ${slug}`);
---
```

### 404 page

```astro
---
// src/pages/404.astro
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout seo={{ title: 'Página no encontrada', robots: 'noindex, nofollow' } as never}>
  <p data-i18n="errors.notFound.message">No hemos podido encontrar esta página.</p>
  <a href="/noticias" data-i18n="errors.notFound.action">Volver a portada</a>
</BaseLayout>
```

### Filter state in the query string (roadmap, once `/festivales` ships)

```ts
// src/scripts/festival-filters.ts (roadmap island — reads/writes location.search)
const params = new URLSearchParams(window.location.search);
const provincia = params.get('provincia');
const mes = params.get('mes') ? Number(params.get('mes')) : null;
// ...filter the already-rendered DOM list client-side using these values...
```

## Related skills

- [[project-structure]]
- [[seo-meta]]
