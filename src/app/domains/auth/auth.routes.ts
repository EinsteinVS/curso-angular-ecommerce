import { publicGuard } from '../../core/guards/public.guard';

const authRoutes = [
  { path: 'login',  
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  { path: 'register', 
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'verify-email',
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/verify-email-callback/verify-email-callback.component').then(m => m.VerifyEmailCallbackComponent),
  },
  {
    path: 'forgot-password',
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
  }
];

export default authRoutes;
