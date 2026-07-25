import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { environment } from '@env/environment';
import type { NewsArticle } from './news-article.model';

interface NewsListingMeta {
  readonly title: string;
  readonly description: string;
  readonly image: NewsArticle['socialImage'];
  readonly imageAlt: string;
}

interface NewsArticleMeta extends NewsListingMeta {
  readonly headline: string;
  readonly author: string;
  readonly category: string;
  readonly breadcrumbLabel: string;
  readonly language: string;
}

const NEWS_CANONICAL_SELECTOR = 'link[data-fv-news-canonical]';
const NEWS_STRUCTURED_DATA_SELECTOR = 'script[data-fv-news-jsonld]';

@Injectable({ providedIn: 'root' })
export class NewsMetaService {
  readonly #document = inject(DOCUMENT);
  readonly #meta = inject(Meta);
  readonly #title = inject(Title);
  readonly #baseUrl = environment.baseUrl.replace(/\/$/, '');

  applyListing(content: NewsListingMeta): void {
    const canonicalUrl = `${this.#baseUrl}/noticias`;
    this.#applyCommon(content, canonicalUrl, 'website');
    this.#meta.removeTag("property='article:published_time'");
    this.#meta.removeTag("property='article:modified_time'");
    this.#meta.removeTag("name='author'");
    this.#removeStructuredData();
  }

  applyArticle(article: NewsArticle, content: NewsArticleMeta): void {
    const canonicalUrl = `${this.#baseUrl}/noticias/${article.slug}`;
    const imageUrl = this.#absoluteUrl(article.socialImage.src);
    const citations = [article.source.url, ...(article.source.additionalUrls ?? [])];

    this.#applyCommon(content, canonicalUrl, 'article');
    this.#meta.updateTag({ property: 'article:published_time', content: article.publishedAt });
    this.#meta.updateTag({ property: 'article:modified_time', content: article.modifiedAt });
    this.#meta.updateTag({ name: 'author', content: content.author });
    this.#setStructuredData({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'NewsArticle',
          '@id': `${canonicalUrl}#article`,
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
          headline: content.headline,
          description: content.description,
          image: [imageUrl],
          datePublished: article.publishedAt,
          dateModified: article.modifiedAt,
          author: { '@type': 'Organization', name: content.author },
          publisher: {
            '@type': 'Organization',
            name: 'TuriaFest',
            url: this.#baseUrl,
          },
          articleSection: content.category,
          inLanguage: content.language,
          url: canonicalUrl,
          citation: citations.length === 1 ? citations[0] : citations,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'TuriaFest',
              item: this.#baseUrl,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: content.breadcrumbLabel,
              item: `${this.#baseUrl}/noticias`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: content.headline,
            },
          ],
        },
      ],
    });
  }

  #applyCommon(content: NewsListingMeta, canonicalUrl: string, type: string): void {
    const imageUrl = this.#absoluteUrl(content.image.src);
    this.#title.setTitle(content.title);
    this.#meta.updateTag({ name: 'description', content: content.description });
    this.#meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.#meta.updateTag({ property: 'og:title', content: content.title });
    this.#meta.updateTag({ property: 'og:description', content: content.description });
    this.#meta.updateTag({ property: 'og:type', content: type });
    this.#meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.#meta.updateTag({ property: 'og:image', content: imageUrl });
    this.#meta.updateTag({ property: 'og:image:alt', content: content.imageAlt });
    this.#meta.updateTag({ property: 'og:image:width', content: String(content.image.width) });
    this.#meta.updateTag({ property: 'og:image:height', content: String(content.image.height) });
    this.#meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.#meta.updateTag({ name: 'twitter:title', content: content.title });
    this.#meta.updateTag({ name: 'twitter:description', content: content.description });
    this.#meta.updateTag({ name: 'twitter:image', content: imageUrl });
    this.#meta.updateTag({ name: 'twitter:image:alt', content: content.imageAlt });
    this.#setCanonical(canonicalUrl);
  }

  #absoluteUrl(path: string): string {
    return /^https?:\/\//.test(path) ? path : `${this.#baseUrl}/${path.replace(/^\//, '')}`;
  }

  #setCanonical(url: string): void {
    let link = this.#document.head.querySelector<HTMLLinkElement>(NEWS_CANONICAL_SELECTOR);
    if (!link) {
      link = this.#document.createElement('link');
      link.rel = 'canonical';
      link.setAttribute('data-fv-news-canonical', '');
      this.#document.head.appendChild(link);
    }
    link.href = url;
  }

  #setStructuredData(data: object): void {
    this.#removeStructuredData();
    const script = this.#document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-fv-news-jsonld', '');
    script.textContent = JSON.stringify(data);
    this.#document.head.appendChild(script);
  }

  #removeStructuredData(): void {
    const script = this.#document.head.querySelector(NEWS_STRUCTURED_DATA_SELECTOR);
    if (script) this.#document.head.removeChild(script);
  }
}
