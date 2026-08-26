import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/store/auth.store';
import { email } from '@angular/forms/signals';
import { exhaustMap, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  standalone: true,
  selector: 'app-login',
  styleUrl: './login.component.scss',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  readonly authStore = inject(AuthStore);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  //Defensive RxJS submissions stream
  private loginSubmit$ = new Subject<void>();

  constructor() {
    this.loginSubmit$
      .pipe(
        //Ignores consecutive submissions while the active authenticaiton req is inflight
        exhaustMap(() => {
          const credentials = this.loginForm.value;
          return this.authStore.login(credentials);
        }),
        takeUntilDestroyed(), // prevents potential memory leak states when navigating away
      )
      .subscribe();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loginSubmit$.next();
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
