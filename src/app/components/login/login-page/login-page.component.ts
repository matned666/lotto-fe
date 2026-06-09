import { Component, inject } from '@angular/core';

import { AuthService } from '../../../core/auth/auth.service';
import {NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrl: '../../../shared/auth-page.css',
    imports: [
        NgOptimizedImage
    ]
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);

  protected readonly errorMessage = this.authService.errorMessage;

  protected login(): void {
    this.authService.login();
  }
}
