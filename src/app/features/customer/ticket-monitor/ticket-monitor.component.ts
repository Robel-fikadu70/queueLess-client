import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomerStore } from '../../../core/store/customer.store';
import { exhaustMap, filter, Subject, Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SignalrService } from '../../../core/services/Signalr/signalr';
import { TicketState } from '../../../shared/models/queue.model';

@Component({
  imports: [CommonModule, RouterLink],
  standalone: true,
  selector: 'app-ticket-monitor',
  styleUrl: './ticket-monitor.component.scss',
  templateUrl: './ticket-monitor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketMonitorComponent {
  readonly store = inject(CustomerStore);
  private signalrService = inject(SignalrService);
  id = input.required<string>();
  public ticketState = TicketState

  private checkInClick$ = new Subject<void>();
  private cancelClick$ = new Subject<void>();
  private eventSubscription = new Subscription();
  constructor() {
    // Automatically triggers data fetches when input parameters change
    effect(() => {
      this.store.loadTicketDashboard(this.id());
    });

    // Defensive check-in stream
    this.checkInClick$
      .pipe(
        exhaustMap(() => this.store.checkIn(this.id())),
        takeUntilDestroyed(),
      )
      .subscribe();

    // Defensive cancel stream
    this.cancelClick$
      .pipe(
        exhaustMap(() => this.store.cancelActiveTicket(this.id())),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  ngOnInit(): void {
    // 1. Initialize SignalR Connection
    this.signalrService.connect().then(() => {
      // 2. Join the targeted broadcast group for this specific ticket
      this.signalrService.joinTicketGroup(this.id());
    });

    // 3. Listen for live ticket updates
    this.eventSubscription.add(
      this.signalrService.statusUpdate
        .pipe(filter((event) => event.ticketId === this.id()))
        .subscribe((event) => {
          console.log(`Live Status Update: Ticket ${event.ticketNumber} is now ${event.state}`);
          // Silently trigger a load to update wait times and positions
          this.store.loadTicketDashboard(this.id());
        }),
    );

    // 4. Listen for position changes inside the queue
    this.eventSubscription.add(
      this.signalrService.positionChanged.subscribe(() => {
        console.log('Queue position shifted. Recalculating waiting estimates...');
        this.store.loadTicketDashboard(this.id());
      }),
    );
  }

  onCheckIn(): void {
    this.checkInClick$.next();
  }

  onLeaveQueue(): void {
    const confirmation = confirm(
      'Are you sure you want to leave this queue? Your ticket will be permanently deleted.',
    );
    if (confirmation) {
      this.cancelClick$.next();
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks (Module 9 Slide 35)
    this.eventSubscription.unsubscribe();
    this.signalrService.disconnect();
  }
}
