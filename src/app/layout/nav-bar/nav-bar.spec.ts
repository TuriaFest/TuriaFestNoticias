import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { of } from 'rxjs';

import { NavBar } from './nav-bar';

class TranslocoLoaderStub {
  getTranslation() {
    return of({});
  }
}

describe('NavBar', () => {
  const realMatchMedia = window.matchMedia;

  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    window.matchMedia = (() => ({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    })) as unknown as typeof window.matchMedia;
    await TestBed.configureTestingModule({
      imports: [NavBar],
      providers: [
        provideRouter([]),
        provideTransloco({
          config: {
            availableLangs: ['es', 'ca', 'en'],
            defaultLang: 'es',
            fallbackLang: 'es',
            reRenderOnLangChange: false,
            prodMode: false,
          },
          loader: TranslocoLoaderStub,
        }),
      ],
    }).compileComponents();

    TestBed.inject(TranslocoService).setActiveLang('es');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    window.matchMedia = realMatchMedia;
  });

  it('renders the brand logo from the project branding assets', () => {
    const fixture = TestBed.createComponent(NavBar);
    fixture.detectChanges();
    const brand = (fixture.nativeElement as HTMLElement).querySelector(
      '.nav-bar__brand',
    ) as HTMLAnchorElement | null;
    const img = (fixture.nativeElement as HTMLElement).querySelector(
      '.nav-bar__brand-img',
    ) as HTMLImageElement | null;
    expect(brand?.getAttribute('href')).toBe('https://www.turiafest.com/');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('ng-img')).toBe('true');
    expect(img?.getAttribute('alt')).toBe('TuriaFest');
    expect(img?.getAttribute('src') ?? '').toContain('assets/branding/festi-val-logo.webp');
  });

  it('renders four primary navigation items with Spanish labels', () => {
    const fixture = TestBed.createComponent(NavBar);
    fixture.detectChanges();
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('.nav-bar__nav-link');
    expect(links.length).toBe(4);
    const labels = Array.from(links).map((link) => link.textContent?.trim());
    expect(labels).toEqual(['Inicio', 'Festivales', 'Calendario', 'Noticias']);
  });

  it('links the public sections to their TuriaFest destinations', () => {
    const fixture = TestBed.createComponent(NavBar);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const destinations = {
      'nav-link-inicio': 'https://www.turiafest.com/',
      'nav-link-festivales': 'https://www.turiafest.com/festivales',
      'nav-link-calendario': 'https://www.turiafest.com/calendario',
    } as const;

    for (const [testId, expectedHref] of Object.entries(destinations)) {
      const link = root.querySelector(`[data-testid="${testId}"]`) as HTMLAnchorElement | null;
      expect(link?.getAttribute('href')).toBe(expectedHref);
    }
  });

  it('links Noticias to the TuriaFestNoticias domain', () => {
    const fixture = TestBed.createComponent(NavBar);
    fixture.detectChanges();
    const newsItem = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="nav-link-noticias"]',
    ) as HTMLAnchorElement;

    expect(newsItem?.tagName).toBe('A');
    expect(newsItem?.getAttribute('href')).toBe('https://turiafestnoticias.es/');
    expect(newsItem?.hasAttribute('aria-disabled')).toBe(false);
  });

  it('exposes the search, theme toggle and hamburger controls', () => {
    const fixture = TestBed.createComponent(NavBar);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.nav-bar__search svg[lucidesearch]')).not.toBeNull();
    const toggle = root.querySelector('.nav-bar__theme-toggle') as HTMLButtonElement | null;
    expect(toggle).not.toBeNull();
    expect(toggle?.getAttribute('aria-pressed')).toBe('false');
    expect(root.querySelector('.nav-bar__theme-toggle svg[lucidesun]')).not.toBeNull();
    expect(root.querySelector('.nav-bar__menu svg[lucidemenu]')).not.toBeNull();
  });

  it('opens the news search form from the search button', () => {
    const fixture = TestBed.createComponent(NavBar);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const trigger = root.querySelector('[data-testid="nav-btn-buscar"]') as HTMLButtonElement;

    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(root.querySelector('[data-testid="nav-search-input"]')).not.toBeNull();
    expect(root.querySelector('[data-testid="nav-search-submit"]')).not.toBeNull();
  });

  it('navigates to news with the submitted search query', () => {
    const fixture = TestBed.createComponent(NavBar);
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    (root.querySelector('[data-testid="nav-btn-buscar"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    const input = root.querySelector('[data-testid="nav-search-input"]') as HTMLInputElement;
    input.value = 'Valencia';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    root
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(navigate).toHaveBeenCalledWith(['/noticias'], {
      queryParams: { buscar: 'Valencia' },
    });
  });

  it('flips the theme toggle icon and aria-pressed when activated', () => {
    const fixture = TestBed.createComponent(NavBar);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const toggle = root.querySelector('.nav-bar__theme-toggle') as HTMLButtonElement;

    toggle.click();
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector('.nav-bar__theme-toggle svg[lucidemoon]')).not.toBeNull();
  });

  it('renders both logo variants so CSS can pick the right one per theme', () => {
    const fixture = TestBed.createComponent(NavBar);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const lightLogo = root.querySelector('.nav-bar__brand-img--light') as HTMLImageElement;
    const darkLogo = root.querySelector('.nav-bar__brand-img--dark') as HTMLImageElement;

    expect(lightLogo).not.toBeNull();
    expect(darkLogo).not.toBeNull();
    expect(lightLogo.getAttribute('ng-reflect-ng-src') ?? lightLogo.src).toContain(
      'assets/branding/festi-val-logo.webp',
    );
    expect(darkLogo.getAttribute('ng-reflect-ng-src') ?? darkLogo.src).toContain(
      'assets/branding/festi-val-logo-dark.webp',
    );
    expect(darkLogo.getAttribute('loading')).toBe('eager');
    expect(darkLogo.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders the language selector with the current flag', () => {
    const fixture = TestBed.createComponent(NavBar);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const trigger = root.querySelector('[data-testid="nav-btn-language"]') as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    const flag = trigger.querySelector('.nav-bar__language-flag') as HTMLImageElement;
    expect(flag).not.toBeNull();
    expect(flag.src).toContain('flag-es.webp');
  });

  it('opens the language menu on click and shows all options', () => {
    const fixture = TestBed.createComponent(NavBar);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const trigger = root.querySelector('[data-testid="nav-btn-language"]') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const menu = root.querySelector('[data-testid="nav-language-menu"]');
    expect(menu).not.toBeNull();

    const options = menu!.querySelectorAll('.nav-bar__language-option');
    expect(options.length).toBe(3);

    const labels = Array.from(options).map((o) =>
      o.querySelector('.nav-bar__language-option-label')?.textContent?.trim(),
    );
    expect(labels).toEqual(['Español', 'Valencià', 'English']);
  });

  it('marks the active language with aria-current', () => {
    const fixture = TestBed.createComponent(NavBar);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const trigger = root.querySelector('[data-testid="nav-btn-language"]') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    const activeOption = root.querySelector('[data-testid="nav-language-option-es"]');
    expect(activeOption?.getAttribute('aria-current')).toBe('true');
  });

  it('positions the language selector before the search button in DOM order', () => {
    const fixture = TestBed.createComponent(NavBar);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const actions = root.querySelector('.nav-bar__actions')!;
    const children = Array.from(actions.children);

    const langIndex = children.findIndex((el) => el.classList.contains('nav-bar__language'));
    const searchIndex = children.findIndex((el) => el.classList.contains('nav-bar__search'));

    expect(langIndex).toBeGreaterThanOrEqual(0);
    expect(searchIndex).toBeGreaterThan(langIndex);
  });
});
