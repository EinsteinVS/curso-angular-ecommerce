import { Injectable, signal } from '@angular/core';
import { StoreSession } from '../models/session.model';

@Injectable({ providedIn: 'root' })
export class SessionService {

  private readonly STORAGE_KEY = 'store-session';
  private readonly AUTH_TOKEN_KEY = 'auth_token';

  session = signal<StoreSession | null>(null);

  constructor() {
    this.loadFromStorage();
  }

  setSession(data: StoreSession) {
    this.session.set(data);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  clearSession() {
    this.session.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
  }

  setAuthToken(token: string) {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
  }

  getAuthToken() {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  clearAuthToken() {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
  }

  private loadFromStorage() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      this.session.set(JSON.parse(raw));
    }
  }

  isLoggedIn() {
    return !!this.getAuthToken();
  }
}
