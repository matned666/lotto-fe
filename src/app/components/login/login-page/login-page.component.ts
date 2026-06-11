import { Component, inject } from '@angular/core';

import { AuthService } from '../../../core/auth/auth.service';
import {NgOptimizedImage} from "@angular/common";
import {TranslatePipe} from '@ngx-translate/core';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrl: '../../../shared/auth-page.css',
  imports: [
    NgOptimizedImage,
    TranslatePipe,

  ]
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);

  protected readonly errorMessage = this.authService.errorMessage;

  protected loginByGithub(): void {
    this.authService.loginByGithub();
  }

  protected loginByGoogle(): void {
    this.authService.loginByGoogle();
  }


}
