import { DailyPerformancePipe } from './daily-performance.pipe';

describe('DailyPerformancePipe', () => {
  it('should return 0', () => {
    const pipe = new DailyPerformancePipe();
    expect(pipe.transform(null)).toBe(0);
    expect(pipe.transform(undefined)).toBe(0);
    expect(pipe.transform([])).toBe(0);
  });
  it('should return a performance value', () => {
    const pipe = new DailyPerformancePipe();
    expect(
      pipe.transform([
        { x: new Date('2025-01-01T00:00:00.000Z'), y: 150 },
        { x: new Date('2025-01-02T00:00:00.000Z'), y: 149 },
        { x: new Date('2025-01-03T00:00:00.000Z'), y: 147 },
      ]),
    ).toBe(-1.5);
  });
});
