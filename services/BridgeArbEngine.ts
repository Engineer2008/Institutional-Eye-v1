
import { ArbOpportunity } from '../types';
import { CORE_CONFIG } from '../constants';

// Mock price/fee/gas helpers to simulate live cross-chain data
const getPrice = (token: string, chain: string): number => {
  const basePrices: Record<string, number> = {
    'WETH': 2640,
    'WBTC': 64200,
    'USDC': 1.00
  };
  const base = basePrices[token] || 100;
  // Add artificial variance per chain
  const chainVariance: Record<string, number> = {
    'ETH': 0,
    'ARB': -0.5,
    'OP': 1.2,
    'BASE': 0.8
  };
  const jitter = (Math.random() - 0.5) * 2; // Real-time volatility
  return base + (chainVariance[chain] || 0) + jitter;
};

const getBridgeFee = (source: string, target: string): number => 1.5; // Flat $1.5 Bridge Fee for demo
const getGasEst = (chain: string): number => {
  const gasMap: Record<string, number> = {
    'ETH': 12.0,
    'ARB': 0.2,
    'OP': 0.15,
    'BASE': 0.1
  };
  return gasMap[chain] || 0.5;
};

/**
 * v4.0 Logic: Cross-Chain Arbitrage Logic
 */
export const calculateBridgeArb = (token: string, sourceChain: string, targetChain: string): ArbOpportunity => {
  const sourcePrice = getPrice(token, sourceChain);
  const targetPrice = getPrice(token, targetChain);
  const bridgeFee = getBridgeFee(sourceChain, targetChain);

  const rawProfit = targetPrice - sourcePrice;
  const netProfit = rawProfit - (bridgeFee + getGasEst(sourceChain) + getGasEst(targetChain));

  return {
    token,
    sourceChain,
    targetChain,
    sourcePrice,
    targetPrice,
    isProfitable: netProfit > 0,
    expectedROI: (netProfit / sourcePrice) * 100,
    // Using v4.0 Primary Bridge Aggregator config
    route: `Buy on ${sourceChain} -> Bridge via ${CORE_CONFIG.PRIMARY_BRIDGE_AGGREGATOR.replace(/_/g, ' ')} -> Sell on ${targetChain}`,
    timestamp: Date.now()
  };
};

export const scanAllOpportunities = (): ArbOpportunity[] => {
  const tokens = ['WETH', 'WBTC'];
  const chains = ['ETH', 'ARB', 'OP', 'BASE'];
  const opportunities: ArbOpportunity[] = [];

  tokens.forEach(t => {
    chains.forEach(src => {
      chains.forEach(dest => {
        if (src === dest) return;
        opportunities.push(calculateBridgeArb(t, src, dest));
      });
    });
  });

  return opportunities.sort((a, b) => b.expectedROI - a.expectedROI);
};
