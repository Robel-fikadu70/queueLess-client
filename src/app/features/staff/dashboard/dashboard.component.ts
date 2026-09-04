import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Staff } from '../../../core/services/Staff/staff';
import { exhaustMap, filter, of, Subject, Subscription } from 'rxjs';
import { StaffStore } from '../../../core/store/staff.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SignalrService } from '../../../core/services/Signalr/signalr';
import { AuthStore } from '../../../core/store/auth.store';
import { TicketState } from '../../../shared/models/queue.model';

@Component({
  imports: [CommonModule],
  standalone: true,
  selector: 'app-dashboard',
  styleUrl: './dashboard.component.scss',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  readonly store = inject(StaffStore);
  private authStore = inject(AuthStore);
  public ticketState = TicketState;
  private signalrService = inject(SignalrService);

  assignedServiceId = computed(() => this.authStore.user()?.assignedServiceId ?? null);
  assignedServiceName = computed(() => this.authStore.user()?.assignedServiceName ?? 'Unassigned');
  counterNumber = computed(() => this.authStore.user()?.counterNumber ?? null);

  private eventSubscription = new Subscription();

  private callNext$ = new Subject<void>();
  private start$ = new Subject<string>();
  private complete$ = new Subject<string>();
  private skip$ = new Subject<string>();
  private recall$ = new Subject<string>();

  constructor() {
    const serviceId = this.assignedServiceId();
    if (serviceId) {
      this.store.loadDashboard(serviceId);
    }
    this.callNext$
      .pipe(
        exhaustMap(() => {
          const id = this.assignedServiceId();
          return id ? this.store.callNext(id) : of(null);
        }),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.start$
      .pipe(
        exhaustMap((id) => this.store.startCounterService(id)),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.complete$
      .pipe(
        exhaustMap((id) => this.store.completeCounterService(id)),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.skip$
      .pipe(
        exhaustMap((id) => this.store.skipNoShow(id)),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.recall$
      .pipe(
        exhaustMap((id) => this.store.recallSkipped(id)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  ngOnInit(): void {
    const serviceId = this.assignedServiceId();
    if (!serviceId) return;

    this.signalrService.connect().then(() => {
      this.signalrService.joinServiceGroup(serviceId);
    });

    this.eventSubscription.add(
      this.signalrService.positionChanged
        .pipe(filter((event) => event.serviceId === serviceId))
        .subscribe(() => {
          console.log('Queue updated. Refreshing staff workspace waiting list...');
          this.store.loadDashboard(serviceId);
        }),
    );
  }

  onCallNext(): void {
    this.callNext$.next();
  }

  onStartService(ticketId: string): void {
    this.start$.next(ticketId);
  }

  onCompleteService(ticketId: string): void {
    this.complete$.next(ticketId);
  }

  onSkip(ticketId: string): void {
    this.skip$.next(ticketId);
  }

  onRecall(ticketId: string): void {
    this.recall$.next(ticketId);
  }

  onSignOut(): void {
    this.authStore.logout();
  }

  ngOnDestroy(): void {
    this.eventSubscription.unsubscribe();
    this.signalrService.disconnect();
  }
}
