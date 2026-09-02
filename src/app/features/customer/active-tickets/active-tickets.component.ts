import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CustomerStore } from '../../../core/store/customer.store';
import { AuthStore } from '../../../core/store/auth.store';
import { ActiveTicket } from '../../../shared/models/queue.model';

@Component({
  imports: [CommonModule, RouterLink, RouterLinkActive],
  standalone: true,
  selector: 'app-active-tickets',
  styleUrl: './active-tickets.component.scss',
  templateUrl: './active-tickets.component.html',
})
export class ActiveTicketsComponent {
  readonly store = inject(CustomerStore);
  readonly authStore = inject(AuthStore);
  private router = inject(Router);

  ngOnInit(): void {
    this.store.loadActiveTickets();
  }

  onMonitorTicket(ticket: ActiveTicket): void {
    // Redirects the user directly to their active live queue monitor card
    this.router.navigate(['/customer/ticket', ticket.ticketId]);
  }
}
