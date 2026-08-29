import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { UserProfile } from '../../../shared/models/user.model';
import { environment } from '../../../../environments/environment.development';

export interface AuthResponseDto {
  accessToken: string;
}
@Service()
export class AuthService {
  private http = inject(HttpClient);

  private rawAccessToken = signal<string | null>(null);
  readonly accessToken = this.rawAccessToken.asReadonly();

  setAccessToken(token: string | null): void {
    this.rawAccessToken.set(token);
  }

  login(credentials: any): Observable<AuthResponseDto> {
    return this.http
      .post<AuthResponseDto>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(tap((res) => this.setAccessToken(res.accessToken)));
  }

  register(payload: any): Observable<AuthResponseDto> {
    return this.http
      .post<AuthResponseDto>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(tap((res) => this.setAccessToken(res.accessToken)));
  }

  refresh(): Observable<AuthResponseDto> {
    // Satisfies Section 2.3: Silently exchanges HttpOnly X-Refresh-Token for a new accessToken
    return this.http
      .post<AuthResponseDto>(`${environment.apiUrl}/auth/refresh`, {})
      .pipe(tap((res) => this.setAccessToken(res.accessToken)));
  }

  logout(): Observable<any> {
    // Requires Bearer header validation
    return this.http
      .post(`${environment.apiUrl}/auth/logout`, {})
      .pipe(tap(() => this.setAccessToken(null)));
  }
}
