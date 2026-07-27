import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import {
  LATIN_FEST_2027_REGISTRATION_ARTICLE_SLUG,
  LATIN_FEST_VALENCIA_2026_ARTICLE_SLUG,
  REVE_FEST_2026_ARTICLE_SLUG,
  ZEVRA_2026_FIRST_DAY_ARTICLE_SLUG,
  ZEVRA_2026_SECOND_DAY_ARTICLE_SLUG,
} from '../data-access/news.catalogue';
import { NewsPageComponent } from './news.page';

describe('NewsPageComponent', () => {
  const queryParamMap = new BehaviorSubject(convertToParamMap({}));

  beforeEach(async () => {
    queryParamMap.next(convertToParamMap({}));
    await TestBed.configureTestingModule({
      imports: [NewsPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamMap.asObservable(),
            snapshot: { queryParamMap: convertToParamMap({}) },
          },
        },
      ],
    }).compileComponents();
  });

  it('renders the news title and introduction', () => {
    const fixture = TestBed.createComponent(NewsPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[data-testid="news-page-title"]')).not.toBeNull();
    expect(root.querySelector('[data-testid="news-page-description"]')).not.toBeNull();
  });

  it('renders all real articles with the newest story first and crawlable detail links', () => {
    const fixture = TestBed.createComponent(NewsPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const article = root.querySelector('[data-testid="news-card-zevra-2026-second-day"]');

    expect(article?.tagName).toBe('ARTICLE');
    expect(root.querySelectorAll('article')).toHaveLength(5);
    expect(article?.querySelector('img')).not.toBeNull();
    expect(article?.querySelector('time')?.getAttribute('datetime')).toContain('2026-07-26');
    expect(
      article?.querySelector<HTMLAnchorElement>('[data-testid="news-card-read-more"]')?.href,
    ).toContain(`/noticias/${ZEVRA_2026_SECOND_DAY_ARTICLE_SLUG}`);
    expect(
      root.querySelector(`[href="/noticias/${ZEVRA_2026_FIRST_DAY_ARTICLE_SLUG}"]`),
    ).not.toBeNull();
    expect(
      root.querySelector(`[href="/noticias/${LATIN_FEST_2027_REGISTRATION_ARTICLE_SLUG}"]`),
    ).not.toBeNull();
    expect(
      root.querySelector(`[href="/noticias/${LATIN_FEST_VALENCIA_2026_ARTICLE_SLUG}"]`),
    ).not.toBeNull();
    expect(root.querySelector(`[href="/noticias/${REVE_FEST_2026_ARTICLE_SLUG}"]`)).not.toBeNull();
  });

  it('finds the Latin Fest 2027 story by its Benidorm early-bird context', () => {
    queryParamMap.next(convertToParamMap({ buscar: 'Benidorm early bird' }));
    const fixture = TestBed.createComponent(NewsPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(
      root.querySelector('[data-testid="news-card-latin-fest-2027-registration"]'),
    ).not.toBeNull();
    expect(root.querySelectorAll('article')).toHaveLength(1);
  });

  it('finds the Zevra story through an artist who is not pictured in the gallery', () => {
    queryParamMap.next(convertToParamMap({ buscar: 'La Sargantana' }));
    const fixture = TestBed.createComponent(NewsPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[data-testid="news-card-zevra-2026-first-day"]')).not.toBeNull();
    expect(root.querySelectorAll('article')).toHaveLength(1);
  });

  it('finds the Zevra second-day story through an artist who is not pictured in the gallery', () => {
    queryParamMap.next(convertToParamMap({ buscar: 'Brenda Serna' }));
    const fixture = TestBed.createComponent(NewsPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[data-testid="news-card-zevra-2026-second-day"]')).not.toBeNull();
    expect(root.querySelectorAll('article')).toHaveLength(1);
  });

  it('finds the Zevra second-day story through the guest performance song', () => {
    queryParamMap.next(convertToParamMap({ buscar: 'Rakata' }));
    const fixture = TestBed.createComponent(NewsPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[data-testid="news-card-zevra-2026-second-day"]')).not.toBeNull();
    expect(root.querySelectorAll('article')).toHaveLength(1);
  });

  it('finds the Latin Fest story by a music-style synonym', () => {
    queryParamMap.next(convertToParamMap({ buscar: 'dancehall' }));
    const fixture = TestBed.createComponent(NewsPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[data-testid="news-card-latin-fest-valencia-2026"]')).not.toBeNull();
    expect(root.querySelectorAll('article')).toHaveLength(1);
  });

  it('shows the empty search state when no article matches', () => {
    queryParamMap.next(convertToParamMap({ buscar: 'rock' }));
    const fixture = TestBed.createComponent(NewsPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[data-testid="news-search-empty"]')).not.toBeNull();
    expect(root.querySelectorAll('article')).toHaveLength(0);
  });
});
