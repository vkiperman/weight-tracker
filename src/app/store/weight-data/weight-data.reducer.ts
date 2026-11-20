import { Action, createReducer, on } from '@ngrx/store';
import { ChartDataPoint } from 'canvasjs';
import { weightDataActions } from './weight-data.actions';

export const weightDataFeatureKey = 'weightData';

export interface WeightDataState {
  weights: ChartDataPoint[] | null;
}

export const initialState: WeightDataState = {
  weights: null,
};

const reducer = createReducer(
  initialState,
  on(weightDataActions.weightsComplete, (state, { weights }) => ({ ...state, weights })),
);

export function weightDataReducer(state: WeightDataState | undefined, action: Action<string>) {
  return reducer(state, action);
}

// entity selectors
export const getWeights = (state: { weightData?: WeightDataState } | undefined) =>
  state?.weightData?.weights ?? null;
