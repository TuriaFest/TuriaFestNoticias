import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { REVE_FEST_2026_ARTICLE_SLUG } from '../../data-access/news.catalogue';
import { NewsArticlePageComponent } from './news-article.page';

describe('NewsArticlePageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsArticlePageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { newsSlug: REVE_FEST_2026_ARTICLE_SLUG } } },
        },
      ],
    }).compileComponents();
  });

  it('renders one semantic article with a single h1 and a published date', async () => {
    const fixture = TestBed.createComponent(NewsArticlePageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[data-testid="news-article-detail"]')?.tagName).toBe('ARTICLE');
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(root.querySelector('time')?.getAttribute('datetime')).toContain('2026-07-21');
  });

  it('renders the gallery and crawlable source and back links', () => {
    const fixture = TestBed.createComponent(NewsArticlePageComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelectorAll('.news-gallery__item')).toHaveLength(6);
    expect(root.querySelector('.news-article__source a')?.getAttribute('href')).toContain(
      'roigarena.com',
    );
    expect(root.querySelector('.news-article__footer a')?.getAttribute('href')).toBe('/noticias');
  });
});
