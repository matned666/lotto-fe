import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import {MenuService} from "../../../core/menu/model/menu.service";
import {TranslatePipe} from '@ngx-translate/core';

interface DashboardMenuItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe],
})
export class DashboardPageComponent {
  private readonly authService = inject(AuthService);
  private menuService = inject(MenuService);

  protected readonly errorMessage = this.authService.errorMessage;
  protected readonly isLoggingOut = signal(false);
  protected readonly isMenuExpanded = signal(true);
  protected readonly displayName = computed(() => this.authService.user()?.displayName ?? 'Llama user');
  protected readonly menuItems: DashboardMenuItem[] = this.menuService.menuItems;

  protected toggleMenu(): void {
    this.isMenuExpanded.update((value) => !value);
  }

  protected logout(): void {
    this.isLoggingOut.set(true);

    this.authService.logout().subscribe({
      error: () => this.isLoggingOut.set(false),
    });
  }
}
