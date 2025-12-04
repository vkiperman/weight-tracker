import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { WeightDataService } from './weight-data.service';

describe('WeightDataService', () => {
  let service: WeightDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(WeightDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
