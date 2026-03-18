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
  pagRedirect = signal<string>('');
  constructor( 
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ){


  this.route.queryParams.subscribe(params => {
      const email = params['email'];
      debugger;
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

    this.authService.login(email, password).subscribe({
        next: (response) => {
          if (response?.token) {
            this.router.navigate([`${this.pagRedirect()}`]);
          }
        },
        error: (error) => {
          this.responseStatus.set({ status: 'error' });
          
          console.error('Error al iniciar sesión:', error);
        }
    });
    console.log('Login:', this.form.value);
  }

}
  
