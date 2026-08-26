import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'customer/dashboard',
    canActivate: [authGuard, roleGuard(['Customer'])],
    loadComponent: () =>
      import('./features/customer/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'customer/ticket/:id',
    canActivate: [authGuard, roleGuard(['Customer'])],
    loadComponent: () =>
      import('./features/customer/ticket-monitor/ticket-monitor.component').then(
        (m) => m.TicketMonitorComponent,
      ),
  },
  {
    path: 'customer/history',
    canActivate: [authGuard, roleGuard(['Customer'])],
    loadComponent: () =>
      import('./features/customer/history/history.component').then((m) => m.HistoryComponent),
  },
  {
    path: 'staff/dashboard',
    canActivate: [authGuard, roleGuard(['Staff'])],
    loadComponent: () =>
      import('./features/staff/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'admin/dashboard',
    canActivate: [authGuard, roleGuard(['Admin'])],
    loadComponent: () =>
      import('./features/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'admin/facilities',
    canActivate: [authGuard, roleGuard(['Admin'])],
    loadComponent: () =>
      import('./features/admin/facilities/facilities.component').then((m) => m.FacilitiesComponent),
  },
  {
    path: 'admin/staff',
    canActivate: [authGuard, roleGuard(['Admin'])],
    loadComponent: () =>
      import('./features/admin/staff/staff.component').then((m) => m.StaffComponent),
  },
  {
    path: 'admin/services',
    canActivate: [authGuard, roleGuard(['Admin'])],
    loadComponent: () =>
      import('./features/admin/services/services.component').then((m) => m.ServicesComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/unauthorized/unauthorized.component').then((m) => m.UnauthorizedComponent),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
