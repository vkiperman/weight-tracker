import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'trendtrim',
        pathMatch: 'full',
      },
      {
        path: 'trendtrim',
        loadComponent: () =>
          import('./components/weight-tracker/weight-tracker.component').then(
            (m) => m.WeightTrackerComponent,
          ),
      },
      {
        path: 'about',
        loadComponent: () => import('./components/about/about').then((m) => m.About),
      },
    ],
  },
];
