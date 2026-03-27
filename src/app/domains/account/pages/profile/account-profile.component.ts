import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../account.service';
import { UserProfileUpdate } from '../../account.service';

@Component({
  selector: 'app-account-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.css']
})
export default class AccountProfileComponent implements OnInit {
  private fb = new FormBuilder().nonNullable;
  private accountService = inject(AccountService);

  form = this.fb.group({
    name: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: [{ value: '', disabled: true }],
    phoneNumber: [''],
    tipoDocumento: [''],
    numeroDocumento: [''],
    role: [{ value: '', disabled: true }],
    isActive: [{ value: true, disabled: true }],
  });

  isSaving = false;
  saveSuccess = false;
  saveError = false;

  private successTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this.accountService.getUserMe().subscribe({
      next: (user) => this.form.patchValue(user),
    });
  }

  saveProfile() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saveSuccess = false;
    this.saveError = false;
    this.isSaving = true;

    const { name, lastName, phoneNumber, tipoDocumento, numeroDocumento } = this.form.getRawValue();
    const payload: UserProfileUpdate = { name, lastName, phoneNumber, tipoDocumento, numeroDocumento };

    this.accountService.updateUserMe(payload).subscribe({
      next: (updatedUser) => {
        this.form.patchValue(updatedUser);
        this.isSaving = false;
        this.saveSuccess = true;
        if (this.successTimer) clearTimeout(this.successTimer);
        this.successTimer = setTimeout(() => { this.saveSuccess = false; }, 4000);
      },
      error: () => {
        this.isSaving = false;
        this.saveError = true;
      },
    });
  }
}
