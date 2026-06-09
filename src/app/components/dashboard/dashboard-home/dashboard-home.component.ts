import { Component, computed, inject } from '@angular/core';

import { AuthService } from '../../../core/auth/auth.service';
import {LottoCardFormComponent} from '../lotto-card-form/lotto-card-form.component';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrl: '../dashboard.component.css',
  imports: [
    LottoCardFormComponent
  ]
})
export class DashboardHomeComponent {
  private readonly authService = inject(AuthService);

  protected readonly displayName = computed(() => this.authService.user()?.displayName ?? 'Llama user');
}
