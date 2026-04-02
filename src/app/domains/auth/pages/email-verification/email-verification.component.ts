import { Component, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
import { ResponseStatus } from '@shared/models/ResponseStatus';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex min-h-[calc(100vh-130px)] items-center justify-center py-10">
      <div class="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <img class="mx-auto mb-6 h-8 w-auto" src="./assets/svg/logo_yard_sale.svg" alt="Tottus">
        
        <div class="mb-6 text-emerald-600">
          <svg class="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>

        <h1 class="text-2xl font-bold text-slate-800">Verifica tu correo electrónico</h1>
        
        <p class="mx-auto mt-4 max-w-sm text-slate-600">
          Te hemos enviado un correo electrónico a <span class="font-semibold">{{ email }}</span> con instrucciones para verificar tu cuenta.
        </p>

        <div class="mt-6 rounded-lg bg-blue-50 p-4 border border-blue-200">
          <p class="text-sm text-blue-800">
            <span class="font-semibold">📧 ¿No ves el correo?</span>
            Revisa tu carpeta de spam o correo no deseado.
          </p>
        </div>

        <div class="mt-8 border-t pt-6">
          <p class="text-sm text-slate-600 mb-4">
            ¿Ya verificaste tu cuenta?
          </p>
          <button
            type="button"
            class="w-full rounded-full bg-slate-200 px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-300"
            (click)="goToLogin()"
          >
            Ir a iniciar sesión
          </button>
        </div>

        <!-- MODO DESARROLLO: Mostrar link de verificación -->
        @if (isDevelopmentMode() && verificationLink()) {
          <div class="mt-8 rounded-lg bg-yellow-50 p-4 border-2 border-yellow-300">
            <p class="text-xs font-bold text-yellow-800 mb-2">
              ⚙️ MODO DESARROLLO - Link de Verificación:
            </p>
            <div class="bg-white rounded p-3 mb-3 break-all text-xs text-gray-700 max-h-20 overflow-y-auto font-mono">
              {{ verificationLink() }}
            </div>
            <a
              [href]="verificationLink()"
              target="_blank"
              class="inline-block w-full text-center rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-yellow-900 transition hover:bg-yellow-500"
            >
              🔗 Hacer clic aquí para verificar (Dev)
            </a>
          </div>
        }

        @if (resendStatus().status === 'success') {
          <div class="mt-6 rounded-lg bg-green-50 p-4 border border-green-200">
            <p class="text-sm text-green-800">
              ✓ Correo de verificación reenviado exitosamente
            </p>
          </div>
        }

        @if (handleResendError().trim()) {
          <div class="mt-6 rounded-lg bg-red-50 p-4 border border-red-200">
            <p class="text-sm text-red-800">
              {{ handleResendError() }}
            </p>
          </div>
        }

        <button
          type="button"
          class="mt-6 text-sm text-slate-500 hover:text-slate-700 transition"
          (click)="resendEmail()"
          [disabled]="resendStatus().status === 'loading'"
        >
          @if (resendStatus().status === 'loading') {
            <span>Reenviando...</span>
          } @else {
            <span>Reenviar correo de verificación</span>
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class EmailVerificationComponent implements OnInit, OnDestroy {
  @Input() email: string = '';

  verificationLink = signal<string>('');
  isDevelopmentMode = signal<boolean>(false);
  resendStatus = signal<ResponseStatus>({ status: 'initial' });
  resendErrorMessage = signal<string>('');
  private resendTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Controlla se siamo in modalità sviluppo (non produzione)
    const isDev = !this.isProd();
    this.isDevelopmentMode.set(isDev);

    // Se il backend fornisce un link di verifica nel localStorage/sessionStorage
    const storedLink = sessionStorage.getItem('verificationLink');
    if (storedLink) {
      this.verificationLink.set(storedLink);
    }
  }

  ngOnDestroy() {
    if (this.resendTimeoutId) {
      clearTimeout(this.resendTimeoutId);
    }
  }

  resendEmail() {
    if (!this.email) return;

    this.resendStatus.set({ status: 'loading' });
    this.resendErrorMessage.set('');

    // Chiama un endpoint per rinviare l'email di verifica
    this.authService.register({
      email: this.email,
      name: '',
      lastName: '',
      password: '',
      tipoDocumento: '',
      numeroDocumento: '',
      edad: '',
      genero: ''
    }).subscribe({
      next: () => {
        this.resendStatus.set({ status: 'success' });
        this.resendTimeoutId = setTimeout(() => {
          this.resendStatus.set({ status: 'initial' });
        }, 5000);
      },
      error: (error) => {
        this.resendStatus.set({ status: 'error' });
        this.resendErrorMessage.set(this.getErrorMessage(error));
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/auth/login'], { queryParams: { email: this.email } });
  }
/**
   * Verifica se siamo in modalità produzione
   */
  private isProd(): boolean {
    // Controlla se l'URL contiene 'localhost' o 'dev'
    const host = window.location.hostname;
    return !host.includes('localhost') && !host.includes('127.0.0.1') && !host.includes('dev');
  }

  
  handleResendError(): string {
    return this.resendErrorMessage();
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        return 'Email già registrata o dati non validi';
      }
      if (error.status === 429) {
        return 'Troppi tentativi. Prova più tardi.';
      }
      return error.error?.message || 'Errore durante l\'invio dell\'email';
    }
    return 'Errore sconosciuto';
  }
}
