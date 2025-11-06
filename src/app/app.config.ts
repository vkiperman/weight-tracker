import {
  ApplicationConfig,
  isDevMode,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideEffects } from '@ngrx/effects';
import { provideRouterStore } from '@ngrx/router-store';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import {
  weightTrackerConfigFeatureKey,
  weightTrackerConfigReducer,
} from '@store/weight-tracker-config/weight-tracker-config.reducer';
import { routes } from './app.routes';
import { WeightDataEffects } from './store/weight-data/weight-data.effects';
import { weightDataFeatureKey, weightDataReducer } from './store/weight-data/weight-data.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideEffects(WeightDataEffects),
    provideRouterStore(),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    { provide: LOCALE_ID, useValue: 'en-US' },
    provideStore({
      [weightTrackerConfigFeatureKey]: weightTrackerConfigReducer,
      [weightDataFeatureKey]: weightDataReducer,
    }),
    provideStoreDevtools({
      maxAge: 15,
      serialize: true,
      trace: true,
    }),
  ],
};
