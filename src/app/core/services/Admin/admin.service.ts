import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardStats, StaffMember } from '../../../shared/models/admin.model';
import { environment } from '../../../../environments/environment.development';
import { Facility, QueueService, QueueStatus } from '../../../shared/models/queue.model';
import { FacilityStatus } from '../../store/admin.store';
export interface UpdateFacilityRequest {
  name: string;
  description?: string;
  location: string;
  operatingHours: string;
}
export interface UpdateServiceRequest {
  Name: string;
  Description?: string;
  EstimatedDurationMinutes: number;
}

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

  updateFacility(id: string, payload: UpdateFacilityRequest): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/facilities/${id}`, payload);
  }

  updateFacilityStatus(id: string, status: FacilityStatus): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/facilities/${id}/status`, { id, status });
  }

  deleteFacility(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/facilities/${id}`);
  }

  // 4. Service CRUD Operations
  createService(payload: Partial<QueueService>): Observable<string> {
    return this.http.post<string>(`${environment.apiUrl}/services`, payload);
  }

  updateService(id: string, payload: UpdateServiceRequest): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/services/${id}`, payload);
  }

  updateServiceStatus(id: string, isActive: boolean): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/services/${id}/status`, isActive);
  }
}
