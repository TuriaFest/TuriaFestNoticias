import { Injectable, signal } from '@angular/core';
import MiniSearch from 'minisearch';

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

function normalizeSearchTerm(term: string): string {
  return term
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

@Injectable({ providedIn: 'root' })
export class NewsSearchService {
  readonly #revision = signal(0);
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
    this.#revision.update((revision) => revision + 1);
  }

  search(query: string): readonly NewsSearchResult[] {
    this.#revision();
    const normalizedQuery = normalizeSearchTerm(query.trim());
    if (!normalizedQuery) return [];

    return this.#index.search(normalizedQuery).map((result) => ({
      id: String(result.id),
      score: result.score,
      matchedFields: Array.from(new Set(Object.values(result.match).flat())),
    }));
  }
}
