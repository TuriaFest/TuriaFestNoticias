// ============================================================================
// news-search.ts — TuriaFestNoticias · news hub client-side search
// ============================================================================
// News search: MiniSearch index
// over the news catalogue, diacritic-insensitive for Spanish. The news hub
// island builds the index from per-article data embedded in the page and
// re-builds it when the active language changes.
// ============================================================================

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

export function normalizeSearchTerm(term: string): string {
  return term
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

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
