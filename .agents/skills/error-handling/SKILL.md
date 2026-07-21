---
name: error-handling
description: >-
  Normalised FestivalError model, an HttpInterceptor plus a global ErrorHandler, Sentry reporting
  and user-facing messages via i18n. Use when handling failures, surfacing errors to users, or
  wiring error monitoring.
---

# 🛑 Error Handling

Unified error capture, presentation, and reporting for **TuriaFestNoticias**.

## Purpose

Make failures (network, validation, runtime) predictable for the user and observable for the developer.

## Layers

1. **HTTP errors** — normalized by an `HttpErrorInterceptor` into a `FestivalError` shape:
   ```ts
   interface FestivalError {
     code: 'NETWORK' | 'NOT_FOUND' | 'SERVER' | 'VALIDATION';
     message: string;        // i18n key
     correlationId?: string;
     issues?: { path: string; message: string }[];  // populated for Zod failures
   }
   ```
   `ZodError` instances thrown by [[api-integration]] are caught here and mapped to `code: 'VALIDATION'`. Issue paths go into Sentry, never to the user.
2. **Global runtime errors** — handled by a custom `ErrorHandler` that logs to console in dev and forwards to **Sentry** in production.
3. **Form errors** — surfaced inline via the [[forms-validation]] skill.
4. **Route errors** — `/404` and `/error` routes with friendly Spanish messaging.

## User-Facing Messages

- Never expose stack traces.
- Always provide a recovery action ("Reintentar", "Volver al inicio").
- Use the `<festival-toast>` component for transient errors.

## Observability

- **Sentry** is the canonical frontend error monitor. Initialized in `app.config.ts`, gated by `environment.production`.
- Tag every event with `route`, `locale`, and (when available) `festivalSlug` for triage.
- Use Sentry's `beforeSend` to drop noisy errors (extension-injected scripts, cancelled navigations) so the event budget is spent on real bugs.
- Source maps uploaded at build time via the Sentry CLI in the Cloudflare Pages deploy step.

---

## Examples

### HttpErrorInterceptor — normalize errors to FestivalError

```ts
// src/app/core/interceptors/http-error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ZodError } from 'zod';
import type { FestivalError } from '@shared/domain/festival-error.model';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((err: unknown) => {
      const festivalError: FestivalError = toFestivalError(err);
      return throwError(() => festivalError);
    }),
  );

function toFestivalError(err: unknown): FestivalError {
  if (err instanceof ZodError) {
    return {
      code: 'VALIDATION',
      message: 'errors.validation.message',
      issues: err.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
    };
  }
  if (err instanceof HttpErrorResponse) {
    if (err.status === 404) return { code: 'NOT_FOUND', message: 'errors.notFound.message' };
    if (err.status === 0)   return { code: 'NETWORK',   message: 'errors.network.message' };
    return { code: 'SERVER', message: 'errors.server.message' };
  }
  return { code: 'SERVER', message: 'errors.server.message' };
}
```

```ts
// Registered in app.config.ts
provideHttpClient(withInterceptors([httpErrorInterceptor])),
```

### Custom ErrorHandler — dev console + Sentry in prod

```ts
// src/app/core/handlers/festival-error-handler.ts
import { ErrorHandler, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '@env/environment';
import * as Sentry from '@sentry/angular';

@Injectable()
export class FestivalErrorHandler implements ErrorHandler {
  private readonly platformId = inject(PLATFORM_ID);

  handleError(error: unknown): void {
    if (!isPlatformBrowser(this.platformId)) return;

    console.error('[TuriaFestNoticias]', error);

    if (environment.production) {
      Sentry.captureException(error);
    }
  }
}
```

```ts
// app.config.ts
providers: [
  { provide: ErrorHandler, useClass: FestivalErrorHandler },
]
```

### User-facing error in a component — toast + retry

```ts
// In a smart page component
@Component({ /* ... */ })
export class FestivalListPageComponent {
  private readonly service = inject(FestivalService);
  readonly error = signal<FestivalError | null>(null);

  load(): void {
    this.service.list().subscribe({
      next:  festivals => this.catalogue.set(festivals),
      error: (err: FestivalError) => this.error.set(err),
    });
  }
}
```

```html
<!-- Template — show error state with retry CTA -->
@if (error()) {
  <fv-empty-state
    icon="wifi-off"
    [title]="error()!.message | t"
    [action]="'errors.retry' | t"
    (actionClick)="load()"
  />
}

## Related skills

- [[api-integration]]
- [[internationalization]]
