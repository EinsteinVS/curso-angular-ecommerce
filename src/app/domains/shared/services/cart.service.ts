import { Injectable, computed, effect, signal } from '@angular/core';
import { Product } from '../models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly storageKey = 'store_cart';

  cart = signal<CartItem[]>(this.getInitialCart());
  totalItems = computed(() => {
    const cart = this.cart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  });

  total = computed(() => {
    const cart = this.cart();
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  });

  constructor() {
    effect(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.cart()));
      }
    });
  }

  addToCart(product: Product) {
    this.cart.update(state => {
      const index = state.findIndex(item => item.product.id === product.id);
      if (index === -1) {
        return [...state, { product, quantity: 1 }];
      }

      return state.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1
        };
      });
    });
  }

  decreaseQuantity(productId: number) {
    this.cart.update(state => {
      return state
        .map(item => {
          if (item.product.id !== productId) {
            return item;
          }

          return {
            ...item,
            quantity: item.quantity - 1
          };
        })
        .filter(item => item.quantity > 0);
    });
  }

  increaseQuantity(productId: number) {
    this.cart.update(state => {
      return state.map(item => {
        if (item.product.id !== productId) {
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1
        };
      });
    });
  }

  removeFromCart(productId: number) {
    this.cart.update(state => state.filter(item => item.product.id !== productId));
  }

  clearCart() {
    this.cart.set([]);
  }

  private getInitialCart(): CartItem[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as CartItem[];
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(item => !!item?.product && Number.isFinite(item?.quantity) && item.quantity > 0);
    } catch {
      return [];
    }
  }
}
