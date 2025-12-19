
import { TradeData, OrderBookData } from '../types';

type TradeCallback = (data: any) => void;
type DepthCallback = (data: OrderBookData) => void;

// Failover Endpoints for Single Stream
// FIXED: Reordered to prioritize 443/Vision (Firewall Friendly) over 9443
const ENDPOINTS = [
    'wss://stream.binance.com:443/ws',        // Primary (Standard SSL)
    'wss://data-stream.binance.vision/ws',    // Secondary (Vision/CloudFront)
    'wss://stream.binance.com:9443/ws'        // Fallback (Legacy)
];

export class BinanceService {
  private ws: WebSocket | null = null;
  private symbol: string;
  private onTrade: TradeCallback | null = null;
  private onDepth: DepthCallback | null = null;
  private isExplicitDisconnect: boolean = false;
  private reconnectTimeout: number | undefined;
  private endpointIndex: number = 0;

  constructor(symbol: string) {
    this.symbol = symbol.toLowerCase();
  }

  public connect(onTrade: TradeCallback, onDepth: DepthCallback) {
    this.onTrade = onTrade;
    this.onDepth = onDepth;
    this.isExplicitDisconnect = false;
    this.initWebSocket();
  }

  private initWebSocket() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // ignore
      }
      this.ws = null;
    }

    // Round-robin endpoint selection for robustness
    const baseUrl = ENDPOINTS[this.endpointIndex % ENDPOINTS.length];
    // Cache bust
    const wsUrl = `${baseUrl}/${this.symbol}@aggTrade/${this.symbol}@depth20@100ms?t=${Date.now()}`;
    
    console.log(`[BinanceService] Connecting to ${this.symbol} via ${baseUrl}...`);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log(`[BinanceService] Connected to ${this.symbol} feed`);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.e === 'aggTrade' && this.onTrade) {
            this.onTrade(message);
          }

          if ((message.bids || message.b) && (message.asks || message.a) && this.onDepth) {
            const normalizedData: OrderBookData = {
              b: message.bids || message.b,
              a: message.asks || message.a,
              u: message.lastUpdateId
            };
            this.onDepth(normalizedData);
          }
        } catch (err) {
          console.error('[BinanceService] Parse Error:', err);
        }
      };

      this.ws.onerror = (event) => {
        // Switch endpoint on error
        this.endpointIndex++;
      };

      this.ws.onclose = () => {
        if (!this.isExplicitDisconnect) {
          console.log('[BinanceService] Connection lost. Reconnecting...');
          // Switch endpoint on close to avoid stuck connection
          this.endpointIndex++;
          this.reconnectTimeout = window.setTimeout(() => {
            this.initWebSocket();
          }, 2000);
        } else {
          console.log('[BinanceService] Disconnected');
        }
      };
    } catch (err) {
      console.error('[BinanceService] Initialization Error:', err);
      if (!this.isExplicitDisconnect) {
        this.reconnectTimeout = window.setTimeout(() => {
          this.initWebSocket();
        }, 3000);
      }
    }
  }

  public disconnect() {
    this.isExplicitDisconnect = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}