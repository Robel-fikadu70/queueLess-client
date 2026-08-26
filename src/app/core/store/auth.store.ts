import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { UserProfile } from '../../shared/models/user.model';
import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { catchError, of, tap } from 'rxjs';
import { AuthService } from '../services/Auth/auth.service';

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

function decodeTokenClaims(token: string): any {
  try {
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = atob(payloadBase64);
    return JSON.parse(decodedPayload);
  } catch (e) {
    console.error('Error decoding authorization token claims:', e);
    return null;
  }
}
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isAuthenticated: computed(() => !!store.user()),
    currentUserRole: computed(() => {
      const user = store.user();
      if (!user || !user.token) return null;

      const claims = decodeTokenClaims(user.token);
      return (
        claims?.['role'] ||
        claims?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        null
      );
    }),
  })),
  withMethods((store, authService = inject(AuthService), router = inject(Router)) => ({
    setError(err: string | null) {
      patchState(store, { error: err });
    },

    //core login request
    login(credentials: { email: string; password: string }) {
      patchState(store, { isLoading: true, error: null });

      return authService.login(credentials).pipe(
        tap((user) => {
          patchState(store, { user, isLoading: false });
          const role = store.currentUserRole();
          if (role == 'Admin') {
            router.navigate(['/admin/dashboard']);
          } else if (role === 'Staff') {
            router.navigate(['/staff/dashboard']);
          } else {
            router.navigate(['/customer/dashboard']);
          }
        }),
        catchError((err) => {
          const errMsg = err.error?.detail ?? 'Authentication Failed.';
          patchState(store, { error: errMsg, isLoading: false });
          return of(null);
        }),
      );
    },

    // Core sign-out request
    logout() {
      patchState(store, { isLoading: true });

      return authService.logout().pipe(
        tap(() => {
          patchState(store, initialState);
          router.navigate(['/login']);
        }),
        catchError(() => {
          // Force reset local state if server fails to clear session cache
          patchState(store, initialState);
          router.navigate(['/login']);
          return of(null);
        }),
      ).subscribe();
    },
  })),
);
