// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  // Comentadas por ahora hasta que las creemos
  // {
  //   path: 'feed',
  //   canActivate: [authGuard],
  //   loadChildren: () => import('./features/feed/feed.module').then(m => m.FeedModule)
  // },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];