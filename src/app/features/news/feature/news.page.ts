import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { TranslationService } from '@shared/data-access/i18n/translation.service';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { NewsSearchService } from '../data-access/news-search.service';

const SAMPLE_NEWS_ID = 'sample-news';

@Component({
  selector: 'fv-news-page',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './news.page.html',
  styleUrl: './news.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsPageComponent {
  readonly #title = inject(Title);
  readonly #translation = inject(TranslationService);
  readonly #route = inject(ActivatedRoute);
  readonly #search = inject(NewsSearchService);
  readonly #queryParamMap = toSignal(this.#route.queryParamMap, {
    initialValue: this.#route.snapshot.queryParamMap,
  });

  protected readonly query = computed(() => this.#queryParamMap().get('buscar')?.trim() ?? '');
  protected readonly hasResults = computed(() => {
    const query = this.query();
    return !query || this.#search.search(query).some((result) => result.id === SAMPLE_NEWS_ID);
  });

  constructor() {
    this.#buildSearchIndex();

    effect(() => {
      this.#translation.activeLang();
      this.#title.setTitle(this.#translation.t('news.meta.title'));
      this.#buildSearchIndex();
    });
  }

  #buildSearchIndex(): void {
    this.#search.buildIndex([
      {
        id: SAMPLE_NEWS_ID,
        title: this.#translation.t('news.sample.title'),
        city: this.#translation.t('news.sample.city'),
        genres: this.#translation.t('news.sample.genre'),
      },
    ]);
  }
}
