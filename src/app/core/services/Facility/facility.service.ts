import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Facility, QueueService } from '../../../shared/models/queue.model';
import { environment } from '../../../../environments/environment.development';

@Service()
export class FacilityService {
  private http = inject(HttpClient);

  getFacilities(): Observable<Facility[]> {
    return this.http.get<Facility[]>(`${environment.apiUrl}/facilities`);
  }

  getServicesByFacility(facilityId: string): Observable<QueueService[]> {
    return this.http.get<QueueService[]>(`${environment.apiUrl}/services/facility/${facilityId}`);
  }
}
