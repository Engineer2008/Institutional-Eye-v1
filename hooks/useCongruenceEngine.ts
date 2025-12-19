
import { useMemo } from 'react';
import { GlobalLiquidityState } from '../types';

export const useCongruenceEngine = (state: GlobalLiquidityState) => {
  return useMemo(() => {
    // Calculate the standard deviation of Delta across exchanges
    const deltas = [state.binanceDelta, state.coinbaseDelta, state.bybitDelta];
    const mean = deltas.reduce((a, b) => a + b) / 3;
    const variance = deltas.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 3;
    const stabilityScore = 1 / (1 + Math.sqrt(variance));

    return {
      globalConviction: stabilityScore > 0.8 ? 'CONGRUENT' : 'DIVERGENT',
      stabilityScore,
      isLeadExchange: state.binanceDelta > state.coinbaseDelta ? 'BINANCE_LEADING' : 'COINBASE_LEADING'
    };
  }, [state]);
};
