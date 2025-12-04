import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { WeightDataStore } from './weight-data.store';

describe('WeightDataStore', () => {
  let service: WeightDataStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideMockStore()],
    });
    service = TestBed.inject(WeightDataStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
