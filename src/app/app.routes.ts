import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'chart',
    loadComponent: () => import('./features/charts/components/chart/chart').then(m => m.Chart)
  }
];
