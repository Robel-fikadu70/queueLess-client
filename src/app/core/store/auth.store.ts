import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { UserProfile } from '../../shared/models/user.model';
import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { catchError, of, tap } from 'rxjs';

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

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isAuthenticated: computed(() => !!store.user()),
    currentUserRole: computed(() => {
      return store.user() ? 'Customer' : null;
    }),
  })),
  withMethods((store, http = inject(HttpClient), router = inject(Router)) => ({
    setError(err: string | null) {
      patchState(store, { error: err });
    },

    //core login request
    login(credentials: { email: string; password: string }) {
      patchState(store, { isLoading: true, error: null });

      return http.post<UserProfile>(`${environment.apiUrl}/auth/login`, credentials).pipe(
        tap((user) => {
          patchState(store, { user, isLoading: false });
          router.navigate(['customer/dashboard']);
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

      return http.post(`${environment.apiUrl}/auth/logout`, {}).pipe(
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
      );
    },
  })),
);
