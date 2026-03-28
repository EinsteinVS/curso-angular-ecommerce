import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-checkout-step-shipping-method',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-step-shipping-method.component.html',
})
export class CheckoutStepShippingMethodComponent {
  @Input({ required: true }) isActive = false;
  @Input({ required: true }) isCompleted = false;
  @Input({ required: true }) selectedShipping!: 'free' | 'standard' | 'express';

  @Output() edit = new EventEmitter<void>();
  @Output() shippingChange = new EventEmitter<'free' | 'standard' | 'express'>();
  @Output() continueStep = new EventEmitter<void>();
}
