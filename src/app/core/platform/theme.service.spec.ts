import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

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

function flush(): void {
  TestBed.inject(ApplicationRef).tick();
}

function dataTheme(): string | null {
  return document.documentElement.getAttribute('data-theme');
}

describe('ThemeService', () => {
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

  it('defaults to system and resolves light when the device is light', () => {
    mockPrefersDark(false);
    const theme = TestBed.inject(ThemeService);
    flush();

    expect(theme.mode()).toBe('system');
    expect(theme.resolvedTheme()).toBe('light');
    expect(dataTheme()).toBeNull(); // system → no attribute, CSS media query governs
  });

  it('resolves dark on first visit when the device is dark', () => {
    mockPrefersDark(true);
    const theme = TestBed.inject(ThemeService);
    flush();

    expect(theme.mode()).toBe('system');
    expect(theme.resolvedTheme()).toBe('dark');
    expect(dataTheme()).toBeNull();
  });

  it('reacts to a runtime device change while in system mode', () => {
    const mql = mockPrefersDark(false);
    const theme = TestBed.inject(ThemeService);
    flush();
    expect(theme.resolvedTheme()).toBe('light');

    mql.dispatch(true);
    flush();
    expect(theme.resolvedTheme()).toBe('dark');
  });

  it('toggles to an explicit theme, writes data-theme and persists it', () => {
    mockPrefersDark(false);
    const theme = TestBed.inject(ThemeService);
    flush();

    theme.toggle();
    flush();

    expect(theme.mode()).toBe('dark');
    expect(theme.resolvedTheme()).toBe('dark');
    expect(dataTheme()).toBe('dark');
    expect(localStorage.getItem('fv-theme')).toBe('dark');
  });

  it('restores the persisted manual choice on reload', () => {
    localStorage.setItem('fv-theme', 'dark');
    mockPrefersDark(false);
    const theme = TestBed.inject(ThemeService);
    flush();

    expect(theme.mode()).toBe('dark');
    expect(theme.resolvedTheme()).toBe('dark');
    expect(dataTheme()).toBe('dark');
  });

  it('lets an explicit light choice win over a dark device', () => {
    mockPrefersDark(true);
    const theme = TestBed.inject(ThemeService);
    flush();

    theme.setMode('light');
    flush();

    expect(theme.resolvedTheme()).toBe('light');
    expect(dataTheme()).toBe('light');
    expect(localStorage.getItem('fv-theme')).toBe('light');
  });
});
