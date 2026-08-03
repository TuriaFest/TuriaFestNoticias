// ============================================================================
// seo.ts — TuriaFestNoticias · build-time meta and structured data
// ============================================================================
// Build-time SEO helpers: canonical URLs, Open
// Graph / Twitter tags and NewsArticle JSON-LD are computed here and rendered
// by BaseLayout into `<head>` with the same `data-fv-*` anchor attributes.
// ============================================================================

import type { NewsArticle } from '@data/news-article.model';
import { absoluteUrl, BASE_URL } from './site';

export interface SeoCommonContent {
  readonly title: string;
  readonly description: string;
  readonly image: NewsArticle['socialImage'];
  readonly imageAlt: string;
}

export interface SeoArticleContent extends SeoCommonContent {
  readonly headline: string;
  readonly author: string;
  readonly category: string;
  readonly breadcrumbLabel: string;
  readonly language: string;
}

export interface SeoHead {
  readonly title: string;
  readonly description: string;
  readonly robots: string;
  readonly canonical: string;
  readonly og: Readonly<{
    title: string;
    description: string;
    type: 'website' | 'article';
    url: string;
    image: string;
    imageAlt: string;
    imageWidth: number;
    imageHeight: number;
  }>;
  readonly twitter: Readonly<{
    card: string;
    title: string;
    description: string;
    image: string;
    imageAlt: string;
  }>;
  readonly article?: Readonly<{
    publishedTime: string;
    modifiedTime: string;
    author: string;
  }>;
  readonly jsonLd?: string;
}

/** SEO head for the news listing page (`/noticias`). */
export function buildListingSeo(content: SeoCommonContent): SeoHead {
  const canonical = `${BASE_URL}/noticias`;
  const imageUrl = absoluteUrl(content.image.src);
  const common = {
    title: content.title,
    description: content.description,
    canonical,
    imageUrl,
    imageAlt: content.imageAlt,
    imageWidth: content.image.width,
    imageHeight: content.image.height,
  };
  return toSeoHead(common, 'website');
}

/** SEO head for a single article page (`/noticias/:slug`). */
export function buildArticleSeo(article: NewsArticle, content: SeoArticleContent): SeoHead {
  const canonical = `${BASE_URL}/noticias/${article.slug}`;
  const imageUrl = absoluteUrl(article.socialImage.src);
  const citations = [article.source.url, ...(article.source.additionalUrls ?? [])];
  const common = {
    title: content.title,
    description: content.description,
    canonical,
    imageUrl,
    imageAlt: content.imageAlt,
    imageWidth: article.socialImage.width,
    imageHeight: article.socialImage.height,
  };
  return {
    ...toSeoHead(common, 'article'),
    article: {
      publishedTime: article.publishedAt,
      modifiedTime: article.modifiedAt,
      author: content.author,
    },
    jsonLd: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'NewsArticle',
          '@id': `${canonical}#article`,
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
          headline: content.headline,
          description: content.description,
          image: [imageUrl],
          datePublished: article.publishedAt,
          dateModified: article.modifiedAt,
          author: { '@type': 'Organization', name: content.author },
          publisher: {
            '@type': 'Organization',
            name: 'TuriaFest',
            url: BASE_URL,
          },
          articleSection: content.category,
          inLanguage: content.language,
          url: canonical,
          citation: citations.length === 1 ? citations[0] : citations,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'TuriaFest',
              item: BASE_URL,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: content.breadcrumbLabel,
              item: `${BASE_URL}/noticias`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: content.headline,
            },
          ],
        },
      ],
    }),
  };
}

interface CommonSeoInput {
  readonly title: string;
  readonly description: string;
  readonly canonical: string;
  readonly imageUrl: string;
  readonly imageAlt: string;
  readonly imageWidth: number;
  readonly imageHeight: number;
}

function toSeoHead(content: CommonSeoInput, type: 'website' | 'article'): SeoHead {
  return {
    title: content.title,
    description: content.description,
    robots: 'index, follow',
    canonical: content.canonical,
    og: {
      title: content.title,
      description: content.description,
      type,
      url: content.canonical,
      image: content.imageUrl,
      imageAlt: content.imageAlt,
      imageWidth: content.imageWidth,
      imageHeight: content.imageHeight,
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description,
      image: content.imageUrl,
      imageAlt: content.imageAlt,
    },
  };
}
