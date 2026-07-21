import { getNewsArticleBySlug, NEWS_ARTICLES, REVE_FEST_2026_ARTICLE_SLUG } from './news.catalogue';

describe('news catalogue', () => {
  it('returns the Reve Fest article by its immutable slug', () => {
    expect(getNewsArticleBySlug(REVE_FEST_2026_ARTICLE_SLUG)?.id).toBe('reve-fest-2026');
  });

  it('returns undefined for an unpublished slug', () => {
    expect(getNewsArticleBySlug('noticia-no-publicada')).toBeUndefined();
  });

  it('is ordered from newest to oldest', () => {
    const publishedTimes = NEWS_ARTICLES.map((article) => Date.parse(article.publishedAt));
    expect(publishedTimes).toEqual([...publishedTimes].sort((left, right) => right - left));
  });
});
