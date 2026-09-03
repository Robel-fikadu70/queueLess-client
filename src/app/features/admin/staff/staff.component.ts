import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminStore } from '../../../core/store/admin.store';
import { StaffMember } from '../../../shared/models/admin.model';
import { AuthStore } from '../../../core/store/auth.store';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  standalone: true,
  selector: 'app-staff',
  styleUrl: './staff.component.scss',
  templateUrl: './staff.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffComponent implements OnInit {
  readonly store = inject(AdminStore);
  readonly authStore = inject(AuthStore);
  private fb = inject(FormBuilder);

  registerForm: FormGroup;
  assignForm: FormGroup;

  selectedStaff: StaffMember | null = null;
  showRegisterModal = false;
  showAssignModal = false;
  isRegistering = false;

  constructor() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['Password123!', [Validators.required, Validators.minLength(12)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
    });

    this.assignForm = this.fb.group({
      facilityId: ['', Validators.required],
      serviceId: ['', Validators.required],
      counterNumber: [1, [Validators.required, Validators.min(1)]],
    });

    // Automatically load services dynamically inside assignment selectors
    this.assignForm.get('facilityId')?.valueChanges.subscribe((facId) => {
      if (facId) {
        this.store.loadServices(facId);
      }
    });
  }

  ngOnInit(): void {
    this.store.loadStaff();
    this.store.loadFacilities();
  }

  openRegisterModal(): void {
    this.registerForm.reset({
      email: '',
      password: 'Password123!',
      firstName: '',
      lastName: '',
    });

    this.registerForm.markAsPristine();
    this.registerForm.markAsUntouched();
    this.showRegisterModal = true;
  }

  openAssignModal(staff: StaffMember): void {
    this.selectedStaff = staff;
    this.assignForm.reset({ counterNumber: 1 });
    this.showAssignModal = true;
  }

  onRegisterSubmit(): void {
    if (this.registerForm.invalid || this.isRegistering) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isRegistering = true;

    this.store.registerStaff(this.registerForm.getRawValue(), () => {
      this.isRegistering = false;
      this.showRegisterModal = false;
    });
  }

  onAssignSubmit(): void {
    if (this.assignForm.invalid || !this.selectedStaff) return;

    const { serviceId, counterNumber } = this.assignForm.value;
    const targetService = this.store.services().find((s) => s.id === serviceId);
    const serviceName = targetService ? targetService.name : 'Unknown';

    this.store.assignStaffCounter(
      {
        staffId: this.selectedStaff.userId,
        serviceId,
        counterNumber,
      },
      serviceName,
    );

    this.showAssignModal = false;
  }
}
