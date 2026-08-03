---
name: search
description: >-
  Client-side fuzzy search over the news feed (implemented) and the future festival catalogue
  (roadmap) with MiniSearch: field boosts on title/nombre and cartel, diacritic-stripping for
  Spanish, index built from per-article/per-festival data embedded in the page. Use when building
  or tuning search and autocomplete.
---

# 🔎 Search

Client-side fuzzy search using **MiniSearch**, driven by a page-embedded index rather than a live service call.

## Purpose

Provide instant, typo-tolerant search across news articles (and, on the roadmap, festivals and artists) without standing up a search backend. The catalogue is small (tens of festivals/articles, hundreds of artists) and rarely changes mid-session, so client-side indexing is the right tool — Algolia or Typesense would be overkill.

## Status

- **Implemented**: news hub search (`/noticias`) — `src/data/news-search.ts` (the `NewsSearchService` class) + `src/scripts/news-search.ts` (the page island that wires it to the DOM and the URL).
- **Roadmap**: the same pattern applied to the festival catalogue and artist line-ups once those routes exist (see `Festival`/`Artist` shapes in `.claude/CLAUDE.md`).

## Why MiniSearch (not Fuse.js)

MiniSearch supports inverted indexes, prefix search, and **per-field boosting** — critical for our model. A user typing `"rosalia"` should surface the festival where Rosalía is on the line-up, not a festival whose name happens to contain that substring. Fuse.js does fuzzy matching but lacks field weighting.

Bundle cost: ~7 KB gzipped, no runtime deps — safe for a client island in a static Astro build with no framework overhead.

## Architecture — why the index is built from embedded data, not a live store

There is no Angular-style singleton service or app-wide store to hold catalogue data client-side. Instead:

- Astro renders the page **statically**, with the searchable fields for every article (or festival) serialized into a `<script type="application/json" id="news-search-docs">` tag (see `src/pages/noticias/index.astro`).
- The page island (`src/scripts/news-search.ts`) reads that JSON once on load, builds a `MiniSearch` index in memory via `NewsSearchService`, and never calls back to a server.
- Because the same JSON carries all three locales, the index is **rebuilt** (not fetched again) whenever the active language changes.

## Index shape

```ts
// src/data/news-search.ts
export interface NewsSearchDocument {
  readonly id: string;
  readonly title: string;
  readonly city: string;
  readonly genres: string;
}

export interface NewsSearchResult {
  readonly id: string;
  readonly score: number;
  readonly matchedFields: readonly string[];
}

export function normalizeSearchTerm(term: string): string {
  return term
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}
```

The roadmap festival/artist index follows the same shape with additional boosted fields (`nombre`, `cartel`, `provincia`) — see the "Full SearchService" example below for the target shape once `/festivales` ships.

## Rules

- The index is built **once per page load** (and rebuilt on language change) inside the relevant island. Nothing outside `src/scripts/` or `src/data/*-search.ts` instantiates `MiniSearch` directly.
- Embedded JSON (`#news-search-docs` and its future festival equivalent) is the source of truth for the client; there is no incremental update path — a new build re-serializes it.
- **Strip diacritics on both sides** (term and query) so `"rosalia"` matches `"Rosalía"`. `normalizeSearchTerm()` handles indexing; `NewsSearchService.search()` applies the same transform to the query before searching.
- Boost weights are tuned for the domain: `title/nombre > cartel > ciudad > generos > provincia`. Adjust only with measured user feedback.
- `fuzzy: 0.2` allows ~1 character difference per 5 — enough for typos, not so loose that it surfaces noise.
- `combineWith: 'AND'` means multi-word queries narrow results (`"medusa cullera"` returns only Medusa Festival, once the festival index exists).

## API contract

```ts
export interface NewsSearchResult {
  readonly id: string;         // article id / future festival slug
  readonly score: number;      // relevance, descending
  readonly matchedFields: readonly string[];
}

search(query: string): readonly NewsSearchResult[];
```

Callers (page islands) receive only `id`/`slug` and resolve them against the already-rendered DOM cards (`document.querySelectorAll('[data-news-article]')`) or, on the roadmap, the festival catalogue module — the search service never re-renders content itself, keeping search and presentation decoupled.

## Debouncing and URL state

Debouncing and the "active query" state live in the **page island**, not the search service, mirroring `src/scripts/news-search.ts`:

- The active query is read from `?buscar=` in the URL (`readActiveQuery()`), not from component state — this makes search results shareable/bookmarkable and keeps the island stateless across `popstate` navigations.
- Debouncing on the text input uses a hand-rolled `setTimeout`/`clearTimeout` pair (see [[forms-validation]] for the exact snippet) before updating the URL and re-running `apply()`.
- `NewsSearchService.search()` itself is synchronous and fast; no debouncing happens inside it.

## SSR / static-build considerations

MiniSearch runs in any JS runtime, but the index is **never built at build time** — there is no user query to serve during static generation. Astro renders the full, unfiltered list of cards; the island builds the index in the browser on `DOMContentLoaded` and applies filtering only if `?buscar=` is present, so the page is fully usable and indexable by search engines with JavaScript disabled.

## When to graduate

If any of these become true, evaluate a server-side search backend (Typesense self-hosted, Meili, or Algolia):

- Catalogue exceeds ~500 festivals/articles.
- Artists become first-class searchable entities with their own pages and need ranking signals beyond name match.
- Multi-language search is needed with stemming per locale (today it's diacritic-stripping only).

Until then, MiniSearch is sufficient.

---

## Examples

### Full NewsSearchService (implemented)

```ts
// src/data/news-search.ts
import MiniSearch from 'minisearch';

export class NewsSearchService {
  readonly #index = new MiniSearch<NewsSearchDocument>({
    fields: ['title', 'city', 'genres'],
    storeFields: ['id'],
    searchOptions: {
      boost: { title: 3, city: 1.5, genres: 1 },
      prefix: true,
      fuzzy: 0.2,
      combineWith: 'AND',
    },
    processTerm: normalizeSearchTerm,
  });

  buildIndex(documents: readonly NewsSearchDocument[]): void {
    this.#index.removeAll();
    this.#index.addAll([...documents]);
  }

  search(query: string): readonly NewsSearchResult[] {
    const normalizedQuery = normalizeSearchTerm(query.trim());
    if (!normalizedQuery) return [];

    return this.#index.search(normalizedQuery).map((result) => ({
      id: String(result.id),
      score: result.score,
      matchedFields: Array.from(new Set(Object.values(result.match).flat())),
    }));
  }
}
```

### News hub island — embedded data, URL-driven query, language-aware rebuild (implemented)

```ts
// src/scripts/news-search.ts (excerpt)
import { NewsSearchService, type NewsSearchDocument } from '@data/news-search';
import { getActiveLang, interpolate, translateKey } from './i18n';

export function initNewsSearch(): void {
  const docs = readDocs(); // parsed from <script id="news-search-docs">
  if (!docs.length) return;

  const service = new NewsSearchService();
  const entries = [...document.querySelectorAll<HTMLElement>('[data-news-article]')];

  function buildIndex(lang: string): void {
    service.buildIndex(docs.map((entry) => toDocForLang(entry, lang)));
  }

  function apply(): void {
    const query = readActiveQuery(); // from ?buscar=
    const results = query ? service.search(query) : [];
    const matchingIds = new Set(results.map((r) => r.id));

    for (const entry of entries) {
      const id = entry.dataset['newsArticle'] ?? '';
      entry.hidden = query !== '' && !matchingIds.has(id);
    }
  }

  buildIndex(getActiveLang());
  apply();

  window.addEventListener('fv:langchange', () => {
    buildIndex(getActiveLang());
    apply();
  });
  window.addEventListener('popstate', apply);
}
```

### Roadmap: festival catalogue index (target shape once `/festivales` ships)

```ts
// src/data/festival-search.ts (roadmap)
import MiniSearch from 'minisearch';
import type { Festival } from '@data/festival.model';
import { normalizeSearchTerm } from './news-search';

interface FestivalSearchDocument {
  id: string;          // slug
  nombre: string;
  ciudad: string;
  provincia: string;
  generos: string;     // joined for tokenization
  cartel: string;       // joined headliners + supporting artists
}

export class FestivalSearchService {
  readonly #index = new MiniSearch<FestivalSearchDocument>({
    fields: ['nombre', 'cartel', 'ciudad', 'generos', 'provincia'],
    storeFields: ['id'],
    searchOptions: {
      boost: { nombre: 3, cartel: 2.5, ciudad: 1, provincia: 0.5, generos: 1 },
      prefix: true,
      fuzzy: 0.2,
      combineWith: 'AND',
    },
    processTerm: normalizeSearchTerm,
  });

  buildIndex(festivals: readonly Festival[]): void {
    this.#index.removeAll();
    this.#index.addAll(festivals.map(toDoc));
  }

  search(query: string) {
    const normalized = normalizeSearchTerm(query.trim());
    if (!normalized) return [];
    return this.#index.search(normalized);
  }
}

function toDoc(f: Festival): FestivalSearchDocument {
  return {
    id: f.slug,
    nombre: f.nombre,
    ciudad: f.ciudad,
    provincia: f.provincia,
    generos: f.generos.join(' '),
    cartel: f.cartel.map((a) => a.nombre).join(' '),
  };
}
```

## Related skills

- [[forms-validation]]
- [[internationalization]]
