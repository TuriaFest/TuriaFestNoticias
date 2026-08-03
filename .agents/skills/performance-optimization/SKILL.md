---
name: performance-optimization
description: >-
  Core Web Vitals discipline: static-first prerendering, minimal client islands, plain-`<img>`
  responsive delivery and page-weight budgets to keep TuriaFestNoticias fast on 4G. Use for any
  change that could move LCP, CLS or INP, affect shipped JS/asset weight, or touch lazy loading
  and image delivery.
---

# ⚡ Performance Optimization

Guidelines to keep **TuriaFestNoticias** fast on mobile devices during festival season traffic spikes.

## Targets

- **LCP** < 2.5 s on 4G mid-tier device.
- **CLS** < 0.1.
- **INP** < 200 ms.
- **TTI** < 3.5 s.
- Keep the static build lean by hand — there is no Angular-style bundle budget file. Watch the
  Cloudflare Workers **1 MB gzipped** asset limit.

## Techniques

- **Static-first by construction** — `astro.config.mjs` sets `output: 'static'`; every route is
  prerendered HTML at `astro build` time with zero framework runtime shipped by default.
- **Islands, not global JS** — interactive behavior (theme toggle, language switch, nav, news
  search) lives in small, dependency-free scripts under `src/scripts/*`, wired via a `<script>`
  tag in the owning `.astro` file. Reach for an island only for genuine interactivity; everything
  else stays server-rendered markup.
- **Lazy islands for below-the-fold sections** — heavy behavior (the roadmap venue map, a full
  line-up grid, a gallery) initializes only `on viewport` (`IntersectionObserver`) or `on idle`
  (`requestIdleCallback`), never eagerly on page load.
- **Framework-agnostic domain logic** — `src/data`, `src/lib`, `src/i18n` are plain TypeScript,
  unit-testable without Astro and carrying no runtime cost in the browser unless explicitly
  imported by a script.
- **Static generation (SSG)** for every SEO-critical route (this is the default, not an opt-in —
  see [[seo-meta]]).
- Cloudflare edge caching for the static `dist/` output; cache headers reviewed with **systems**.

---

## Image strategy

Images are the dominant payload on the festival portal — posters, heroes, artist photos, article
social images. They are also the most common LCP element on article/detail pages. The image
pipeline below is **mandatory**: any image that ships to the user must come through it.

### Formats

- **WebP is the canonical delivery format** for every raster image. Quality/size ratio is
  significantly better than JPEG, support is universal (>97 % of browsers), and the Sharp-based
  converter emits it natively.
- **AVIF as a progressive enhancement** when the source is large (hero posters > 1200 px). Served
  via `<picture>` with WebP fallback. Never AVIF-only.
- **Inline SVG for vector** (icons, logos, illustrations) — hand-optimized with SVGO before
  commit, embedded directly in `.astro` markup. There is no icon package; see
  [[project-structure]].
- **JPEG / PNG / JXL are forbidden in `src/assets/images/`** and must never be referenced from
  markup. They may exist only in `src/assets/images-src/` as the build-time source.

### Sources of images

1. **Festival posters, article social images and editorial photos** live as typed source assets
   under `src/assets/images-src/`, organized by folder (`src/assets/images-src/festivals/<slug>/`,
   `src/assets/images-src/news/...`). Nothing references this folder at runtime — see
   [[asset-organization]].

2. **The build step converts them to WebP variants** in `src/assets/images/` (see the
   **converter** section below), then a prebuild step copies the runtime-needed subset into
   `public/assets/images/` so Astro serves them verbatim from the static output.

### Responsive variants

Every image is served in the widths that matter for its use case, picked by the browser via
`srcset`:

| Use case            | Widths (px)         | Quality |
| ------------------- | ------------------- | ------- |
| Card thumbnail       | 320 / 480 / 640     | 70      |
| Detail hero          | 800 / 1200 / 1600   | 75      |
| OG share card        | 1200 (fixed)        | 80      |

Use a plain `<img>` with explicit `width`, `height`, `srcset` and `sizes`. CLS budget is
non-negotiable — dimensions are mandatory, since Astro has no `NgOptimizedImage`-equivalent doing
this automatically.

```html
<img
  src="/assets/images/festivals/medusa/cartel-medusa-2026-800.webp"
  srcset="
    /assets/images/festivals/medusa/cartel-medusa-2026-320.webp 320w,
    /assets/images/festivals/medusa/cartel-medusa-2026-480.webp 480w,
    /assets/images/festivals/medusa/cartel-medusa-2026-640.webp 640w"
  sizes="(min-width: 768px) 320px, 100vw"
  width="320"
  height="400"
  alt="Cartel del festival"
  fetchpriority="high"
/>
```

### Hero / LCP rules

- The detail/article-page hero is the LCP element. It must:
  - Use `fetchpriority="high"` and **omit** `loading="lazy"` (the two are mutually exclusive for
    the LCP candidate).
  - Be served as WebP at the chosen viewport width — never larger.
  - Reserve its box with explicit `width`/`height` (or `aspect-ratio` in SCSS) to avoid layout
    shift during decode; a placeholder background-color is an acceptable stand-in for a blurred
    LQIP, evaluate only if measured CLS demands it.
- **Never** put a map above the hero. See [[maps]].
- Below-the-fold images MUST use `loading="lazy"`.

---

## Image converter (build-time)

The `scripts/convert-images.mjs` pipeline, its layout, `package.json` wiring and extension rules.

➡️ Moved to [`references/image-converter.md`](references/image-converter.md) to keep this SKILL.md lean.

## Auditing

- Run `npm run build` and inspect `dist/` size directly (`du -sh dist/`, `find dist -name '*.js' -exec du -h {} +`)
  — there is no webpack/`webpack-bundle-analyzer` in a static Astro build; the equivalent audit is
  reading the actual shipped files.
- **Lighthouse CI** in the Cloudflare deploy pipeline; fail PRs that regress > 5 points on
  Performance.
- Track Core Web Vitals via the **`web-vitals`** library posting to Cloudflare Web Analytics.
- Image size audit: `du -sh src/assets/images/` should stay under 2 MB total. If it grows beyond,
  revisit presets and quality.

---

## Examples

### Static `.astro` page — zero JS by default

```astro
---
// src/pages/noticias/[slug].astro
import BaseLayout from '@/layouts/BaseLayout.astro';
import { getArticleBySlug } from '@data/news.catalogue';
import { buildArticleSeo } from '@lib/seo';

const article = getArticleBySlug(Astro.params.slug);
const seo = buildArticleSeo(article, { /* ... */ });
---
<BaseLayout seo={seo}>
  <article>
    <h1>{article.headline}</h1>
    <!-- No client JS is shipped for this page unless a <script> below adds one -->
  </article>
</BaseLayout>
```

### Lazy island — behavior below the fold, loaded on viewport

```astro
<!-- festival-detail-like page, roadmap example -->
<section id="lineup-section">
  <div id="lineup-placeholder" style="min-height: 400px;" aria-hidden="true"></div>
</section>

<script>
  const target = document.getElementById('lineup-section');
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      import('../scripts/lineup-grid.ts').then((m) => m.mount(target));
    }
  });
  if (target) observer.observe(target);
</script>
```

### Page-weight check — after adding a dependency or island

```bash
# Build the static site and inspect the actual output
npm run build
du -sh dist/
find dist -name '*.js' -exec du -h {} + | sort -rh | head -5

# Gzipped size of a specific island bundle
gzip -c dist/_astro/some-island.js | wc -c
```

## Related skills

- [[seo-meta]]
- [[asset-organization]]
- [[project-structure]]
