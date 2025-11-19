import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/feed',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'feed',
    canActivate: [authGuard],
    loadChildren: () => import('./features/feed/feed.module').then(m => m.FeedModule)
  },
  {
    path: 'movies',
    canActivate: [authGuard],
    children: [
      {
        path: 'search',
        loadComponent: () => import('./features/movies/pages/search/search').then(m => m.SearchComponent)
      },
      {
        path: '',
        redirectTo: 'search',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/feed'
  }
];