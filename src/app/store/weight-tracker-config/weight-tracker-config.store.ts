import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { weightTrackerConfigActions } from './weight-tracker-config.actions';
import {
  getWeightTrackerConfigState,
  WeightTrackerConfigState,
} from './weight-tracker-config.reducer';

@Injectable({
  providedIn: 'root',
})
export class WeightTrackerConfigStore {
  private store = inject(Store<WeightTrackerConfigState>);

  public setState(state: WeightTrackerConfigState) {
    this.store.dispatch(weightTrackerConfigActions.updateState(state));
  }

  public getState() {
    return this.store.select<WeightTrackerConfigState>(getWeightTrackerConfigState);
  }
}
