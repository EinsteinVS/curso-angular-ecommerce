import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout-step-shipping-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout-step-shipping-address.component.html',
})
export class CheckoutStepShippingAddressComponent {
  @Input({ required: true }) isActive = false;
  @Input({ required: true }) isCompleted = false;
  @Input({ required: true }) form!: FormGroup;

  @Output() edit = new EventEmitter<void>();
  @Output() continueStep = new EventEmitter<void>();

  getControl(name: string) {
    return this.form.get(name);
  }
}
