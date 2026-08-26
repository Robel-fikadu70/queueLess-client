import { Routes } from '@angular/router';

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
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'customer/dashboard',
    loadComponent: () =>
      import('./features/customer/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'customer/ticket/:id',
    loadComponent: () =>
      import('./features/customer/ticket-monitor/ticket-monitor.component').then(
        (m) => m.TicketMonitorComponent,
      ),
  },
  {
    path: 'customer/history',
    loadComponent: () =>
      import('./features/customer/history/history.component').then((m) => m.HistoryComponent),
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
