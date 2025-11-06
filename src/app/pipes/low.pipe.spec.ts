import { ChartDataPoint } from 'canvasjs';
import { LowPipe } from './low.pipe';

describe('LowPipe', () => {
  it('should return the min', () => {
    const pipe = new LowPipe<ChartDataPoint>();
    expect(
      pipe.transform(
        [
          { x: new Date('2025-01-01T00:00:00.000Z'), y: 150 },
          { x: new Date('2025-01-02T00:00:00.000Z'), y: 149 },
          { x: new Date('2025-01-03T00:00:00.000Z'), y: 147 },
        ],
        'y',
      ),
    ).toBe(147);
  });
});
