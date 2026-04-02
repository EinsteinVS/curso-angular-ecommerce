import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';

function passwordMatch(control: AbstractControl): ValidationErrors | null {
  const newPwd = control.get('newPassword');
  const confirm = control.get('confirmPassword');
  if (!newPwd || !confirm) return null;
  return newPwd.value !== confirm.value ? { passwordMismatch: true } : null;
}

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
      confirmPassword: ['', Validators.required],
    }, { validators: passwordMatch });
  }

  changePassword() {
    this.successMsg = '';
    this.errorMsg = '';
    if (this.passwordForm.invalid) return;
    this.loading = true;
    const { currentPassword, newPassword } = this.passwordForm.value;
    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: (res) => {
        this.successMsg = res.message || 'Password cambiata con successo!';
        this.passwordForm.reset();
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Errore nel cambio password.';
        this.loading = false;
      }
    });
  }
}
