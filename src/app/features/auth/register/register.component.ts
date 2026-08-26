import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/store/auth.store';
import { catchError, exhaustMap, of, Subject, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  standalone: true,
  selector: 'app-register',
  styleUrl: './register.component.scss',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  readonly authStore = inject(AuthStore);

  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(12),
        Validators.pattern(/[A-Z]/), // Requires at least one uppercase letter
        Validators.pattern(/[0-9]/), // Requires at least one digit (0-9)
        Validators.pattern(/[^a-zA-Z0-9]/), // Requires at least one non-alphanumeric character
      ],
    ],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
  });

  registerError = signal<string | null>(null);
  isRegistering = signal<boolean>(false);

  private registerSubmit$ = new Subject<void>();

  constructor() {
    this.registerSubmit$
      .pipe(
        exhaustMap(() => {
          this.isRegistering.set(true);
          this.registerError.set(null);
          const payload = this.registerForm.value;

          return this.authService.register(payload).pipe(
            tap(() => {
              this.isRegistering.set(false);
              this.router.navigate(['/login']);
            }),
            catchError((err) => {
              this.isRegistering.set(false);

              //safe error parser
              const detailMsg = err.error?.detail ?? 'Registration failed. Please Try again.';
              this.registerError.set(detailMsg);
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  // Helper validation getters for UI checks
  hasMinLength(): boolean {
    const val = this.registerForm.get('password')?.value || '';
    return val.length >= 12;
  }

  hasUppercase(): boolean {
    const val = this.registerForm.get('password')?.value || '';
    return /[A-Z]/.test(val);
  }

  hasNumber(): boolean {
    const val = this.registerForm.get('password')?.value || '';
    return /[0-9]/.test(val);
  }

  hasSpecialChar(): boolean {
    const val = this.registerForm.get('password')?.value || '';
    return /[^a-zA-Z0-9]/.test(val);
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.registerSubmit$.next();
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
