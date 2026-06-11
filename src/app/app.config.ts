import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import {HttpClient, provideHttpClient, withInterceptors, withXsrfConfiguration} from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { backendCredentialsInterceptor } from './core/auth/backend-credentials.interceptor';
import { AppConfigService } from './core/config/app-config.service';
import {provideTranslateService, TranslateLoader} from '@ngx-translate/core';
import {provideTranslateHttpLoader, TranslateHttpLoader} from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(() => inject(AppConfigService).load()),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([backendCredentialsInterceptor]),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN'
      })
    ),
    provideTranslateService({
      lang: 'pl',
      fallbackLang: 'pl',
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json'
      })
    })
  ]
};
