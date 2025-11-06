import { ChartDataPoint } from 'canvasjs';
import { HighPipe } from './high.pipe';

describe('HighPipe', () => {
  it('create return the max', () => {
    const pipe = new HighPipe<ChartDataPoint>();
    expect(
      pipe.transform(
        [
          { x: new Date('2025-01-01T00:00:00.000Z'), y: 150 },
          { x: new Date('2025-01-02T00:00:00.000Z'), y: 149 },
          { x: new Date('2025-01-03T00:00:00.000Z'), y: 147 },
        ],
        'y',
      ),
    ).toBe(150);
  });
});
