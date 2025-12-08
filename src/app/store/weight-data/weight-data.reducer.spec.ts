import { weightDataActions } from './weight-data.actions';
import { getWeights, initialState, weightDataReducer as reducer } from './weight-data.reducer';

describe('WeightData Reducer', () => {
  const mockWeights = [
    { x: new Date('2025-01-01'), y: 150 },
    { x: new Date('2025-01-02'), y: 149 },
  ];

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('weightsComplete action', () => {
    it('should update weights in state', () => {
      const action = weightDataActions.weightsComplete({ weights: mockWeights });

      const result = reducer(initialState, action);

      expect(result.weights).toEqual(mockWeights);
    });
  });

  describe('getWeights selector', () => {
    it('should select weights from state', () => {
      const state = {
        weightData: { weights: mockWeights },
      };

      const result = getWeights(state);

      expect(result).toBe(mockWeights);
    });

    it('should return null when weights is null', () => {
      const state = {
        weightData: { weights: null },
      };

      const result = getWeights(state);

      expect(result).toBeNull();
    });
  });
});
