
import { MarketSignal } from '../types';

// Export Trade to satisfy Scanner.tsx and others
export interface Trade {
  s: string;
  p: number;
  q: number;
  m: boolean;
  T: number;
}

// Define and export Signal type for consistency with Scanner.tsx
export type Signal = MarketSignal;

interface SymbolState {
  volumes: number[];
  avg: number;
  stdDev: number;
  cluster: {
    price: number;
    volume: number;
    side: 'BUY' | 'SELL';
    lastUpdate: number;
  } | null;
}

export class AdaptiveBrain {
  private memory = new Map<string, SymbolState>();

  public process(t: Trade): MarketSignal | null {
    const now = Date.now();
    let state = this.memory.get(t.s);

    if (!state) {
      state = { volumes: [], avg: 0, stdDev: 0, cluster: null };
      this.memory.set(t.s, state);
    }

    // Use rolling 200 window for volatility/vol normalization
    state.volumes.push(t.q);
    if (state.volumes.length > 200) state.volumes.shift();

    if (state.volumes.length < 50) return null; // Wait for stable baseline

    const n = state.volumes.length;
    const mean = state.volumes.reduce((a, b) => a + b, 0) / n;
    const variance = state.volumes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    state.stdDev = Math.sqrt(variance);
    state.avg = mean;

    const side = t.m ? 'SELL' : 'BUY';
    // Use 3.5 Sigma for clinical institutional significance
    const threshold = mean + (state.stdDev * 3.5); 

    if (!state.cluster || state.cluster.price !== t.p || state.cluster.side !== side || (now - state.cluster.lastUpdate > 1200)) {
      state.cluster = { price: t.p, volume: t.q, side, lastUpdate: now };
    } else {
      state.cluster.volume += t.q;
      state.cluster.lastUpdate = now;
    }

    if (state.cluster.volume > threshold) {
      // Intensity = % over threshold scaled for 0-100 range
      const excess = state.cluster.volume / threshold;
      const intensity = Math.min(100, excess * 20);
      
      return {
        id: `SIG-${t.s}-${now}-${Math.random().toString(36).substr(2, 4)}`,
        symbol: t.s,
        type: side === 'BUY' ? 'HIDDEN_BUY' : 'HIDDEN_SELL',
        price: t.p,
        size: state.cluster.volume,
        threshold: threshold,
        intensity: intensity,
        confidence: Math.min(99, 60 + (intensity / 2)),
        timestamp: now
      };
    }

    return null;
  }
}
