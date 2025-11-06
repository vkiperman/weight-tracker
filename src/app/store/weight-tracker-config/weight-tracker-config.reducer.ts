import { Action, createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { weightTrackerConfigActions } from './weight-tracker-config.actions';

export const weightTrackerConfigFeatureKey = 'weightTrackerConfig';

export interface WeightTrackerConfigState {
  units: number | null;
}

export const initialState: WeightTrackerConfigState = {
  units: 0,
};

const reducer = createReducer(
  initialState,
  on(weightTrackerConfigActions.updateState, (state, { units }) => ({
    ...state,
    units,
  })),
);

export function weightTrackerConfigReducer(
  state: WeightTrackerConfigState | undefined,
  action: Action<string>,
) {
  return reducer(state, action);
}

// entity selectors
const selectState = createFeatureSelector<WeightTrackerConfigState>(weightTrackerConfigFeatureKey);
export const getWeightTrackerConfigState = createSelector(selectState, (state) => state);
