import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/store/auth.store';
import { catchError, exhaustMap, of, Subject, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  standalone: true,
  selector: 'app-register',
  styleUrl: './register.component.scss',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  readonly authStore = inject(AuthStore);

  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(12)]], // Strong passwords default matching Slide 1 (Module 11)
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
  });

  registerError: string | null = null;
  isRegistering = false;

  private registerSubmit$ = new Subject<void>();

  constructor() {
    this.registerSubmit$
      .pipe(
        exhaustMap(() => {
          this.isRegistering = true;
          this.registerError = null;
          const payload = this.registerForm.value;

          return this.http.post(`${environment.apiUrl}/auth/register`, payload).pipe(
            tap(() => {
              this.isRegistering = false;
              // Redirect newly registered customer straight to sign in
              this.router.navigate(['/login']);
            }),
            catchError((err) => {
              this.registerError = err.error?.detail ?? 'Registration failed. Try again.';
              this.isRegistering = false;
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.registerSubmit$.next();
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
