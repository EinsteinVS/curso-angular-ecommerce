import { Component,inject,signal } from '@angular/core';
import { StoreService } from '@shared/services/store.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '@shared/services/cart.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent  {
  activeMenu = false;
  
  toggleMenu() {
    this.activeMenu = !this.activeMenu;
  }


}