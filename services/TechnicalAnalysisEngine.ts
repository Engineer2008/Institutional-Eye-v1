
import { GlobalStrategicState, VolatilityState } from '../types';

export class TechnicalAnalysisEngine {
  private registry: Map<string, GlobalStrategicState> = new Map();

  public processGlobalTickers(tickers: any[]): GlobalStrategicState[] {
    const now = Date.now();
    
    tickers.forEach(t => {
      const symbol = (t.s || t.symbol || '').toUpperCase();
      if (!symbol.endsWith('USDT')) return;

      const price = parseFloat(t.c || t.lastPrice);
      const volume = parseFloat(t.v || t.volume);
      const change = parseFloat(t.P || t.priceChangePercent || 0);

      let volState: VolatilityState = 'NORMAL';
      if (Math.abs(change) > 5) volState = 'EXPANSION';
      else if (Math.abs(change) > 10) volState = 'HIGH';

      this.registry.set(symbol, {
        symbol,
        price,
        change24h: change,
        volume24h: volume,
        liquidityIndex: (volume / 1000000) > 100 ? 90 : 40,
        cvd: change * volume * 0.01, // Synthetic CVD for global matrix
        rotationBeta: 1.0, 
        trend: change > 0 ? 'UP' : change < 0 ? 'DOWN' : 'SIDEWAYS',
        volatility: volState,
        lastUpdate: now
      });
    });

    return Array.from(this.registry.values()).sort((a, b) => b.volume24h - a.volume24h);
  }
}
