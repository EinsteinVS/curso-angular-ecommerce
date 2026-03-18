import { LoginComponent } from './pages/login/login.component';

const authRoutes = [
  { path: 'login',  
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  { path: 'register', 
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  }
];

export default authRoutes;
