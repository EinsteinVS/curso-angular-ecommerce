import { Component, signal,inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';
import  { OrderSummaryComponent } from '../order-summary/order-summary.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, OrderSummaryComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  hideSideMenu = signal(true);
  private cartService = inject(CartService);
  cart = this.cartService.cart;
  totalItems = this.cartService.totalItems;
  total = this.cartService.total;
  router = inject(Router);
  toggleSideMenu() {
    this.hideSideMenu.update(prevState => !prevState);
  }

  decreaseQuantity(productId: number) {
    this.cartService.decreaseQuantity(productId);
  }

  increaseQuantity(productId: number) {
    this.cartService.increaseQuantity(productId);
  }

  removeFromCart(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  checkout() {
    // Aquí puedes implementar la lógica de checkout, como redirigir a una página de pago o mostrar un resumen del pedido.
    this.toggleSideMenu();
    this.router.navigate(['/checkout']);
  } 
}
