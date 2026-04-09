import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, switchMap, throwError } from 'rxjs';
import { SessionService } from '../services/session.service';
import { TokenRefreshService } from '../services/token-refresh.service';
import { AuthService } from '../../domains/auth/auth.service';

// Endpoint pubblici: un 401 su questi NON deve fare logout/redirect
const PUBLIC_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/email-available',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
];

const REFRESH_ENDPOINT = '/api/auth/refresh';

function getPathname(url: string): string {
  try {
    return new URL(url, window.location.origin).pathname;
  } catch {
    return url;
  }
}

function isPublicEndpoint(url: string): boolean {
  const path = getPathname(url);
  return PUBLIC_ENDPOINTS.some((endpoint) => path === endpoint);
}

function isRefreshEndpoint(url: string): boolean {
  return getPathname(url) === REFRESH_ENDPOINT;
}

function addAuthHeader(req: Parameters<HttpInterceptorFn>[0], token: string) {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function handleAuthFailure(sessionService: SessionService, router: Router) {
  sessionService.clearSession();
  router.navigate(['/auth/login']);
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(SessionService);
  const authService = inject(AuthService);
  const tokenRefreshService = inject(TokenRefreshService);
  const router = inject(Router);
  const token = sessionService.getAuthToken();

  const authReq = token && !isRefreshEndpoint(req.url)
    ? addAuthHeader(req, token)
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isPublicEndpoint(req.url)) {
        return throwError(() => error);
      }

      if (!sessionService.getAuthToken()) {
        handleAuthFailure(sessionService, router);
        return throwError(() => error);
      }

      if (tokenRefreshService.isRefreshing) {
        return tokenRefreshService.waitForToken$().pipe(
          switchMap((newToken) => next(addAuthHeader(req, newToken)))
        );
      }

      tokenRefreshService.startRefresh();

      return authService.refreshToken().pipe(
        switchMap((response) => {
          if (!response?.token) {
            throw new Error('REFRESH_TOKEN_MISSING');
          }

          tokenRefreshService.completeRefresh(response.token);
          return next(addAuthHeader(req, response.token));
        }),
        catchError((refreshError) => {
          tokenRefreshService.failRefresh();
          handleAuthFailure(sessionService, router);
          return throwError(() => refreshError);
        }),
        finalize(() => {
          tokenRefreshService.finishRefresh();
        })
      );
    })
  );
};
