import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { DashboardStats, StaffMember } from '../../shared/models/admin.model';
import { Facility, QueueService } from '../../shared/models/queue.model';
import {
  addEntity,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { inject } from '@angular/core';
import { AdminService } from '../services/Admin/admin.service';
import { FacilityService } from '../services/Facility/facility.service';
import { catchError, of, tap } from 'rxjs';

export interface AdminState {
  stats: DashboardStats | null;
  staff: StaffMember[];
  services: QueueService[];
  isLoading: boolean;
  error: string | null;
}
const initialState: AdminState = {
  stats: null,
  staff: [],
  services: [],
  isLoading: false,
  error: null,
};

export const AdminStore = signalStore(
  { providedIn: 'root' },
  withEntities<Facility>(),
  withState(initialState),
  withMethods(
    (store, adminService = inject(AdminService), facilityService = inject(FacilityService)) => ({
      // 1. Load Admin Analytics Stats
      loadStats() {
        patchState(store, { isLoading: true, error: null });
        adminService
          .getDashboardStats()
          .pipe(
            tap((stats) => patchState(store, { stats, isLoading: false })),
            catchError((err) => {
              const detail = err.error?.detail ?? 'Failed to load statistics.';
              patchState(store, { error: detail, isLoading: false });
              return of(null);
            }),
          )
          .subscribe();
      },

      // 2. Load Staff Assignments List
      loadStaff() {
        patchState(store, { isLoading: true, error: null });
        adminService
          .getStaffMembers()
          .pipe(
            tap((staff) => patchState(store, { staff, isLoading: false })),
            catchError((err) => {
              const detail = err.error?.detail ?? 'Failed to load staff list.';
              patchState(store, { error: detail, isLoading: false });
              return of([]);
            }),
          )
          .subscribe();
      },

      // 3. Load Facilities list
      loadFacilities() {
        patchState(store, { isLoading: true, error: null });
        facilityService
          .getFacilities()
          .pipe(
            tap((facilities) => {
              patchState(store, setAllEntities(facilities), { isLoading: false });
            }),
            catchError((err) => {
              const detail = err.error?.detail ?? 'Failed to load facilities.';
              patchState(store, { error: detail, isLoading: false });
              return of([]);
            }),
          )
          .subscribe();
      },

      // 4. Create New Facility
      createFacility(payload: Partial<Facility>) {
        patchState(store, { isLoading: true, error: null });
        adminService
          .createFacility(payload)
          .pipe(
            tap((newId) => {
              const newFacility: Facility = {
                id: newId,
                name: payload.name ?? '',
                description: payload.description ?? '',
                location: payload.location ?? '',
                operatingHours: payload.operatingHours ?? '',
                status: 'Open',
                createdAt: new Date().toISOString(),
                lastModifiedAt: null,
              };
              patchState(store, addEntity(newFacility), { isLoading: false });
            }),
            catchError((err) => {
              const detail = err.error?.detail ?? 'Failed to create facility.';
              patchState(store, { error: detail, isLoading: false });
              return of(null);
            }),
          )
          .subscribe();
      },

      // 5. Update Facility Details (Optimistic UI Pattern)
      updateFacility(id: string, payload: Partial<Facility>) {
        // 1. Capture snapshot before mutation for potential rollback
        const snapshot = store.entities();

        // 2. Apply update immediately to keep UI highly responsive
        patchState(store, updateEntity({ id, changes: payload }));

        adminService
          .updateFacility(id, payload)
          .pipe(
            catchError((err) => {
              const detail = err.error?.detail ?? 'Failed to update facility.';
              // 3. Roll back to the captured state snapshot if the API call fails
              patchState(store, setAllEntities(snapshot), { error: detail });
              return of(null);
            }),
          )
          .subscribe();
      },

      // 6. Delete Facility (Optimistic Deletion)
      deleteFacility(id: string) {
        const snapshot = store.entities();
        patchState(store, removeEntity(id)); // Remove from UI instantly

        adminService
          .deleteFacility(id)
          .pipe(
            catchError((err) => {
              const detail = err.error?.detail ?? 'Failed to delete facility.';
              // Roll back to snapshot on failure
              patchState(store, setAllEntities(snapshot), { error: detail });
              return of(null);
            }),
          )
          .subscribe();
      },

      // 7. Load Services by Facility
      loadServices(facilityId: string) {
        patchState(store, { isLoading: true, error: null });
        facilityService
          .getServicesByFacility(facilityId)
          .pipe(
            tap((services) => patchState(store, { services, isLoading: false })),
            catchError((err) => {
              const detail = err.error?.detail ?? 'Failed to load services.';
              patchState(store, { error: detail, isLoading: false });
              return of([]);
            }),
          )
          .subscribe();
      },

      // 8. Create Service category
      createService(payload: Partial<QueueService>) {
        patchState(store, { isLoading: true, error: null });
        adminService
          .createService(payload)
          .pipe(
            tap((newId) => {
              const newService: QueueService = {
                id: newId,
                facilityId: payload.facilityId ?? '',
                name: payload.name ?? '',
                description: payload.description ?? '',
                estimatedDurationMinutes: payload.estimatedDurationMinutes ?? 10,
                isActive: true,
                createdAt: new Date().toISOString(),
                lastModifiedAt: null,
              };
              patchState(store, {
                services: [...store.services(), newService],
                isLoading: false,
              });
            }),
            catchError((err) => {
              const detail = err.error?.detail ?? 'Failed to create service.';
              patchState(store, { error: detail, isLoading: false });
              return of(null);
            }),
          )
          .subscribe();
      },

      // 9. Update Service (Optimistic)
      updateService(id: string, payload: Partial<QueueService>) {
        const snapshot = store.services();
        const updated = snapshot.map((s) => (s.id === id ? { ...s, ...payload } : s));
        patchState(store, { services: updated });

        adminService
          .updateService(id, payload)
          .pipe(
            catchError((err) => {
              const detail = err.error?.detail ?? 'Failed to update service details.';
              patchState(store, { services: snapshot, error: detail });
              return of(null);
            }),
          )
          .subscribe();
      },

      // 10. Register Staff Account
      registerStaff(payload: any, onSuccess: () => void) {
        patchState(store, { isLoading: true, error: null });
        adminService
          .registerStaff(payload)
          .pipe(
            tap((res) => {
              const newStaff: StaffMember = {
                userId: res.staffId,
                email: payload.email,
                firstName: payload.firstName,
                lastName: payload.lastName,
                assignedServiceId: null,
                assignedServiceName: null,
                counterNumber: null,
              };
              patchState(store, {
                staff: [...store.staff(), newStaff],
                isLoading: false,
              });
              onSuccess();
            }),
            catchError((err) => {
              const detail = err.error?.detail ?? 'Failed to register staff.';
              patchState(store, { error: detail, isLoading: false });
              return of(null);
            }),
          )
          .subscribe();
      },

      // 11. Assign Staff member to Counter
      assignStaffCounter(
        payload: { staffId: string; serviceId: string; counterNumber: number },
        serviceName: string,
      ) {
        patchState(store, { isLoading: true, error: null });
        adminService
          .assignStaff(payload)
          .pipe(
            tap(() => {
              const updatedStaff = store.staff().map((s) =>
                s.userId === payload.staffId
                  ? {
                      ...s,
                      assignedServiceId: payload.serviceId,
                      assignedServiceName: serviceName,
                      counterNumber: payload.counterNumber,
                    }
                  : s,
              );
              patchState(store, { staff: updatedStaff, isLoading: false });
            }),
            catchError((err) => {
              const detail = err.error?.detail ?? 'Failed to complete staff assignment.';
              patchState(store, { error: detail, isLoading: false });
              return of(null);
            }),
          )
          .subscribe();
      },
    }),
  ),
);
