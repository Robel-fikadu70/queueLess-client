import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomerStore } from '../../../core/store/customer.store';

@Component({
  imports: [CommonModule],
  standalone: true,
  selector: 'app-history',
  styleUrl: './history.component.scss',
  templateUrl: './history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent implements OnInit {
  readonly store = inject(CustomerStore);

  constructor() {
    this.store.loadHistory();
  }

  ngOnInit(): void {}
}
