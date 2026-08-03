// ============================================================================
// theme.ts — TuriaFestNoticias · light / dark / system theming
// ============================================================================
// Theme state helpers. The anti-flicker inline
// script in BaseLayout applies the stored choice before first paint; this
// module keeps the DOM in sync afterwards (island side).
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'system';

export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'fv-theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function readStoredMode(storage: Storage | undefined): ThemeMode | null {
  try {
    const value = storage?.getItem(THEME_STORAGE_KEY) ?? null;
    return isThemeMode(value) ? value : null;
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

export function resolveTheme(mode: ThemeMode, systemDark: boolean): ResolvedTheme {
  return mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
}

/** Applies the painted theme and persists the user preference. */
export function applyTheme(
  root: HTMLElement,
  mode: ThemeMode,
  systemDark: boolean,
  storage: Storage | undefined,
): ResolvedTheme {
  const resolved = resolveTheme(mode, systemDark);
  if (mode === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', resolved);
  }
  persistMode(storage, mode);
  syncThemeColor(root);
  return resolved;
}

/** Keeps the `meta[name="theme-color"]` in sync with the painted background. */
export function syncThemeColor(root: HTMLElement): void {
  const view = root.ownerDocument.defaultView;
  if (!view) {
    return;
  }
  const color = view.getComputedStyle(root).getPropertyValue('--fv-bg-page').trim();
  if (!color) {
    return;
  }
  let meta = root.ownerDocument.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = root.ownerDocument.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    root.ownerDocument.head.appendChild(meta);
  }
  meta.setAttribute('content', color);
}

export function isDarkModePreferred(view: Window | undefined): boolean {
  return view?.matchMedia?.(DARK_QUERY).matches ?? false;
}

export function watchDarkModePreference(
  view: Window | undefined,
  onChange: (dark: boolean) => void,
): () => void {
  const media = view?.matchMedia?.(DARK_QUERY);
  if (!media) {
    return () => undefined;
  }
  const listener = (event: MediaQueryListEvent): void => onChange(event.matches);
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
}
