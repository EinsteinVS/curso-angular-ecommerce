import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLinkWithHref, RouterLinkActive } from '@angular/router';
import { CartComponent} from '@shared/components/cart/cart.component';  
import { SearchComponent  } from '@shared/components/search/search.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLinkWithHref, RouterLinkActive, CartComponent, SearchComponent  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  showLoginMenu = signal(false);

  openLoginMenu() { this.showLoginMenu.set(true); }
  closeLoginMenu() { this.showLoginMenu.set(false); }
}
