---
name: state-management
description: >-
  Island-local state and framework-agnostic persistence patterns for TuriaFestNoticias: module-level
  state in src/lib and src/scripts, localStorage/idb-keyval persistence of theme, language and
  (roadmap) favourites/filters. Use when introducing or changing state in a client island or a
  framework-agnostic module.
---

# 🧠 State Management

Reusable patterns for managing state across the **TuriaFestNoticias** Astro app.

## Purpose

Centralize how the small amount of client-side state — active theme, active language, (roadmap) favourites and filters — is stored, mutated, and consumed, given that the site is static-first and most pages carry **no** client-side state at all.

## Where state lives

There is no store layer like an SPA would have — Astro pages are rendered once at build time and shipped as static HTML. State only exists where a **client island** needs it:

- **Framework-agnostic state helpers** → `src/lib/<name>.ts`. Example: `src/lib/theme.ts` exports pure functions (`resolveTheme`, `applyTheme`, `readStoredMode`, `persistMode`) that compute and mutate theme state without knowing about the DOM event wiring.
- **Island-local state** → `src/scripts/<name>.ts`. Example: `src/scripts/theme.ts` holds the in-memory `mode`/`resolved` variables for the running page and calls into `@lib/theme` to read, resolve, and persist them.

A helper starts inline in the one island that needs it and is promoted to `src/lib/` the moment a **second** island (or a page's inline anti-flicker script) needs the same logic — never earlier. `src/lib/theme.ts` is shared today by the `BaseLayout.astro` inline anti-flicker script and the `theme.ts` island; that is the promotion trigger, not a hypothetical future need.

## Scope

- Theme mode (`light` / `dark` / `system`), resolved against `prefers-color-scheme`.
- Active language (`es` / `ca` / `en`), resolved against a stored preference.
- News search index state (`NewsSearchService` in `src/data/news-search.ts`), rebuilt in-memory whenever the news hub island mounts or the active language changes.
- Roadmap: persisted favourites and filters once the Personalization phase begins.

## Recommended approach

- **Module-level closures or a small class** for state that outlives a single function call within one island (e.g. `NewsSearchService` wraps a MiniSearch instance as private state with `buildIndex()` / `search()` methods).
- **Pure functions in `src/lib/`** for anything that can be expressed as `(currentState, input) => nextState` — these are trivially unit-tested with Vitest, no DOM required.
- **No global mutable singletons shared across islands.** Each island reads its own state from `localStorage`/DOM on mount; islands do not talk to each other directly.

## Persistence

User preferences survive reloads via the browser, never a server session (the site has none):

- **`localStorage`** — trivial scalar preferences: active theme (`fv-theme`, see `THEME_STORAGE_KEY` in `src/lib/theme.ts`), last selected language. Synchronous, tiny, read before first paint by `BaseLayout.astro`'s inline anti-flicker script to avoid a flash of the wrong theme.
- **`idb-keyval` (IndexedDB, roadmap)** — structured or larger data: a future favourites set, cached filter combinations. Asynchronous, no 5 MB string limit. Not installed yet — introduce only when the Personalization phase starts persisting more than scalars.

Persistence always goes through the owning `src/lib/` module (`readStoredMode` / `persistMode` in `theme.ts`), never read or written directly from a `.astro` file or from an island's DOM-handling code. Guard every `localStorage`/`window` access — `src/lib/theme.ts` wraps reads in `try/catch` and accepts `Storage | undefined` so the same functions can be imported (and no-op) in a non-browser context.

## Usage guidelines

1. One module per concern (`src/lib/theme.ts`, `src/i18n/index.ts`'s language state, `src/data/news-search.ts`).
2. Never mutate `localStorage`/`document` from inline code in an island when a named function in `src/lib/` already owns that mutation — call the function.
3. Pure helpers (`resolveTheme`, `normalizeSearchTerm`) must stay side-effect-free so they can be tested without jsdom.
4. Islands read state on `DOMContentLoaded`/module init and re-render the DOM; they never hold a second, divergent copy of `localStorage`'s value.

## Anti-patterns

- Reimplementing theme/i18n persistence logic inside a `<script>` block instead of importing `@lib/theme` / `@i18n`.
- Sharing a mutable object between two unrelated islands via `window.__someGlobal`.
- Reading `localStorage` directly from `.astro` frontmatter (frontmatter runs at build time — there is no browser there; only islands may touch `localStorage`).
- A page's inline `<script>` growing business logic that belongs in `src/lib/` or `src/data/`.

---

## Examples

### Framework-agnostic state helpers — `src/lib/theme.ts`

```ts
// src/lib/theme.ts
export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'fv-theme';

export function resolveTheme(mode: ThemeMode, systemDark: boolean): ResolvedTheme {
  return mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
}

export function readStoredMode(storage: Storage | undefined): ThemeMode | null {
  try {
    const value = storage?.getItem(THEME_STORAGE_KEY) ?? null;
    return value === 'light' || value === 'dark' || value === 'system' ? value : null;
  } catch {
    return null;
  }
}

export function persistMode(storage: Storage | undefined, mode: ThemeMode): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Storage unavailable (private mode / blocked) — non-fatal.
  }
}
```

### Island-local state — `src/scripts/theme.ts`

```ts
// src/scripts/theme.ts — module-level `mode`/`resolved` are this island's only state
import {
  applyTheme,
  isDarkModePreferred,
  readStoredMode,
  watchDarkModePreference,
  type ThemeMode,
} from '@lib/theme';

export function initTheme(): void {
  const view = window;
  const storage = view.localStorage;
  const root = document.documentElement;

  let mode: ThemeMode = readStoredMode(storage) ?? 'system';
  let systemDark = isDarkModePreferred(view);
  let resolved = applyTheme(root, mode, systemDark, storage);

  watchDarkModePreference(view, (dark) => {
    systemDark = dark;
    if (mode === 'system') {
      resolved = applyTheme(root, mode, systemDark, storage);
    }
  });

  document.querySelector('[data-testid="nav-btn-tema"]')?.addEventListener('click', () => {
    mode = resolved === 'dark' ? 'light' : 'dark';
    resolved = applyTheme(root, mode, systemDark, storage);
  });
}
```

### Class-based in-memory index — `src/data/news-search.ts`

```ts
// src/data/news-search.ts
import MiniSearch from 'minisearch';

export class NewsSearchService {
  readonly #index = new MiniSearch({
    fields: ['title', 'city', 'genres'],
    storeFields: ['id'],
    searchOptions: { boost: { title: 3, city: 1.5, genres: 1 }, prefix: true, fuzzy: 0.2 },
  });

  buildIndex(documents: readonly { id: string; title: string; city: string; genres: string }[]): void {
    this.#index.removeAll();
    this.#index.addAll([...documents]);
  }

  search(query: string) {
    return this.#index.search(query);
  }
}
```

### Anti-flicker theme read — inline script in `BaseLayout.astro`

```astro
<script is:inline>
  // Runs before first paint — imports are not available here, so this stays a
  // tiny, deliberately duplicated read of the same THEME_STORAGE_KEY contract
  // that src/lib/theme.ts owns. Keep both in sync if the key ever changes.
  try {
    const stored = localStorage.getItem('fv-theme');
    if (stored === 'dark' || (stored !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch {}
</script>
```

## Related skills

- [[api-integration]]
- [[project-structure]]
