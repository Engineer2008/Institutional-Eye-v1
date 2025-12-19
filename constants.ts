
import { SwarmConfig } from './types';

export const SYMBOL = 'btcusdt'; // Default fallback
export const MAX_CHART_POINTS = 100;

// Global Scanner Constants
export const BASE_ASSET = 'USDT'; // Scan all coins paired with USDT
export const MAX_PAIRS = 500; // Limit to Top 500 by Volume
export const WS_URL_COMBINED = 'wss://stream.binance.com:9443/stream';

// Dynamic Adaptive Engine Constants
export const LEARNING_BUFFER = 50; // Minimum trades per coin before alerting
export const SENSITIVITY_MULTIPLIER = 50; // Threshold = Avg Vol * 50
export const CLUSTER_WINDOW_MS = 1000; // Time window to group trades (1 second)

// Iceberg / Hidden Liquidity Constants
export const MAX_ICEBERGS = 30; // Max signals to keep in feed

// v4.0 Core Environment Config
export const CORE_CONFIG = {
  APP_ENV: "production",
  INSTITUTIONAL_CLEARANCE_LEVEL: "ELITE",

  // Execution Logic
  MEV_SHIELD_ACTIVE: true,
  MAX_SLIPPAGE_TOLERANCE: 0.005, // 0.5%
  MIN_CONGRUENCE_SCORE: 0.85,

  // Emergency Protocols
  AUTO_EVAC_TRIGGER_TOXICITY: 0.95,
  KILL_SWITCH_THRESHOLD_USD: 500000, // Max exposure per node

  // Web3 Routing
  PRIMARY_BRIDGE_AGGREGATOR: "JUMPER_LI_FI",
  MEV_REBATE_RECIPIENT_WALLET: "0xYourFirmTreasury...",

  // v6.0 Governance
  GOV_THRESHOLD: 0.15, // Impact score must exceed this to trigger autonomous vote
  
  // Real-time Alert Thresholds
  CRITICAL_WHALE_USD: 1000000, // $1M+
  MAJOR_IMBALANCE_PERCENT: 80, // 80%+
  TOXIC_THREAT_SCORE: 0.85     // VPIN > 0.85
};

// v5.0 Swarm Persona Configuration
export const SWARM_CONFIG: SwarmConfig = {
  currentPersona: 'FORENSIC_SCIENTIST',
  overrides: {
    maxDrawdown: 0.02, // 2% Hard Cap
    mevProtection: 'MAXIMUM',
    yieldPreference: 'LOW_RISK_STABLES'
  }
};
