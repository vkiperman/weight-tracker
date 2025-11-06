import { Injectable } from '@angular/core';
import { storageItemName } from '@app/components/weight-tracker/weight-tracker.component';
import { WT_ChartDataPoint } from '@app/components/weight-tracker/weight-tracker.types';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WeightDataService {
  public getWeights() {
    const data = [...JSON.parse(localStorage.getItem(storageItemName) || '[]')].map(({ x, y }) => ({
      x: new Date(x),
      y,
    }));

    return of(data);
  }

  public setWeights(weights: WT_ChartDataPoint[]) {
    localStorage.setItem(
      storageItemName,
      JSON.stringify(weights.filter(({ filledIn }) => !filledIn)),
    );
  }
}
