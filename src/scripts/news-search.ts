// ============================================================================
// news-search.ts — TuriaFestNoticias · news hub filtering island
// ============================================================================
// News hub behaviour: reads `?buscar=` from the URL,
// filters the server-rendered article cards with the MiniSearch index (built
// from per-language strings embedded in `#news-search-docs`), updates the
// summary / empty-state and re-runs on `fv:langchange` and `popstate`.
// ============================================================================

import { NewsSearchService, type NewsSearchDocument } from '@data/news-search';
import { DEFAULT_LANG, isLangCode } from '@i18n/index';
import { getActiveLang, interpolate, translateKey } from './i18n';

interface SearchDocsEntry {
  readonly id: string;
  readonly slug: string;
  readonly es: NewsSearchDocument;
  readonly ca: NewsSearchDocument;
  readonly en: NewsSearchDocument;
}

function readDocs(): readonly SearchDocsEntry[] {
  const script = document.getElementById('news-search-docs');
  if (!script?.textContent) return [];
  try {
    return JSON.parse(script.textContent) as SearchDocsEntry[];
  } catch {
    return [];
  }
}

function readActiveQuery(): string {
  return new URLSearchParams(window.location.search).get('buscar')?.trim() ?? '';
}

export function initNewsSearch(): void {
  const docs = readDocs();
  if (!docs.length) return;

  const service = new NewsSearchService();
  const entries = [...document.querySelectorAll<HTMLElement>('[data-news-article]')];
  const summary = document.querySelector<HTMLElement>('[data-testid="news-search-summary"]');
  const emptyState = document.querySelector<HTMLElement>('[data-testid="news-search-empty"]');
  const summaryText = document.querySelector<HTMLElement>('[data-testid="news-search-summary-text"]');

  function buildIndex(lang: string): void {
    const langKey = isLangCode(lang) ? lang : DEFAULT_LANG;
    service.buildIndex(
      docs.map((entry) => ({
        id: entry.id,
        title: entry[langKey].title,
        city: entry[langKey].city,
        genres: entry[langKey].genres,
      })),
    );
  }

  function apply(): void {
    const query = readActiveQuery();
    const results = query ? service.search(query) : [];
    const matchingIds = new Set(results.map((result) => result.id));

    for (const entry of entries) {
      const id = entry.dataset['newsArticle'] ?? '';
      entry.hidden = query !== '' && !matchingIds.has(id);
    }

    if (summary && summaryText) {
      const showingResults = query !== '';
      summary.hidden = !showingResults;
      if (showingResults) {
        summaryText.textContent = interpolate(translateKey('news.search.results'), { query });
      }
    }

    if (emptyState) {
      emptyState.hidden = !(query !== '' && results.length === 0);
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
