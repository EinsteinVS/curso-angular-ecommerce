import { Routes } from '@angular/router';
import { LayoutComponent } from '@shared/components/layout/layout.component';
import { NotFoundComponent } from '@info/pages/not-found/not-found.component';
import { authGuard } from './core/guards/auth.guard';

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
                canActivate: [authGuard],
                loadComponent: () => import('./domains/checkout/pages/order/order.component')
            },
            {
                path: 'auth',
                loadChildren: () => import('./domains/auth/auth.routes').then(m => m.default)
            }
             
        ]
    },
    {
        path: '**',
        component: NotFoundComponent
    }
];
