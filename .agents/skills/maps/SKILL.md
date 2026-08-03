---
name: maps
description: >-
  Interactive venue maps with MapLibre GL JS and Protomaps tiles: lazy-loaded as a client island,
  SSR-safe (build-time-safe) and accessible with text equivalents. Use when adding or changing a
  map on a venue or festival detail page.
---

# 🗺️ Maps

Interactive maps of festival venues using **MapLibre GL JS** with **Protomaps** tiles.

> **Current status (2026-08-03):** the roadmap festival detail page is planned to use the
> **official Google Maps embed** (iframe `maps/embed?pb=…` from the Share → Embed dialog, no API
> key; the only iframe format not blocked by X-Frame-Options) as its first venue-map treatment —
> see the Maps row in `CLAUDE.md`. This skill is the contract for the interactive `/mapa` map
> (roadmap): when that phase launches, `maplibre-gl` will be installed and the
> `MapLoader` island pattern described below will be built.

## Purpose

Show the user where each festival happens — a single venue marker on detail pages, and a
multi-marker overview on the listing page. The stack is fully OSS and free at our scale, avoiding
Mapbox / Google Maps fees.

## Stack

- **MapLibre GL JS** (~200 KB gzipped) — fork of Mapbox GL JS, vector tiles, WebGL renderer.
- **Protomaps** — single static `.pmtiles` file served from a CDN; no tile server to run. Plan B:
  **Stadia Maps** free tier if Protomaps' self-hosted route is too much ops for the MVP.
- **Custom dark style** matching the TuriaFestNoticias design system (deep navy land, muted gray
  streets, violet POI accents).

## Scope

- A `venue-map` island — single-marker map for the festival detail page, mounted from a `<script>`
  tag inside `src/pages/festivales/[slug].astro` (roadmap) or a dedicated component under
  `src/components/`.
- A `festivals-map` island — multi-marker clustered map for the listing page (phase 2; ship the
  list view first).
- A shared `src/scripts/map-loader.ts` module that lazy-loads MapLibre and the style JSON once and
  is imported by any page/island that needs a map.

## Lazy loading

MapLibre is heavy. **Never** import it eagerly, and never from a module that a static page loads
unconditionally:

```ts
// src/scripts/map-loader.ts
export async function loadMapLibre(): Promise<typeof import('maplibre-gl')> {
  return import('maplibre-gl');
}
```

The owning page mounts the map only from an inline `<script>` gated on viewport intersection, so
users who never scroll to the map pay nothing:

```html
<div id="venue-map-root" data-lat="39.47" data-lng="-0.38"></div>
<script>
  const root = document.getElementById('venue-map-root');
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      import('../scripts/venue-map.ts').then((m) => m.mount(root));
    }
  });
  if (root) observer.observe(root);
</script>
```

## Build-time safety

MapLibre depends on `window` and WebGL — it **cannot** run during Astro's build (every `.astro`
file's frontmatter executes in Node, and `output: 'static'` means there is no server request to
defer work to either). The map island's module MUST only ever run inside a browser-executed
`<script>`, never imported from `.astro` frontmatter:

```ts
// venue-map.ts — this file is only ever reached via a client <script> import,
// so `window`/WebGL are guaranteed to exist. Still, guard defensively:
export function mount(container: HTMLElement | null): void {
  if (!container || typeof window === 'undefined') return;
  // ...load MapLibre and attach the canvas here
}
```

The detail page's static HTML renders venue address, lat/lng, and a static placeholder box; the
live map mounts client-side when the island's `<script>` runs.

## Style

The map style is a static JSON in `public/assets/maps/festival-dark.json` (served verbatim by
Astro's static output, referenced by absolute path from the island). Colors come from the design
tokens (see [[theming-styling]]) and are hardcoded into the style file — **not** referenced from
CSS variables, because MapLibre reads the style at WebGL initialization time and has no access to
the page's computed styles.

Key style decisions:

- Land: `--bg-canvas` (`#07070C`).
- Water: `--bg-surface` (`#0B0B14`) with subtle violet tint.
- Roads: hairline `rgba(255,255,255,0.08)` for residential, brighter for highways.
- Labels: Inter, `--text-secondary`, no halos.
- Festival markers: 12 px circle, `--accent-violet`, white 1 px border, soft glow on hover.

When the design system changes a token used by the map, the style file must be regenerated. This
is an explicit, accepted coupling.

## Markers

- Use **HTML markers** (`new Marker({ element })`) instead of symbol layers — a plain DOM element
  built with vanilla TS (optionally the same inline-SVG icons used elsewhere in the app) supports
  focus/hover/click handlers and is keyboard accessible without any framework.
- Cluster markers above 25 features using MapLibre's built-in `cluster: true` source option.
- Marker popups are rendered as plain DOM nodes built by the island's own TS, not a framework
  component — inheriting the design system's CSS classes and i18n via the `t()` resolver from
  `src/i18n`.

## Accessibility

Maps are graphical and unreachable by screen readers by default. Mitigations:

- Every map has a sibling **text equivalent**: the venue address, postal code, and "Cómo llegar"
  link below the map, rendered as ordinary static HTML in the `.astro` page. This is the canonical
  content; the map is decoration on top.
- Keyboard users can pan with arrow keys and zoom with `+`/`-` (MapLibre default), but the canvas
  itself is `tabindex="-1"` and the surrounding `<figure>` carries the `aria-label`.
- `prefers-reduced-motion`: disable the map's fly-to animation; jump-cut transitions instead.

## Performance

- Map is the largest dependency in the app by far. **Never** let MapLibre be reachable from a
  static page's default HTML/JS — it must load only via the lazy island pattern above. Track this
  with the agent **performance**.
- Tile cache uses the browser's HTTP cache; Protomaps tiles are immutable so we cache aggressively
  at Cloudflare's edge.
- The style JSON is fetched once and cached for the session.

## Rules

1. **Never** import `maplibre-gl` from `.astro` frontmatter or from any module reachable at page
   load — only from the lazily-mounted island script.
2. **Never** put the map above the fold on the home page — it kills LCP.
3. **Always** confine MapLibre/WebGL code to browser-executed `<script>` modules; `.astro`
   frontmatter runs at build time in Node and must never reference `window`/WebGL.
4. **Always** ship a text equivalent for the venue location alongside the map, in the page's
   static HTML.
5. **Never** call third-party tile providers without checking attribution requirements (Protomaps
   requires a `© Protomaps © OpenStreetMap` link).

## When to graduate

If we add per-festival heatmaps, hourly stage schedules with isochrones, or routing between
stages, evaluate a tile pipeline with server-side rendering. Until then, the static `.pmtiles`
setup is sufficient and free — and stays compatible with the site's `output: 'static'` model since
all of it runs client-side.

---

## Examples

### `venue-map` island — lazy MapLibre + build-time-safe

```ts
// src/scripts/venue-map.ts
import type { Map as MapLibreMap } from 'maplibre-gl';

export async function mount(container: HTMLElement | null): Promise<void> {
  if (!container) return;

  const lat = Number(container.dataset.lat);
  const lng = Number(container.dataset.lng);

  const { Map, Marker } = await import('maplibre-gl'); // lazy, browser-only

  const map: MapLibreMap = new Map({
    container,
    style: '/assets/maps/festival-dark.json',
    center: [lng, lat],
    zoom: 13,
  });

  new Marker({ color: 'var(--fv-accent-violet)' })
    .setLngLat([lng, lat])
    .addTo(map);

  // No framework lifecycle hook to clean up on — if the page is a full
  // static navigation (no client router), the map is torn down by the
  // browser's normal page unload.
}
```

```scss
// styles/components/_venue-map.scss
.venue-map {
  margin: 0;
  border-radius: var(--fv-radius-lg);
  overflow: hidden;
  aspect-ratio: 16 / 9;

  &__canvas {
    width: 100%;
    height: 100%;
  }
}
```

### Usage in the festival-detail page — mounted on viewport (roadmap)

```astro
---
// src/pages/festivales/[slug].astro
---
<section class="detail-venue">
  <!-- Text equivalent always present — map is decorative on top -->
  <address class="detail-venue__address">
    <p>{festival.ciudad}, {festival.provincia}</p>
    <a href={directionsUrl} target="_blank" rel="noopener">
      Cómo llegar
    </a>
  </address>

  <!-- Map mounted only once this section enters the viewport -->
  <figure class="venue-map" aria-label="Mapa de ubicación del festival">
    <div
      id="venue-map-canvas"
      class="venue-map__canvas"
      data-lat={festival.ubicacion.lat}
      data-lng={festival.ubicacion.lng}
    ></div>
  </figure>
</section>

<script>
  const target = document.getElementById('venue-map-canvas');
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      import('../../scripts/venue-map.ts').then((m) => m.mount(target));
    }
  });
  if (target) observer.observe(target);
</script>
```

## Related skills

- [[performance-optimization]]
- [[accessibility]]
