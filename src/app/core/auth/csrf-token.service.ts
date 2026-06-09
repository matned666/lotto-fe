import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CsrfTokenService {
  private readonly tokenState = signal<string | null>(null);

  get token(): string | null {
    return this.tokenState();
  }

  setToken(token: string): void {
    this.tokenState.set(token);
  }

  clear(): void {
    this.tokenState.set(null);
  }
}
