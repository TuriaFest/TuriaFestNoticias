---
name: api-integration
description: >-
  Typed HTTP services for festival data: DTOs validated once with Zod at the boundary,
  interceptors and caching, with HttpClient confined to data-access folders. Use when adding or
  changing a service, an HTTP call, a DTO contract or a resolver.
---

# 🌐 API Integration

Patterns for communicating with backend services that supply festival data.

## Purpose

Standardize HTTP communication for the **TuriaFestNoticias** portal — fetching festival listings from the **Sanity** headless CMS, artist line-ups, venue information, and (in the future) ticketing partners like Dice or Ticketmaster.

## Scope

- Typed services built on `HttpClient`.
- Strongly-typed DTOs in `@shared/domain/` (cross-feature) or a feature's own `data-access/` (feature-local).
- **Runtime boundary validation with Zod** — every payload that crosses the network is parsed before reaching the rest of the app.
- HTTP interceptors for auth tokens, error normalization, request logging, and caching.
- Caching of read-only endpoints (festival catalogue rarely changes mid-session).

## Recommended Approach

- One service per resource: `FestivalService`, `ArtistService`, `VenueService`.
- Return `Signal<T>` via `toSignal()` for components; expose raw `Observable<T>` only when chained operators are needed.
- Centralize the base URL in `environment.ts`.
- Use `HttpResourceRef` (Angular 19+) for declarative resources where possible.

## Zod at the boundary

The **only** place Zod runs is at the HTTP boundary. Once a payload is parsed, the inferred TypeScript type is trusted everywhere downstream — no defensive validation in stores or components.

### Pattern

Each model file declares the Zod schema **and** exports the inferred type. Components and stores import the type; only the service imports the schema.

```ts
// src/app/shared/domain/festival.model.ts
import { z } from 'zod';

export const ProvinciaSchema = z.enum(['Valencia', 'Alicante', 'Castellón']);

export const FestivalSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  nombre: z.string().min(1),
  provincia: ProvinciaSchema,
  ciudad: z.string(),
  fechaInicio: z.string().datetime(),
  fechaFin: z.string().datetime(),
  generos: z.array(z.string()),
  cabezasDeCartel: z.array(z.string()),
  precioDesde: z.number().nonnegative(),
  urlOficial: z.string().url(),
  estado: z.enum(['anunciado', 'entradas-abiertas', 'sold-out', 'en-curso']),
});

export type Festival = z.infer<typeof FestivalSchema>;
```

### Service usage

```ts
// src/app/shared/data-access/festival.service.ts
@Injectable({ providedIn: 'root' })
export class FestivalService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  list(): Observable<Festival[]> {
    return this.http
      .get<unknown>(`${this.base}/festivals`)
      .pipe(map((raw) => z.array(FestivalSchema).parse(raw)));
  }
}
```

### Rules

- **Parse, never validate** — use `.parse()` (or `.safeParse()` when the failure is a user-facing concern, not a bug). A failed parse is an error.
- **Schemas live next to types**, in `@shared/domain/` (or a feature's `data-access/`). Never inside services.
- **One schema per DTO**. Compose with `z.object({ ... }).extend(...)`, never duplicate.
- **Never re-validate downstream**. Once parsed, the type is trusted.
- **Coerce, don't convert**: use `z.coerce.date()` for ISO strings that need to become `Date` at the boundary; never do `new Date(x)` later.
- **Discriminated unions** for polymorphic payloads (`z.discriminatedUnion('tipo', [...])`).

### Error mapping

A failed `parse()` throws `ZodError`. The HTTP interceptor catches it and normalizes to the `FestivalError` shape with `code: 'VALIDATION'` (see [[error-handling]]). The user sees a generic "no hemos podido cargar la información" message; the dev sees the full Zod issue path in Sentry.

## Conventions

- `GET /festivals` → list with pagination and filter query params.
- `GET /festivals/:slug` → detail page hydration.
- `GET /festivals/:slug/artists` → line-up.
- All endpoints return ISO-8601 dates; `z.string().datetime()` at the boundary, formatted later by [[internationalization]] via `date-fns`.

## Caching

- Read-only catalogue endpoints get a service-level memoization with stale-while-revalidate.
- Interceptor honors `Cache-Control` headers from Cloudflare's edge.

## Error Handling

Delegated to [[error-handling]] via an `HttpInterceptor` that catches both network errors and `ZodError`s.

---

## Examples

### Service with caching — stale-while-revalidate

```ts
// src/app/shared/data-access/festival.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { map } from 'rxjs/operators';
import { z } from 'zod';
import { environment } from '@env/environment';
import { FestivalSchema } from '@shared/domain/festival.model';
import type { Festival } from '@shared/domain/festival.model';

@Injectable({ providedIn: 'root' })
export class FestivalService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  // Cached for the session — catalogue rarely changes mid-session.
  // shareReplay(1) multicasts to all subscribers without re-fetching.
  private readonly catalogue$ = this.http
    .get<unknown>(`${this.base}/festivals`)
    .pipe(
      map(raw => z.array(FestivalSchema).parse(raw)),
      shareReplay(1),
    );

  list(): Observable<Festival[]> {
    return this.catalogue$;
  }

  getBySlug(slug: string): Observable<Festival> {
    return this.http
      .get<unknown>(`${this.base}/festivals/${slug}`)
      .pipe(map(raw => FestivalSchema.parse(raw)));
  }
}
```

### Interceptor registration in app.config.ts

```ts
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpErrorInterceptor } from '@core/interceptors/http-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([httpErrorInterceptor]),
    ),
    // ... other providers
  ],
};
```

### HttpResource — declarative resource (Angular 19+)

```ts
// Declarative alternative when a single resource is tied to route params
@Component({ /* ... */ })
export class FestivalDetailPageComponent {
  private readonly route = inject(ActivatedRoute);

  // Automatically re-fetches when the slug param changes.
  // Zod parsing happens in the service; the component just reads the resource.
  readonly festivalResource = httpResource<Festival>(() => ({
    url:  `/api/festivals/${this.route.snapshot.params['slug']}`,
    method: 'GET',
  }));

  readonly festival = this.festivalResource.value;   // Signal<Festival | undefined>
  readonly loading  = this.festivalResource.isLoading; // Signal<boolean>
}
```

## Related skills

- [[state-management]]
- [[error-handling]]
- [[sanity-cms]]
- [[project-structure]]
