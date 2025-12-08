import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';

import { weightDataActions } from './weight-data.actions';
import { WeightDataEffects } from './weight-data.effects';
import { WeightDataService } from './weight-data.service';

describe('WeightDataEffects', () => {
  let actions$: Observable<any>;
  let effects: WeightDataEffects;
  let service: jasmine.SpyObj<WeightDataService>;

  const mockWeights = [
    { x: new Date('2025-01-01'), y: 150 },
    { x: new Date('2025-01-02'), y: 149 },
  ];

  beforeEach(() => {
    const serviceSpy = jasmine.createSpyObj('WeightDataService', ['getWeights']);
    serviceSpy.getWeights.and.returnValue(of(mockWeights));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        WeightDataEffects,
        provideMockActions(() => actions$!),
        { provide: WeightDataService, useValue: serviceSpy },
      ],
    });

    effects = TestBed.inject(WeightDataEffects);
    service = TestBed.inject(WeightDataService) as jasmine.SpyObj<WeightDataService>;
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  it('should dispatch weightsComplete on weightsRequest', (done) => {
    actions$ = of(weightDataActions.weightsRequest());

    effects.weightsRequested$.subscribe((action) => {
      expect(action).toEqual(weightDataActions.weightsComplete({ weights: mockWeights }));
      expect(service.getWeights).toHaveBeenCalled();
      done();
    });
  });
});
