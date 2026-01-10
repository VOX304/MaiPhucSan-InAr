import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { ApiResponse, AuthLoginResponse, AuthUser } from '../models/api-models';

const STORAGE_TOKEN_KEY = 'inar_auth_token';
const STORAGE_USER_KEY = 'inar_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());

  constructor(private http: HttpClient) {}

  /**
   * Current user as observable.
   */
  user$(): Observable<AuthUser | null> {
    return this.userSubject.asObservable();
  }

  /**
   * Current user snapshot.
   */
  get user(): AuthUser | null {
    return this.userSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }

  login(username: string, password: string): Observable<AuthUser> {
    return this.http
      .post<ApiResponse<AuthLoginResponse>>(`${environment.apiBaseUrl}/auth/login`, { username, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(STORAGE_TOKEN_KEY, res.data.token);
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(res.data.user));
          this.userSubject.next(res.data.user);
        }),
        map((res) => res.data.user)
      );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    this.userSubject.next(null);
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
