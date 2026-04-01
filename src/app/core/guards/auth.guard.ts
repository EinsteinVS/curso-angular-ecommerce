import { inject } from '@angular/core';
import { Router, RouterStateSnapshot } from '@angular/router';
import { SessionService } from '../services/session.service';
import { AuthService } from '../../domains/auth/auth.service';

export const authGuard = (_: unknown, state: RouterStateSnapshot) => {
  const session = inject(SessionService);
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!session.isLoggedIn()) {
    // Salva l'URL richiesto prima di redirigere a login
    auth.setRedirectUrl(state.url);
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
};