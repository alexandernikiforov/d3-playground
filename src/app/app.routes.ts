import {Routes} from '@angular/router';

export const routes: Routes = [
    {
        path: 'chart',
        loadComponent: () => import('./features/charts/components/chart/chart').then(m => m.Chart)
    },
    {
        path: 'first-svg',
        loadComponent: () => import('./features/charts/components/first-svg/first-svg').then(m => m.FirstSvg)
    },
    {
        path: 'bar-chart',
        loadComponent: () => import('./features/charts/components/bar-chart/bar-chart').then(m => m.BarChart)
    }

];
