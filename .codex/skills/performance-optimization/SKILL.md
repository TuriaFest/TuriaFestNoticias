---
name: performance-optimization
description: >-
  Core Web Vitals discipline: OnPush, @defer, NgOptimizedImage, bundle budgets and SSR /
  prerendering to keep TuriaFestNoticias fast on 4G. Use for any change that could move LCP, CLS or INP,
  affect bundle size, or touch lazy loading and image delivery.
---

# ⚡ Performance Optimization

Guidelines to keep **TuriaFestNoticias** fast on mobile devices during festival season traffic spikes.

## Targets

- **LCP** < 2.5 s on 4G mid-tier device.
- **CLS** < 0.1.
- **INP** < 200 ms.
- **TTI** < 3.5 s.
- Initial bundle < 250 KB gzipped.

## Techniques

- **OnPush** change detection everywhere.
- **Standalone components** + per-feature lazy `loadChildren` (chunk boundary) with `loadComponent` for the page inside each feature.
- **Deferrable views** (`@defer`) for below-the-fold sections like the full line-up grid and the venue map.
- **Signals** instead of `async` pipe where reactivity is local.
- **Pre-rendering / SSR** with Angular Universal for festival detail pages (SEO win too).
- HTTP caching at the service layer with stale-while-revalidate semantics.

---

## Image strategy

Images are the dominant payload on the festival portal — posters, heroes, artist photos. They are also the most common LCP element on detail pages. The image pipeline below is **mandatory**: any image that ships to the user must come through it.

### Formats

- **WebP is the canonical delivery format** for every raster image. Quality/size ratio is significantly better than JPEG, support is universal (>97 % of browsers), and Sanity / Sharp emit it natively.
- **AVIF as a progressive enhancement** when the source is large (hero posters > 1200 px). Served via `<picture>` with WebP fallback. Never AVIF-only.
- **SVG for vector** (icons, logos, illustrations). Hand-optimized with SVGO before commit.
- **JPEG / PNG are forbidden in `src/assets/images/`** and must never be referenced from templates. They may exist only in `src/assets/images-src/` as the build-time source.

### Sources of images

1. **Festival posters and editorial photos** live in **Sanity**. Sanity's image CDN transforms on demand via URL params:
   ```
   https://cdn.sanity.io/images/<project>/<dataset>/<asset-id>.jpg
     ?fm=webp&w=800&q=75&auto=format&fit=max
   ```
   The `FestivalImagePipe` (under `@shared/pipes/`) builds these URLs. Components **never** concatenate Sanity URLs by hand.

2. **Static UI images** (default poster fallback, OG share cards, illustrations for empty states) live in `src/assets/images-src/` as the highest-quality source the designer provides (PNG or JPEG). The build step converts them to WebP variants in `src/assets/images/` — see the **converter** section below.

### Responsive variants

Every image is served in **three widths**, picked by the browser via `srcset`:

| Use case            | Widths (px)         | Quality |
| ------------------- | ------------------- | ------- |
| Card thumbnail      | 320 / 480 / 640     | 70      |
| Detail hero         | 800 / 1200 / 1600   | 75      |
| OG share card       | 1200 (fixed)        | 80      |

Use `NgOptimizedImage` with explicit `width`, `height`, and `ngSrcset`. CLS budget is non-negotiable — dimensions are mandatory.

```html
<img
  ngSrc="/assets/images/festival-fallback.webp"
  ngSrcset="320w, 480w, 640w"
  sizes="(min-width: 768px) 320px, 100vw"
  width="320"
  height="400"
  alt="Cartel del festival"
  priority
/>
```

### Hero / LCP rules

- The detail-page hero is the LCP element. It must:
  - Use `priority` (preloads via `<link rel="preload">`).
  - Be served as WebP at the chosen viewport width — never larger.
  - Have a `placeholder` (10-px LQIP from Sanity: `?w=10&blur=20`) to avoid blank canvas during decode.
- **Never** put a map above the hero. See [[maps]].

---

## Image converter (build-time)

The `scripts/convert-images.mjs` pipeline, its layout, `package.json` wiring and extension rules.

➡️ Moved to [`references/image-converter.md`](references/image-converter.md) to keep this SKILL.md lean.

## Auditing

- Run `npm run build -- --stats-json` and inspect with `webpack-bundle-analyzer` (or `@angular/build`'s built-in stats).
- **Lighthouse CI** in the Cloudflare Pages deploy pipeline; fail PRs that regress > 5 points on Performance.
- Track Core Web Vitals via the **`web-vitals`** library posting to Cloudflare Web Analytics.
- Image size audit: `du -sh src/assets/images/` should stay under 2 MB total. If it grows beyond, revisit presets and quality.

---

## Examples

### OnPush + Signals — the right default

```ts
// ✅ Every component uses OnPush. Signals are the reactive primitive.
@Component({
  selector: 'fv-festival-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,   // non-negotiable
  imports: [FestivalCardComponent, AsyncPipe],
  template: `
    @for (f of visibleFestivals(); track f.slug) {
      <fv-festival-card [festival]="f" />
    }
  `,
})
export class FestivalListPageComponent {
  private readonly catalogue = inject(CatalogueStore);
  private readonly filters   = inject(FiltersStore);

  // Derived signal — no manual subscription, no async pipe needed
  readonly visibleFestivals = computed(() =>
    this.catalogue.festivals().filter(f =>
      !this.filters.provincia() || f.provincia === this.filters.provincia(),
    ),
  );
}
```

### @defer — lazy sections below the fold

```html
<!-- festival-detail.page.html -->

<!-- Hero image is above the fold — loads eagerly, has priority -->
<fv-festival-hero [festival]="festival()" />

<!-- Line-up is below the fold — deferred until the user scrolls there -->
@defer (on viewport) {
  <fv-lineup-grid [cartel]="festival().cartel" />
} @loading (minimum 200ms) {
  <fv-skeleton-loader variant="lineup" />
} @placeholder {
  <div class="lineup-placeholder" style="height: 400px;"></div>
}

<!-- Map is the heaviest dependency — deferred on viewport, never in initial bundle -->
@defer (on viewport) {
  <fv-venue-map
    [lat]="festival().ubicacion.lat"
    [lng]="festival().ubicacion.lng"
  />
} @placeholder {
  <div class="map-placeholder" style="aspect-ratio: 16/9;"></div>
}
```

### Bundle analysis — check after adding a dependency

```bash
# Build with stats and open the visualizer
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/TuriaFestNoticias/browser/stats.json

# Quick budget check — initial bundle must stay under 250 KB gzipped
ls -lh dist/TuriaFestNoticias/browser/*.js | sort -k5 -rh | head -5
gzip -c dist/TuriaFestNoticias/browser/main-*.js | wc -c   # bytes gzipped
```

## Related skills

- [[seo-meta]]
- [[asset-organization]]
- [[project-structure]]
