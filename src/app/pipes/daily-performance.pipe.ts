import { Pipe, PipeTransform } from '@angular/core';
import { ChartDataPoint } from 'canvasjs';

@Pipe({
  name: 'dailyPerformance',
})
export class DailyPerformancePipe implements PipeTransform {
  private DAY = 1000 * 60 * 60 * 24;

  public transform(data: ChartDataPoint[] | null | undefined): number {
    if (!data || data.length < 2) return 0;
    const first = data.at(0)!;
    const last = data.at(-1)!;

    const progress = last!.y! - first!.y!;
    const days = (+new Date(last.x!) - +new Date(first.x!)) / this.DAY;
    return progress / days;
  }
}
