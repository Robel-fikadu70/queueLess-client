import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { CurrentlyServing, RecentActivity, Staff, WaitingTicket } from "../services/Staff/staff";
import { inject } from "@angular/core";
import { catchError, of, tap } from "rxjs";


export interface StaffState {
  currentlyServing: CurrentlyServing | null;
  waitingList: WaitingTicket[];
  recentActivity: RecentActivity[];
  isLoading: boolean;
  error: string | null;
}

const initialState: StaffState = {
  currentlyServing: null,
  waitingList: [],
  recentActivity: [],
  isLoading: false,
  error: null
};

export const StaffStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, staffService = inject(Staff)) => ({
    
    // 1. Fetch dashboard data
    loadDashboard(serviceId: string) {
      patchState(store, { isLoading: true, error: null });
      
      staffService.getStaffDashboard(serviceId).pipe(
        tap((data) => {
          patchState(store, {
            currentlyServing: data.currentlyServing,
            waitingList: data.waitingList,
            recentActivity: data.recentActivity,
            isLoading: false
          });
        }),
        catchError((err) => {
          const detail = err.error?.detail ?? 'Failed to load staff panel.';
          patchState(store, { error: detail, isLoading: false });
          return of(null);
        })
      ).subscribe();
    },

    // 2. Call next customer in line
    callNext(serviceId: string) {
      patchState(store, { isLoading: true, error: null });

      staffService.callNext(serviceId).pipe(
        tap((ticket) => {
          // Update currently serving, and remove the first person from waiting list
          patchState(store, {
            currentlyServing: ticket,
            waitingList: store.waitingList().filter(t => t.id !== ticket.id),
            isLoading: false
          });
        }),
        catchError((err) => {
          const detail = err.error?.detail ?? 'No customers waiting or queue is paused.';
          patchState(store, { error: detail, isLoading: false });
          return of(null);
        })
      ).subscribe();
    },

    // 3. Move state from Called -> Serving (Customer arrived at counter)
    startCounterService(ticketId: string) {
      // Optimistic state transition matching Slide 10 guidelines
      const previous = store.currentlyServing();
      if (store.currentlyServing()) {
        patchState(store, {
          currentlyServing: { ...store.currentlyServing()!, state: 'Serving' }
        });
      }

      staffService.startService(ticketId).pipe(
        catchError((err) => {
          const detail = err.error?.detail ?? 'Failed to start service.';
          // Rollback to previous called state if API rejects
          patchState(store, { currentlyServing: previous, error: detail });
          return of(null);
        })
      ).subscribe();
    },

    // 4. Complete current service at counter
    completeCounterService(ticketId: string) {
      const active = store.currentlyServing();
      patchState(store, { currentlyServing: null, isLoading: true });

      staffService.completeService(ticketId).pipe(
        tap(() => {
          if (active) {
            const completedRecord: RecentActivity = { id: active.id, ticketNumber: active.ticketNumber, state: 'Completed' };
            patchState(store, {
              recentActivity: [completedRecord, ...store.recentActivity()],
              isLoading: false
            });
          }
        }),
        catchError((err) => {
          const detail = err.error?.detail ?? 'Failed to complete counter service.';
          patchState(store, { currentlyServing: active, error: detail, isLoading: false });
          return of(null);
        })
      ).subscribe();
    },

    // 5. Skip customer (No-Show)
    skipNoShow(ticketId: string) {
      const active = store.currentlyServing();
      patchState(store, { currentlyServing: null, isLoading: true });

      staffService.skipNoShow(ticketId).pipe(
        tap(() => {
          if (active) {
            const skippedRecord: RecentActivity = { id: active.id, ticketNumber: active.ticketNumber, state: 'NoShow' };
            patchState(store, {
              recentActivity: [skippedRecord, ...store.recentActivity()],
              isLoading: false
            });
          }
        }),
        catchError((err) => {
          const detail = err.error?.detail ?? 'Failed to skip ticket.';
          patchState(store, { currentlyServing: active, error: detail, isLoading: false });
          return of(null);
        })
      ).subscribe();
    },

    // 6. Recall skipped customer
    recallSkipped(ticketId: string) {
      patchState(store, { isLoading: true, error: null });

      staffService.recall(ticketId).pipe(
        tap(() => {
          // Re-populate active serving slot, and clear from recent activity lists
          const recalledTicket: CurrentlyServing = {
            id: ticketId,
            ticketNumber: store.recentActivity().find(t => t.id === ticketId)?.ticketNumber ?? 'REC-1',
            state: 'Called',
            sequenceNumber: 0,
            checkedInAt: new Date().toISOString()
          };
          patchState(store, {
            currentlyServing: recalledTicket,
            recentActivity: store.recentActivity().filter(t => t.id !== ticketId),
            isLoading: false
          });
        }),
        catchError((err) => {
          const detail = err.error?.detail ?? 'Failed to recall customer.';
          patchState(store, { error: detail, isLoading: false });
          return of(null);
        })
      ).subscribe();
    }
  }))
);