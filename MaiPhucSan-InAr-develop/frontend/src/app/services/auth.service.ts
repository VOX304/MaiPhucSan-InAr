import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, map, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { AuthUser } from '../models/api-models';

const STORAGE_TOKEN_KEY = 'inar_auth_token';
const STORAGE_USER_KEY = 'inar_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());

  constructor(private http: HttpClient) {}

  user$(): Observable<AuthUser | null> {
    return this.userSubject.asObservable();
  }

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
    // Backend returns { data: { token } } — then fetch /auth/me for user object
    return this.http
      .post<{ data: { token: string } }>(`${environment.apiBaseUrl}/auth/login`, { username, password })
      .pipe(
        tap((res) => localStorage.setItem(STORAGE_TOKEN_KEY, res.data.token)),
        switchMap(() =>
          this.http.get<AuthUser>(`${environment.apiBaseUrl}/auth/me`, {
            headers: { Authorization: `Bearer ${localStorage.getItem(STORAGE_TOKEN_KEY)!}` }
          })
        ),
        tap((user) => {
          localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
          this.userSubject.next(user);
        })
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
