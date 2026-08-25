import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { UserProfile } from '../../shared/models/user.model';
import { environment } from '../../../environments/environment.development';

@Service()
export class AuthService {
    private http = inject(HttpClient);

    login(credentials: any): Observable<UserProfile> {
        return this.http.post<UserProfile>(`${environment.apiUrl}/auth/login`, credentials);
    }

    register(payload: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}/auth/register`, payload);
    }

    logout(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/logout`, {});
  }
}
