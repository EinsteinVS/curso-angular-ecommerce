import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-checkout-step-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-step-review.component.html',
})
export class CheckoutStepReviewComponent {
  @Input({ required: true }) isActive = false;
  @Input({ required: true }) addressText = '';
  @Input({ required: true }) selectedShipping!: 'free' | 'standard' | 'express';
  @Input({ required: true }) selectedPayment!: 'visa' | 'mastercard' | 'paypal';

  @Output() placeOrder = new EventEmitter<void>();
}
