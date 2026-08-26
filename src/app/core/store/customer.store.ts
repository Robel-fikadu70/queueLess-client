import { signalStore, withState, patchState, withMethods } from '@ngrx/signals';
import { withEntities, setAllEntities } from '@ngrx/signals/entities';
import { inject } from '@angular/core';
import {
  Facility,
  QueueService,
  TicketDashboard,
  TicketHistory,
} from '../../shared/models/queue.model';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { FacilityService } from '../services/Facility/facility.service';
import { TicketService } from '../services/Ticket/ticket.service';

export interface CustomerState {
  services: QueueService[];
  activeTicketId: string | null;
  ticketDashboard: TicketDashboard | null;
  history: TicketHistory[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  services: [],
  activeTicketId: null,
  ticketDashboard: null,
  history: [],
  isLoading: false,
  error: null,
};

export const CustomerStore = signalStore(
  { providedIn: 'root' },
  withEntities<Facility>(),
  withState(initialState),
  withMethods(
    (store, facilityService = inject(FacilityService), ticketService = inject(TicketService)) => ({
      // Loads active facilities into the dictionary state wrapper
      loadFacilities() {
        patchState(store, { isLoading: true, error: null });
        facilityService.getFacilities().pipe(
          tap((facilities) => {
            patchState(store, { isLoading: false });
            // setAllEntities scales efficiently and prevents UI lag on large datasets
            patchState(store, setAllEntities(facilities));
          }),
          catchError((err) => {
            const detail = err.error?.detail ?? 'Failed to load active facilities.';
            patchState(store, { error: detail, isLoading: false });
            return of([]);
          }),
        ).subscribe();
      },

      // Loads queue services associated with a chosen facility
      loadServices(facilityId: string) {
        patchState(store, { isLoading: true, error: null, services: [] });
        return facilityService.getServicesByFacility(facilityId).pipe(
          tap((services) => {
            patchState(store, { services, isLoading: false });
          }),
          catchError((err) => {
            const detail = err.error?.detail ?? 'Failed to load services.';
            patchState(store, { error: detail, isLoading: false });
            return of([]);
          }),
        ).subscribe();
      },

      // Enters an active service queue
      joinQueue(serviceId: string) {
        patchState(store, { isLoading: true, error: null });
        return ticketService.joinQueue(serviceId).pipe(
          tap((res) => {
            patchState(store, { activeTicketId: res.ticketId, isLoading: false });
          }),
          catchError((err) => {
            const detail =
              err.error?.detail ?? 'Could not join queue. Please check if queue is paused.';
            patchState(store, { error: detail, isLoading: false });
            return of(null);
          }),
        );
      },

      // Fetches live dashboard stats for an active ticket
      loadTicketDashboard(ticketId: string) {
        patchState(store, { isLoading: true, error: null });
        return ticketService.getTicketDashboard(ticketId).pipe(
          tap((ticketDashboard) => {
            patchState(store, { ticketDashboard, isLoading: false });
          }),
          catchError((err) => {
            const detail = err.error?.detail ?? 'Failed to fetch ticket dashboard details.';
            patchState(store, { error: detail, isLoading: false });
            return of(null);
          }),
        ).subscribe();
      },

      // Logs a physical check-in state
      checkIn(ticketId: string) {
        patchState(store, { isLoading: true, error: null });
        return ticketService.checkIn(ticketId).pipe(
          tap(() => {
            // Instantly patch local check-in signal state
            if (store.ticketDashboard()) {
              patchState(store, {
                ticketDashboard: {
                  ...store.ticketDashboard()!,
                  checkInStatus: 'Checked In',
                },
                isLoading: false,
              });
            }
          }),
          catchError((err) => {
            const detail = err.error?.detail ?? 'Check-in failed. Please try again.';
            patchState(store, { error: detail, isLoading: false });
            return of(null);
          }),
        );
      },

      // Leaves an active queue, canceling the ticket
      cancelActiveTicket(ticketId: string) {
        // Capture state snapshot before mutations to support rollbacks if the network fails
        const snapshot = store.ticketDashboard();

        // Optimistic transition: immediately clear the active ticket state to keep the UI responsive
        patchState(store, { activeTicketId: null, ticketDashboard: null });

        return ticketService.cancelTicket(ticketId).pipe(
          catchError((err) => {
            // If the network call fails, roll back to captured state snapshot
            const detail = err.error?.detail ?? 'Failed to leave queue.';
            patchState(store, {
              ticketDashboard: snapshot,
              activeTicketId: ticketId,
              error: detail,
            });
            return of(null);
          }),
        );
      },

      // Fetches user queue history
      loadHistory() {
        patchState(store, { isLoading: true, error: null });
        return ticketService.getTicketHistory().pipe(
          tap((history) => {
            patchState(store, { history, isLoading: false });
          }),
          catchError((err) => {
            const detail = err.error?.detail ?? 'Failed to load queue history.';
            patchState(store, { error: detail, isLoading: false });
            return of([]);
          }),
        ).subscribe();
      },
    }),
  ),
);
