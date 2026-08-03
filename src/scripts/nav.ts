// ============================================================================
// nav.ts — TuriaFestNoticias · NavBar interaction island
// ============================================================================
// Ports the Angular NavBar behaviours: language menu (open/close, click
// outside, Escape), search panel toggle + focused submit, and language
// selection. The submit keeps the native GET form navigation to
// `/noticias?buscar=…` — only the empty-query guard is intercepted.
// ============================================================================

import { getActiveLang, initI18n, selectLanguage } from './i18n';
import { initTheme } from './theme';

function closeOverlays(
  langMenu: HTMLElement,
  searchForm: HTMLElement,
  langTrigger: HTMLButtonElement,
  searchButton: HTMLButtonElement,
): void {
  langMenu.setAttribute('hidden', '');
  langTrigger.setAttribute('aria-expanded', 'false');
  searchForm.setAttribute('hidden', '');
  searchButton.setAttribute('aria-expanded', 'false');
}

export function initNav(): void {
  const langTrigger = document.querySelector<HTMLButtonElement>(
    '[data-testid="nav-btn-language"]',
  );
  const langMenu = document.querySelector<HTMLElement>('[data-testid="nav-language-menu"]');
  const langSelector = document.querySelector<HTMLElement>('[data-testid="nav-language-selector"]');
  const searchButton = document.querySelector<HTMLButtonElement>('[data-testid="nav-btn-buscar"]');
  const searchForm = document.querySelector<HTMLFormElement>('#nav-news-search');
  const searchInput = document.querySelector<HTMLInputElement>('[data-testid="nav-search-input"]');

  if (langTrigger && langMenu) {
    langTrigger.addEventListener('click', () => {
      const opening = langMenu.hasAttribute('hidden');
      closeOverlays(langMenu, searchForm as HTMLElement, langTrigger, searchButton as HTMLButtonElement);
      if (opening) {
        langMenu.removeAttribute('hidden');
        langTrigger.setAttribute('aria-expanded', 'true');
      }
    });

    for (const option of langMenu.querySelectorAll<HTMLButtonElement>('[data-lang-option]')) {
      option.addEventListener('click', () => {
        void selectLanguage(option.dataset['langOption'] ?? 'es');
        langMenu.setAttribute('hidden', '');
        langTrigger.setAttribute('aria-expanded', 'false');
      });
    }
  }

  if (langSelector) {
    document.addEventListener('click', (event) => {
      if (langMenu?.hasAttribute('hidden')) return;
      if (!langSelector.contains(event.target as Node)) {
        closeOverlays(
          langMenu as HTMLElement,
          searchForm as HTMLElement,
          langTrigger as HTMLButtonElement,
          searchButton as HTMLButtonElement,
        );
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeOverlays(
        langMenu as HTMLElement,
        searchForm as HTMLElement,
        langTrigger as HTMLButtonElement,
        searchButton as HTMLButtonElement,
      );
    }
  });

  if (searchButton && searchForm) {
    searchButton.addEventListener('click', () => {
      closeOverlays(
        langMenu as HTMLElement,
        searchForm,
        langTrigger as HTMLButtonElement,
        searchButton,
      );
      searchForm.removeAttribute('hidden');
      searchButton.setAttribute('aria-expanded', 'true');
      queueMicrotask(() => searchInput?.focus());
    });

    searchForm.addEventListener('submit', (event) => {
      const query = searchInput?.value.trim() ?? '';
      if (!query) {
        event.preventDefault();
        searchInput?.focus();
      }
    });
  }

  void initI18n();
  initTheme();
}
