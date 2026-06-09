import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';

import { AuthenticatedUser, AuthStatus, CsrfTokenResponse } from './auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly backendUrl = 'http://localhost:8080';

  private readonly statusState = signal<AuthStatus>('unknown');
  private readonly userState = signal<AuthenticatedUser | null>(null);
  private readonly errorMessageState = signal<string | null>(null);

  readonly status = this.statusState.asReadonly();
  readonly user = this.userState.asReadonly();
  readonly errorMessage = this.errorMessageState.asReadonly();
  readonly isAuthenticated = computed(() => this.statusState() === 'authenticated');

  login(): void {
    window.location.assign(`${this.backendUrl}/oauth2/authorization/github`);
  }

  loadCurrentUser(): Observable<AuthenticatedUser | null> {
    this.statusState.set('checking');
    this.errorMessageState.set(null);

    return this.http.get<AuthenticatedUser>(`${this.backendUrl}/api/auth/me`).pipe(
      switchMap((user) => this.loadCsrfToken().pipe(
        map(() => user),
        catchError(() => of(user)),
      )),
      tap((user) => {
        this.userState.set(user);
        this.statusState.set('authenticated');
      }),
      catchError((error: HttpErrorResponse) => {
        this.userState.set(null);
        this.statusState.set('anonymous');
        this.errorMessageState.set(error.status === 0 ? 'Backend jest chwilowo niedostepny.' : null);
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
        this.errorMessageState.set('Nie udalo sie wylogowac. Sprobuj ponownie.');
        return throwError(() => error);
      }),
    );
  }

  private loadCsrfToken(): Observable<CsrfTokenResponse> {
    return this.http.get<CsrfTokenResponse>(`${this.backendUrl}/api/auth/csrf`);
  }

  private submitLogoutForm(csrfToken: CsrfTokenResponse): void {
    const form = document.createElement('form');
    form.method = 'post';
    form.action = `${this.backendUrl}/api/auth/logout`;
    form.style.display = 'none';

    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = csrfToken.parameterName;
    tokenInput.value = csrfToken.token;

    form.appendChild(tokenInput);
    document.body.appendChild(form);
    form.submit();
  }
}
