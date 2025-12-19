
// Fix: Import shared CongruenceState interface from central types file
import { CongruenceState } from '../types';

/**
 * v2.0 Logic: Cross-Exchange Congruence Check
 * Compares primary exchange (Binance) against secondary (Coinbase/Index)
 */
export const checkCrossExchangeCongruence = (binancePrice: number, coinbasePrice: number): CongruenceState => {
  if (binancePrice === 0 || coinbasePrice === 0) {
    return {
      isCongruent: true,
      opportunity: 'SYNCHRONIZED',
      intensity: 0,
      spreadPercent: 0
    };
  }

  const spread = Math.abs(binancePrice - coinbasePrice) / binancePrice;
  
  return {
    isCongruent: spread < 0.0005, // 0.05% threshold
    opportunity: spread > 0.001 ? 'ARBITRAGE_DETECTED' : 'SYNCHRONIZED',
    intensity: spread * 1000,
    spreadPercent: spread * 100
  };
};
