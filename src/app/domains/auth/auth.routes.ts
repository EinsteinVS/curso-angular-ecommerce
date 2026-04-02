import { publicGuard } from '../../core/guards/public.guard';

const authRoutes = [
  { path: 'login',  
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  { path: 'register', 
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  }
];

export default authRoutes;
