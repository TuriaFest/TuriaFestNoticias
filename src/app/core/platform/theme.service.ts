import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  Signal,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';

/** User-selectable theme preference. */
export type ThemeMode = 'light' | 'dark' | 'system';

/** Theme actually painted once `system` is resolved against the device. */
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'fv-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

/**
 * Single source of truth for the active theme.
 *
 * - Default is `system` (follows `prefers-color-scheme`).
 * - A manual choice is persisted in `localStorage` and applied as
 *   `data-theme="light|dark"` on `<html>`. For `system` the attribute is
 *   removed so the `prefers-color-scheme` media query governs (and the device
 *   preference is never hidden).
 * - SSR-safe: every browser-only API is guarded by `isPlatformBrowser`. The
 *   anti-flicker inline script in `index.html` applies the stored choice before
 *   first paint; this service keeps everything in sync afterwards.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly #document = inject(DOCUMENT);
  readonly #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly #mode = signal<ThemeMode>('system');
  readonly #systemDark = signal<boolean>(false);

  /** The user's selected preference (`light | dark | system`). */
  readonly mode: Signal<ThemeMode> = this.#mode.asReadonly();

  /** The theme actually applied to the DOM (`light | dark`). */
  readonly resolvedTheme: Signal<ResolvedTheme> = computed(() => {
    const mode = this.#mode();
    if (mode === 'system') {
      return this.#systemDark() ? 'dark' : 'light';
    }
    return mode;
  });

  constructor() {
    if (!this.#isBrowser) {
      return;
    }

    const stored = this.#readStoredMode();
    if (stored) {
      this.#mode.set(stored);
    }

    const media = this.#document.defaultView?.matchMedia?.(DARK_QUERY);
    if (media) {
      this.#systemDark.set(media.matches);
      media.addEventListener('change', (event) => this.#systemDark.set(event.matches));
    }

    effect(() => this.#apply(this.#mode(), this.resolvedTheme()));
  }

  /** Set an explicit preference (`light | dark | system`). */
  setMode(mode: ThemeMode): void {
    this.#mode.set(mode);
  }

  /** Flip between light and dark based on what is currently painted. */
  toggle(): void {
    this.setMode(this.resolvedTheme() === 'dark' ? 'light' : 'dark');
  }

  #apply(mode: ThemeMode, resolved: ResolvedTheme): void {
    const root = this.#document.documentElement;
    if (mode === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', resolved);
    }
    this.#persist(mode);
    this.#syncThemeColor();
  }

  #syncThemeColor(): void {
    const view = this.#document.defaultView;
    if (!view) {
      return;
    }
    const color = view
      .getComputedStyle(this.#document.documentElement)
      .getPropertyValue('--fv-bg-page')
      .trim();
    if (!color) {
      return;
    }
    let meta = this.#document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = this.#document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      this.#document.head.appendChild(meta);
    }
    meta.setAttribute('content', color);
  }

  #readStoredMode(): ThemeMode | null {
    try {
      const value = this.#document.defaultView?.localStorage.getItem(STORAGE_KEY) ?? null;
      return isThemeMode(value) ? value : null;
    } catch {
      return null;
    }
  }

  #persist(mode: ThemeMode): void {
    try {
      this.#document.defaultView?.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Storage unavailable (private mode / blocked) — non-fatal.
    }
  }
}
