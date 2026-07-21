---
name: search
description: >-
  ROADMAP SPEC — the search feature is not implemented yet (MiniSearch is not installed).
  Client-side fuzzy search over the festival catalogue with MiniSearch: field boosts on nombre and
  cabezasDeCartel, diacritic-stripping for Spanish. Use when building or tuning search and
  autocomplete; treat this as the design contract for that future work.
---

# 🔎 Search

Client-side fuzzy search over the festival catalogue using **MiniSearch**.

## Purpose

Provide instant, typo-tolerant search across festivals and artists without standing up a search backend. The catalogue is small (tens of festivals, hundreds of artists) and rarely changes mid-session, so client-side indexing is the right tool — Algolia or Typesense would be overkill.

## Why MiniSearch (not Fuse.js)

MiniSearch supports inverted indexes, prefix search, and **per-field boosting** — critical for our model. A user typing `"rosalia"` should surface the festival where Rosalía is on the line-up, not a festival whose name happens to contain that substring. Fuse.js does fuzzy matching but lacks field weighting.

Bundle cost: ~7 KB gzipped, no runtime deps.

## Scope

- A single `SearchService` exposing `search(query: string): SearchResult[]`.
- An index built once at app bootstrap from the festival catalogue.
- Re-built when the catalogue store emits a fresh list.

## Index shape

```ts
// src/app/shared/data-access/search.service.ts
import MiniSearch from 'minisearch';
import { Festival } from '@shared/domain/festival.model';

interface SearchableFestival {
  id: string;          // slug
  nombre: string;
  ciudad: string;
  provincia: string;
  generos: string;     // joined for tokenization
  cartel: string;      // joined headliners + supporting artists
}

const index = new MiniSearch<SearchableFestival>({
  fields: ['nombre', 'cartel', 'ciudad', 'generos', 'provincia'],
  storeFields: ['id'],
  searchOptions: {
    boost: { nombre: 3, cartel: 2.5, ciudad: 1, provincia: 0.5, generos: 1 },
    prefix: true,
    fuzzy: 0.2,
    combineWith: 'AND',
  },
  // Spanish-friendly tokenizer: lowercase, strip diacritics
  processTerm: (term) =>
    term
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, ''),
});
```

## Rules

- The index is built **once** per session and stored in the `SearchService`. Components never instantiate `MiniSearch` directly.
- The catalogue is the source of truth; the index is derived. If the catalogue updates, the service rebuilds the index — there is no incremental update path that components can trigger.
- **Strip diacritics on both sides** (term and query) so `"rosalia"` matches `"Rosalía"`. The `processTerm` hook above handles indexing; the search method must apply the same transform to the query.
- Boost weights are tuned for festival queries: `nombre > cartel > ciudad > generos > provincia`. Adjust only with measured user feedback.
- `fuzzy: 0.2` allows ~1 character difference per 5 — enough for typos, not so loose that it surfaces noise.
- `combineWith: 'AND'` means multi-word queries narrow results (`"medusa cullera"` returns only Medusa Festival).

## API contract for components

```ts
interface SearchResult {
  slug: string;        // festival slug
  score: number;       // relevance, descending
  matchedFields: string[];
}

search(query: string): SearchResult[];
```

Components receive only slugs and resolve them against the catalogue store — the service never exposes raw `Festival` objects, keeping search and data layers decoupled.

## Debouncing

Debouncing lives in the **component**, not the service. The `SearchBarComponent` (see [[ui-components]]) debounces input at 300 ms before calling `search()`. The service is synchronous and fast.

## SSR considerations

MiniSearch runs in any JS runtime, but the index is **not** built during SSR — there is no user query to serve. SSR returns the unfiltered catalogue; the index hydrates on the client during `APP_INITIALIZER` after the catalogue store has its data.

## When to graduate

If any of these become true, evaluate a server-side search backend (Typesense self-hosted, Meili, or Algolia):

- Catalogue exceeds ~500 festivals.
- Artists become first-class searchable entities with their own pages and need ranking signals beyond name match.
- Multi-language search is needed (Valencian + English + Spanish) with stemming per locale.

Until then, MiniSearch is sufficient.

---

## Examples

### Full SearchService

```ts
// src/app/shared/data-access/search.service.ts
import { Injectable, inject } from '@angular/core';
import MiniSearch from 'minisearch';
import { CatalogueStore } from './catalogue.store';
import type { Festival } from '@shared/domain/festival.model';

interface SearchableDoc {
  id:       string;
  nombre:   string;
  ciudad:   string;
  provincia: string;
  generos:  string;
  cartel:   string;
}

export interface SearchResult {
  slug:          string;
  score:         number;
  matchedFields: string[];
}

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly catalogue = inject(CatalogueStore);
  private readonly index = new MiniSearch<SearchableDoc>({
    fields:       ['nombre', 'cartel', 'ciudad', 'generos', 'provincia'],
    storeFields:  ['id'],
    searchOptions: {
      boost:       { nombre: 3, cartel: 2.5, ciudad: 1, provincia: 0.5, generos: 1 },
      prefix:      true,
      fuzzy:       0.2,
      combineWith: 'AND',
    },
    processTerm: normalize,
  });

  // Called from APP_INITIALIZER after CatalogueStore.load()
  buildIndex(festivals: Festival[]): void {
    this.index.removeAll();
    this.index.addAll(festivals.map(this.toDoc));
  }

  search(query: string): SearchResult[] {
    if (!query.trim()) return [];
    return this.index
      .search(normalize(query))
      .map(r => ({ slug: r.id, score: r.score, matchedFields: r.match ? Object.keys(r.match) : [] }));
  }

  private toDoc(f: Festival): SearchableDoc {
    return {
      id:        f.slug,
      nombre:    f.nombre,
      ciudad:    f.ciudad,
      provincia: f.provincia,
      generos:   f.generos.join(' '),
      cartel:    f.cartel.map(a => a.nombre).join(' '),
    };
  }
}
```

### SearchBarComponent — debounce in the component

```ts
// src/app/shared/ui/search-bar/search-bar.ts
@Component({
  selector: 'fv-search-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslatePipe],
  template: `
    <label class="sr-only" for="search">{{ 'search.label' | t }}</label>
    <input
      id="search"
      type="search"
      [formControl]="queryControl"
      [placeholder]="'search.placeholder' | t"
      autocomplete="off"
    />
  `,
})
export class SearchBarComponent implements OnInit {
  private readonly searchService = inject(SearchService);
  readonly results = output<SearchResult[]>();

  readonly queryControl = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.queryControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(q => this.results.emit(this.searchService.search(q)));
  }
}
```

## Related skills

- [[state-management]]
- [[internationalization]]
