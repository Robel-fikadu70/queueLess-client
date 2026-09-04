import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AdminStore } from '../../../core/store/admin.store';
import { AuthStore } from '../../../core/store/auth.store';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [CommonModule, RouterLink, RouterLinkActive],
  standalone: true,
  selector: 'app-dashboard',
  styleUrl: './dashboard.component.scss',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  readonly store = inject(AdminStore);
  readonly authStore = inject(AuthStore);

  ngOnInit(): void {
    this.store.loadStats();
  }
}
