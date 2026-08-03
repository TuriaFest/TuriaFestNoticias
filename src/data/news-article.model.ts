import type { TranslationKey } from '@i18n/translations';

export interface NewsArticleImage {
  readonly src: string;
  readonly responsive?: Readonly<{
    srcset: string;
    sizes: string;
    sources: Readonly<Record<number, string>>;
  }>;
  readonly width: number;
  readonly height: number;
  readonly altKey: TranslationKey;
  readonly captionKey?: TranslationKey;
  readonly creditKey?: TranslationKey;
}

export interface NewsArticleSection {
  readonly headingKey: TranslationKey;
  readonly paragraphKeys: readonly TranslationKey[];
}

export interface NewsArticle {
  readonly id: string;
  readonly slug: string;
  readonly titleKey: TranslationKey;
  readonly summaryKey: TranslationKey;
  readonly cityKey: TranslationKey;
  readonly categoryKey: TranslationKey;
  readonly searchGenresKey: TranslationKey;
  readonly publishedLabelKey: TranslationKey;
  readonly publishedAt: string;
  readonly modifiedAt: string;
  readonly authorKey: TranslationKey;
  readonly seoTitleKey: TranslationKey;
  readonly seoDescriptionKey: TranslationKey;
  readonly cover: NewsArticleImage;
  readonly cardImage: NewsArticleImage;
  readonly socialImage: NewsArticleImage;
  readonly highlightKey?: TranslationKey;
  readonly sections: readonly NewsArticleSection[];
  readonly galleryTitleKey: TranslationKey;
  readonly gallery: readonly NewsArticleImage[];
  readonly source: Readonly<{
    url: string;
    additionalUrls?: readonly string[];
  }>;
}
