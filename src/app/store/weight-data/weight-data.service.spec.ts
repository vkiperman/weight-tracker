import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { storageItemName } from '@app/components/weight-tracker/weight-tracker.component';

import { WeightDataService } from './weight-data.service';

describe('WeightDataService', () => {
  let service: WeightDataService;

  const mockData = [
    { x: '2025-01-01T00:00:00.000Z', y: 150 },
    { x: '2025-01-02T00:00:00.000Z', y: 149 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(WeightDataService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getWeights from localStorage', (done) => {
    localStorage.setItem(storageItemName, JSON.stringify(mockData));

    service.getWeights().subscribe((weights) => {
      expect(weights.length).toBe(2);
      expect(weights[0].y).toBe(150);
      expect(weights[1].y).toBe(149);
      done();
    });
  });

  it('should return empty array when localStorage is empty', (done) => {
    service.getWeights().subscribe((weights) => {
      expect(weights).toEqual([]);
      done();
    });
  });

  it('should setWeights to localStorage', () => {
    const weights = [
      { x: new Date('2025-01-01'), y: 150 },
      { x: new Date('2025-01-02'), y: 149, filledIn: true },
      { x: new Date('2025-01-03'), y: 148 },
    ];

    service.setWeights(weights);

    const stored = JSON.parse(localStorage.getItem(storageItemName) || '[]');
    expect(stored.length).toBe(2); // filledIn items are filtered out
  });
});
