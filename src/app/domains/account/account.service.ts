import { Injectable, computed, inject } from '@angular/core';
import { SessionService } from '../../core/services/session.service';
import { ApiService } from '../../core/services/api.service';

export interface UserProfile {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  tipoDocumento: string;
  numeroDocumento: string;
  role: string;
  isActive: boolean;
}

export interface UserProfileUpdate {
  name: string;
  lastName: string;
  phoneNumber: string;
  tipoDocumento: string;
  numeroDocumento: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private sessionService = inject(SessionService);
  private apiService = inject(ApiService);

  getUserMe() {
    return this.apiService.get<UserProfile>('/api/user/me');
  }

  updateUserMe(data: UserProfileUpdate) {
    return this.apiService.put<UserProfile>('/api/user/me', data);
  }

  getUser(id: number) {
    return this.apiService.get<UserProfile>(`/api/user/${id}`);
  }

  updateUser(id: number, data: UserProfile) {
    return this.apiService.put<UserProfile>(`/api/user/${id}`, data);
  }

  customerSummary = computed(() => {
    const session = this.sessionService.session();

    if (!session) {
      return {
        clienteID: '',
        customerType: 'guest',
        age: '',
        gender: '',
        addressesCount: 0,
        paymentsCount: 0,
      };
    }

    return {
      clienteID: session.login.clienteID,
      customerType: session.login.tipo,
      age: session.login.edad,
      gender: session.login.genero,
      addressesCount: this.safeNumber(session.login.addresses),
      paymentsCount: this.safeNumber(session.login.payments),
    };
  });

  private safeNumber(value: string): number {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return 0;
    }
    return parsed;
  }
}
