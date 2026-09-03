import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminStore } from '../../../core/store/admin.store';
import { QueueService } from '../../../shared/models/queue.model';
import { AuthStore } from '../../../core/store/auth.store';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive, FormsModule],
  standalone: true,
  selector: 'app-services',
  styleUrl: './services.component.scss',
  templateUrl: './services.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesComponent implements OnInit {
  readonly store = inject(AdminStore);
  readonly authStore = inject(AuthStore);
  private fb = inject(FormBuilder);

  serviceForm: FormGroup;
  selectedFacilityId = signal<string>('');
  editingServiceId: string | null = null;
  showFormModal = false;

  showStatusModal = false;
  statusService: QueueService | null = null;
  selectedActiveStatus: boolean | null = null;

  constructor() {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      estimatedDurationMinutes: [15, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.store.loadFacilities();
  }

  onFacilityChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedFacilityId.set(select.value);

    if (select.value) {
      this.store.loadServices(select.value);
    }
  }

  openCreateModal(): void {
    if (!this.selectedFacilityId()) {
      alert('Please select a facility first.');
      return;
    }
    this.editingServiceId = null;
    this.serviceForm.reset({ estimatedDurationMinutes: 15 });
    this.showFormModal = true;
  }

  openEditModal(service: QueueService): void {
    this.editingServiceId = service.id;
    this.serviceForm.patchValue(service);
    this.showFormModal = true;
  }

  openStatusModal(service: QueueService): void {
    this.statusService = service;
    this.selectedActiveStatus = service.isActive;
    this.showStatusModal = true;
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
    this.statusService = null;
    this.selectedActiveStatus = null;
  }

  onSave(): void {
    if (this.serviceForm.invalid) return;

    const formValue = this.serviceForm.value;

    if (this.editingServiceId) {
      this.store.updateService(this.editingServiceId, formValue);
    } else {
      const payload: Partial<QueueService> = {
        ...formValue,
        facilityId: this.selectedFacilityId(),
      };
      this.store.createService(payload);
    }
    this.showFormModal = false;
  }

  onStatusChange(): void {
    if (!this.statusService || this.selectedActiveStatus === null) {
      return;
    }

    this.store.updateServiceStatus(this.statusService.id, this.selectedActiveStatus);

    this.closeStatusModal();
  }
}
