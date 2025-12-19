
import { VolatilityState } from '../types';

export interface BacktestResult {
  tradeType: string;
  entryPrice: number;
  exitPrice: number;
  slippage: number;
  wasSuccessful: boolean;
  maxDrawdown: number;
  timestamp: number;
}

/**
 * Heuristic check for signal validity within historical data
 */
const checkSignal = (tick: any, alertType: 'GUNPOINT' | 'SWEEP' | 'ABSORPTION'): boolean => {
  const toxicity = tick.toxicity || 0;
  const ratio = tick.forensicRatio || 1.0;
  const vol = tick.volume || 0;

  switch (alertType) {
    case 'GUNPOINT':
      // Gunpoint is defined by extreme toxicity and aggressive delta speed (proxy via volume here)
      return toxicity > 0.85 && vol > 5.0; 
    case 'SWEEP':
      // Sweep is defined by volume exceeding structural thresholds
      return vol > (ratio * 5);
    case 'ABSORPTION':
      // Absorption is defined by high forensic ratio (HFT absorption signature)
      return ratio > 1.8;
    default:
      return false;
  }
};

/**
 * Simulated slippage based on market toxicity/liquidity
 */
const calculateSimulatedSlippage = (toxicity: number): number => {
  // Higher toxicity implies lower organic liquidity, leading to higher slippage
  // 0.01% baseline + up to 0.1% based on toxicity
  return 0.0001 + (toxicity * 0.001);
};

export const runForensicBacktest = (
  historicalTicks: any[], 
  alertType: 'GUNPOINT' | 'SWEEP' | 'ABSORPTION'
): BacktestResult[] => {
  const results: BacktestResult[] = [];
  const LOOK_AHEAD = 100; // Look 100 ticks into the "future"
  const TAKE_PROFIT = 0.005; // 0.5%
  const STOP_LOSS = -0.003;  // 0.3%
  
  // Iterate through history leaving room for look-ahead
  for (let index = 0; index < historicalTicks.length - LOOK_AHEAD; index++) {
    const tick = historicalTicks[index];
    const signalTriggered = checkSignal(tick, alertType);

    if (signalTriggered) {
      const entry = tick.price;
      let exit = 0;
      let peakDrawdown = 0;
      let exitFound = false;
      
      // Look forward in the array (The "Future" replay)
      for (let i = index + 1; i < index + LOOK_AHEAD; i++) {
        const futureTick = historicalTicks[i];
        if (!futureTick) break;

        const rawPnl = (futureTick.price - entry) / entry;
        peakDrawdown = Math.min(peakDrawdown, rawPnl);

        // Take Profit (TP) or Stop Loss (SL) Logic
        if (rawPnl >= TAKE_PROFIT || rawPnl <= STOP_LOSS) { 
          exit = futureTick.price;
          exitFound = true;
          break;
        }
      }

      // If no TP/SL hit, exit at the end of window
      if (!exitFound) {
        exit = historicalTicks[index + LOOK_AHEAD].price;
      }

      const slippage = calculateSimulatedSlippage(tick.toxicity || 0.2);
      
      results.push({
        tradeType: alertType,
        entryPrice: entry,
        exitPrice: exit,
        slippage: slippage,
        wasSuccessful: (exit * (1 - slippage)) > entry,
        maxDrawdown: peakDrawdown,
        timestamp: tick.time || Date.now()
      });

      // Jump forward slightly to avoid overlapping signals for the same move
      index += 20; 
    }
  }

  return results;
};
