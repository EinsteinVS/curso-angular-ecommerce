import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-account-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './account-nav.component.html',
  styleUrls: ['./account-nav.component.css']
})
export class AccountNavComponent {
  menu = [
    { label: 'Dashboard', path: '/account/dashboard' },
    { label: 'Profilo', path: '/account/profile' },
    { label: 'Indirizzi', path: '/account/addresses' },
    { label: 'Ordini', path: '/account/orders' },
    { label: 'Sicurezza', path: '/account/security' },
  ];
}
