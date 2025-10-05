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
    },
    {
        path: 'first-graph',
        loadComponent: () => import('./features/charts/components/first-graph/first-graph').then(m => m.FirstGraph)
    },
    {
        path: 'stacked-chart',
        loadComponent: () => import('./features/charts/components/stacked-chart/stacked-chart').then(m => m.StackedChart)
    },
    {
        path: 'canvas',
        loadComponent: () => import('./features/charts/components/canvas/canvas').then(m => m.Canvas)
    }
];
