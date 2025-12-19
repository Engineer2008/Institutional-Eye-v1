
import { useMemo } from 'react';
import { extractNeuralFeatures, NeuralFeatures } from '../services/NeuralFeatureExtractor';

export interface FingerprintResult {
  isBot: boolean;
  botProbability: number;
  fingerprintID: string;
  threatLevel: "HIGH_PREDATION" | "NORMAL";
  features: NeuralFeatures;
}

export const useNeuralFingerprint = (tradeWindow: { q: number; T: number; m: boolean }[]): FingerprintResult => {
  const result = useMemo(() => {
    if (tradeWindow.length < 5) {
      return {
        isBot: false,
        botProbability: 0,
        fingerprintID: "INITIALIZING",
        threatLevel: "NORMAL" as const,
        features: { sizeVariance: 0, temporalEntropy: 0, aggressionRatio: 0, isPulsing: false }
      };
    }

    const features = extractNeuralFeatures(tradeWindow);
    
    // Heuristic Score Calculation
    // Bots usually have:
    // 1. Low size variance (0.3 weight)
    // 2. Low temporal entropy (0.3 weight)
    // 3. Constant pulsing (0.4 weight)
    
    const normVariance = Math.max(0, 1 - (features.sizeVariance / 1.0)); // Normalize assuming low variance is bot-like
    const normEntropy = Math.max(0, 1 - (features.temporalEntropy / 4.0)); // Entropy usually 0-5, 0 is perfect pattern
    const pulseBonus = features.isPulsing ? 1.0 : 0;

    const botProbability = (normVariance * 0.3) + (normEntropy * 0.3) + (pulseBonus * 0.4);
    const isBot = botProbability > 0.8;

    return {
      isBot,
      botProbability: Math.min(1, botProbability),
      fingerprintID: isBot ? "MM_TYPE_ALGO_B" : "ORGANIC_FLOW",
      threatLevel: botProbability > 0.9 ? "HIGH_PREDATION" : "NORMAL" as const,
      features
    };
  }, [tradeWindow]);

  return result;
};
