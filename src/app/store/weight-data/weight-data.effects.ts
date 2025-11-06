import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs';
import { weightDataActions } from './weight-data.actions';
import { WeightDataService } from './weight-data.service';

@Injectable()
export class WeightDataEffects {
  private service = inject(WeightDataService);
  private actions$ = inject(Actions);

  public weightsRequested$ = createEffect(() =>
    this.actions$.pipe(
      ofType(weightDataActions.weightsRequest),
      switchMap(() => this.service.getWeights()),
      map((weights) => weightDataActions.weightsComplete({ weights })),
      catchError((_, caught) => caught),
    ),
  );
}
