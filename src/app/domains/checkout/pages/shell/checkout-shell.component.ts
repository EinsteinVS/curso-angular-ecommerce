import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderSummaryComponent } from '@shared/components/order-summary/order-summary.component';
import { CartService } from '@shared/services/cart.service';
import { CheckoutStepShippingAddressComponent } from '../../components/step-shipping-address/checkout-step-shipping-address.component';
import { CheckoutStepShippingMethodComponent } from '../../components/step-shipping-method/checkout-step-shipping-method.component';
import { CheckoutStepPaymentComponent } from '../../components/step-payment/checkout-step-payment.component';
import { CheckoutStepReviewComponent } from '../../components/step-review/checkout-step-review.component';

@Component({
  selector: 'app-checkout-shell',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OrderSummaryComponent,
    CheckoutStepShippingAddressComponent,
    CheckoutStepShippingMethodComponent,
    CheckoutStepPaymentComponent,
    CheckoutStepReviewComponent,
  ],
  templateUrl: './checkout-shell.component.html',
})
export default class CheckoutShellComponent {
  currentStep = signal(1);

  private router = inject(Router);
  private cartService = inject(CartService);
  private fb = new FormBuilder().nonNullable;

  subtotal = this.cartService.total;

  shippingForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    address1: ['', Validators.required],
    address2: [''],
    zipCode: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
  });

  selectedShipping = signal<'free' | 'standard' | 'express'>('standard');
  selectedPayment = signal<'visa' | 'mastercard' | 'paypal'>('visa');

  get shippingAddressSummary(): string {
    const controls = this.shippingForm.controls;
    return `${controls.address1.value}, ${controls.city.value}, ${controls.state.value} ${controls.zipCode.value}`;
  }

  get progressPercent(): number {
    return this.currentStep() * 25;
  }

  get stepLabel(): string {
    if (this.currentStep() === 1) return 'Shipping Address';
    if (this.currentStep() === 2) return 'Shipping Method';
    if (this.currentStep() === 3) return 'Payment';
    return 'Review & Place Order';
  }

  goToStep(step: number) {
    if (step < this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  continueToShippingMethod() {
    if (this.shippingForm.invalid) {
      this.shippingForm.markAllAsTouched();
      return;
    }
    this.currentStep.set(2);
  }

  continueToPayment() {
    this.currentStep.set(3);
  }

  continueToReview() {
    this.currentStep.set(4);
  }

  placeOrder() {
    this.cartService.clearCart();
    this.router.navigate(['/checkout/confirmation']);
  }
}
