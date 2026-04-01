import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLinkWithHref, RouterLinkActive } from '@angular/router';
import { CartComponent} from '@shared/components/cart/cart.component';  
import { SearchComponent  } from '@shared/components/search/search.component';
import { AuthService } from '../../../auth/auth.service';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLinkWithHref, RouterLinkActive, CartComponent, SearchComponent  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  showLoginMenu = signal(false);
  authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.authService.loadCurrentUser().subscribe();
  }

  openLoginMenu() { this.showLoginMenu.set(true); }
  closeLoginMenu() { this.showLoginMenu.set(false); }

  logout() {
    this.authService.logout().subscribe(() => {
      this.closeLoginMenu();
      this.router.navigate(['/']);
    });
  }
}
