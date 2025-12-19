
import { MarketSignal } from '../types';

export interface Trade {
  s: string;
  p: number;
  q: number;
  m: boolean;
  T: number;
}

export type Signal = MarketSignal;

export type EngineMode = 'CLINICAL' | 'AGGRESSIVE' | 'HFT' | 'STEALTH';

export interface IntelligenceMetadata {
  pattern: 'ABSORPTION' | 'SWEEP' | 'RELOADING' | 'EXHAUSTION' | 'SPOOF_TRAP';
  entropy: number;
  volatilitySkew: number;
  impactScore: number;
}

interface SymbolState {
  volumes: number[];
  avg: number;
  stdDev: number;
  heat: number;
  entropyBuffer: number[];
  cluster: {
    price: number;
    volume: number;
    side: 'BUY' | 'SELL';
    lastUpdate: number;
    hitCount: number;
  } | null;
}

export class AdaptiveBrain {
  private memory = new Map<string, SymbolState>();
  private mode: EngineMode = 'CLINICAL';

  public setMode(mode: EngineMode) {
    this.mode = mode;
  }

  private getProfile() {
    switch (this.mode) {
      case 'AGGRESSIVE': return { sigma: 2.2, window: 100, heatDecay: 0.95, entropyThreshold: 0.5 };
      case 'HFT': return { sigma: 1.5, window: 50, heatDecay: 0.85, entropyThreshold: 0.3 };
      case 'STEALTH': return { sigma: 4.5, window: 400, heatDecay: 0.99, entropyThreshold: 0.8 };
      case 'CLINICAL':
      default: return { sigma: 3.5, window: 200, heatDecay: 0.98, entropyThreshold: 0.6 };
    }
  }

  private calculateEntropy(intervals: number[]): number {
    if (intervals.length < 5) return 0;
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
    return Math.sqrt(variance) / (mean + 1); // Coefficient of variation as proxy for entropy
  }

  public process(t: Trade): (MarketSignal & { intel?: IntelligenceMetadata }) | null {
    const now = Date.now();
    const profile = this.getProfile();
    let state = this.memory.get(t.s);

    if (!state) {
      state = { volumes: [], avg: 0, stdDev: 0, heat: 0, entropyBuffer: [], cluster: null };
      this.memory.set(t.s, state);
    }

    // 1. Data Ingestion & Memory Management
    state.volumes.push(t.q);
    if (state.volumes.length > profile.window) state.volumes.shift();

    if (state.volumes.length < 15) return null;

    // 2. Statistical Calculus
    const n = state.volumes.length;
    const mean = state.volumes.reduce((a, b) => a + b, 0) / n;
    const variance = state.volumes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    state.stdDev = Math.sqrt(variance);
    state.avg = mean;
    state.heat *= profile.heatDecay;

    const side = t.m ? 'SELL' : 'BUY';
    const threshold = mean + (state.stdDev * profile.sigma);

    // 3. Cluster Consolidation Logic
    if (!state.cluster || state.cluster.price !== t.p || state.cluster.side !== side || (now - state.cluster.lastUpdate > 1200)) {
      state.cluster = { price: t.p, volume: t.q, side, lastUpdate: now, hitCount: 1 };
    } else {
      state.cluster.volume += t.q;
      state.cluster.lastUpdate = now;
      state.cluster.hitCount += 1;
    }

    // 4. Intelligence Pattern Matching
    if (state.cluster.volume > threshold) {
      const ratio = state.cluster.volume / threshold;
      const intensity = Math.min(100, ratio * 20);
      state.heat = Math.min(100, state.heat + (intensity / 4));

      // Entropy check for bot identification
      const entropy = this.calculateEntropy(state.volumes.slice(-10));
      
      let pattern: IntelligenceMetadata['pattern'] = 'ABSORPTION';
      if (ratio > 5) pattern = 'SWEEP';
      if (state.heat > 70) pattern = 'RELOADING';
      if (entropy < 0.2) pattern = 'SPOOF_TRAP';

      return {
        id: `SIG-${t.s}-${now}-${Math.random().toString(36).substr(2, 4)}`,
        symbol: t.s,
        type: side === 'BUY' ? 'HIDDEN_BUY' : 'HIDDEN_SELL',
        price: t.p,
        size: state.cluster.volume,
        threshold: threshold,
        intensity: intensity,
        confidence: Math.min(99, 50 + (intensity / 2) + (state.heat / 5)),
        timestamp: now,
        intel: {
          pattern,
          entropy,
          volatilitySkew: state.stdDev / (mean + 1),
          impactScore: ratio
        }
      };
    }

    return null;
  }
}
