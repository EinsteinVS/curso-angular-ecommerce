import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';

export const authGuard = () => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (!session.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
};