import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { cold } from 'jasmine-marbles';
import { weightTrackerConfigActions } from './weight-tracker-config.actions';
import {
  weightTrackerConfigReducer as weightTrackerConfig,
  WeightTrackerConfigState,
} from './weight-tracker-config.reducer';
import { WeightTrackerConfigStore } from './weight-tracker-config.store';

describe('WeightTrackerConfigStore', () => {
  let facade: WeightTrackerConfigStore;
  let store: Store<WeightTrackerConfigState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({ weightTrackerConfig })],
      providers: [provideZonelessChangeDetection()],
    });
    facade = TestBed.inject(WeightTrackerConfigStore);
    store = TestBed.inject(Store<WeightTrackerConfigState>);
  });

  it('should set state', () => {
    spyOn(store, 'dispatch');
    const state = { units: 0 };
    facade.setState(state);
    expect(store.dispatch).toHaveBeenCalledWith(weightTrackerConfigActions.updateState(state));
  });

  it('should get state', () => {
    const a = { units: 1 };
    facade.setState(a);
    expect(facade.getState()).toBeObservable(cold('a', { a }));
  });
});
