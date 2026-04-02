import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { ResponseStatus } from '@shared/models/ResponseStatus';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-verify-email-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex min-h-[calc(100vh-130px)] items-center justify-center py-10">
      <div class="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <img class="mx-auto mb-6 h-8 w-auto" src="./assets/svg/logo_yard_sale.svg" alt="Tottus">
        
        @if (verificationStatus().status === 'loading') {
          <div class="mb-6 text-blue-600">
            <svg class="mx-auto h-16 w-16 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-slate-800">Verificando tu cuenta...</h1>
          <p class="mt-4 text-slate-600">Por favor espera mientras verificamos tu correo electrónico.</p>
        }

        @if (verificationStatus().status === 'success') {
          <div class="mb-6 text-green-600">
            <svg class="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-slate-800">¡Cuenta verificada correctamente!</h1>
          <p class="mt-4 text-slate-600">
            Tu cuenta ha sido verificada exitosamente. Ahora puedes iniciar sesión y comenzar a comprar.
          </p>
          
          <button
            type="button"
            class="mt-8 w-full rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
            (click)="goToLogin()"
          >
            Ir a iniciar sesión
          </button>
        }

        @if (verificationStatus().status === 'error') {
          <div class="mb-6 text-red-600">
            <svg class="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4v2m0 4v2M6.343 17.657l1.414-1.414M17.657 6.343l-1.414 1.414m1.414 0l1.414 1.414m-1.414 0l-1.414-1.414"></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-slate-800">Error en la verificación</h1>
          <p class="mt-4 text-slate-600">
            {{ errorMessage() }}
          </p>
          
          <div class="mt-6 border-t pt-6">
            <button
              type="button"
              class="w-full rounded-full bg-slate-200 px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-300 mb-3"
              (click)="goToRegister()"
            >
              Volver a registro
            </button>
            <button
              type="button"
              class="w-full rounded-full bg-slate-200 px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-300"
              (click)="goToHome()"
            >
              Ir a inicio
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class VerifyEmailCallbackComponent implements OnInit {
  verificationStatus = signal<ResponseStatus>({ status: 'loading' });
  errorMessage = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.verifyEmail();
  }

  private verifyEmail() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const email = params['email'];

      if (!token || !email) {
        this.handleError('Parámetros de verificación inválidos o faltantes.');
        return;
      }

      this.authService.verifyEmail({ email, verificationToken: token }).subscribe({
        next: (response) => {
          this.verificationStatus.set({ status: 'success' });
          // Auto redirect after 3 seconds
          setTimeout(() => {
            this.goToLogin();
          }, 3000);
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    });
  }

  private handleError(error: unknown) {
    this.verificationStatus.set({ status: 'error' });
    
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        this.errorMessage.set('El token de verificación es inválido o ha expirado.');
      } else if (error.status === 404) {
        this.errorMessage.set('La cuenta no fue encontrada.');
      } else if (error.status === 410) {
        this.errorMessage.set('La cuenta ya ha sido verificada anteriormente.');
      } else {
        this.errorMessage.set(error.error?.message || 'Error al verificar la cuenta. Por favor intenta de nuevo.');
      }
    } else if (typeof error === 'string') {
      this.errorMessage.set(error);
    } else {
      this.errorMessage.set('Error desconocido durante la verificación.');
    }
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
