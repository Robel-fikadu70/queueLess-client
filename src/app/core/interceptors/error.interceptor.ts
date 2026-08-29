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
          switchMap((res) => {
            // Replay the original failed request with the newly rotated Access Token
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.accessToken}`,
              },
            });
            return next(retryReq);
          }),
          catchError((refreshErr) => {
            // If refresh fails (Theft Detection or expired refresh token), invalidate session and route to login
            console.warn('Silent session refresh failed. Session expired or compromised.');
            authService.setAccessToken(null);
            router.navigate(['/login']);
            return throwError(() => refreshErr);
          }),
        );
      }

      // If direct login or refresh fails, clear token state
      if (err.status === 401) {
        authService.setAccessToken(null);
        if (!isAuthRoute) {
          router.navigate(['/login']);
        }
      } else {
        console.error('API Error Response:', detail);
      }

      return throwError(() => err);
    }),
  );
};
