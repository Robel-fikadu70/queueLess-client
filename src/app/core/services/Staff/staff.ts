import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { TicketState } from '../../../shared/models/queue.model';

export interface CurrentlyServing {
  id: string;
  ticketNumber: string;
  state: TicketState.Called | TicketState.Serving | TicketState.CheckedIn;
  sequenceNumber: number;
  checkedInAt: string;
}
export interface WaitingTicket {
  id: string;
  ticketNumber: string;
  state: TicketState.Waiting;
}
export interface RecentActivity {
  id: string;
  ticketNumber: string;
  state: TicketState.Completed | TicketState.NoShow;
}
export interface StaffDashboardDto {
  currentlyServing: CurrentlyServing | null;
  waitingList: WaitingTicket[];
  recentActivity: RecentActivity[];
}

@Service()
export class Staff {
  private http = inject(HttpClient);

  getStaffDashboard(serviceId: string): Observable<StaffDashboardDto> {
    return this.http.get<StaffDashboardDto>(`${environment.apiUrl}/staff/dashboard/${serviceId}`);
  }

  callNext(serviceId: string): Observable<CurrentlyServing> {
    return this.http.post<CurrentlyServing>(`${environment.apiUrl}/staff/call-next`, { serviceId });
  }

  startService(ticketId: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/staff/start-service/${ticketId}`, {});
  }

  completeService(ticketId: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/staff/complete-service/${ticketId}`, {});
  }

  skipNoShow(ticketId: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/staff/skip-noshow/${ticketId}`, {});
  }

  recall(ticketId: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/staff/recall/${ticketId}`, {});
  }
}
