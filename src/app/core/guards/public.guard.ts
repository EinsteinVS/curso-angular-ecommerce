import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';

/**
 * Guard che permette l'accesso SOLO a utenti NON autenticati.
 * Se l'utente è loggato, redirige a home.
 * 
 * Uso: percorsi pubblici come /auth/login, /auth/register
 */
export const publicGuard = () => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (session.isLoggedIn()) {
    // Se loggato, redirige a home
    router.navigate(['/']);
    return false;
  }

  // Se NON loggato, permette accesso
  return true;
};
