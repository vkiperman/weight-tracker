import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ColorScaleService,
  fillLinearDaily,
  lineOfBestFit,
  slidingProjections,
} from './weight-tracker.utils';

describe('Weight Tracker Utils', () => {
  it('should calculate linear regression correctly', () => {
    const data = [
      { x: new Date('2024-01-01'), y: 2 },
      { x: new Date('2024-01-04'), y: 7 },
    ];
    const result = fillLinearDaily(data);
    expect(result).toEqual([
      { x: new Date('2024-01-01'), y: 2, message: '' },
      { x: new Date('2024-01-02'), y: 3.7, filledIn: true, message: '' },
      { x: new Date('2024-01-03'), y: 5.3, filledIn: true, message: '' },
      { x: new Date('2024-01-04'), y: 7, message: '' },
    ]);
  });

  describe('lineOfBestFit', () => {
    it('should return empty array for less than 2 points', () => {
      expect(lineOfBestFit([])).toEqual([]);
      expect(lineOfBestFit([{ x: new Date('2024-01-01'), y: 5 }])).toEqual([]);
    });

    it('should return first and last points of best fit line', () => {
      const data = [
        { x: new Date('2024-01-01'), y: 10 },
        { x: new Date('2024-01-02'), y: 20 },
        { x: new Date('2024-01-03'), y: 30 },
      ];
      const result = lineOfBestFit(data);
      expect(result.length).toBe(2);
      expect(result[0].x).toEqual(new Date('2024-01-01'));
      expect(result[1].x).toEqual(new Date('2024-01-03'));
    });

    it('should calculate correct slope for linear data', () => {
      const data = [
        { x: new Date('2024-01-01'), y: 100 },
        { x: new Date('2024-01-02'), y: 110 },
        { x: new Date('2024-01-03'), y: 120 },
      ];
      const result = lineOfBestFit(data);
      expect(result[0].y).toBe(100);
      expect(result[1].y).toBe(120);
    });
  });

  describe('slidingProjections', () => {
    it('should return projections for each data point', () => {
      const data = [
        { x: new Date('2024-01-01'), y: 100 },
        { x: new Date('2024-01-02'), y: 102 },
        { x: new Date('2024-01-03'), y: 104 },
      ];
      const result = slidingProjections(data, 3);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should use default sample size of 7', () => {
      const data = [
        { x: new Date('2024-01-01'), y: 100 },
        { x: new Date('2024-01-02'), y: 101 },
        { x: new Date('2024-01-03'), y: 102 },
      ];
      const result = slidingProjections(data);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should project next day based on trend', () => {
      const data = [
        { x: new Date('2024-01-01'), y: 100 },
        { x: new Date('2024-01-02'), y: 110 },
      ];
      const result = slidingProjections(data, 2);
      expect(result[result.length - 1].x).toEqual(new Date('2024-01-03'));
    });

    it('should handle single data point', () => {
      const data = [{ x: new Date('2024-01-01'), y: 100 }];
      const result = slidingProjections(data, 7);
      expect(result.length).toBe(1);
      expect(result[0].y).toBe(100);
    });
  });
});

describe('ColorScaleService', () => {
  let service: ColorScaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(ColorScaleService);
  });

  it('should return low color at low bound', () => {
    const scale = service.createColorScale(0, 100, 'rgb(255, 0, 0)', 'rgb(0, 255, 0)');
    expect(scale(0)).toBe('rgb(255, 0, 0)');
  });

  it('should return high color at high bound', () => {
    const scale = service.createColorScale(0, 100, 'rgb(255, 0, 0)', 'rgb(0, 255, 0)');
    expect(scale(100)).toBe('rgb(0, 255, 0)');
  });

  it('should interpolate color at midpoint', () => {
    const scale = service.createColorScale(0, 100, 'rgb(0, 0, 0)', 'rgb(100, 100, 100)');
    expect(scale(50)).toBe('rgb(50, 50, 50)');
  });

  it('should clamp values below low bound', () => {
    const scale = service.createColorScale(0, 100, 'rgb(255, 0, 0)', 'rgb(0, 255, 0)');
    expect(scale(-50)).toBe('rgb(255, 0, 0)');
  });

  it('should clamp values above high bound', () => {
    const scale = service.createColorScale(0, 100, 'rgb(255, 0, 0)', 'rgb(0, 255, 0)');
    expect(scale(150)).toBe('rgb(0, 255, 0)');
  });

  it('should throw error for invalid RGB format', () => {
    expect(() => service.createColorScale(0, 100, 'invalid', 'rgb(0, 255, 0)')).toThrowError(
      'Invalid RGB format: invalid',
    );
  });
});
