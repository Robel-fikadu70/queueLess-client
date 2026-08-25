import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface UserProfileDto {
  email: string;
  firstName: string;
  lastName: string;
}
@Service()
export class ProfileService {
  private http = inject(HttpClient);

  getProfile(): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${environment.apiUrl}/users/profile`);
  }

  updateProfile(profile: { firstName: string; lastName: string }): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/users/profile`, profile);
  }
}
