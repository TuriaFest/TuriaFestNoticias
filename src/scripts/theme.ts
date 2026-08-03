// ============================================================================
// theme.ts — TuriaFestNoticias · theme toggle island
// ============================================================================
// Port of the Angular `ThemeService` for the browser: reads the stored mode,
// resolves `system` against `prefers-color-scheme`, applies `data-theme` and
// keeps the toggle button (pressed state, icon, translated label) in sync.
// ============================================================================

import {
  applyTheme,
  isDarkModePreferred,
  readStoredMode,
  resolveTheme,
  watchDarkModePreference,
  type ThemeMode,
} from '@lib/theme';
import { getActiveLang, getDictionary, translateKey } from './i18n';

function getRoot(): HTMLElement {
  return document.documentElement;
}

function getThemeButton(): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>('[data-testid="nav-btn-tema"]');
}

function updateToggleButton(resolved: 'light' | 'dark'): void {
  const button = getThemeButton();
  if (!button) return;

  const isDark = resolved === 'dark';
  button.setAttribute('aria-pressed', String(isDark));
  const labelKey = isDark ? 'nav.theme.toLight' : 'nav.theme.toDark';
  button.setAttribute('aria-label', translateKey(labelKey));
}

export function initTheme(): void {
  const view = window;
  const storage = view.localStorage;
  const root = getRoot();

  const stored = readStoredMode(storage);
  let mode: ThemeMode = stored ?? 'system';
  let systemDark = isDarkModePreferred(view);
  let resolved = applyTheme(root, mode, systemDark, storage);

  updateToggleButton(resolved);

  watchDarkModePreference(view, (dark) => {
    systemDark = dark;
    if (mode === 'system') {
      resolved = applyTheme(root, mode, systemDark, storage);
      updateToggleButton(resolved);
    }
  });

  getThemeButton()?.addEventListener('click', () => {
    // Toggle flips the *painted* theme and pins it explicitly (as before).
    mode = resolved === 'dark' ? 'light' : 'dark';
    resolved = applyTheme(root, mode, systemDark, storage);
    updateToggleButton(resolved);
  });

  getDictionary(getActiveLang()).then(() => updateToggleButton(resolved));
}
