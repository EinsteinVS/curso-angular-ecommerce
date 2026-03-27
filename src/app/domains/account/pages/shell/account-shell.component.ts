import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AccountNavComponent } from '../../components/account-nav/account-nav.component';

@Component({
  selector: 'app-account-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AccountNavComponent],
  templateUrl: './account-shell.component.html',
  styleUrls: ['./account-shell.component.css']
})
export default class AccountShellComponent {
}
