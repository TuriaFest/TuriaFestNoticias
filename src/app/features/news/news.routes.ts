import { Routes } from '@angular/router';

export const NEWS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./feature/news.page').then(({ NewsPageComponent }) => NewsPageComponent),
  },
];
