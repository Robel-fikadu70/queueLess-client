import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CustomerStore } from '../../../core/store/customer.store';
import { Facility, QueueService } from '../../../shared/models/queue.model';
import { exhaustMap, Subject, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { QueueStatus } from '../../../shared/models/queue.model';
import { AuthStore } from '../../../core/store/auth.store';
@Component({
  imports: [CommonModule, RouterLink],
  standalone: true,
  selector: 'app-dashboard',
  styleUrl: './dashboard.component.scss',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  readonly store = inject(CustomerStore);
  readonly authStore = inject(AuthStore);

  private router = inject(Router);

  QueueStatus = QueueStatus;

  // Track the locally selected facility and service
  selectedFacility = signal<Facility | null>(null);
  selectedService = signal<QueueService | null>(null);

  private joinQueueSubmit$ = new Subject<string>();

  constructor() {
    // Loads the facilities list on initialize
    this.store.loadFacilities();

    // Defensive queue join action
    this.joinQueueSubmit$
      .pipe(
        exhaustMap((serviceId) => this.store.joinQueue(serviceId)),
        takeUntilDestroyed(),
      )
      .subscribe((res) => {
        if(res){
          this.router.navigate(['/customer/ticket', res]);
        }
      });
  }

  ngOnInit(): void {}

  onSelectFacility(facility: Facility): void {
    this.selectedFacility.set(facility);
    this.selectedService.set(null); // Clear selected service from prior selection
    this.store.loadServices(facility.id);
  }

  onSelectService(service: QueueService): void {
    this.selectedService.set(service);
  }

  onJoinQueue(): void {
    const service = this.selectedService();
    if (service) {
      this.joinQueueSubmit$.next(service.id);
    }
    
  }
}
