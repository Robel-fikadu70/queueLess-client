import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminStore } from '../../../core/store/admin.store';
import { QueueService } from '../../../shared/models/queue.model';
import { AuthStore } from '../../../core/store/auth.store';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
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

  onToggleActive(service: QueueService): void {
    this.store.updateService(service.id, { isActive: !service.isActive });
  }
}
