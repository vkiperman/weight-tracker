import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'glowdown',
        pathMatch: 'full',
      },
      {
        path: 'glowdown',
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
