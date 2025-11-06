import { TestBed } from '@angular/core/testing';

import { WeightDataStore } from './weight-data.store';

describe('WeightDataStore', () => {
  let service: WeightDataStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeightDataStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
