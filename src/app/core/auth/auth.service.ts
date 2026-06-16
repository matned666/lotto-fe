import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap, throwError, take, EMPTY } from 'rxjs';

import { AppConfigService } from '../config/app-config.service';
import { AuthenticatedUser, AuthStatus, CsrfTokenResponse, OAuthType } from './auth.models';
import { CsrfTokenService } from './csrf-token.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(AppConfigService);
  private readonly csrfTokenService = inject(CsrfTokenService);

  private readonly statusState = signal<AuthStatus>('unknown');
  private readonly userState = signal<AuthenticatedUser | null>(null);
  private readonly errorMessageState = signal<string | null>(null);

  readonly status = this.statusState.asReadonly();
  readonly user = this.userState.asReadonly();
  readonly errorMessage = this.errorMessageState.asReadonly();
  readonly isAuthenticated = computed(() => this.statusState() === 'authenticated');

  loginByOAuth(oauthType: OAuthType): void {
    this.http
      .get(`${this.appConfig.backendUrl}/api/auth/csrf`)
      .pipe(
        take(1),
        catchError((error: HttpErrorResponse) => {
          this.userState.set(null);
          this.statusState.set('anonymous');
          this.errorMessageState.set('ERRORS.LOGIN_ERROR');
          return EMPTY;
        }),
      )
      .subscribe(() => {
        window.location.assign(`${this.appConfig.backendUrl}/oauth2/authorization/${oauthType}`);
      });
  }

  loadCurrentUser(): Observable<AuthenticatedUser | null> {
    this.statusState.set('checking');
    this.errorMessageState.set(null);

    return this.http.get<AuthenticatedUser>(`${this.appConfig.backendUrl}/api/auth/me`).pipe(
      switchMap((user) =>
        this.loadCsrfToken().pipe(
          map(() => user),
          catchError(() => of(user)),
        ),
      ),
      tap((user) => {
        this.userState.set(user);
        this.statusState.set('authenticated');
      }),
      catchError((error: HttpErrorResponse) => {
        this.userState.set(null);
        this.csrfTokenService.clear();
        this.statusState.set('anonymous');
        if (error.status === 403) {
          this.errorMessageState.set('ERRORS.USER_BLOCKED');
        } else if (error.status === 0) {
          this.errorMessageState.set('ERRORS.LOGIN_ERROR');
        }
        return of(null);
      }),
    );
  }

  logout(): Observable<void> {
    this.errorMessageState.set(null);

    return this.loadCsrfToken().pipe(
      tap((csrfToken) => this.submitLogoutForm(csrfToken)),
      map(() => undefined),
      catchError((error: HttpErrorResponse) => {
        this.errorMessageState.set('ERRORS.LOGOUT_ERROR');
        return throwError(() => error);
      }),
    );
  }

  private loadCsrfToken(): Observable<CsrfTokenResponse> {
    return this.http.get<CsrfTokenResponse>(`${this.appConfig.backendUrl}/api/auth/csrf`).pipe(
      tap((csrfToken) => this.csrfTokenService.setToken(csrfToken.token)),
      catchError((error) => {
        this.userState.set(null);
        return throwError(() => error);
      }),
    );
  }

  private submitLogoutForm(csrfToken: CsrfTokenResponse): void {
    const form = document.createElement('form');
    form.method = 'post';
    form.action = `${this.appConfig.backendUrl}/api/auth/logout`;
    form.style.display = 'none';

    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = csrfToken.parameterName;
    tokenInput.value = csrfToken.token;

    form.appendChild(tokenInput);
    document.body.appendChild(form);
    form.submit();
  }

  clearLocalState(): void {
    this.userState.set(null);
    this.csrfTokenService.clear();
    this.statusState.set('anonymous');
    this.errorMessageState.set(null);
  }
}
