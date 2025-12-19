
import { TradeData } from '../types';

export interface NeuralFeatures {
  sizeVariance: number;
  temporalEntropy: number;
  aggressionRatio: number;
  isPulsing: boolean;
}

/**
 * Calculates statistical variance of a numerical array.
 */
const calculateVariance = (data: number[]): number => {
  if (data.length < 2) return 0;
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  return data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
};

/**
 * Calculates Shannon Entropy for a set of values (e.g., intervals).
 * Higher entropy = higher randomness.
 */
const calculateEntropy = (data: number[]): number => {
  if (data.length < 2) return 0;
  const frequencies: Record<string, number> = {};
  data.forEach(val => {
    // Quantize to 50ms buckets for entropy calculation
    const bucket = Math.round(val / 50) * 50;
    frequencies[bucket] = (frequencies[bucket] || 0) + 1;
  });

  const probs = Object.values(frequencies).map(f => f / data.length);
  return -probs.reduce((sum, p) => sum + p * Math.log2(p), 0);
};

/**
 * Checks for a consistent 'pulse' in execution timing.
 * standard deviation of intervals / mean interval < 0.1 indicates extreme consistency.
 */
const checkPulse = (intervals: number[]): boolean => {
  if (intervals.length < 10) return false;
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  if (mean < 10) return false; // Too fast to be a reliable pulse
  const variance = calculateVariance(intervals);
  const stdDev = Math.sqrt(variance);
  return (stdDev / mean) < 0.15; 
};

/**
 * v2.0 Pre-Processor: Feature Extraction for AI Training
 * Maps raw trade data to a normalized feature vector for neural fingerprinting.
 */
export const extractNeuralFeatures = (tradeWindow: { q: number; T: number; m: boolean }[]): NeuralFeatures => {
  if (tradeWindow.length === 0) {
    return { sizeVariance: 0, temporalEntropy: 0, aggressionRatio: 0, isPulsing: false };
  }

  const sizes = tradeWindow.map(t => t.q);
  const intervals = tradeWindow.map((t, i) => i > 0 ? t.T - tradeWindow[i - 1].T : 0).slice(1);

  return {
    // Feature 1: Size Variance (Low = High Bot Probability)
    sizeVariance: calculateVariance(sizes),
    
    // Feature 2: Entropy of Intervals (Patterns in time)
    temporalEntropy: calculateEntropy(intervals),
    
    // Feature 3: Aggression Ratio (Taker participation - m=false means buyer is aggressor)
    aggressionRatio: tradeWindow.filter(t => !t.m).length / tradeWindow.length,
    
    // Feature 4: Pulse Consistency (Does it trade every X ms?)
    isPulsing: checkPulse(intervals) 
  };
};
