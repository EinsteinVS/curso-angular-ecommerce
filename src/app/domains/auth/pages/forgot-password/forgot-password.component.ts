import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../auth.service';
import { ResponseStatus } from '@shared/models/ResponseStatus';
import { ForgotPasswordResponse } from '../../models/forgot-reset-password.model';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  private fb = new FormBuilder().nonNullable;

  constructor(private authService: AuthService) {}

  status = signal<ResponseStatus>({ status: 'initial' });
  errorMessage = signal('');
  successMessage = signal('');
  resetToken = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email } = this.form.getRawValue();
    if (!email) {
      return;
    }

    this.status.set({ status: 'loading' });
    this.errorMessage.set('');
    this.successMessage.set('');
    this.resetToken.set('');

    this.authService.forgotPassword({ email }).subscribe({
      next: (response: ForgotPasswordResponse) => {
        this.status.set({ status: 'success' });
        this.successMessage.set(response.message || 'Se l\'email esiste, riceverai le istruzioni per il reset password.');

        // In locale/dev il backend può restituire il token per test manuali.
        if (response.resetToken) {
          this.resetToken.set(response.resetToken);
        }
      },
      error: (error: unknown) => {
        this.status.set({ status: 'error' });
        this.errorMessage.set(this.getErrorMessage(error));
      },
    });
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
        return 'Email non valida. Controlla e riprova.';
      }
    }

    return 'Errore durante la richiesta di reset password. Riprova.';
  }
}
