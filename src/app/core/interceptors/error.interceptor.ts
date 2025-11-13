import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error inesperado';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Intentar obtener el mensaje del backend
        const backendMessage = error.error?.detail || error.error?.message;
        
        switch (error.status) {
          case 400:
            errorMessage = backendMessage || 'Solicitud incorrecta';
            console.log('Error 400 completo:', error.error); // ⬅️ Debug
            break;
          case 401:
            errorMessage = backendMessage || 'No autorizado. Por favor inicia sesión';
            localStorage.removeItem('access_token');
            router.navigate(['/auth/login']);
            break;
          case 403:
            errorMessage = backendMessage || 'No tienes permisos para realizar esta acción';
            break;
          case 404:
            errorMessage = backendMessage || 'Recurso no encontrado';
            break;
          case 500:
            errorMessage = backendMessage || 'Error del servidor. Intenta más tarde';
            break;
          default:
            errorMessage = backendMessage || `Error: ${error.status}`;
        }
      }

      toastr.error(errorMessage, 'Error');
      return throwError(() => error);
    })
  );
};