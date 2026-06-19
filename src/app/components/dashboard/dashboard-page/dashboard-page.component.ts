import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import {MenuService} from "../../../core/menu/model/menu.service";
import {TranslatePipe} from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';

interface DashboardMenuItem {
  label: string;
  route: string;
  icon: string;
  roles: string[];
}

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe, MatIcon],
})
export class DashboardPageComponent {
  private readonly authService = inject(AuthService);
  private menuService = inject(MenuService);

  protected readonly errorMessage = this.authService.errorMessage;
  protected readonly isLoggingOut = signal(false);
  protected readonly isMenuExpanded = signal(true);
  protected readonly displayName = computed(
    () => this.authService.user()?.displayName ?? 'Llama user',
  );
  protected readonly avatarUrl = computed(() => this.authService.user()?.avatar ?? null);
  protected readonly menuItems: DashboardMenuItem[] = this.menuService.menuItems;
  protected readonly userRoles = computed(() => this.authService.user()?.authorities ?? []);

  protected toggleMenu(): void {
    this.isMenuExpanded.update((value) => !value);
  }

  protected logout(): void {
    this.isLoggingOut.set(true);

    this.authService.logout().subscribe({
      error: () => this.isLoggingOut.set(false),
    });
  }

  protected hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.userRoles().includes(role));
  }
}
