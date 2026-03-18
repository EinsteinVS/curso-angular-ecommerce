import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ResponseStatus } from '@shared/models/ResponseStatus';
import { HttpClient } from '@angular/common/http';
import { SearchEmailComponent } from '../../components/search-email/search-email.component';

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
export class RegisterComponent {
  
  private fb = new FormBuilder();
  statusUser = signal<ResponseStatus>({ status: 'initial' });
  
  constructor(private router: Router,private http: HttpClient) { 
    
  }

  formUser =  this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^[+]?[\d\s\-]{7,15}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatch });

  get f() { return this.form.controls; }
  get fUser() { return this.formUser.controls; }
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log('Register:', this.form.value);
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
}
