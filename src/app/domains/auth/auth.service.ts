import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loginResponse } from '@shared/models/login.model';
import { ResponseStatus } from '@shared/models/ResponseStatus';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'auth_token';
  
  constructor(private http: HttpClient) { 

  }

  login(username: string, password: string) {
    return this.http.post<loginResponse>('http://localhost:5268/api/auth/login', {
      Username: 'einstein',//username,
      Password: password
    }).pipe(
      tap((response) => {
        if (typeof localStorage !== 'undefined' && response?.token) {
          localStorage.setItem(this.tokenKey, response.token);
        }
      })
    );
  }

  isLoggedIn() {
    if (typeof localStorage === 'undefined') {
      return false;
    }

    return !!localStorage.getItem(this.tokenKey);
  }

  logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
  }

  checkEmailExists(email: string) {
    return this.http.get<boolean>(`http://localhost:5268/api/user/email?email=${email}`).pipe(
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
