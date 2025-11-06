import { AvgPipe } from './avg.pipe';

describe('AvgPipe', () => {
  it('should return an average from numbers', () => {
    const pipe = new AvgPipe();
    expect(pipe.transform([1, 2, 3])).toBe(2);
  });
  
  it('should return an average from objects', () => {
    const pipe = new AvgPipe<{ y: number }>();
    expect(pipe.transform([{ y: 1 }, { y: 2 }, { y: 3 }], 'y')).toBe(2);
  });
});
