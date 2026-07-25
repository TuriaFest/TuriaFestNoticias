import { NEWS_ARTICLES } from './data-access/news.catalogue';
import { NEWS_ROUTES } from './news.routes';

describe('NEWS_ROUTES', () => {
  it('generates one crawlable detail route for every published article', () => {
    const routePaths = NEWS_ROUTES.map((route) => route.path);

    for (const article of NEWS_ARTICLES) {
      expect(routePaths).toContain(article.slug);
    }
  });
});
