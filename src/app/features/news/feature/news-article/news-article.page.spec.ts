import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import {
  LATIN_FEST_2027_REGISTRATION_ARTICLE_SLUG,
  LATIN_FEST_VALENCIA_2026_ARTICLE_SLUG,
  REVE_FEST_2026_ARTICLE_SLUG,
  ZEVRA_2026_FIRST_DAY_ARTICLE_SLUG,
  ZEVRA_2026_SECOND_DAY_ARTICLE_SLUG,
  ZEVRA_2026_THIRD_DAY_ARTICLE_SLUG,
  ZEVRA_2027_PRESALE_ARTICLE_SLUG,
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

  it('renders the Zevra 2027 presale story with its prices and cashless artwork', async () => {
    const fixture = await renderArticle(ZEVRA_2027_PRESALE_ARTICLE_SLUG);
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[data-testid="news-article-detail"]')?.tagName).toBe('ARTICLE');
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(root.querySelectorAll('.news-article__section')).toHaveLength(4);
    expect(root.querySelectorAll('.news-gallery__item')).toHaveLength(2);
    expect(root.querySelector('.news-article__highlight')).toBeNull();
    expect(root.querySelector('time')?.getAttribute('datetime')).toContain('2026-07-27');
    expect(root.querySelector('a[href*="instagram.com"]')).toBeNull();
    expect(root.querySelector('a[href*="zevrafestival.com"]')).toBeNull();
  });

  it('renders the Zevra first-day story with every section and the supplied photo gallery', async () => {
    const fixture = await renderArticle(ZEVRA_2026_FIRST_DAY_ARTICLE_SLUG);
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[data-testid="news-article-detail"]')?.tagName).toBe('ARTICLE');
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(root.querySelectorAll('.news-article__section')).toHaveLength(5);
    expect(root.querySelectorAll('.news-gallery__item')).toHaveLength(8);
    expect(root.querySelector('.news-article__highlight')).toBeNull();
    expect(root.querySelector('time')?.getAttribute('datetime')).toContain('2026-07-25');
    expect(root.querySelector('a[href*="zevrafestival.com"]')).toBeNull();
  });

  it('renders the Zevra second-day story with every section and only the supplied photos', async () => {
    const fixture = await renderArticle(ZEVRA_2026_SECOND_DAY_ARTICLE_SLUG);
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[data-testid="news-article-detail"]')?.tagName).toBe('ARTICLE');
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(root.querySelectorAll('.news-article__section')).toHaveLength(5);
    expect(root.querySelectorAll('.news-gallery__item')).toHaveLength(8);
    expect(root.querySelector('.news-article__highlight')).toBeNull();
    expect(root.querySelector('time')?.getAttribute('datetime')).toContain('2026-07-26');
    expect(root.querySelector('a[href*="zevrafestival.com"]')).toBeNull();
  });

  it('renders the Zevra third-day story with every section and only the supplied photos', async () => {
    const fixture = await renderArticle(ZEVRA_2026_THIRD_DAY_ARTICLE_SLUG);
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[data-testid="news-article-detail"]')?.tagName).toBe('ARTICLE');
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(root.querySelectorAll('.news-article__section')).toHaveLength(5);
    expect(root.querySelectorAll('.news-gallery__item')).toHaveLength(8);
    expect(root.querySelector('.news-article__highlight')).toBeNull();
    expect(root.querySelector('time')?.getAttribute('datetime')).toContain('2026-07-27');
    expect(root.querySelector('a[href*="zevrafestival.com"]')).toBeNull();
  });

  it('renders the Latin Fest 2027 registration story without exposing its sources', async () => {
    const fixture = await renderArticle(LATIN_FEST_2027_REGISTRATION_ARTICLE_SLUG);
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[data-testid="news-article-detail"]')?.tagName).toBe('ARTICLE');
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(root.querySelectorAll('.news-article__section')).toHaveLength(3);
    expect(root.querySelector('.news-article__highlight')).toBeNull();
    expect(root.querySelector('.news-gallery')).toBeNull();
    expect(root.querySelector('time')?.getAttribute('datetime')).toContain('2026-07-25');
    expect(root.querySelector('a[href*="instagram.com"]')).toBeNull();
    expect(root.querySelector('a[href*="latinfest.es"]')).toBeNull();
  });

  it('renders the two-day Latin Fest story as one semantic article', async () => {
    const fixture = await renderArticle(LATIN_FEST_VALENCIA_2026_ARTICLE_SLUG);
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[data-testid="news-article-detail"]')?.tagName).toBe('ARTICLE');
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(root.querySelectorAll('.news-article__section')).toHaveLength(3);
    expect(root.querySelector('.news-article__highlight')).not.toBeNull();
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
