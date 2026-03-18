import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-search-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-email.component.html',
  styleUrls: ['./search-email.component.css']
})
export class SearchEmailComponent {
  @Output() showRegisterForm = new EventEmitter<string>();
  
 constructor(private authService: AuthService, private router: Router) { 

 }

 private fb = new FormBuilder().nonNullable;
 formUser =  this.fb.group({
     email: ['', [Validators.required, Validators.email]],
   });

  searchEmail() {
    if(this.formUser.invalid){
      this.formUser.markAllAsTouched();
      console.warn('searchEmail: form inválido', this.formUser.value);
      return;
    }

    const { email } = this.formUser.getRawValue();
    console.log('searchEmail: request start', email);

    this.authService.checkEmailExists(email).subscribe({
      next: (response) => {
        console.log('searchEmail: subscribe next', response);
        if(response) {
          
          this.router.navigate(['/auth/login'],{
            queryParams: { email }
          });
          return;
        }

        this.showRegisterForm.emit(email);
      },
      error: (error) => {
        console.error('searchEmail: subscribe error', error);
        this.showRegisterForm.emit(email);
      }
    });
  }
}
