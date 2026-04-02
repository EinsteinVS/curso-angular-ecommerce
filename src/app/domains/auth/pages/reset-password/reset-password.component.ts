import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth.service';
import { ResponseStatus } from '@shared/models/ResponseStatus';

function passwordMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('newPassword');
  const confirm = control.get('confirmPassword');

  if (!password || !confirm) {
    return null;
  }

  return password.value !== confirm.value ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnDestroy {
  private fb = new FormBuilder().nonNullable;
  private queryParamsSub: Subscription;

  status = signal<ResponseStatus>({ status: 'initial' });
  errorMessage = signal('');
  successMessage = signal('');

  // 12+ chars, uppercase, lowercase, number, special char.
  private readonly strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/;

  form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      resetToken: ['', [Validators.required, Validators.minLength(10)]],
      newPassword: ['', [Validators.required, Validators.pattern(this.strongPasswordPattern)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatch }
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.queryParamsSub = this.route.queryParams.subscribe((params) => {
      const email = params['email'];
      const token = params['token'];

      if (email) {
        this.form.get('email')?.setValue(email);
      }

      if (token) {
        this.form.get('resetToken')?.setValue(token);
      }
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, resetToken, newPassword } = this.form.getRawValue();
    if (!email || !resetToken || !newPassword) {
      return;
    }

    this.status.set({ status: 'loading' });
    this.errorMessage.set('');
    this.successMessage.set('');

    this.authService.resetPassword({ email, resetToken, newPassword }).subscribe({
      next: (response) => {
        this.status.set({ status: 'success' });
        this.successMessage.set(response.message || 'Password aggiornata correttamente.');
        this.form.get('resetToken')?.reset('');
      },
      error: (error: unknown) => {
        this.status.set({ status: 'error' });
        this.errorMessage.set(this.getErrorMessage(error));
      },
    });
  }

  goToLogin() {
    const email = this.form.get('email')?.value;
    this.router.navigate(['/auth/login'], {
      queryParams: email ? { email } : undefined,
    });
  }

  ngOnDestroy() {
    this.queryParamsSub.unsubscribe();
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }

      if (typeof error.error?.message === 'string' && error.error.message.trim()) {
        return error.error.message;
      }

      if (error.status === 400) {
        return 'Token non valido o password non conforme ai requisiti.';
      }
    }

    return 'Errore durante il reset password. Riprova.';
  }
}
