import { Injectable, signal } from '@angular/core';
import { loginResponse, RegisterRequest, RegisterResponse } from '@shared/models/login.model';
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
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser = signal<LoggedUser | null>(null);
  
  constructor(private api: ApiService, private sessionService: SessionService) {

  }

  register(data: RegisterRequest) {
    return this.api.post<RegisterResponse>('/api/auth/register', data);
  }

  login(email: string, password: string) {
    return this.api.post<LoginApiResponse>('/api/auth/login', {
      email: email,
      password: password
    }).pipe(
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
    this.sessionService.clearSession();
    this.currentUser.set(null);
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
    return this.api.get<boolean>(`/api/user/email?email=${email}`).pipe(
      tap({
        next: (response) => {
          console.log('checkEmailExists next:', response);
        },
        error: (error) => {
          console.error('checkEmailExists error:', error);
        }
      })
    );
  }

}
