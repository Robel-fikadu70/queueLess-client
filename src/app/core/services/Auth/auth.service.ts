import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { UserProfile } from '../../../shared/models/user.model';

export interface AuthResponseDto {
  accessToken: string;
}
@Service()
export class AuthService {
  private http = inject(HttpClient);

  login(credentials: any): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/login`, credentials);
  }

  register(payload: any): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/register`, payload);
  }

  refresh(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/refresh`, {});
  }

  getCurrentUser(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${environment.apiUrl}/auth/me`);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/logout`, {});
  }
}
