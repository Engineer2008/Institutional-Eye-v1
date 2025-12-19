
import { ForensicData, GlobalStrategicState } from '../types';

export class ForensicIntelligenceSuite {
  private lastDepth: Map<string, Map<number, number>> = new Map();
  private tradeHistory: Map<string, any[]> = new Map();

  /**
   * Identifies "Spoofing" by tracking the speed of liquidity withdrawal.
   */
  public calculateSpoofRisk(symbol: string, currentBids: [string, string][]): number {
    const prev = this.lastDepth.get(symbol) || new Map();
    const current = new Map<number, number>();
    let pulled = 0;
    let total = 0;

    currentBids.forEach(([pStr, qStr]) => {
      const p = parseFloat(pStr);
      const q = parseFloat(qStr);
      current.set(p, q);
      
      if (prev.has(p)) {
        const delta = q - (prev.get(p) || 0);
        if (delta < -q * 0.4) pulled += Math.abs(delta); // Significant pull
      }
      total += q;
    });

    this.lastDepth.set(symbol, current);
    return Math.min(100, (pulled / (total + 1)) * 1000);
  }

  /**
   * Detects Institutional Rotation via CVD Beta calculation against BTC.
   */
  public calculateRotationBeta(symbol: string, allData: GlobalStrategicState[]): number {
    const target = allData.find(d => d.symbol === symbol);
    const btc = allData.find(d => d.symbol === 'BTCUSDT');
    
    if (!target || !btc || symbol === 'BTCUSDT') return 1.0;
    
    // Beta = Asset Delta / BTC Delta (Normalized)
    return (target.change24h / (btc.change24h || 1));
  }

  /**
   * Emulates on-chain execution analysis by identifying TWAP signatures in the tape.
   */
  public detectAlgoFootprint(symbol: string, trade: any): number {
    let history = this.tradeHistory.get(symbol) || [];
    history.push(trade);
    if (history.length > 50) history.shift();
    this.tradeHistory.set(symbol, history);

    if (history.length < 20) return 0;

    // Detect periodicity in timestamps (TWAP execution signature)
    let intervals = [];
    for (let i = 1; i < history.length; i++) {
      intervals.push(history[i].T - history[i-1].T);
    }

    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / intervals.length;
    
    // Low variance in execution time = High probability of algorithmic execution
    return Math.max(0, 100 - (Math.sqrt(variance) / 10));
  }
}
