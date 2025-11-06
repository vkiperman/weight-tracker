import { inject, Injectable } from '@angular/core';
import { fillLinearDaily } from '@app/shared/utils/weight-tracker.utils';
import { Store } from '@ngrx/store';
import { ChartDataPoint } from 'canvasjs';
import { filter, map } from 'rxjs';
import { weightDataActions } from './weight-data.actions';
import { getWeights } from './weight-data.reducer';

@Injectable({
  providedIn: 'root',
})
export class WeightDataStore {
  private store = inject(Store);

  public getWeights(): void {
    this.store.dispatch(weightDataActions.weightsRequest());
  }
  public setWeights(weights: ChartDataPoint[]): void {
    this.store.dispatch(weightDataActions.weightsComplete({ weights }));
  }
  public selectWeights() {
    return this.store.select(getWeights);
  }
  public selectDedupedWeights() {
    return this.selectWeights().pipe(
      filter((data) => !!data),
      map((data) => {
        const seen = new Set<number>();
        return data.filter((item) => !seen.has(+item.x!) && seen.add(+item.x!));
      }),
      map((data) => fillLinearDaily(data)),
    );
  }
}
