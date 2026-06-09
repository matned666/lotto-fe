import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface RuntimeAppConfig {
  backendUrl: string;
}

const defaultConfig: RuntimeAppConfig = {
  backendUrl: 'http://localhost:8080',
};

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private readonly http = inject(HttpClient);
  private config = defaultConfig;

  get backendUrl(): string {
    return this.config.backendUrl;
  }

  async load(): Promise<void> {
    try {
      const config = await firstValueFrom(this.http.get<RuntimeAppConfig>('/assets/app-config.json'));
      this.config = {
        ...defaultConfig,
        ...config,
        backendUrl: normalizeUrl(config.backendUrl ?? defaultConfig.backendUrl),
      };
    } catch {
      this.config = defaultConfig;
    }
  }
}

function normalizeUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}
