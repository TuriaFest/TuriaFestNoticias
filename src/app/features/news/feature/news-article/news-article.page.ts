import {
  IMAGE_LOADER,
  NgOptimizedImage,
  type ImageLoader,
  type ImageLoaderConfig,
} from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { TranslationService } from '@shared/data-access/i18n/translation.service';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { getNewsArticleBySlug } from '../../data-access/news.catalogue';
import { NewsMetaService } from '../../data-access/news-meta.service';

const LANGUAGE_TAGS: Readonly<Record<string, string>> = {
  es: 'es-ES',
  ca: 'ca-ES-valencia',
  en: 'en-GB',
};

const NEWS_IMAGE_LOADER: ImageLoader = ({ src, width, loaderParams }: ImageLoaderConfig) => {
  const sources = loaderParams?.['sources'] as Readonly<Record<number, string>> | undefined;
  return width === undefined ? src : (sources?.[width] ?? src);
};

@Component({
  selector: 'fv-news-article-page',
  imports: [NgOptimizedImage, RouterLink, TranslatePipe],
  templateUrl: './news-article.page.html',
  styleUrl: './news-article.page.scss',
  providers: [{ provide: IMAGE_LOADER, useValue: NEWS_IMAGE_LOADER }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsArticlePageComponent {
  readonly #route = inject(ActivatedRoute);
  readonly #translation = inject(TranslationService);
  readonly #meta = inject(NewsMetaService);

  protected readonly article = this.#getArticle();

  constructor() {
    effect(() => {
      const activeLang = this.#translation.activeLang();
      this.#meta.applyArticle(this.article, {
        title: this.#translation.t(this.article.seoTitleKey),
        description: this.#translation.t(this.article.seoDescriptionKey),
        headline: this.#translation.t(this.article.titleKey),
        author: this.#translation.t(this.article.authorKey),
        category: this.#translation.t(this.article.categoryKey),
        breadcrumbLabel: this.#translation.t('news.title'),
        language: LANGUAGE_TAGS[activeLang] ?? LANGUAGE_TAGS['es'],
        image: this.article.socialImage,
        imageAlt: this.#translation.t(this.article.socialImage.altKey),
      });
    });
  }

  #getArticle() {
    const slug = String(this.#route.snapshot.data['newsSlug'] ?? '');
    const article = getNewsArticleBySlug(slug);
    if (!article) throw new Error(`News article route is missing catalogue data: ${slug}`);
    return article;
  }
}
