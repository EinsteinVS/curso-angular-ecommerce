import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink ,Router} from '@angular/router';
import { AuthService } from '../../auth.service';
import { ResponseStatus } from '@shared/models/ResponseStatus';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  responseStatus = signal<ResponseStatus>({ status: 'initial' });
  errorMessage = signal<string>('');
  pagRedirect = signal<string>('');
  constructor( 
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ){


  this.route.queryParams.subscribe(params => {
      const email = params['email'];
      if(email) {
        this.form.get('email')?.setValue(email);
        this.pagRedirect.set('/checkout');
      }
  })
}
  
  private fb = new FormBuilder().nonNullable;


  form = this.fb.group({
    email:['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  get f() { return this.form.controls; }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    const { email, password } = this.form.getRawValue();

    if (!email || !password) return;

    this.responseStatus.set({ status: 'loading' });
    this.errorMessage.set('');

    this.authService.login(email, password).subscribe({
        next: (response) => {
          if (response?.token) {
            this.responseStatus.set({ status: 'success' });
            this.router.navigate([`${this.pagRedirect()}`]);
            return;
          }

          this.responseStatus.set({ status: 'error' });
          this.errorMessage.set('Credenziali non valide o sessione incompleta.');
        },
        error: (error) => {
          this.responseStatus.set({ status: 'error' });
          this.errorMessage.set(this.getLoginErrorMessage(error));
        }
    });
  }

  private getLoginErrorMessage(error: unknown): string {
    // Handle HttpErrorResponse
    if (error && typeof error === 'object' && 'status' in error) {
      const httpError = error as any;
      
      if (httpError.status === 401) {
        return 'Credenziali non valide.';
      }
      
      if (httpError.error?.error) {
        return httpError.error.error;
      }
    }

    const message = error instanceof Error ? error.message : '';

    if (message === 'SESSION_EMPTY') {
      return 'Accesso non completato: sessione non disponibile. Riprova.';
    }

    return 'Errore al login. Verifica le credenziali e riprova.';
  }

}
  
