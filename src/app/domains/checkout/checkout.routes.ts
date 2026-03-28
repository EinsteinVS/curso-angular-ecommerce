import { Routes } from '@angular/router';

const checkoutRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/shell/checkout-shell.component')
  },
  {
    path: 'confirmation',
    loadComponent: () => import('./pages/confirmation/checkout-confirmation.component')
  }
];

export default checkoutRoutes;
