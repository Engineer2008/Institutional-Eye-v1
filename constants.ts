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