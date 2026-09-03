import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AdminStore, FacilityStatus } from '../../../core/store/admin.store';
import { Facility, QueueStatus } from '../../../shared/models/queue.model';
import { AuthStore } from '../../../core/store/auth.store';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive, FormsModule],
  standalone: true,
  selector: 'app-facilities',
  styleUrl: './facilities.component.scss',
  templateUrl: './facilities.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacilitiesComponent implements OnInit {
  readonly store = inject(AdminStore);
  readonly authStore = inject(AuthStore);
  private fb = inject(FormBuilder);

  facilityForm: FormGroup;
  editingFacilityId: string | null = null;
  showFormModal = false;
  facilityStatus = QueueStatus;
  showStatusModal = false;
  statusFacility: Facility | null = null;
  selectedStatus: FacilityStatus | null = null;
  QueueStatus = QueueStatus;
  constructor() {
    this.facilityForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      operatingHours: ['08:00 - 17:00', Validators.required],
    });
  }

  ngOnInit(): void {
    this.store.loadFacilities();
  }

  openCreateModal(): void {
    this.editingFacilityId = null;
    this.facilityForm.reset({ operatingHours: '08:00 - 17:00' });
    this.showFormModal = true;
  }

  openEditModal(facility: Facility): void {
    this.editingFacilityId = facility.id;
    this.facilityForm.patchValue(facility);
    this.showFormModal = true;
  }
  openStatusModal(facility: Facility): void {
    this.statusFacility = facility;
    this.selectedStatus = facility.status;
    this.showStatusModal = true;
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
    this.statusFacility = null;
    this.selectedStatus = null;
  }

  onSave(): void {
    if (this.facilityForm.invalid) return;

    const payload = this.facilityForm.value;
    if (this.editingFacilityId) {
      this.store.updateFacility(this.editingFacilityId, payload);
    } else {
      this.store.createFacility(payload);
    }
    this.showFormModal = false;
  }

  // onToggleStatus(facility: Facility): void {
  //   const nextStatus =
  //     facility.status === 'Open' ? 'Paused' : facility.status === 'Paused' ? 'Closed' : 'Open';
  //   this.store.updateFacility(facility.id, { status: nextStatus });
  // }

  onStatusChange(): void {
    if (!this.statusFacility || this.selectedStatus === null) {
      return;
    }

    this.store.updateFacilityStatus(this.statusFacility.id, this.selectedStatus);

    this.closeStatusModal();
  }

  onDelete(id: string): void {
    const confirmed = confirm(
      'Are you sure you want to delete this facility? All services associated with it will be deactivated.',
    );
    if (confirmed) {
      this.store.deleteFacility(id);
    }
  }
}
