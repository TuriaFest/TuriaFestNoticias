import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import {
  LATIN_FEST_VALENCIA_2026_ARTICLE_SLUG,
  REVE_FEST_2026_ARTICLE_SLUG,
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

  it('renders both real articles with the newest story first and a crawlable detail link', () => {
    const fixture = TestBed.createComponent(NewsPageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const article = root.querySelector('[data-testid="news-card-latin-fest-valencia-2026"]');

    expect(article?.tagName).toBe('ARTICLE');
    expect(root.querySelectorAll('article')).toHaveLength(2);
    expect(article?.querySelector('img')).not.toBeNull();
    expect(article?.querySelector('time')?.getAttribute('datetime')).toContain('2026-07-21');
    expect(
      article?.querySelector<HTMLAnchorElement>('[data-testid="news-card-read-more"]')?.href,
    ).toContain(`/noticias/${LATIN_FEST_VALENCIA_2026_ARTICLE_SLUG}`);
    expect(root.querySelector(`[href="/noticias/${REVE_FEST_2026_ARTICLE_SLUG}"]`)).not.toBeNull();
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
