import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/Auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      //safety parse
      const detail = err.error?.detail ?? 'A system error occurred.';

      // Avoid infinite retry loops if login or refresh endpoints return 401
      const isAuthRoute =
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/refresh') ||
        req.url.includes('/auth/register');

      if (err.status === 401 && !isAuthRoute) {
        // Triggers silent token rotation
        return authService.refresh().pipe(
          switchMap(() => {
            return next(req);
          }),
          catchError((refreshErr) => {
            // If refresh fails (Theft Detection or expired refresh token), invalidate session and route to login
            console.warn('Refresh token is expired or has been compromised. Redirecting to login.');
            router.navigate(['/login']);
            return throwError(() => refreshErr);
          }),
        );
      }

      // If direct auth routes fails, redirect to login
      if (err.status === 401 && isAuthRoute) {
        router.navigate(['/login']);
      } else if (err.status !== 401) {
        console.error('API Error Response:', detail);
      }

      return throwError(() => err);
    }),
  );
};
