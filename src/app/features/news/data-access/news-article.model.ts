import type { TranslationKey } from '@shared/data-access/i18n/translations';

export interface NewsArticleImage {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly altKey: TranslationKey;
  readonly captionKey?: TranslationKey;
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
  readonly highlightKey: TranslationKey;
  readonly sections: readonly NewsArticleSection[];
  readonly galleryTitleKey: TranslationKey;
  readonly gallery: readonly NewsArticleImage[];
  readonly source: Readonly<{
    nameKey: TranslationKey;
    url: string;
    verifiedLabelKey: TranslationKey;
  }>;
}
