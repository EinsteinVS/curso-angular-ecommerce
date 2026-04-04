import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';

type HttpOptions = {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: HttpParams | Record<string, string | number | boolean | string[]>;
  context?: HttpContext;
  withCredentials?: boolean;
  reportProgress?: boolean;
};

@Injectable({ providedIn: 'root' })
export class ApiService {

  private readonly baseUrl = 'http://localhost:5268';

  constructor(private http: HttpClient) {}

  get<T>(url: string, options?: HttpOptions) {
    return this.http.get<T>(this.buildUrl(url), options);
  }

  post<T>(url: string, body: unknown, options?: HttpOptions) {
    return this.http.post<T>(this.buildUrl(url), body, options);
  }

  put<T>(url: string, body: unknown, options?: HttpOptions) {
    return this.http.put<T>(this.buildUrl(url), body, options);
  }

  private buildUrl(url: string) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return `${this.baseUrl}${url}`;
  }
}
