import {
  getNewsArticleBySlug,
  LATIN_FEST_VALENCIA_2026_ARTICLE_SLUG,
  NEWS_ARTICLES,
  REVE_FEST_2026_ARTICLE_SLUG,
} from './news.catalogue';

describe('news catalogue', () => {
  it('returns the Reve Fest article by its immutable slug', () => {
    expect(getNewsArticleBySlug(REVE_FEST_2026_ARTICLE_SLUG)?.id).toBe('reve-fest-2026');
  });

  it('returns the two-day Latin Fest article by its immutable slug', () => {
    expect(getNewsArticleBySlug(LATIN_FEST_VALENCIA_2026_ARTICLE_SLUG)?.id).toBe(
      'latin-fest-valencia-2026',
    );
  });

  it('returns undefined for an unpublished slug', () => {
    expect(getNewsArticleBySlug('noticia-no-publicada')).toBeUndefined();
  });

  it('is ordered from newest to oldest', () => {
    const publishedTimes = NEWS_ARTICLES.map((article) => Date.parse(article.publishedAt));
    expect(publishedTimes).toEqual([...publishedTimes].sort((left, right) => right - left));
  });

  it('keeps unique identifiers, valid dates, HTTPS sources and WebP assets', () => {
    const ids = NEWS_ARTICLES.map((article) => article.id);
    const slugs = NEWS_ARTICLES.map((article) => article.slug);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const article of NEWS_ARTICLES) {
      expect(Number.isNaN(Date.parse(article.publishedAt))).toBe(false);
      expect(Number.isNaN(Date.parse(article.modifiedAt))).toBe(false);
      expect(article.source.url).toMatch(/^https:\/\//);

      const images = [article.cover, article.cardImage, article.socialImage, ...article.gallery];
      expect(images.every((image) => image.src.endsWith('.webp'))).toBe(true);
      expect(images.every((image) => image.width > 0 && image.height > 0)).toBe(true);
    }
  });
});
