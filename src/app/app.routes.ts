import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'noticias',
  },
  {
    path: 'noticias',
    loadChildren: () => import('@features/news/news.routes').then(({ NEWS_ROUTES }) => NEWS_ROUTES),
  },
];
