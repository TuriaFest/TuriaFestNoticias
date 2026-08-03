import { describe, it, expect } from 'vitest';

import { NEWS_ARTICLES } from '@data/news.catalogue';
import { ES_TRANSLATIONS } from '@i18n/translations';
import { t } from '@i18n/index';
import { buildArticleSeo, buildListingSeo } from '@lib/seo';

function firstArticle() {
  return NEWS_ARTICLES[0];
}

describe('seo lib', () => {
  it('builds the listing head with an absolute canonical for /noticias', () => {
    const article = firstArticle();
    const seo = buildListingSeo({
      title: 'TuriaFest — Noticias',
      description: 'Descripción de la lista',
      image: article.socialImage,
      imageAlt: 'Alt',
    });

    expect(seo.canonical).toBe('https://turiafestnoticias.es/noticias');
    expect(seo.og.type).toBe('website');
    expect(seo.og.image).toMatch(/^https:\/\//);
    expect(seo.article).toBeUndefined();
    expect(seo.jsonLd).toBeUndefined();
  });

  it('builds the article head with NewsArticle JSON-LD and citations', () => {
    const article = firstArticle();
    const seo = buildArticleSeo(article, {
      title: 'Título SEO',
      description: 'Descripción SEO',
      headline: 'Titular',
      author: 'TuriaFest',
      category: 'Festivales',
      breadcrumbLabel: 'Noticias',
      language: 'es-ES',
      image: article.socialImage,
      imageAlt: 'Alt',
    });

    expect(seo.canonical).toBe(
      `https://turiafestnoticias.es/noticias/${article.slug}`,
    );
    expect(seo.og.type).toBe('article');
    expect(seo.article?.publishedTime).toBe(article.publishedAt);
    expect(seo.article?.modifiedTime).toBe(article.modifiedAt);

    const graph = JSON.parse(seo.jsonLd ?? '{}') as {
      '@graph': Array<Record<string, unknown>>;
    };
    expect(graph['@graph'].some((node) => node['@type'] === 'NewsArticle')).toBe(true);
    expect(graph['@graph'].some((node) => node['@type'] === 'BreadcrumbList')).toBe(true);
  });

  it('uses translated strings when composing the article head', () => {
    const article = firstArticle();
    const seo = buildArticleSeo(article, {
      title: t(article.seoTitleKey, ES_TRANSLATIONS),
      description: t(article.seoDescriptionKey, ES_TRANSLATIONS),
      headline: t(article.titleKey, ES_TRANSLATIONS),
      author: t(article.authorKey, ES_TRANSLATIONS),
      category: t(article.categoryKey, ES_TRANSLATIONS),
      breadcrumbLabel: t('news.title', ES_TRANSLATIONS),
      language: 'es-ES',
      image: article.socialImage,
      imageAlt: t(article.socialImage.altKey, ES_TRANSLATIONS),
    });

    expect(seo.og.title).toBe(t(article.seoTitleKey, ES_TRANSLATIONS));
    expect(seo.twitter.description).toBe(t(article.seoDescriptionKey, ES_TRANSLATIONS));
  });
});
