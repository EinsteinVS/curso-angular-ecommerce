import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ResponseStatus } from '@shared/models/ResponseStatus';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { SearchEmailComponent } from '../../components/search-email/search-email.component';
import { AuthService } from '../../auth.service';

function passwordMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  if (!password || !confirm) return null;
  return password.value !== confirm.value ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SearchEmailComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnDestroy {
  
  private fb = new FormBuilder();
  statusUser = signal<ResponseStatus>({ status: 'initial' });
  registerStatus = signal<ResponseStatus>({ status: 'initial' });
  registerErrorMessage = signal<string>('');
  registerCompleted = signal(false);
  TIMER_SECONDS = 5;
  redirectSeconds = signal(this.TIMER_SECONDS);
  private redirectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private redirectIntervalId: ReturnType<typeof setInterval> | null = null;
  
  constructor(private router: Router, private http: HttpClient, private authService: AuthService) { 
    
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
      next: () => {
        this.authService.login(email, password).subscribe({
          next: () => {
            this.clearRedirectTimers();
            this.redirectSeconds.set(this.TIMER_SECONDS);
            this.registerCompleted.set(true);
            this.redirectIntervalId = setInterval(() => {
              const remainingSeconds = this.redirectSeconds();
              if (remainingSeconds > 0) {
                this.redirectSeconds.set(remainingSeconds - 1);
              }
            }, 1000);
            this.redirectTimeoutId = setTimeout(() => {
              this.clearRedirectTimers();
              this.router.navigate(['/']);
            }, this.TIMER_SECONDS * 1000);
          },
          error: () => {
            this.router.navigate(['/auth/login'], { queryParams: { email } });
          }
        });
      },
      error: (error) => {
        debugger;
        console.error('register error:', error);
        this.registerStatus.set({ status: 'error' });
        this.registerErrorMessage.set(this.getRegisterErrorMessage(error));
      }
    });
  }

  goToAbout() {
    this.clearRedirectTimers();
    this.router.navigate(['/']);
  }

  onShowRegisterForm(email: string) {
    this.form.patchValue({ email });
    this.statusUser.set({ status: 'success' });
  }

  validaUser(){
    if(this.formUser.invalid){
        this.formUser.markAllAsTouched();
      return;
    }
     debugger;
    const email = this.formUser.get('email')?.value;
    this.http.get<ResponseStatus>(`http://localhost:5268/api/user/email?email=${email}`).subscribe(response => {
      console.log('Respuesta de la API:', response);
      if(response.status === 'error') {
        //this.statusUser.set({ status: 'error' });
        this.router.navigate(['/auth/register'],{
          queryParams: { email }
        });
      } else {
        //this.statusUser.set({ status: 'error' });
        this.router.navigate(['/auth/login'],{
          queryParams: { email }
        });
        //this.statusUser.set({ status: 'success' });
      }
    }, error => {
       this.router.navigate(['/auth/register'],{
          queryParams: { email }
        });
      console.error('Error al validar el usuario:', error);
      this.statusUser.set({ status: 'success' });
    });
   
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
