import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-checkout-step-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-step-payment.component.html',
})
export class CheckoutStepPaymentComponent {
  @Input({ required: true }) isActive = false;
  @Input({ required: true }) isCompleted = false;
  @Input({ required: true }) selectedPayment!: 'visa' | 'mastercard' | 'paypal';

  @Output() edit = new EventEmitter<void>();
  @Output() paymentChange = new EventEmitter<'visa' | 'mastercard' | 'paypal'>();
  @Output() continueStep = new EventEmitter<void>();
}
