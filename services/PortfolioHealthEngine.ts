
import { Position, PortfolioHealthReport } from '../types';

/**
 * v4.0 Portfolio Health Logic: Liquidation Watchdog
 */
export const calculateGlobalHealth = (positions: Position[]): PortfolioHealthReport => {
  if (positions.length === 0) {
    return { status: 'STABLE', score: '2.00', actionRequired: 'NONE' };
  }

  const totalDebt = positions.reduce((acc, p) => acc + p.debtUSD, 0);
  const totalCollateral = positions.reduce((acc, p) => acc + p.collateralUSD, 0);

  if (totalDebt === 0) return { status: 'STABLE', score: '∞', actionRequired: 'NONE' };

  // Health Factor: Institutional-grade threshold is < 1.15 for 'Critical'
  const hFactor = totalCollateral / (totalDebt * 1.05); 

  return {
    status: hFactor < 1.2 ? 'DANGER' : hFactor < 1.5 ? 'WARNING' : 'STABLE',
    score: hFactor.toFixed(2),
    actionRequired: hFactor < 1.2 ? "REPAY_DEBT_OR_ADD_COLLATERAL" : "NONE"
  };
};

/**
 * Mock: Generates simulated institutional positions for UI testing
 */
export const generateMockPositions = (): Position[] => {
  return [
    { asset: 'BTC', collateralUSD: 150000, debtUSD: 85000 },
    { asset: 'ETH', collateralUSD: 45000, debtUSD: 20000 },
    { asset: 'SOL', collateralUSD: 12000, debtUSD: 10000 }
  ];
};
