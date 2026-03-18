import { Component, signal,inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';
import  { OrderSummaryComponent } from '../order-summary/order-summary.component';
import { AuthService } from '../../../auth/auth.service';

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
  private authService = inject(AuthService);

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
    this.toggleSideMenu();
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/checkout']);
      return;
    }

    this.router.navigate(['/auth/register']);
  }
}
