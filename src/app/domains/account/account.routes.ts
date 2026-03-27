import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

const accountRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/shell/account-shell.component'),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/account-dashboard.component')
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/account-profile.component')
      },
      {
        path: 'addresses',
        loadComponent: () => import('./pages/addresses/account-addresses.component')
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders/account-orders.component')
      },
      {
        path: 'security',
        loadComponent: () => import('./pages/security/account-security.component')
      }
    ]
  }
];

export default accountRoutes;
