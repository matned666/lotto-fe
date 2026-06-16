import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from './auth.service';

export const userGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService
    .loadCurrentUser()
    .pipe(
      map((user) =>
        user
          ? authService.isAuthenticated() &&
            !user.authorities.includes('ROLE_BLOCKED') &&
            (user.authorities.includes('ROLE_USER') || user.authorities.includes('ROLE_ADMIN'))
          : router.createUrlTree(['/login']),
      ),
    );
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService
    .loadCurrentUser()
    .pipe(
      map((user) =>
        user
          ? authService.isAuthenticated() &&
            !user.authorities.includes('ROLE_BLOCKED') &&
            user.authorities.includes('ROLE_ADMIN')
          : router.createUrlTree(['/login']),
      ),
    );
};

export const anonymousGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.loadCurrentUser().pipe(
    map((user) => user ? router.createUrlTree(['/dashboard']) : true),
  );
};
