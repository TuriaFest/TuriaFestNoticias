---
name: maps
description: >-
  Interactive venue maps with MapLibre GL JS and Protomaps tiles: lazy-loaded, SSR-safe and
  accessible with text equivalents. Use when adding or changing a map on a venue or festival
  detail page.
---

# 🗺️ Maps

Interactive maps of festival venues using **MapLibre GL JS** with **Protomaps** tiles.

> **Current status (2026-07-04):** the detail page uses the **official Google Maps embed**
> (iframe `maps/embed?pb=…` from the Share → Embed dialog, no API key; the only iframe format not
> blocked by X-Frame-Options) — see `festival-location-map` and the Maps row in `CLAUDE.md`.
> This skill is the contract for the interactive `/mapa` map (roadmap): when that phase launches,
> `maplibre-gl` will be reinstalled and the `MapLoaderService` pattern described below will be restored.

## Purpose

Show the user where each festival happens — a single venue marker on detail pages, and a multi-marker overview on the listing page. The stack is fully OSS and free at our scale, avoiding Mapbox / Google Maps fees.

## Stack

- **MapLibre GL JS** (~200 KB gzipped) — fork of Mapbox GL JS, vector tiles, WebGL renderer.
- **Protomaps** — single static `.pmtiles` file served from a CDN; no tile server to run. Plan B: **Stadia Maps** free tier if Protomaps' self-hosted route is too much ops for the MVP.
- **Custom dark style** matching the TuriaFestNoticias design system (deep navy land, muted gray streets, violet POI accents).

## Scope

- `VenueMapComponent` — single-marker map for the festival detail page.
- `FestivalsMapComponent` — multi-marker clustered map for the listing page (phase 2; ship the list view first).
- A shared `MapLoaderService` that lazy-loads MapLibre and the style JSON once.

## Lazy loading

MapLibre is heavy. **Never** import it eagerly:

```ts
// MapLoaderService
async load(): Promise<typeof import('maplibre-gl')> {
  return import('maplibre-gl');
}
```

Components that render a map call `load()` in `ngOnInit` and only attach the canvas once the import resolves. The map route uses Angular's `@defer (on viewport)` so users who never scroll to the map pay nothing.

## SSR

MapLibre depends on `window` and WebGL — it **cannot** run during SSR. Guard with:

```ts
if (!isPlatformBrowser(this.platformId)) return;
```

The detail page SSR-renders venue address, lat/lng, and a static placeholder; the live map hydrates on the client.

## Style

The map style is a static JSON in `src/assets/maps/festival-dark.json`. Colors come from the design tokens (see [[theming-styling]]) and are hardcoded into the style file — **not** referenced from CSS variables, because MapLibre reads the style at WebGL initialization time.

Key style decisions:

- Land: `--bg-canvas` (`#07070C`).
- Water: `--bg-surface` (`#0B0B14`) with subtle violet tint.
- Roads: hairline `rgba(255,255,255,0.08)` for residential, brighter for highways.
- Labels: Inter, `--text-secondary`, no halos.
- Festival markers: 12 px circle, `--accent-violet`, white 1 px border, soft glow on hover.

When the design system changes a token used by the map, the style file must be regenerated. This is an explicit, accepted coupling.

## Markers

- Use **HTML markers** (`new Marker({ element })`) instead of symbol layers — they accept Angular templates and Lucide icons, support focus/hover/click handlers, and are keyboard accessible.
- Cluster markers above 25 features using MapLibre's built-in `cluster: true` source option.
- Marker popup is rendered via Angular's `ComponentPortal`, not MapLibre's `Popup` — so it inherits the design system and i18n.

## Accessibility

Maps are graphical and unreachable by screen readers by default. Mitigations:

- Every map has a sibling **text equivalent**: the venue address, postal code, and "Cómo llegar" link below the map. This is the canonical content; the map is decoration on top.
- Keyboard users can pan with arrow keys and zoom with `+`/`-` (MapLibre default), but the canvas itself is `tabindex="-1"` and the surrounding `<figure>` carries the `aria-label`.
- `prefers-reduced-motion`: disable the map's fly-to animation; jump-cut transitions instead.

## Performance

- Map is the largest dependency in the app by far. **Never** include MapLibre in the initial bundle. Track this with the agent **performance**.
- Tile cache uses the browser's HTTP cache; Protomaps tiles are immutable so we cache aggressively at Cloudflare's edge.
- The style JSON is fetched once and cached for the session.

## Rules

1. **Never** import `maplibre-gl` at the top level of a file that ships in the initial bundle.
2. **Never** put the map above the fold on the home page — it kills LCP.
3. **Always** guard browser-only code with `isPlatformBrowser`.
4. **Always** ship a text equivalent for the venue location alongside the map.
5. **Never** call third-party tile providers without checking attribution requirements (Protomaps requires a `© Protomaps © OpenStreetMap` link).

## When to graduate

If we add per-festival heatmaps, hourly stage schedules with isochrones, or routing between stages, evaluate moving to a tile pipeline with server-side rendering. Until then, the static `.pmtiles` setup is sufficient and free.

---

## Examples

### VenueMapComponent — lazy MapLibre + SSR guard

```ts
// src/app/features/festival-detail/ui/venue-map/venue-map.ts
import {
  AfterViewInit, ChangeDetectionStrategy, Component,
  ElementRef, inject, input, OnDestroy, PLATFORM_ID, viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { Map as MapLibreMap } from 'maplibre-gl';

@Component({
  selector: 'fv-venue-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="venue-map" [attr.aria-label]="ariaLabel()">
      <div #mapContainer class="venue-map__canvas"></div>
    </figure>
  `,
  styleUrl: './venue-map.scss',
})
export class VenueMapComponent implements AfterViewInit, OnDestroy {
  readonly lat      = input.required<number>();
  readonly lng      = input.required<number>();
  readonly ariaLabel = input('Mapa de ubicación del festival');

  private readonly platformId  = inject(PLATFORM_ID);
  private readonly mapContainer = viewChild.required<ElementRef>('mapContainer');
  private map: MapLibreMap | undefined;

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;   // SSR guard

    const { Map, Marker } = await import('maplibre-gl');  // lazy

    this.map = new Map({
      container: this.mapContainer().nativeElement,
      style:     '/assets/maps/festival-dark.json',
      center:    [this.lng(), this.lat()],
      zoom:      13,
    });

    new Marker({ color: 'var(--fv-accent-violet)' })
      .setLngLat([this.lng(), this.lat()])
      .addTo(this.map);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}
```

```scss
// venue-map.scss
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

### Usage in festival-detail page — deferred below the fold

```html
<!-- festival-detail.page.html -->
<section class="detail-venue">
  <!-- Text equivalent always present — map is decorative on top -->
  <address class="detail-venue__address">
    <p>{{ festival().ciudad }}, {{ festival().provincia }}</p>
    <a [href]="directionsUrl()" target="_blank" rel="noopener">
      {{ 'festival.detail.directions' | t }}
    </a>
  </address>

  <!-- Map deferred until viewport — users who don't scroll pay nothing -->
  @defer (on viewport) {
    <fv-venue-map
      [lat]="festival().ubicacion.lat"
      [lng]="festival().ubicacion.lng"
      [ariaLabel]="'festival.detail.mapLabel' | t"
    />
  } @placeholder {
    <div class="venue-map-placeholder" aria-hidden="true"></div>
  }
</section>
```

## Related skills

- [[performance-optimization]]
- [[accessibility]]
