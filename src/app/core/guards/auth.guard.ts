import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  if (token) {
    // Usuario autenticado, puede acceder
    return true;
  }

  // Usuario no autenticado, redirigir al login
  router.navigate(['/auth/login']);
  return false;
};