import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Footer } from './footer';

describe('Footer', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the TuriaFestNoticias brand and tagline', () => {
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const logo = root.querySelector('.footer__logo--light') as HTMLImageElement | null;

    expect(logo?.getAttribute('ng-img')).toBe('true');
    expect(logo?.getAttribute('alt')).toBe('TuriaFestNoticias');
    expect(logo?.getAttribute('src') ?? '').toContain('assets/branding/festi-val-logo.webp');
    expect(root.querySelector('.footer__tagline')?.textContent?.trim()).toBe(
      'Tu guía de festivales en la Comunitat Valenciana. Música, cultura y verano.',
    );
  });

  it('exposes the four social links with accessible labels', () => {
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelectorAll('.footer__social-link')).toHaveLength(4);
    expect(
      root.querySelector('[data-testid="footer-social-instagram"]')?.getAttribute('aria-label'),
    ).toBe('Síguenos en Instagram');
    expect(root.querySelector('[data-testid="footer-social-x"]')).not.toBeNull();
    expect(root.querySelector('[data-testid="footer-social-youtube"]')).not.toBeNull();
    expect(root.querySelector('[data-testid="footer-social-spotify"]')).not.toBeNull();
  });

  it('renders the three navigation columns and copyright notice', () => {
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const titles = Array.from(root.querySelectorAll('.footer__col-title')).map((node) =>
      node.textContent?.trim(),
    );

    expect(titles).toEqual(['Explora', 'Información', 'Legal']);
    expect(root.querySelector('.footer__copyright')?.textContent?.trim()).toBe(
      '© 2026 TuriaFestNoticias. Todos los derechos reservados.',
    );
  });
});
