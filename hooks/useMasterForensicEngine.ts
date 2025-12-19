
import { useMemo } from 'react';

export interface MarketSignalState {
  toxicity: number;       // 0-1 (VPIN)
  forensicRatio: number;  // e.g. 1.85 (Absorption)
  obi: number;            // Order Book Imbalance (-1 to 1)
  isAtSwingLevel: boolean;// Sweep detection context
  deltaSpeed: number;     // Aggression metric
}

export const useMasterForensicEngine = (state: MarketSignalState) => {
  return useMemo(() => {
    // 1. Calculate Integrated Conviction Score
    // We weight absorption and toxicity highest for institutional intent
    const conviction = (
      (state.forensicRatio / 2) * 0.4 + 
      (state.toxicity) * 0.3 + 
      (Math.abs(state.obi)) * 0.3
    );

    // 2. Identify "Mode" based on combined signals
    let mode: 'ACCUMULATION' | 'DISTRIBUTION' | 'TRAP' | 'NEUTRAL' = 'NEUTRAL';
    
    if (state.forensicRatio > 1.5 && state.toxicity > 0.6) {
      mode = state.obi > 0 ? 'ACCUMULATION' : 'DISTRIBUTION';
    }
    
    if (state.isAtSwingLevel && state.forensicRatio > 1.7) {
      mode = 'TRAP';
    }

    // 3. Final Warning System
    const isGunpoint = state.toxicity > 0.8 && state.deltaSpeed > 150;

    return {
      convictionScore: Math.min(conviction * 100, 100).toFixed(0),
      marketMode: mode,
      isGunpoint,
      action: mode === 'TRAP' ? 'FADE_THE_MOVE' : 'FOLLOW_WHALE'
    };
  }, [state]);
};
