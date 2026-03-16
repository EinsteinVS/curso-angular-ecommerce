import { Component, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OrderSummaryComponent } from '@shared/components/order-summary/order-summary.component';
import { CartService } from '@shared/services/cart.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, DatePipe, OrderSummaryComponent],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export default class OrderComponent {
  private cartService = inject(CartService);

  today = new Date();
  orderId = Math.floor(1000000000 + Math.random() * 9000000000);

  subtotal = this.cartService.total;
  shipping = computed(() => this.subtotal() > 0 ? 8 : 0);
  taxes = computed(() => this.subtotal() * 0.22);
  discount = computed(() => this.subtotal() > 100 ? 12 : 0);
  grandTotal = computed(() => this.subtotal() + this.shipping() + this.taxes() - this.discount());
}
