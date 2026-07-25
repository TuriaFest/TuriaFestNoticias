import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';

import { NEWS_ARTICLES } from './news.catalogue';
import { NewsMetaService } from './news-meta.service';

describe('NewsMetaService', () => {
  let service: NewsMetaService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [Meta, Title] });
    service = TestBed.inject(NewsMetaService);
    document.head
      .querySelectorAll('[data-fv-news-canonical], [data-fv-news-jsonld]')
      .forEach((node) => node.remove());
  });

  it('applies one canonical and a NewsArticle graph', () => {
    const article = NEWS_ARTICLES[0];
    service.applyArticle(article, {
      title: 'SEO title',
      description: 'SEO description',
      headline: 'Visible headline',
      author: 'Redacción TuriaFest',
      category: 'Música urbana',
      breadcrumbLabel: 'Noticias',
      language: 'es-ES',
      image: article.socialImage,
      imageAlt: 'Artista sobre el escenario',
    });

    const canonical = document.head.querySelector<HTMLLinkElement>('[data-fv-news-canonical]');
    const script = document.head.querySelector<HTMLScriptElement>('[data-fv-news-jsonld]');
    const schema = JSON.parse(script?.textContent ?? '{}') as {
      '@graph'?: readonly { '@type'?: string; citation?: string | readonly string[] }[];
    };
    const newsArticle = schema['@graph']?.find((entry) => entry['@type'] === 'NewsArticle');

    expect(document.head.querySelectorAll('[data-fv-news-canonical]')).toHaveLength(1);
    expect(canonical?.href).toContain(`/noticias/${article.slug}`);
    expect(newsArticle?.citation).toEqual([
      article.source.url,
      ...(article.source.additionalUrls ?? []),
    ]);
  });

  it('removes article-only metadata when returning to the listing', () => {
    const article = NEWS_ARTICLES[0];
    const listing = {
      title: 'TuriaFest — Noticias',
      description: 'Actualidad festivalera',
      image: article.socialImage,
      imageAlt: 'Artista sobre el escenario',
    };

    service.applyArticle(article, {
      ...listing,
      headline: 'Visible headline',
      author: 'Redacción TuriaFest',
      category: 'Música urbana',
      breadcrumbLabel: 'Noticias',
      language: 'es-ES',
    });
    service.applyListing(listing);

    expect(document.head.querySelector('[data-fv-news-jsonld]')).toBeNull();
    expect(document.head.querySelector('meta[property="article:published_time"]')).toBeNull();
    expect(
      document.head.querySelector<HTMLLinkElement>('[data-fv-news-canonical]')?.href,
    ).toContain('/noticias');
  });
});
