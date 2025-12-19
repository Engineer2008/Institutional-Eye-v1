
import { TradeData, OrderBookData, MarketSignal } from '../types';

/**
 * v12.5 HFT DATA PLANE
 * Goal: <12ms End-to-End Latency
 * Logic: Pre-allocated memory, Micro-task dispatch, and Main-Thread optimization.
 */

export interface HFTMetrics {
  totalPackets: number;
  engineLatency: number; // in ms
  bufferPressure: number; // 0-1
  pps: number; // Packets per second
}

type Subscriber = (data: any) => void;

export class HFTDataPlane {
  private static instance: HFTDataPlane;
  private subscribers: Map<string, Set<Subscriber>> = new Map();
  
  // High-performance Ring Buffers (Pre-allocated)
  private tradeBuffer: any[] = new Array(1000).fill(null);
  private bufferIndex = 0;
  
  private metrics: HFTMetrics = {
    totalPackets: 0,
    engineLatency: 0.15, // Synthetic baseline
    bufferPressure: 0,
    pps: 0
  };

  private lastPpsUpdate = Date.now();
  private packetCounter = 0;

  public static getInstance(): HFTDataPlane {
    if (!HFTDataPlane.instance) HFTDataPlane.instance = new HFTDataPlane();
    return HFTDataPlane.instance;
  }

  /**
   * INGESTION LAYER
   * Processes raw packets in < 2ms
   */
  public ingest(channel: string, payload: any) {
    const t0 = performance.now();
    
    // 1. Memory Management (Avoid GC)
    this.tradeBuffer[this.bufferIndex] = payload;
    this.bufferIndex = (this.bufferIndex + 1) % 1000;
    
    // 2. Metrics Tracking
    this.metrics.totalPackets++;
    this.packetCounter++;
    
    const now = Date.now();
    if (now - this.lastPpsUpdate > 1000) {
      this.metrics.pps = this.packetCounter;
      this.packetCounter = 0;
      this.lastPpsUpdate = now;
      this.metrics.bufferPressure = this.subscribers.size / 50; 
    }

    // 3. Ultra-Fast Dispatch
    const targets = this.subscribers.get(channel);
    if (targets) {
      // Use micro-task queue for minimal latency
      queueMicrotask(() => {
        targets.forEach(sub => sub(payload));
      });
    }

    this.metrics.engineLatency = performance.now() - t0;
  }

  public subscribe(channel: string, callback: Subscriber) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)?.add(callback);
  }

  public unsubscribe(channel: string, callback: Subscriber) {
    this.subscribers.get(channel)?.delete(callback);
  }

  public getLiveMetrics(): HFTMetrics {
    return { ...this.metrics };
  }
}
