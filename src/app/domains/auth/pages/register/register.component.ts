import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ResponseStatus } from '@shared/models/ResponseStatus';
import { HttpErrorResponse } from '@angular/common/http';
import { SearchEmailComponent } from '../../components/search-email/search-email.component';
import { EmailVerificationComponent } from '../email-verification/email-verification.component';
import { AuthService } from '../../auth.service';
import { RegisterResponse } from '@shared/models/login.model';

function passwordMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  if (!password || !confirm) return null;
  return password.value !== confirm.value ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SearchEmailComponent, EmailVerificationComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnDestroy {
  
  private fb = new FormBuilder();
  statusUser = signal<ResponseStatus>({ status: 'initial' });
  registerStatus = signal<ResponseStatus>({ status: 'initial' });
  registerErrorMessage = signal<string>('');
  emailToVerify = signal<string>('');
  showVerificationScreen = signal(false);
  TIMER_SECONDS = 5;
  redirectSeconds = signal(this.TIMER_SECONDS);
  private redirectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private redirectIntervalId: ReturnType<typeof setInterval> | null = null;
  
  constructor(private router: Router, private authService: AuthService) { 
    
  }

  formUser =  this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.pattern(/^[+]?[\d\s\-]{7,15}$/)]],
    tipoDocumento: ['', Validators.required],
    numeroDocumento: ['', Validators.required],
    edad: ['', Validators.required],
    genero: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    geo1: [''],
    addresses: [''],
    payments: [''],
  }, { validators: passwordMatch });

  get f() { return this.form.controls; }
  get fUser() { return this.formUser.controls; }
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, lastName, email, password, phoneNumber, tipoDocumento, numeroDocumento, edad, genero, geo1, addresses, payments } = this.form.getRawValue();

    if (!name || !lastName || !email || !password || !tipoDocumento || !numeroDocumento || !edad || !genero) return;

    this.registerStatus.set({ status: 'loading' });
    this.registerErrorMessage.set('');

    this.authService.register({
      name, 
      lastName, 
      email,
      password,
      tipoDocumento,
      numeroDocumento,
      edad: String(edad),
      genero,
      phoneNumber: phoneNumber || undefined,
      geo1: geo1 || undefined,
      addresses: addresses || undefined,
      payments: payments || undefined
    }).subscribe({
      next: (response: RegisterResponse) => {
        // Mostra lo schermo di verifica email instead of auto-login
        this.emailToVerify.set(response?.email || email);
        this.showVerificationScreen.set(true);
        this.registerStatus.set({ status: 'success' });
        
        // Se il backend fornisce il link di verifica (modalità sviluppo)
        if (response?.verificationLink) {
          sessionStorage.setItem('verificationLink', response.verificationLink);
        }
        // Alternativa: se il backend fornisce token + email, genera il link localmente
      },
      error: (error) => {
        this.registerStatus.set({ status: 'error' });
        this.registerErrorMessage.set(this.getRegisterErrorMessage(error));
      }
    });
  }

  goToAbout() {
    this.clearRedirectTimers();
    this.router.navigate(['/']);
  }

  resetVerificationScreen() {
    this.showVerificationScreen.set(false);
    this.emailToVerify.set('');
    this.registerStatus.set({ status: 'initial' });
  }

  onShowRegisterForm(email: string) {
    this.form.patchValue({ email });
    this.statusUser.set({ status: 'success' });
  }

  ngOnDestroy() {
    this.clearRedirectTimers();
  }

  private clearRedirectTimers() {
    if (this.redirectTimeoutId) {
      clearTimeout(this.redirectTimeoutId);
      this.redirectTimeoutId = null;
    }

    if (this.redirectIntervalId) {
      clearInterval(this.redirectIntervalId);
      this.redirectIntervalId = null;
    }
  }

  private getRegisterErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        const backendMessage = this.extractBackendErrorMessage(error.error);
        return backendMessage || 'Dati non validi. Controlla i campi richiesti e riprova.';
      }

      if (error.status === 409) {
        return 'Email già registrata.';
      }
    }

    return 'Errore al registrarsi. Verifica i dati e riprova.';
  }

  private extractBackendErrorMessage(errorBody: unknown): string {
    if (!errorBody) {
      return '';
    }

    if (typeof errorBody === 'string') {
      return errorBody;
    }

    if (typeof errorBody === 'object') {
      const body = errorBody as Record<string, unknown>;

      if (typeof body['error'] === 'string') {
        return body['error'];
      }

      if (typeof body['message'] === 'string') {
        return body['message'];
      }

      const errors = body['errors'];
      if (errors && typeof errors === 'object') {
        const firstError = Object.values(errors as Record<string, unknown[]>)
          .flat()
          .find((value) => typeof value === 'string');

        if (typeof firstError === 'string') {
          return firstError;
        }
      }
    }

    return '';
  }
}
