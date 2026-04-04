
import { Injectable, signal } from '@angular/core';
import { loginResponse, RefreshTokenResponse, RegisterRequest, RegisterResponse, LoginRequest, AuthenticatedUser } from '@shared/models/login.model';
import { ChangePasswordRequest, ChangePasswordResponse } from './models/change-password.model';
import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from './models/forgot-reset-password.model';
import {
  EmailVerificationRequest,
  EmailVerificationResponse,
} from './models/email-verification.model';
import { catchError, of, tap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { StoreSession } from '../../core/models/session.model';
import { SessionService } from '../../core/services/session.service';

type LoginApiResponse = loginResponse & {
  storeSession?: StoreSession;
  session?: StoreSession;
  login?: StoreSession['login'];
  page?: StoreSession['page'];
};

type LoggedUser = {
  name: string;
  lastName: string;
  email?: string;
};

type EmailAvailableResponse = {
  available: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser = signal<LoggedUser | null>(null);
  private redirectUrl = signal<string>('/');
  
  constructor(private api: ApiService, private sessionService: SessionService) {

  }

  register(data: RegisterRequest) {
    return this.api.post<RegisterResponse>('/api/auth/register', data);
  }

  login(credentials: LoginRequest) {
    return this.api.post<LoginApiResponse>('/api/auth/login', credentials, { withCredentials: true }).pipe(
      tap((response) => {
        if ((response as any)?.error) {
          throw new Error((response as any).error);
        }

        if (response?.token) {
          this.sessionService.setAuthToken(response.token);
        }

        const session = this.extractSession(response);
        if (session) {
          this.sessionService.setSession(session);
          this.currentUser.set(null);
          this.loadCurrentUser().subscribe();
          return;
        }

        if (response?.token) {
          this.sessionService.clearSession();
          throw new Error('SESSION_EMPTY');
        }
      })
    );
  }

  isLoggedIn() {
    return this.sessionService.isLoggedIn();
  }

  logout() {
    return this.api.post<{ message: string }>('/api/auth/logout', {}, { withCredentials: true }).pipe(
      tap(() => {
        this.sessionService.clearSession();
        this.currentUser.set(null);
      }),
      catchError(() => {
        this.sessionService.clearSession();
        this.currentUser.set(null);
        return of(null);
      })
    );
  }

  refreshToken() {
    return this.api.post<RefreshTokenResponse>('/api/auth/refresh', {}, { withCredentials: true }).pipe(
      tap((response) => {
        if (!response?.token) {
          throw new Error('REFRESH_TOKEN_MISSING');
        }

        this.sessionService.setAuthToken(response.token);
      })
    );
  }

  loadCurrentUser() {
    if (!this.isLoggedIn()) {
      this.currentUser.set(null);
      return of(null);
    }

    return this.api.get<LoggedUser>('/api/user/me').pipe(
      tap((user) => this.currentUser.set(user)),
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      })
    );
  }

  displayName() {
    const user = this.currentUser();
    if (!user) return 'Mi cuenta';

    return `${user.name} ${user.lastName}`.trim();
  }

  /**
   * Salva l'URL da cui l'utente è stato rediretto a login
   * @param url URL da salvare
   */
  setRedirectUrl(url: string): void {
    // Evita di redirigere a /auth/login
    if (!url.includes('/auth/')) {
      this.redirectUrl.set(url);
    }
  }

  /**
   * Recupera l'URL salvato e lo resetta
   * @returns URL salvato o '/' come default
   */
  getRedirectUrl(): string {
    const url = this.redirectUrl();
    this.redirectUrl.set('/');
    return url && url !== '/auth/login' ? url : '/';
  }

  private extractSession(response: LoginApiResponse): StoreSession | null {
    if (this.isValidStoreSession(response.storeSession)) {
      return response.storeSession;
    }

    if (this.isValidStoreSession(response.session)) {
      return response.session;
    }

    if (response.login && response.page) {
      return {
        login: response.login,
        page: response.page,
      };
    }

    return null;
  }

  private isValidStoreSession(session?: StoreSession): session is StoreSession {
    return !!session?.login && !!session?.page;
  }

  checkEmailExists(email: string) {
    return this.api.get<EmailAvailableResponse>(`/api/auth/email-available?email=${email}`);
  }

  changePassword(data: ChangePasswordRequest) {
    return this.api.post<ChangePasswordResponse>('/api/auth/change-password', data);
  }

  forgotPassword(data: ForgotPasswordRequest) {
    return this.api.post<ForgotPasswordResponse>('/api/auth/forgot-password', data);
  }

  resetPassword(data: ResetPasswordRequest) {
    return this.api.post<ResetPasswordResponse>('/api/auth/reset-password', data);
  }

  /**
   * Verifica il token di verifica email
   * @param data EmailVerificationRequest con email e token
   */
  verifyEmail(data: EmailVerificationRequest) {
    return this.api.post<EmailVerificationResponse>('/api/auth/verify-email', data);
  }

}
