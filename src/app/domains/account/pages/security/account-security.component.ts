import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-account-security',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-security.component.html',
  styleUrls: ['./account-security.component.css']
})
export default class AccountSecurityComponent {
  passwordForm: FormGroup;
  loading = false;
  successMsg = '';
  errorMsg = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  changePassword() {
    this.successMsg = '';
    this.errorMsg = '';
    if (this.passwordForm.invalid) return;
    this.loading = true;
    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: (res) => {
        debugger;
         console.log('changePassword: subscribe next', res);
        this.successMsg = res.message || 'Password cambiata con successo!';
        this.passwordForm.reset();
        this.loading = false;
       
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Errore nel cambio password.';
        this.loading = false;
          console.error('changePassword: subscribe error', err);
      }
    });
  }
}
