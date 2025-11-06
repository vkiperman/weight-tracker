import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { WeightDataEffects } from './weight-data.effects';

describe('WeightDataEffects', () => {
  let actions$: Observable<any>;
  let effects: WeightDataEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WeightDataEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(WeightDataEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
