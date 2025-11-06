import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ChartDataPoint } from 'canvasjs';

export const weightDataActions = createActionGroup({
  source: 'Weight Tracker Data',
  events: {
    'Weights request': emptyProps(),
    'Weights complete': props<{ weights: ChartDataPoint[] }>(),
  },
});
