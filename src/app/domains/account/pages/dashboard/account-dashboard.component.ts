import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../account.service';

@Component({
  selector: 'app-account-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-dashboard.component.html',
  styleUrls: ['./account-dashboard.component.css']
})
export default class AccountDashboardComponent {
  private accountService = inject(AccountService);
  summary = this.accountService.customerSummary;
}
