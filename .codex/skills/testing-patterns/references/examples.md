# Test examples (Vitest + jsdom)

> Reference for the [[testing-patterns]] skill — extracted from `SKILL.md` for progressive disclosure.

## Examples

### Vitest — pure-domain unit test

Framework-agnostic modules under `src/data`, `src/lib`, `src/i18n` are plain TypeScript — no DOM, no HTTP, no framework harness needed. Import the module and assert directly.

```ts
// src/data/news-search.spec.ts
import { describe, it, expect } from 'vitest';

import { NewsSearchService, type NewsSearchDocument } from './news-search';

describe('NewsSearchService', () => {
  const articles: readonly NewsSearchDocument[] = [
    {
      id: 'article-one',
      title: 'La primera noticia de TuriaFestNoticias',
      city: 'València',
      genres: 'electrónica techno',
    },
    {
      id: 'article-two',
      title: 'El pop vuelve a Alicante',
      city: 'Alicante',
      genres: 'pop',
    },
  ];

  function createService(): NewsSearchService {
    const service = new NewsSearchService();
    service.buildIndex(articles);
    return service;
  }

  it('finds articles by title', () => {
    expect(
      createService()
        .search('primera')
        .map((result) => result.id),
    ).toEqual(['article-one']);
  });

  it('finds articles by city without requiring diacritics', () => {
    expect(
      createService()
        .search('Valencia')
        .map((result) => result.id),
    ).toEqual(['article-one']);
  });

  it('returns no results for blank or unrelated queries', () => {
    const service = createService();

    expect(service.search('')).toEqual([]);
    expect(service.search('rock')).toEqual([]);
  });
});
```

Real file: `src/data/news-search.spec.ts`.

### Vitest + jsdom — island / DOM test with mocked browser globals

Client islands (`src/scripts/*`) touch `window`, `document`, and `localStorage`. Mock those globals explicitly, exercise the exported functions against `document.documentElement` (jsdom provides it automatically), and **always restore the mock in `afterEach`** so it never leaks into the next spec.

```ts
// src/lib/theme.spec.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  applyTheme,
  resolveTheme,
  type ThemeMode,
} from '@lib/theme';

interface FakeMediaQueryList {
  matches: boolean;
  media: string;
  addEventListener(type: 'change', cb: (e: { matches: boolean }) => void): void;
  removeEventListener(type: 'change', cb: (e: { matches: boolean }) => void): void;
  dispatch(next: boolean): void;
}

function mockPrefersDark(matches: boolean): FakeMediaQueryList {
  const listeners = new Set<(e: { matches: boolean }) => void>();
  const mql: FakeMediaQueryList = {
    matches,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_type, cb) => void listeners.add(cb),
    removeEventListener: (_type, cb) => void listeners.delete(cb),
    dispatch(next: boolean) {
      mql.matches = next;
      listeners.forEach((cb) => cb({ matches: next }));
    },
  };
  (window as unknown as { matchMedia: (q: string) => FakeMediaQueryList }).matchMedia = () => mql;
  return mql;
}

function dataTheme(): string | null {
  return document.documentElement.getAttribute('data-theme');
}

describe('theme lib', () => {
  const realMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    window.matchMedia = realMatchMedia; // restore so the mock never leaks to other specs
  });

  it('resolves system mode against the device preference', () => {
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('system', true)).toBe('dark');
  });

  it('defaults to system and resolves light when the device is light', () => {
    mockPrefersDark(false);
    const resolved = applyTheme(document.documentElement, 'system', false, localStorage);

    expect(resolved).toBe('light');
    expect(dataTheme()).toBeNull(); // system → no attribute, CSS media query governs
  });
});
```

Real file: `src/lib/theme.spec.ts`.

### i18n resolver test

The i18n resolver (`src/i18n/index.ts`) is the one place where asserting against literal Spanish dictionary values is correct — the resolver itself is under test, not a downstream consumer of it.

```ts
// src/i18n/index.spec.ts
import { describe, it, expect } from 'vitest';

import { ES_TRANSLATIONS } from '@i18n/translations';
import { DEFAULT_LANG, getLanguage, interpolate, isLangCode, LANGUAGES, t } from '@i18n/index';

describe('i18n translator', () => {
  it('exposes the three supported locales in order', () => {
    expect(LANGUAGES.map((lang) => lang.code)).toEqual(['es', 'ca', 'en']);
    expect(DEFAULT_LANG).toBe('es');
  });

  it('resolves dotted keys from the Spanish source dictionary', () => {
    expect(t('nav.home', ES_TRANSLATIONS)).toBe('Inicio');
  });

  it('interpolates named params with {{ key }} placeholders', () => {
    const template = 'Resultados para «{{ query }}»';
    expect(interpolate(template, { query: 'Zevra' })).toBe('Resultados para «Zevra»');
  });
});
```

Real file: `src/i18n/index.spec.ts`.

### SEO builder test

`src/lib/seo.ts` is pure TypeScript that builds canonical URLs, Open Graph tags, and JSON-LD — no DOM required, assert on the returned object.

```ts
// src/lib/seo.spec.ts
import { describe, it, expect } from 'vitest';

import { NEWS_ARTICLES } from '@data/news.catalogue';
import { buildArticleSeo, buildListingSeo } from '@lib/seo';

describe('seo lib', () => {
  it('builds the listing head with an absolute canonical for /noticias', () => {
    const article = NEWS_ARTICLES[0];
    const seo = buildListingSeo({
      title: 'TuriaFest — Noticias',
      description: 'Descripción de la lista',
      image: article.socialImage,
      imageAlt: 'Alt',
    });

    expect(seo.canonical).toBe('https://turia-fest-noticias.rngheru.workers.dev/noticias');
    expect(seo.og.type).toBe('website');
  });

  it('builds the article head with NewsArticle JSON-LD', () => {
    const article = NEWS_ARTICLES[0];
    const seo = buildArticleSeo(article, {
      title: 'Título SEO',
      description: 'Descripción SEO',
      headline: 'Titular',
      author: 'TuriaFest',
      category: 'Festivales',
      breadcrumbLabel: 'Noticias',
      language: 'es-ES',
      image: article.socialImage,
      imageAlt: 'Alt',
    });

    const graph = JSON.parse(seo.jsonLd ?? '{}') as {
      '@graph': Array<Record<string, unknown>>;
    };
    expect(graph['@graph'].some((node) => node['@type'] === 'NewsArticle')).toBe(true);
  });
});
```

Real file: `src/lib/seo.spec.ts`.

### Zod schema test (roadmap)

Once a remote DTO is introduced (see [[api-integration]]), validate it with a Zod schema at the boundary and test both the happy and failure paths. No Zod schema exists in the codebase yet — this is the target shape for when one lands (e.g. the roadmap `Festival` entity):

```ts
// src/data/festival.model.spec.ts
import { describe, it, expect } from 'vitest';

import { FestivalSchema } from './festival.model';

const VALID = {
  slug: 'fib-benicassim',
  nombre: 'FIB',
  provincia: 'Castellón',
  ciudad: 'Benicàssim',
  fechaInicio: '2026-07-15T00:00:00.000Z',
  fechaFin: '2026-07-18T00:00:00.000Z',
  generos: ['indie', 'rock'],
  cartel: [],
  precioDesde: 89,
  urlOficial: 'https://fiberfib.com',
  poster: { src: '/assets/images/festivals/fib-2026.webp', alt: 'Cartel FIB 2026' },
  ubicacion: { lat: 39.999, lng: -0.075 },
};

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
