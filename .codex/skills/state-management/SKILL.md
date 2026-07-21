---
name: state-management
description: >-
  Signal-first state with NgRx SignalStore: immutable stores, pure selectors, and persistence of
  filters and favourites. Use when introducing or changing application state, stores or selectors.
---

# 🧠 State Management

Reusable patterns for managing application state across the **TuriaFestNoticias** Angular app.

## Purpose

Centralize how festival data, user preferences (favourites, filters), and UI state (loading, errors, modal visibility) are stored, mutated, and consumed.

## Where stores live

State follows the feature-sliced structure (see [[project-structure]]):

- **Feature-local state** → `features/<feature>/data-access/<name>.store.ts`. Example: `filters.store.ts` inside `festival-list/`.
- **Cross-feature state** → `@shared/data-access/<name>.store.ts`. Example: the festival catalogue, consumed by `home`, `festival-list`, and `festival-detail`.

A store starts feature-local and is promoted to `@shared/data-access/` the moment a **second** feature needs it — never earlier.

## Scope

- The festival catalogue store (Bigsound, Latin Fest, Medusa, Arenal Sound, Reve, Zevra, etc.).
- Local component state via Angular **Signals**.
- Persistence of user filters and favourites across sessions.

## Recommended approach

- **Signals first** for new code. `signal()`, `computed()`, `effect()`.
- **NgRx SignalStore** when state crosses **3 or more features** or needs structured methods + computed selectors at scale.
- **RxJS `BehaviorSubject`** only for streams that interop with external observables (HTTP, router events) — never as the primary cross-component channel.

## Catalogue hydration

The catalogue comes from **Sanity** (see [[api-integration]]). The store is hydrated once, early, and cached for the session:

1. `APP_INITIALIZER` (in `core/initializers/`) triggers `CatalogueStore.load()` before the first route renders.
2. The store holds the parsed `Festival[]` (already Zod-validated at the HTTP boundary).
3. Reads are synchronous Signals; no component re-fetches.
4. Invalidation: the catalogue is treated as immutable per session. A content update in Sanity is picked up on the next full load — there is no live websocket sync in the MVP.
5. On SSR, the store is populated server-side and **transferred to the client** via Angular's hydration state, so the client does not re-fetch.

## Persistence

User preferences survive reloads. Choose the mechanism by data shape (aligned with the roadmap's Personalization phase):

- **`localStorage`** — trivial scalar preferences: active theme, last selected province. Synchronous, tiny.
- **`idb-keyval` (IndexedDB)** — structured or larger data: the favourites set, cached filter combinations. Asynchronous, no 5 MB string limit.

Persistence is wired through the store, never read directly by components. Hydrate persisted state on `APP_INITIALIZER`; write through an `effect()` that mirrors the relevant signal.

## Usage guidelines

1. One store per bounded context (`CatalogueStore`, `FiltersStore`, `FavouritesStore`).
2. Never mutate state outside store methods.
3. Selectors (`computed`) must be pure.
4. Components read Signals and call store methods; they never hold a copy of store state.

## Anti-patterns

- Storing derived values that a `computed()` could produce from existing state.
- Sharing `Subject`s between unrelated components.
- Reading `localStorage` / IndexedDB directly from a component instead of through a store.
- A feature reaching into another feature's store (forbidden by the boundary rules — promote to `@shared/data-access/` instead).

---

## Examples

### NgRx SignalStore — FiltersStore

```ts
// src/app/features/festival-list/data-access/filters.store.ts
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed } from '@angular/core';
import type { Provincia } from '@shared/domain/festival.model';

interface FiltersState {
  provincia: Provincia | null;
  mes: number | null;          // 1–12
  genero: string | null;
  precioMax: number | null;
}

const initialState: FiltersState = {
  provincia: null,
  mes: null,
  genero: null,
  precioMax: null,
};

export const FiltersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ provincia, mes, genero, precioMax }) => ({
    hasActiveFilters: computed(
      () => provincia() !== null || mes() !== null || genero() !== null || precioMax() !== null,
    ),
    activeCount: computed(
      () => [provincia(), mes(), genero(), precioMax()].filter(Boolean).length,
    ),
  })),
  withMethods((store) => ({
    setProvincia(p: Provincia | null): void {
      patchState(store, { provincia: p });
    },
    setMes(m: number | null): void {
      patchState(store, { mes: m });
    },
    setGenero(g: string | null): void {
      patchState(store, { genero: g });
    },
    setPrecioMax(p: number | null): void {
      patchState(store, { precioMax: p });
    },
    reset(): void {
      patchState(store, initialState);
    },
  })),
);
```

### Local component state with Signals

```ts
// Inside a smart page component — never in a presentational ui/ component
@Component({ /* ... */ changeDetection: ChangeDetectionStrategy.OnPush })
export class FestivalListPageComponent {
  private readonly catalogue = inject(CatalogueStore);
  private readonly filters   = inject(FiltersStore);

  readonly festivals = computed(() => {
    const all    = this.catalogue.festivals();
    const prov   = this.filters.provincia();
    const genero = this.filters.genero();
    return all
      .filter(f => !prov   || f.provincia === prov)
      .filter(f => !genero || f.generos.includes(genero));
  });
}
```

### Effect — persist theme to localStorage

```ts
// src/app/core/initializers/theme.initializer.ts
import { effect, inject, signal } from '@angular/core';

export const theme = signal<'dark' | 'light'>('dark');

// Call once in app.config.ts or an initializer
export function wireThemePersistence(): void {
  const saved = localStorage.getItem('fv-theme') as 'dark' | 'light' | null;
  if (saved) theme.set(saved);

  effect(() => {
    localStorage.setItem('fv-theme', theme());
    document.documentElement.setAttribute('data-theme', theme());
  });
}
```

### APP_INITIALIZER — hydrate catalogue before first render

```ts
// src/app/core/initializers/catalogue.initializer.ts
import { inject } from '@angular/core';
import { CatalogueStore } from '@shared/data-access/catalogue.store';

export function provideCatalogueInit() {
  return {
    provide: APP_INITIALIZER,
    useFactory: () => {
      const store = inject(CatalogueStore);
      return () => store.load();   // returns Promise; router waits for it
    },
    multi: true,
  };
}
```

## Related skills

- [[api-integration]]
- [[project-structure]]
