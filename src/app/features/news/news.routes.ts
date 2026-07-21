import { Routes } from '@angular/router';
import { NEWS_ARTICLES } from './data-access/news.catalogue';

export const NEWS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./feature/news.page').then(({ NewsPageComponent }) => NewsPageComponent),
  },
  ...NEWS_ARTICLES.map(({ slug }) => ({
    path: slug,
    loadComponent: () =>
      import('./feature/news-article/news-article.page').then(
        ({ NewsArticlePageComponent }) => NewsArticlePageComponent,
      ),
    data: { newsSlug: slug },
  })),
];
