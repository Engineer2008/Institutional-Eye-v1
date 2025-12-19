
import { WhaleSignal } from '../types';
// Fixed error: BookAnalysis is exported from OrderBookBrain, not types.ts
import { BookAnalysis } from './OrderBookBrain';
import { CORE_CONFIG } from '../constants';

export type AlertPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM';

export interface MarketAlert {
  id: string;
  type: 'WHALE_AGGRESSION' | 'IMBALANCE_COLLAPSE' | 'TOXICITY_ALERT' | 'STRUCTURAL_VOX';
  priority: AlertPriority;
  message: string;
  timestamp: number;
  data: any;
}

type AlertSubscriber = (alert: MarketAlert) => void;

export class AlertEngine {
  private static instance: AlertEngine;
  private subscribers: Set<AlertSubscriber> = new Set();
  private alertHistory: MarketAlert[] = [];

  public static getInstance(): AlertEngine {
    if (!AlertEngine.instance) AlertEngine.instance = new AlertEngine();
    return AlertEngine.instance;
  }

  public subscribe(cb: AlertSubscriber) {
    this.subscribers.add(cb);
  }

  public unsubscribe(cb: AlertSubscriber) {
    this.subscribers.delete(cb);
  }

  private dispatch(alert: MarketAlert) {
    this.alertHistory = [alert, ...this.alertHistory].slice(0, 50);
    this.subscribers.forEach(cb => cb(alert));
  }

  /**
   * Evaluates a whale signal against critical thresholds
   */
  public processWhaleSignal(signal: WhaleSignal) {
    if (signal.valueUSD >= CORE_CONFIG.CRITICAL_WHALE_USD) {
      this.dispatch({
        id: `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'WHALE_AGGRESSION',
        priority: 'CRITICAL',
        message: `INSTITUTIONAL_${signal.side}_BLOCK: $${(signal.valueUSD / 1000000).toFixed(2)}M`,
        timestamp: Date.now(),
        data: signal
      });
    }
  }

  /**
   * Evaluates order book pressure for major imbalances
   */
  public processBookAnalysis(symbol: string, analysis: BookAnalysis) {
    const dominantSide = analysis.bidPressure > analysis.askPressure ? 'BID' : 'ASK';
    const maxPressure = Math.max(analysis.bidPressure, analysis.askPressure);

    if (maxPressure >= CORE_CONFIG.MAJOR_IMBALANCE_PERCENT) {
      this.dispatch({
        id: `ALERT-BOOK-${Date.now()}`,
        type: 'IMBALANCE_COLLAPSE',
        priority: 'HIGH',
        message: `${symbol}_${dominantSide}_DOMINANCE: ${maxPressure.toFixed(1)}%`,
        timestamp: Date.now(),
        data: analysis
      });
    }

    if (analysis.manipulationType !== 'NONE') {
        this.dispatch({
            id: `ALERT-MANIP-${Date.now()}`,
            type: 'TOXICITY_ALERT',
            priority: 'HIGH',
            message: `MANIPULATION_SIGNATURE: ${analysis.manipulationType}`,
            timestamp: Date.now(),
            data: analysis
        });
    }
  }

  /**
   * Evaluates flow toxicity (VPIN)
   */
  public processToxicity(symbol: string, score: number) {
    if (score >= CORE_CONFIG.TOXIC_THREAT_SCORE) {
      this.dispatch({
        id: `ALERT-TOX-${Date.now()}`,
        type: 'TOXICITY_ALERT',
        priority: 'CRITICAL',
        message: `CRITICAL_FLOW_TOXICITY: ${(score * 100).toFixed(1)}% (THREAT)`,
        timestamp: Date.now(),
        data: score
      });
    }
  }
}
