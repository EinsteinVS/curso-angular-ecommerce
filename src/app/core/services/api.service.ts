import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private readonly baseUrl = 'http://localhost:5268';

  constructor(private http: HttpClient) {}

  get<T>(url: string) {
    return this.http.get<T>(this.buildUrl(url));
  }

  post<T>(url: string, body: unknown) {
    return this.http.post<T>(this.buildUrl(url), body);
  }

  private buildUrl(url: string) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return `${this.baseUrl}${url}`;
  }
}
