import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../account.service';

@Component({
  selector: 'app-account-addresses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-addresses.component.html',
  styleUrls: ['./account-addresses.component.css']
})
export default class AccountAddressesComponent {
  private accountService = inject(AccountService);
  summary = this.accountService.customerSummary;
}
