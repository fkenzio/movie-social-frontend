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
    path: 'lists',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/lists/pages/my-lists/my-lists').then(m => m.MyListsComponent)
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./features/lists/pages/list-detail/list-detail').then(m => m.ListDetailComponent)
      }
    ]
  },
  {
    path: 'movies',
    canActivate: [authGuard],
    children: [

      {
        path: 'detail/:id',
        loadComponent: () => import('./features/movies/pages/detail/detail').then(m => m.DetailComponent)
      },

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