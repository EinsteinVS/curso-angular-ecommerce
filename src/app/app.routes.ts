import { Routes } from '@angular/router';
import { LayoutComponent } from '@shared/components/layout/layout.component';
import { NotFoundComponent } from '@info/pages/not-found/not-found.component';

export const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./domains/products/pages/list/list.component')
            },
            {
                path: 'about',
                loadComponent: () => import('./domains/info/pages/about/about.component')
            },
            {
                path: 'product/:id',
                loadComponent: () => import('./domains/products/pages/product-detail/product-detail.component')
            },
            {
                path: 'checkout',
                loadComponent: () => import('./domains/checkout/pages/order/order.component')
            },
            {
                path: 'login',
                loadComponent: () =>
                    import('./domains/auth/pages/login/login.component')
                    .then(m => m.LoginComponent)
             },
            {
                path: 'register',
                loadComponent: () =>
                    import('./domains/auth/pages/register/register.component')
                    .then(m => m.RegisterComponent)
             }
             
        ]
    },
    {
        path: '**',
        component: NotFoundComponent
    }
];
