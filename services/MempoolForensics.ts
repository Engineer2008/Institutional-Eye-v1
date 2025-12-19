
import { Transaction, MempoolToxicityReport } from '../types';

const calculateCumulativeImpact = (txs: Transaction[]): number => {
  // Simple cumulative impact calculation: sum of impact weighted by transaction count
  return txs.reduce((acc, tx) => acc + tx.impact, 0);
};

/**
 * v4.0 Logic: Mempool Toxicity Check
 * Analyzes pending transactions for predatory sell pressure.
 */
export const checkMempoolToxicity = (pendingTx: Transaction[]): MempoolToxicityReport => {
  const aggressiveSells = pendingTx.filter(tx => tx.impact > 0.02 && tx.isSell);
  
  if (aggressiveSells.length > 5) {
    return {
      status: 'HIGH_ALERT',
      reason: 'CASCADING_LIQUIDATION_DETECTED',
      estimatedPriceImpact: calculateCumulativeImpact(aggressiveSells)
    };
  }
  
  return { status: 'STABLE' };
};

/**
 * MOCK: Generates simulated mempool activity for visual testing
 */
export const generateMockMempool = (): Transaction[] => {
  const count = Math.floor(Math.random() * 10) + 2;
  const txs: Transaction[] = [];
  for(let i=0; i<count; i++) {
    txs.push({
      hash: '0x' + Math.random().toString(16).substr(2, 8),
      impact: Math.random() * 0.05,
      isSell: Math.random() > 0.4,
      value: Math.random() * 500000
    });
  }
  return txs;
};
