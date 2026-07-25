import {
  getNewsArticleBySlug,
  LATIN_FEST_2027_REGISTRATION_ARTICLE_SLUG,
  LATIN_FEST_VALENCIA_2026_ARTICLE_SLUG,
  NEWS_ARTICLES,
  REVE_FEST_2026_ARTICLE_SLUG,
  ZEVRA_2026_FIRST_DAY_ARTICLE_SLUG,
} from './news.catalogue';

describe('news catalogue', () => {
  it('returns the Zevra first-day article by its immutable slug', () => {
    expect(getNewsArticleBySlug(ZEVRA_2026_FIRST_DAY_ARTICLE_SLUG)?.id).toBe(
      'zevra-2026-first-day',
    );
  });

  it('returns the Latin Fest 2027 registration article by its immutable slug', () => {
    expect(getNewsArticleBySlug(LATIN_FEST_2027_REGISTRATION_ARTICLE_SLUG)?.id).toBe(
      'latin-fest-2027-registration',
    );
  });

  it('returns the Reve Fest article by its immutable slug', () => {
    expect(getNewsArticleBySlug(REVE_FEST_2026_ARTICLE_SLUG)?.id).toBe('reve-fest-2026');
  });

  it('returns the two-day Latin Fest article by its immutable slug', () => {
    expect(getNewsArticleBySlug(LATIN_FEST_VALENCIA_2026_ARTICLE_SLUG)?.id).toBe(
      'latin-fest-valencia-2026',
    );
  });

  it('keeps the Latin Fest gallery free of visible captions', () => {
    const article = getNewsArticleBySlug(LATIN_FEST_VALENCIA_2026_ARTICLE_SLUG);

    expect(article?.gallery.every((image) => image.captionKey === undefined)).toBe(true);
  });

  it('offers responsive hero sources for the Latin Fest 2027 article', () => {
    const article = getNewsArticleBySlug(LATIN_FEST_2027_REGISTRATION_ARTICLE_SLUG);

    expect(article?.cover.responsive?.srcset).toContain('640w');
    expect(article?.cover.responsive?.srcset).toContain('1600w');
    expect(article?.cover.responsive?.sizes).toContain('100vw');
    expect(article?.cover.responsive?.sources[640]).toContain('cover-detail-640.webp');
  });

  it('uses the supplied Zevra photos for its responsive cover and eight-image gallery', () => {
    const article = getNewsArticleBySlug(ZEVRA_2026_FIRST_DAY_ARTICLE_SLUG);

    expect(article?.cover.responsive?.srcset).toBe('640w, 800w, 1200w, 1600w');
    expect(article?.cover.responsive?.sources[1600]).toContain('zevra-2026-cover-1600.webp');
    expect(article?.gallery).toHaveLength(8);
    expect(article?.gallery.every((image) => image.src.includes('/zevra-2026-'))).toBe(true);
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
      const sourceUrls = [article.source.url, ...(article.source.additionalUrls ?? [])];
      expect(sourceUrls.every((url) => /^https:\/\//.test(url))).toBe(true);

      const images = [article.cover, article.cardImage, article.socialImage, ...article.gallery];
      expect(images.every((image) => image.src.endsWith('.webp'))).toBe(true);
      expect(images.every((image) => image.width > 0 && image.height > 0)).toBe(true);
    }
  });
});
