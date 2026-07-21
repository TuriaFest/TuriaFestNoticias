import { NewsSearchService, type NewsSearchDocument } from './news-search.service';

describe('NewsSearchService', () => {
  const articles: readonly NewsSearchDocument[] = [
    {
      id: 'article-one',
      title: 'La primera noticia de TuriaFestNoticias',
      city: 'València',
      genres: 'electrónica techno',
    },
    {
      id: 'article-two',
      title: 'El pop vuelve a Alicante',
      city: 'Alicante',
      genres: 'pop',
    },
  ];

  function createService(): NewsSearchService {
    const service = new NewsSearchService();
    service.buildIndex(articles);
    return service;
  }

  it('finds articles by title', () => {
    expect(
      createService()
        .search('primera')
        .map((result) => result.id),
    ).toEqual(['article-one']);
  });

  it('finds articles by city without requiring diacritics', () => {
    expect(
      createService()
        .search('Valencia')
        .map((result) => result.id),
    ).toEqual(['article-one']);
  });

  it('finds articles by music genre without requiring diacritics', () => {
    expect(
      createService()
        .search('electronica')
        .map((result) => result.id),
    ).toEqual(['article-one']);
  });

  it('returns no results for blank or unrelated queries', () => {
    const service = createService();

    expect(service.search('')).toEqual([]);
    expect(service.search('rock')).toEqual([]);
  });
});
