import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom } from 'rxjs';

import { weightDataActions } from './weight-data.actions';
import { getWeights } from './weight-data.reducer';
import { WeightDataStore } from './weight-data.store';

describe('WeightDataStore', () => {
  let service: WeightDataStore;
  let store: MockStore;

  const mockWeights = [
    { x: new Date('2025-01-01'), y: 150 },
    { x: new Date('2025-01-02'), y: 149 },
    { x: new Date('2025-01-03'), y: 148 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideMockStore({
          selectors: [{ selector: getWeights, value: mockWeights }],
        }),
      ],
    });
    service = TestBed.inject(WeightDataStore);
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should dispatch weightsRequest action on getWeights', () => {
    service.getWeights();
    expect(store.dispatch).toHaveBeenCalledWith(weightDataActions.weightsRequest());
  });

  it('should dispatch weightsComplete action on setWeights', () => {
    service.setWeights(mockWeights);
    expect(store.dispatch).toHaveBeenCalledWith(
      weightDataActions.weightsComplete({ weights: mockWeights }),
    );
  });

  it('should select weights from store', async () => {
    const weights = await firstValueFrom(service.selectWeights());
    expect(weights).toEqual(mockWeights);
  });

  it('should select deduped and filled weights', async () => {
    const weights = await firstValueFrom(service.selectDedupedWeights());
    expect(weights.length).toBeGreaterThanOrEqual(mockWeights.length);
  });

  it('should filter out duplicate dates in selectDedupedWeights', async () => {
    const duplicateWeights = [
      { x: new Date('2025-01-01'), y: 150 },
      { x: new Date('2025-01-01'), y: 151 }, // duplicate date
      { x: new Date('2025-01-02'), y: 149 },
    ];
    store.overrideSelector(getWeights, duplicateWeights);
    store.refreshState();

    const weights = await firstValueFrom(service.selectDedupedWeights());
    const dates = weights.map((w) => +w.x!);
    const uniqueDates = new Set(dates);
    expect(dates.length).toBe(uniqueDates.size);
  });
});
