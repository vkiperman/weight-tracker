import { Action, createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
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
const selectState = createFeatureSelector<WeightDataState>(weightDataFeatureKey);
export const getWeights = createSelector(selectState, ({ weights }) => weights);
