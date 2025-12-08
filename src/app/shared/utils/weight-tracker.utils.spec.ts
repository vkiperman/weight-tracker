import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ColorScaleService,
  fillLinearDaily,
  lineOfBestFit,
  slidingProjections,
} from './weight-tracker.utils';

describe('Weight Tracker Utils', () => {
  describe('fillLinearDaily', () => {
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

    it('should return empty array for empty input', () => {
      expect(fillLinearDaily([])).toEqual([]);
    });

    it('should return empty array for non-array input', () => {
      expect(fillLinearDaily(null as any)).toEqual([]);
      expect(fillLinearDaily(undefined as any)).toEqual([]);
    });

    it('should handle single data point', () => {
      const data = [{ x: new Date('2024-01-01'), y: 5 }];
      const result = fillLinearDaily(data);
      expect(result.length).toBe(1);
      expect(result[0].y).toBe(5);
    });

    it('should handle consecutive days without interpolation', () => {
      const data = [
        { x: new Date('2024-01-01'), y: 10 },
        { x: new Date('2024-01-02'), y: 12 },
      ];
      const result = fillLinearDaily(data);
      expect(result.length).toBe(2);
    });

    it('should handle same day duplicates', () => {
      const data = [
        { x: new Date('2024-01-01'), y: 10 },
        { x: new Date('2024-01-01'), y: 15 },
      ];
      const result = fillLinearDaily(data);
      expect(result.length).toBe(1);
      expect(result[0].y).toBe(15); // keeps latest
    });

    it('should filter out invalid dates', () => {
      const data = [
        { x: new Date('2024-01-01'), y: 10 },
        { x: new Date('invalid'), y: 15 },
        { x: new Date('2024-01-02'), y: 12 },
      ];
      const result = fillLinearDaily(data);
      expect(result.length).toBe(2);
    });

    it('should preserve message field', () => {
      const data = [
        { x: new Date('2024-01-01'), y: 10, message: 'hello' },
        { x: new Date('2024-01-03'), y: 12, message: 'world' },
      ];
      const result = fillLinearDaily(data);
      expect(result[0].message).toBe('hello');
      expect(result[2].message).toBe('world');
    });

    it('should handle decimals parameter as null', () => {
      const data = [
        { x: new Date('2024-01-01'), y: 2 },
        { x: new Date('2024-01-04'), y: 7 },
      ];
      const result = fillLinearDaily(data, null as any);
      expect(result[1].y).toBe(2 + (7 - 2) * (1 / 3));
    });
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

    it('should handle empty array', () => {
      const result = slidingProjections([], 7);
      expect(result).toEqual([]);
    });

    it('should handle identical x values (denominator zero)', () => {
      const data = [
        { x: new Date('2024-01-01'), y: 100 },
        { x: new Date('2024-01-01'), y: 105 },
      ];
      const result = slidingProjections(data, 2);
      expect(result.length).toBeGreaterThan(0);
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
