import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomerStore } from '../../../core/store/customer.store';
import { exhaustMap, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  id = input.required<string>();

  private checkInClick$ = new Subject<void>();
  private cancelClick$ = new Subject<void>();

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
}
