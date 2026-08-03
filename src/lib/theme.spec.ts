import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  applyTheme,
  isDarkModePreferred,
  persistMode,
  readStoredMode,
  resolveTheme,
  watchDarkModePreference,
  type ThemeMode,
} from '@lib/theme';

interface FakeMediaQueryList {
  matches: boolean;
  media: string;
  addEventListener(type: 'change', cb: (e: { matches: boolean }) => void): void;
  removeEventListener(type: 'change', cb: (e: { matches: boolean }) => void): void;
  dispatch(next: boolean): void;
}

function mockPrefersDark(matches: boolean): FakeMediaQueryList {
  const listeners = new Set<(e: { matches: boolean }) => void>();
  const mql: FakeMediaQueryList = {
    matches,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_type, cb) => void listeners.add(cb),
    removeEventListener: (_type, cb) => void listeners.delete(cb),
    dispatch(next: boolean) {
      mql.matches = next;
      listeners.forEach((cb) => cb({ matches: next }));
    },
  };
  (window as unknown as { matchMedia: (q: string) => FakeMediaQueryList }).matchMedia = () => mql;
  return mql;
}

function dataTheme(): string | null {
  return document.documentElement.getAttribute('data-theme');
}

describe('theme lib', () => {
  const realMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    window.matchMedia = realMatchMedia; // restore so the mock never leaks to other specs
  });

  it('resolves system mode against the device preference', () => {
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('defaults to system and resolves light when the device is light', () => {
    mockPrefersDark(false);
    const resolved = applyTheme(document.documentElement, 'system', false, localStorage);

    expect(resolved).toBe('light');
    expect(dataTheme()).toBeNull(); // system → no attribute, CSS media query governs
  });

  it('resolves dark on first visit when the device is dark', () => {
    mockPrefersDark(true);
    const resolved = applyTheme(document.documentElement, 'system', true, localStorage);

    expect(resolved).toBe('dark');
    expect(dataTheme()).toBeNull();
  });

  it('reacts to a runtime device change while in system mode', () => {
    const mql = mockPrefersDark(false);
    const onChange = (dark: boolean): void => {
      applyTheme(document.documentElement, 'system', dark, localStorage);
    };
    let resolved = applyTheme(document.documentElement, 'system', false, localStorage);
    expect(resolved).toBe('light');

    const unsubscribe = watchDarkModePreference(window, onChange);
    mql.dispatch(true);
    resolved = applyTheme(document.documentElement, 'system', true, localStorage);
    expect(resolved).toBe('dark');
    unsubscribe();
  });

  it('toggles to an explicit theme, writes data-theme and persists it', () => {
    mockPrefersDark(false);
    const resolved = applyTheme(document.documentElement, 'dark', false, localStorage);

    expect(resolved).toBe('dark');
    expect(dataTheme()).toBe('dark');
    expect(localStorage.getItem('fv-theme')).toBe('dark');
  });

  it('restores the persisted manual choice on reload', () => {
    localStorage.setItem('fv-theme', 'dark');
    mockPrefersDark(false);

    expect(readStoredMode(localStorage)).toBe('dark');
    const resolved = applyTheme(document.documentElement, 'dark', false, localStorage);
    expect(resolved).toBe('dark');
    expect(dataTheme()).toBe('dark');
  });

  it('lets an explicit light choice win over a dark device', () => {
    mockPrefersDark(true);
    applyTheme(document.documentElement, 'light', true, localStorage);

    expect(dataTheme()).toBe('light');
    expect(localStorage.getItem('fv-theme')).toBe('light');
  });

  it('persists the chosen mode via persistMode', () => {
    persistMode(localStorage, 'system');
    expect(localStorage.getItem('fv-theme')).toBe('system');
  });

  it('detects a dark device via isDarkModePreferred', () => {
    mockPrefersDark(true);
    expect(isDarkModePreferred(window)).toBe(true);
    mockPrefersDark(false);
    expect(isDarkModePreferred(window)).toBe(false);
  });

  it('keeps a non-TThemeMode storage value ignored', () => {
    localStorage.setItem('fv-theme', 'sepia');
    expect(readStoredMode(localStorage)).toBeNull();
  });

  it('sets data-theme only for explicit modes, not for system', () => {
    applyTheme(document.documentElement, 'dark', false, localStorage);
    expect(dataTheme()).toBe('dark');

    applyTheme(document.documentElement, 'system', true, localStorage);
    expect(dataTheme()).toBeNull();
    expect(localStorage.getItem('fv-theme')).toBe('system');
  });
});
