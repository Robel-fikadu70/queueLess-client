import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Staff } from '../../../core/services/Staff/staff';
import { exhaustMap, of, Subject } from 'rxjs';
import { StaffStore } from '../../../core/store/staff.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  // Mock service assignment for initial staff counter setup
  assignedServiceId = signal<string>('c138b120-1a22-4412-bd0a-7bb1a12001bb'); // Defaults to Laboratory GUID

  private callNext$ = new Subject<void>();
  private start$ = new Subject<string>();
  private complete$ = new Subject<string>();
  private skip$ = new Subject<string>();
  private recall$ = new Subject<string>();

  constructor() {
    // Reload dashboard on initialization
    this.store.loadDashboard(this.assignedServiceId());

    // Defensive operations streams using exhaustMap to prevent duplicate triggers
    this.callNext$
      .pipe(
        exhaustMap(() => of(this.store.callNext(this.assignedServiceId()))),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.start$
      .pipe(
        exhaustMap((id) => of(this.store.startCounterService(id))),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.complete$
      .pipe(
        exhaustMap((id) => of(this.store.completeCounterService(id))),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.skip$
      .pipe(
        exhaustMap((id) => of(this.store.skipNoShow(id))),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.recall$
      .pipe(
        exhaustMap((id) => of(this.store.recallSkipped(id))),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  ngOnInit(): void {}

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
}
