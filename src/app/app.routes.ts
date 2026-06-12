import { Routes } from '@angular/router';

import { anonymousGuard, authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'login',
    canActivate: [anonymousGuard],
    loadComponent: () => import('./components/login/login-page/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./components/dashboard/dashboard-page/dashboard-page.component').then((m) => m.DashboardPageComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'lotto',
      },
      {
        path: 'lotto',
        title: 'Dashboard',
        loadComponent: () => import('./components/dashboard/dashboard-home/dashboard-home.component').then((m) => m.DashboardHomeComponent),
      },
      {
        path: 'stats',
        title: 'Stats',
        loadComponent: () => import('./components/dashboard/stats/stats.component').then((m) => m.StatsComponent),
      },
      {
        path: 'settings',
        title: 'Settings',
        loadComponent: () => import('./components/dashboard/settings/settings.component').then((m) => m.SettingsComponent),
      },

    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
