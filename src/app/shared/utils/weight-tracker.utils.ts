import { Injectable } from '@angular/core';
import { WT_ChartDataPoint } from '@app/components/weight-tracker/weight-tracker.types';
import { ChartDataPoint } from 'canvasjs';

/**
 * Linearly fills missing daily points between known dates.
 *
 * - Input can be unsorted and may have gaps of multiple days.
 * - For each consecutive pair of known points, it inserts daily points
 *   (exclusive of the left end, inclusive of the right end) with y interpolated linearly.
 * - No extrapolation beyond the earliest/latest known x.
 *
 * @param data Sparse array of {x: ISO string, y: number}
 * @param decimals Optional: round to this many decimals (default 1). Pass null to skip rounding.
 * @returns Dense, sorted array with daily points filled in.
 */
export function fillLinearDaily(data: WT_ChartDataPoint[], decimals = 1): WT_ChartDataPoint[] {
  if (!Array.isArray(data) || !data.length) return [];

  const DAY_MS = 24 * 60 * 60 * 1000;

  const roundMaybe = (v: number) => (decimals === null ? v : +v.toFixed(decimals));

  const seen = new Set<number>();

  // Normalize & sort by time ascending
  return [...data]
    .filter((p) => Number.isFinite(+p.x!))
    .sort((a, b) => +a.x! - +b.x!)
    .reduce((acc, cur, i, sorted) => {
      // Always push the first point (or the segment's right endpoint inside the loop)
      if (i === 0) {
        acc.push({ x: new Date(cur.x!), y: roundMaybe(cur.y!) });
        return acc;
      }

      const prev = sorted[i - 1];

      // Compute whole-day gap between prev and cur (by milliseconds)
      const gapDays = Math.round((+cur.x! - +prev.x!) / DAY_MS);

      if (gapDays < 1) {
        // Same day or out-of-order duplicate -> keep the latest point for that day
        acc[acc.length - 1] = { x: new Date(cur.x!), y: roundMaybe(cur.y!) };
        return acc;
      }

      // If exactly next day, just push the current point (no interpolation needed)
      if (gapDays === 1) {
        acc.push({ x: new Date(cur.x!), y: roundMaybe(cur.y!) });
        return acc;
      }

      // Interpolate days strictly between prev and cur
      for (let d = 1; d < gapDays; d++) {
        const ratio = d / gapDays;
        const x = new Date(+prev.x! + d * DAY_MS);
        const y = roundMaybe(prev.y! + (cur.y! - prev.y!) * ratio);
        const filledIn = true;
        acc.push({ x, y, filledIn });
      }

      // Finally push the right endpoint
      acc.push({ x: new Date(cur.x!), y: roundMaybe(cur.y!) });
      return acc;
    }, [] as WT_ChartDataPoint[])
    .filter((p) => !seen.has(+p.x!) && seen.add(+p.x!));
}

/**
 * Returns the best-fit line y = m*x + b for [{x: Date, y: number}] data.
 * x is treated as milliseconds since epoch.
 */
export function lineOfBestFit(data: ChartDataPoint[]): ChartDataPoint[] {
  if (data.length < 2) {
    // throw new Error('Need at least 2 points to compute a best-fit line.');
    return [];
  }

  // Numeric x and y arrays
  const { xs, ys } = data.reduce<{ xs: number[]; ys: number[] }>(
    ({ xs, ys }, { x, y }) => ({
      xs: [...xs, (x as Date).getTime()],
      ys: [...ys, y!],
    }),
    { xs: [], ys: [] },
  );

  const n = data.length;

  // Means
  const getSum = (sum: number, val: number) => sum + val;
  const meanX = xs.reduce(getSum, 0) / n;
  const meanY = ys.reduce(getSum, 0) / n;

  // Slope (m) and intercept (b)
  let numerator = 0,
    denominator = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    numerator += dx * (ys[i] - meanY);
    denominator += dx * dx;
  }
  const m = numerator / denominator;
  const b = meanY - m * meanX;

  // Generate y-values for each original x
  const linePoints = xs.map((x: number) => ({
    x: new Date(x),
    y: m * x + b,
    n: (m * x + b).toFixed(1),
  }));

  return [linePoints.at(0)!, linePoints.at(-1)!];
}

/**
 *
 * @param projectionSampleSize number
 * @returns an array where each item is the projection of the available data of the last @projectionSampleSize points
 */
export function slidingProjections(
  data: ChartDataPoint[],
  projectionSampleSize = 7,
): ChartDataPoint[] {
  const DAY = 24 * 60 * 60 * 1000;

  function regress(xs: number[], ys: number[]): { m: number; b: number; ok: boolean } {
    const n = xs.length;
    if (n < 2) return { m: 0, b: ys[n - 1], ok: false };

    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;

    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      const dx = xs[i] - meanX;
      num += dx * (ys[i] - meanY);
      den += dx * dx;
    }

    if (den === 0) return { m: 0, b: ys[n - 1], ok: false }; // all xs identical
    const m = num / den;
    return { m, b: meanY - m * meanX, ok: true };
  }

  return data
    .map((_, i) => {
      const start = Math.max(0, i - projectionSampleSize + 1);
      const window = data.slice(start, i + 1);

      const xs = window.map((d) => new Date(d.x!).getTime());
      const ys = window.map(({ y }) => y);

      let nextT: number;
      if (xs.length >= 2) {
        const last = xs[xs.length - 1];
        const prev = xs[xs.length - 2];
        const gap = Math.max(DAY, last - prev || DAY); // avoid zero/negative gap
        nextT = last + gap;
        // } else if (xs.length === 1) {
        //   nextT = xs[0] + DAY;
      } else {
        return data[i];
      }

      const { m, b, ok } = regress(xs as number[], ys as number[]);
      const yhat = ok ? +(m * nextT + b).toFixed(1) : ys[ys.length - 1];

      return { x: new Date(nextT), y: yhat ?? null };
    })
    .filter(({ x }, i, src) => i === src.length - 1 || +x! < +src[i + 1]?.x!);
}

@Injectable({ providedIn: 'root' })
export class ColorScaleService {
  private parseRGB(rgbStr: string) {
    const match = rgbStr.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (!match) throw new Error(`Invalid RGB format: ${rgbStr}`);
    const [, r, g, b] = match;
    return { r: +r, g: +g, b: +b };
  }

  private interpolate(low: number, high: number, t: number): number {
    return low + (high - low) * t;
  }

  /**
   * Creates a color scale function mapping numeric values to RGB colors.
   *
   * @param lowNum - The lower bound of the numeric range.
   * @param highNum - The upper bound of the numeric range.
   * @param lowColor - The RGB color at the lower bound (e.g., "rgb(255, 0, 0)").
   * @param highColor - The RGB color at the upper bound (e.g., "rgb(0, 255, 0)").
   * @returns A function that takes a number and returns an interpolated color string.
   */
  public createColorScale(
    lowNum: number,
    highNum: number,
    lowColor: string,
    highColor: string,
  ): (value: number) => string {
    const low = this.parseRGB(lowColor);
    const high = this.parseRGB(highColor);

    return (value: number) => {
      const clamped = Math.max(lowNum, Math.min(highNum, value));
      const t = (clamped - lowNum) / (highNum - lowNum);

      const r = Math.round(this.interpolate(low.r, high.r, t));
      const g = Math.round(this.interpolate(low.g, high.g, t));
      const b = Math.round(this.interpolate(low.b, high.b, t));

      return `rgb(${r}, ${g}, ${b})`;
    };
  }
}

// export function setupDateCheck() {
//   const hourlyInterval = 9000 * 60; // Every nine minutes

//   return interval(hourlyInterval).pipe(
//     map(() => new Date()),
//     filter((now) => now.getHours() === 0),
//     startWith(0),
//   );
// }
