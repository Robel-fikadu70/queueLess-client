import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService, UserProfileDto } from '../../core/services/Profile/profile.service';
import { AuthStore } from '../../core/store/auth.store';
import { catchError, exhaustMap, Subject, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  selector: 'app-profile',
  styleUrl: './profile.component.scss',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  readonly authStore = inject(AuthStore);

  profileForm!: FormGroup;
  // Reactive UI Signals for state tracking
  userProfile = signal<UserProfileDto | null>(null);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  private saveSubmit$ = new Subject<void>();

  constructor() {
    this.profileForm = this.fb.group({
      email: [{ value: '', disabled: true }], // Email stays locked to prevent hijacking
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
    });

    // Defensive RxJS update flow
    this.saveSubmit$
      .pipe(
        exhaustMap(() => {
          this.isSaving.set(true);
          this.errorMessage.set(null);
          this.successMessage.set(null);

          const payload = {
            firstName: this.profileForm.value.firstName,
            lastName: this.profileForm.value.lastName,
          };

          return this.profileService.updateProfile(payload).pipe(
            tap(() => {
              this.isSaving.set(false);
              this.successMessage.set('Profile updated successfully!');

              // Patch local signal profile memory
              const current = this.userProfile();
              if (current) {
                this.userProfile.set({
                  ...current,
                  firstName: payload.firstName,
                  lastName: payload.lastName,
                });
              }
            }),
            catchError((err) => {
              const detail = err.error?.detail ?? 'Failed to update profile details.';
              this.errorMessage.set(detail);
              this.isSaving.set(false);
              return [];
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }
  ngOnInit(): void {
    this.fetchProfile();
  }

  fetchProfile(): void {
    this.profileService
      .getProfile()
      .pipe(
        tap((profile) => {
          this.userProfile.set(profile);
          this.profileForm.patchValue(profile);
          this.isLoading.set(false);
        }),
        catchError((err) => {
          const detail = err.error?.detail ?? 'Failed to load user profile information.';
          this.errorMessage.set(detail);
          this.isLoading.set(false);
          return [];
        }),
      )
      .subscribe();
  }

  onSave(): void {
    if (this.profileForm.valid) {
      this.saveSubmit$.next();
    } else {
      this.profileForm.markAllAsTouched();
    }
  }
}
