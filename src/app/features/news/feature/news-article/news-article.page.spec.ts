import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import {
  LATIN_FEST_VALENCIA_2026_ARTICLE_SLUG,
  REVE_FEST_2026_ARTICLE_SLUG,
} from '../../data-access/news.catalogue';
import { NewsArticlePageComponent } from './news-article.page';

describe('NewsArticlePageComponent', () => {
  async function renderArticle(slug: string): Promise<ComponentFixture<NewsArticlePageComponent>> {
    await TestBed.configureTestingModule({
      imports: [NewsArticlePageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { newsSlug: slug } } },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsArticlePageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('renders the two-day Latin Fest story as one semantic article', async () => {
    const fixture = await renderArticle(LATIN_FEST_VALENCIA_2026_ARTICLE_SLUG);
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[data-testid="news-article-detail"]')?.tagName).toBe('ARTICLE');
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(root.querySelectorAll('.news-article__section')).toHaveLength(3);
    expect(root.querySelector('time')?.getAttribute('datetime')).toContain('2026-07-21');
  });

  it('renders the Latin Fest gallery without exposing the internal official source', async () => {
    const fixture = await renderArticle(LATIN_FEST_VALENCIA_2026_ARTICLE_SLUG);
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelectorAll('.news-gallery__item')).toHaveLength(6);
    expect(root.querySelector('.news-article__source')).toBeNull();
    expect(root.querySelector('a[href*="latinfest.es"]')).toBeNull();
  });

  it('keeps the Reve Fest article and its return link available', async () => {
    const fixture = await renderArticle(REVE_FEST_2026_ARTICLE_SLUG);
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelectorAll('.news-gallery__item')).toHaveLength(6);
    expect(root.querySelector('a[href*="roigarena.com"]')).toBeNull();
    expect(root.querySelector('.news-article__footer a')?.getAttribute('href')).toBe('/noticias');
  });
});
