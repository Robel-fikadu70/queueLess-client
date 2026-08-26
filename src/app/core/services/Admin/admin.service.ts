import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardStats, StaffMember } from '../../../shared/models/admin.model';
import { environment } from '../../../../environments/environment.development';
import { Facility, QueueService } from '../../../shared/models/queue.model';

@Service()
export class AdminService {
  private http = inject(HttpClient);

  // 1. Core Analytics
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${environment.apiUrl}/admin/dashboard-stats`);
  }

  // 2. Staff Management
  getStaffMembers(): Observable<StaffMember[]> {
    return this.http.get<StaffMember[]>(`${environment.apiUrl}/admin/staff`);
  }

  registerStaff(payload: any): Observable<{ staffId: string }> {
    return this.http.post<{ staffId: string }>(
      `${environment.apiUrl}/admin/staff/register`,
      payload,
    );
  }

  assignStaff(payload: {
    staffId: string;
    serviceId: string;
    counterNumber: number;
  }): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/admin/staff/assignment`, payload);
  }

  // 3. Facility CRUD Operations
  createFacility(payload: Partial<Facility>): Observable<string> {
    return this.http.post<string>(`${environment.apiUrl}/facilities`, payload);
  }

  updateFacility(id: string, payload: Partial<Facility>): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/facilities/${id}`, payload);
  }

  deleteFacility(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/facilities/${id}`);
  }

  // 4. Service CRUD Operations
  createService(payload: Partial<QueueService>): Observable<string> {
    return this.http.post<string>(`${environment.apiUrl}/services`, payload);
  }

  updateService(id: string, payload: Partial<QueueService>): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/services/${id}`, payload);
  }
}
