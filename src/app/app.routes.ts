import { Routes } from '@angular/router';

import { adminGuard, anonymousGuard, userGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'login',
    canActivate: [anonymousGuard],
    loadComponent: () =>
      import('./components/login/login-page/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
  },
  {
    path: 'dashboard',
    canActivate: [userGuard],
    loadComponent: () =>
      import('./components/dashboard/dashboard-page/dashboard-page.component').then(
        (m) => m.DashboardPageComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'lotto',
      },
      {
        path: 'lotto',
        title: 'Lotto results',
        loadComponent: () =>
          import('./components/dashboard/dashboard-home/dashboard-home.component').then(
            (m) => m.DashboardHomeComponent,
          ),
      },
      {
        path: 'stats',
        title: 'Lotto stats',
        loadComponent: () =>
          import('./components/dashboard/stats/stats.component').then((m) => m.StatsComponent),
      },
      {
        path: 'settings',
        canActivate: [adminGuard],
        title: 'Settings',
        loadComponent: () =>
          import('./components/dashboard/settings/settings.component').then(
            (m) => m.SettingsComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
