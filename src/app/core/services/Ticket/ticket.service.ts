import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { TicketDashboard, TicketHistory } from '../../../shared/models/queue.model';

@Service()
export class TicketService {
  private http = inject(HttpClient);

  joinQueue(serviceId: string): Observable<{ ticketId: string }> {
    return this.http.post<{ ticketId: string }>(`${environment.apiUrl}/tickets/join`, {
      serviceId,
    });
  }

  checkIn(ticketId: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/tickets/${ticketId}/checkin`, {});
  }

  cancelTicket(ticketId: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/tickets/${ticketId}/cancel`, {});
  }

  getTicketDashboard(ticketId: string): Observable<TicketDashboard> {
    return this.http.get<TicketDashboard>(`${environment.apiUrl}/tickets/${ticketId}/dashboard`);
  }

  getTicketHistory(): Observable<TicketHistory[]> {
    return this.http.get<TicketHistory[]>(`${environment.apiUrl}/tickets/history`);
  }
}
