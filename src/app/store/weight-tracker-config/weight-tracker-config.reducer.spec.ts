import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from '@app/app';
import { Store, StoreModule } from '@ngrx/store';
import { cold } from 'jasmine-marbles';
import { weightTrackerConfigActions } from './weight-tracker-config.actions';
import {
  getWeightTrackerConfigState,
  weightTrackerConfigReducer as weightTrackerConfig,
  WeightTrackerConfigState,
} from './weight-tracker-config.reducer';

describe('WeightTrackerConfig Reducer', () => {
  let store: Store<WeightTrackerConfigState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, StoreModule.forRoot({ weightTrackerConfig })],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    store = TestBed.inject(Store<WeightTrackerConfigState>);
  });

  it('should update state', () => {
    const a = { units: 0 };
    store.dispatch(weightTrackerConfigActions.updateState(a));

    expect(store.select(getWeightTrackerConfigState)).toBeObservable(cold('a', { a }));
  });
});
