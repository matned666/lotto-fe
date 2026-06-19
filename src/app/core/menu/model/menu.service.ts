import {DashboardMenuItem} from "../../../model/dashboard-menu-item";
import {inject, Injectable} from "@angular/core";
import {TranslateService} from '@ngx-translate/core';

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
      icon: 'dashboard',
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

