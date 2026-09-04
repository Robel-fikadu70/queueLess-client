import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../store/auth.store';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const store = inject(AuthStore);
    const router = inject(Router);

    const userRole = store.currentUserRole();

    //Verify if the authenticated role exists inside permitted route limits
    if (store.isAuthenticated() && userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    return router.createUrlTree(['/unauthorized']);
  };
};
