# Test examples (Vitest, ATL, Zod)

> Reference for the [[testing-patterns]] skill — extracted from `SKILL.md` for progressive disclosure.

## Examples

### Vitest — service unit test

```ts
// src/app/shared/data-access/festival.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FestivalService } from './festival.service';
import { FestivalSchema } from '@shared/domain/festival.model';

const FESTIVAL_FIXTURE = {
  slug: 'fib-benicassim', nombre: 'FIB', provincia: 'Castellón',
  ciudad: 'Benicàssim', fechaInicio: '2026-07-15T00:00:00.000Z',
  fechaFin: '2026-07-18T00:00:00.000Z', generos: ['indie', 'rock'],
  cartel: [], precioDesde: 89, urlOficial: 'https://fiberfib.com',
  poster: { src: '/assets/images/festivals/fib-2026.webp', alt: 'Cartel FIB 2026' },
  ubicacion: { lat: 39.999, lng: -0.075 }, estado: 'entradas-abiertas',
  cabezasDeCartel: ['Foo Fighters'],
};

describe('FestivalService', () => {
  let service: FestivalService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FestivalService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('returns parsed Festival[] on success', () => {
    let result: unknown;
    service.list().subscribe(v => (result = v));

    http.expectOne('/api/festivals').flush([FESTIVAL_FIXTURE]);

    expect(result).toHaveLength(1);
    expect((result as { slug: string }[])[0].slug).toBe('fib-benicassim');
  });

  it('throws FestivalError on 404', () => {
    let error: unknown;
    service.list().subscribe({ error: e => (error = e) });

    http.expectOne('/api/festivals').flush(null, { status: 404, statusText: 'Not Found' });

    expect((error as { code: string }).code).toBe('NOT_FOUND');
  });
});
```

### Angular Testing Library — component test

```ts
// src/app/shared/ui/festival-card/festival-card.spec.ts
import { render, screen } from '@testing-library/angular';
import { FestivalCardComponent } from './festival-card';
import { provideRouter } from '@angular/router';

const FESTIVAL = {
  slug: 'medusa-festival', nombre: 'Medusa Festival',
  ciudad: 'Cullera', provincia: 'Valencia', precioDesde: 120,
  poster: { src: '/assets/images/festivals/medusa-2026.webp', alt: 'Medusa 2026' },
  // ... other required fields
} as Festival;

describe('FestivalCardComponent', () => {
  it('renders festival name and city', async () => {
    await render(FestivalCardComponent, {
      inputs: { festival: FESTIVAL },
      providers: [provideRouter([])],
    });

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Medusa Festival');
    expect(screen.getByText('Cullera')).toBeInTheDocument();
  });

  it('links to the festival detail route', async () => {
    await render(FestivalCardComponent, {
      inputs: { festival: FESTIVAL },
      providers: [provideRouter([])],
    });

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/festivales/medusa-festival');
  });

  it('uses data-testid for stable selection', async () => {
    const { container } = await render(FestivalCardComponent, {
      inputs: { festival: FESTIVAL },
      providers: [provideRouter([])],
    });

    expect(container.querySelector('[data-testid="festival-card-medusa-festival"]')).toBeTruthy();
  });
});
```

### Zod schema test

```ts
// src/app/shared/domain/festival.model.spec.ts
import { FestivalSchema } from './festival.model';

const VALID = { /* same as FESTIVAL_FIXTURE above */ };

describe('FestivalSchema', () => {
  it('parses a valid festival', () => {
    expect(() => FestivalSchema.parse(VALID)).not.toThrow();
  });

  it('rejects an invalid provincia', () => {
    const result = FestivalSchema.safeParse({ ...VALID, provincia: 'Madrid' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('provincia');
  });

  it('rejects a negative price', () => {
    const result = FestivalSchema.safeParse({ ...VALID, precioDesde: -10 });
    expect(result.success).toBe(false);
  });
});
```
