
export type MarketType = 'SPOT' | 'PERP';

export interface TradeData {
  p: string; // Price
  q: string; // Quantity
  T: number; // Timestamp
  m: boolean; // Is Buyer the Market Maker?
}

export interface OrderBookData {
  b: [string, string][]; 
  a: [string, string][];
  u: number;
}

export type MarketRegime = 'ABSORPTION' | 'DISTRIBUTION' | 'ROTATION' | 'MANIPULATION' | 'NEUTRAL' | 'ACCUMULATION';
export type VolatilityState = 'LOW' | 'NORMAL' | 'HIGH' | 'EXPANSION' | 'EXTREME' | 'MEDIUM';

export interface GlobalStrategicState {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  liquidityIndex: number;
  cvd: number;           
  rotationBeta: number;  
  trend: 'UP' | 'DOWN' | 'SIDEWAYS';
  volatility: VolatilityState;
  lastUpdate: number;
}

export interface MarketSignal {
  id: string;
  symbol: string;
  type: 'HIDDEN_BUY' | 'HIDDEN_SELL';
  price: number;
  size: number;
  threshold: number;
  intensity: number;
  confidence: number;
  timestamp: number;
  time?: string;
}

export interface ForensicReport extends MarketSignal {
  interpretation: string;
  action: 'LONG_SCALP' | 'SHORT_SCALP' | 'WAIT';
  confidenceScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  intentSignature: 'RELOADING' | 'EXHAUSTION' | 'SPOOF_TRAP' | 'ABSORPTION' | 'MOMENTUM_BLOCK' | 'WASH_FLOW';
}

export interface ForensicData {
  id: string;
  symbol: string;
  type: 'DISPLACEMENT' | 'ABSORPTION' | 'ROTATION' | 'TWAP_DETECTION' | 'HIDDEN_BUY' | 'HIDDEN_SELL';
  price: number;
  size: number;
  intensity: number;
  timestamp: number;
  time: string;
  interpretation: string;
  action: 'LONG' | 'SHORT' | 'MONITOR' | 'WAIT';
  risk: 'LOW' | 'MED' | 'HIGH';
  spoofRisk: number;
  detectionLayer: 'L2_DEPTH' | 'CORRELATION' | 'TAPE_SIGNATURE' | 'AI_CORE';
  threshold: number;
  confidence: number;
  integrity: number;
  latencyMs?: number;
  traceId: string;
}

export interface WhaleSignal {
  id: string;
  time: string;
  type: 'INSTITUTIONAL' | 'ALGO' | 'ICEBERG' | 'WHALE';
  side: 'BUY' | 'SELL';
  price: number;
  valueUSD: number;
  isLiquidationLikely?: boolean;
}

export interface ChartPoint {
  time: number;
  price: number;
  cvd: number;
  rotationBeta: number;
  volume?: number;
}

export interface IcebergSignal {
  id: string;
  type: 'HIDDEN_BUY' | 'HIDDEN_SELL';
  price: number;
  volAbsorbed: number;
  thresholdAtTime: number;
  timestamp: number;
}

export interface SmartSignal {
  id: string;
  time: string;
  type: string;
  confidence: number;
  note: string;
}

export type SystemStatus = 'LEARNING' | 'ACTIVE' | 'DEGRADED';

export interface ForensicZone {
  type: 'BUY' | 'SELL';
  priceStart: number;
  priceEnd: number;
  label: string;
}

export interface ForensicWall {
  price: number;
  side: 'BID' | 'ASK';
  strength: number;
}

// Added missing DynamicMarketState interface to fix exports
export interface DynamicMarketState {
  currentPrice: number;
  volatility: VolatilityState;
  regime: MarketRegime;
  adaptiveWhaleThreshold: number;
  avgTradeVol: number;
  status?: SystemStatus;
}

// Added missing IntelligenceReport interface to fix exports
export interface IntelligenceReport {
  id: string;
  timestamp: number;
  structuralAnalysis: string;
  anomalies: string[];
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  liquidityDelta: number;
}
