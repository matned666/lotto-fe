import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AppConfigService } from '../config/app-config.service';
import { CsrfTokenService } from './csrf-token.service';

const xsrfHeaderName = 'X-XSRF-TOKEN';

export const backendCredentialsInterceptor: HttpInterceptorFn = (request, next) => {
  const appConfig = inject(AppConfigService);
  const csrfToken = inject(CsrfTokenService).token;

  if (!request.url.startsWith(appConfig.backendUrl)) {
    return next(request);
  }

  const headers = csrfToken && !request.headers.has(xsrfHeaderName)
    ? request.headers.set(xsrfHeaderName, csrfToken)
    : request.headers;

  return next(request.clone({
    headers,
    withCredentials: true,
  }));
};
