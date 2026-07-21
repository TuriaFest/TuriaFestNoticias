import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { TranslationService } from '@shared/data-access/i18n/translation.service';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { NEWS_ARTICLES } from '../data-access/news.catalogue';
import { NewsMetaService } from '../data-access/news-meta.service';
import { NewsSearchService } from '../data-access/news-search.service';

@Component({
  selector: 'fv-news-page',
  imports: [NgOptimizedImage, RouterLink, TranslatePipe],
  templateUrl: './news.page.html',
  styleUrl: './news.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsPageComponent {
  readonly #translation = inject(TranslationService);
  readonly #route = inject(ActivatedRoute);
  readonly #meta = inject(NewsMetaService);
  readonly #search = inject(NewsSearchService);
  readonly #queryParamMap = toSignal(this.#route.queryParamMap, {
    initialValue: this.#route.snapshot.queryParamMap,
  });

  protected readonly articles = NEWS_ARTICLES;
  protected readonly query = computed(() => this.#queryParamMap().get('buscar')?.trim() ?? '');
  protected readonly visibleArticles = computed(() => {
    const query = this.query();
    if (!query) return this.articles;

    const matchingIds = new Set(this.#search.search(query).map((result) => result.id));
    return this.articles.filter((article) => matchingIds.has(article.id));
  });

  constructor() {
    this.#buildSearchIndex();

    effect(() => {
      this.#translation.activeLang();
      this.#buildSearchIndex();
      const leadArticle = this.articles[0];
      this.#meta.applyListing({
        title: this.#translation.t('news.meta.title'),
        description: this.#translation.t('news.description'),
        image: leadArticle.socialImage,
        imageAlt: this.#translation.t(leadArticle.socialImage.altKey),
      });
    });
  }

  #buildSearchIndex(): void {
    this.#search.buildIndex(
      this.articles.map((article) => ({
        id: article.id,
        title: this.#translation.t(article.titleKey),
        city: this.#translation.t(article.cityKey),
        genres: this.#translation.t(article.searchGenresKey),
      })),
    );
  }
}
