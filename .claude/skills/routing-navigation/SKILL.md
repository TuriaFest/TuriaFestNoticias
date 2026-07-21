---
name: routing-navigation
description: >-
  Angular Router conventions: the Spanish URL schema (/festivales/:slug), lazy loading via
  loadChildren, resolvers and functional guards. Use when adding or changing routes, navigation,
  guards or route data.
---

# 🧭 Routing & Navigation

Conventions for Angular Router usage across **TuriaFestNoticias**.

## Purpose

Define a predictable, SEO-friendly URL structure and lazy-loading strategy for the festival portal.

## URL Schema

| Route                           | View                                           |
| ------------------------------- | ---------------------------------------------- |
| `/`                             | Home with featured festivals                   |
| `/festivales`                   | Full listing + filters                         |
| `/festivales/:slug`             | Festival detail                                |
| `/festivales/:slug/cartel`      | Full line-up                                   |
| `/artistas/:slug`               | Artist profile                                 |
| `/provincia/:provincia`         | Filtered by Valencia / Alicante / Castellón    |
| `/sobre-nosotros`               | Static page                                    |

## Patterns

Routing is **two-level**, matching the feature-sliced structure (see [[project-structure]]):

- **App level** (`app.routes.ts`): each feature is lazy-loaded with `loadChildren` pointing at its `<feature>.routes.ts`. This is the chunk boundary.
  ```ts
  { path: 'festivales/:slug',
    loadChildren: () => import('@features/festival-detail/festival-detail.routes')
      .then(m => m.FESTIVAL_DETAIL_ROUTES) }
  ```
- **Feature level** (`<feature>.routes.ts`): the page component is lazy-loaded with `loadComponent`, and resolvers/guards are attached here.
  ```ts
  export const FESTIVAL_DETAIL_ROUTES: Routes = [
    { path: '', loadComponent: () => import('./feature/festival-detail.page')
        .then(m => m.FestivalDetailPageComponent),
      resolve: { festival: festivalResolver } },
  ];
  ```
- **Route-level data resolvers** (`ResolveFn`) for festival detail pages to avoid template flicker and to feed SSR.
- **Functional guards** (`CanMatchFn`) instead of class-based.
- Slugs are kebab-case and stable: `fib-benicassim`, `arenal-sound`, `medusa-festival`.

## Scroll & History

- `withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })`.
- Preserve filter state in query params so URLs are shareable.

---

## Examples

### app.routes.ts — two-level lazy loading

```ts
// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () => import('@features/home/home.routes').then(m => m.HOME_ROUTES),
  },
  {
    path: 'festivales',
    loadChildren: () =>
      import('@features/festival-list/festival-list.routes').then(m => m.FESTIVAL_LIST_ROUTES),
  },
  {
    path: 'festivales/:slug',
    loadChildren: () =>
      import('@features/festival-detail/festival-detail.routes').then(m => m.FESTIVAL_DETAIL_ROUTES),
  },
  {
    path: 'artistas/:slug',
    loadChildren: () =>
      import('@features/artist-detail/artist-detail.routes').then(m => m.ARTIST_DETAIL_ROUTES),
  },
  {
    path: '**',
    loadComponent: () => import('@features/not-found/not-found.page').then(m => m.NotFoundPageComponent),
  },
];
```

### Feature routes — ResolveFn + loadComponent

```ts
// src/app/features/festival-detail/festival-detail.routes.ts
import { Routes } from '@angular/router';
import { festivalResolver } from './data-access/festival.resolver';
import { festivalMetaResolver } from './data-access/festival-meta.resolver';

export const FESTIVAL_DETAIL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./feature/festival-detail.page').then(m => m.FestivalDetailPageComponent),
    resolve: {
      festival: festivalResolver,
      meta:     festivalMetaResolver,
    },
  },
];
```

### ResolveFn — fetch festival before render

```ts
// src/app/features/festival-detail/data-access/festival.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { FestivalService } from '@shared/data-access/festival.service';
import type { Festival } from '@shared/domain/festival.model';

export const festivalResolver: ResolveFn<Festival> = (route) => {
  const service = inject(FestivalService);
  const router  = inject(Router);

  return service.getBySlug(route.params['slug']).pipe(
    catchError(() => {
      router.navigate(['/404']);
      return EMPTY;
    }),
  );
};
```

### Functional guard — CanMatchFn

```ts
// src/app/features/user-profile/user-profile.guard.ts
import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '@shared/data-access/auth.service';

export const authGuard: CanMatchFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() || router.createUrlTree(['/iniciar-sesion']);
};
```

### Filter state in query params — shareable URLs

```ts
// Smart page reads and writes query params so /festivales?provincia=Valencia&mes=7 works
@Component({ /* ... */ })
export class FestivalListPageComponent {
  private readonly route        = inject(ActivatedRoute);
  private readonly router       = inject(Router);
  private readonly filtersStore = inject(FiltersStore);

  constructor() {
    // Hydrate store from URL on load
    this.route.queryParamMap.pipe(take(1)).subscribe(params => {
      this.filtersStore.setProvincia(params.get('provincia') as Provincia | null);
      this.filtersStore.setMes(params.get('mes') ? Number(params.get('mes')) : null);
    });

    // Write store changes back to URL
    effect(() => {
      this.router.navigate([], {
        queryParams: {
          provincia: this.filtersStore.provincia() ?? null,
          mes:       this.filtersStore.mes()       ?? null,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }
}
```

## Related skills

- [[project-structure]]
- [[seo-meta]]
