import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CustomerStore } from '../../../core/store/customer.store';
import { AuthStore } from '../../../core/store/auth.store';

@Component({
  imports: [CommonModule, RouterLink, RouterLinkActive],
  standalone: true,
  selector: 'app-history',
  styleUrl: './history.component.scss',
  templateUrl: './history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent implements OnInit {
  readonly store = inject(CustomerStore);
  readonly authStore = inject(AuthStore)
  constructor() {
    this.store.loadHistory();
  }

  ngOnInit(): void {}
}
