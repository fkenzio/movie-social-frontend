import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const guestGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  if (!token) {
    // Usuario NO autenticado, puede acceder a login/register
    return true;
  }

  // Usuario YA autenticado, redirigir al feed
  router.navigate(['/feed']);
  return false;
};