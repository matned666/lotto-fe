import { DashboardMenuItem } from '../../../model/dashboard-menu-item';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  readonly menuItems: DashboardMenuItem[] = [
    {
      label: 'MENU.LOTTO_CHECK',
      route: 'lotto',
      icon: 'casino',
      roles: ['ROLE_USER', 'ROLE_ADMIN'],
    },
    {
      label: 'MENU.STATS',
      route: 'stats',
      icon: 'analytics',
      roles: ['ROLE_USER', 'ROLE_ADMIN'],
    },
    {
      label: 'MENU.SETTINGS',
      route: 'settings',
      icon: 'settings',
      roles: ['ROLE_USER', 'ROLE_ADMIN'],
    },
  ];
}

