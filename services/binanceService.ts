
import { TradeData, OrderBookData } from '../types';
import { HFTDataPlane } from './HFTDataPlane';

type TradeCallback = (data: any) => void;
type DepthCallback = (data: OrderBookData) => void;

const ENDPOINTS = [
    'wss://stream.binance.com:443/ws',
    'wss://data-stream.binance.vision/ws',
    'wss://stream.binance.com:9443/ws'
];

export class BinanceService {
  private ws: WebSocket | null = null;
  private symbol: string;
  private isExplicitDisconnect: boolean = false;
  private reconnectTimeout: number | undefined;
  private endpointIndex: number = 0;
  private dataPlane = HFTDataPlane.getInstance();

  constructor(symbol: string) {
    this.symbol = symbol.toLowerCase();
  }

  public connect(onTrade: TradeCallback, onDepth: DepthCallback) {
    this.isExplicitDisconnect = false;
    // Map legacy callbacks to the data plane
    this.dataPlane.subscribe(`${this.symbol}:trade`, onTrade);
    this.dataPlane.subscribe(`${this.symbol}:depth`, onDepth);
    this.initWebSocket();
  }

  private initWebSocket() {
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
      this.ws = null;
    }

    const baseUrl = ENDPOINTS[this.endpointIndex % ENDPOINTS.length];
    const wsUrl = `${baseUrl}/${this.symbol}@aggTrade/${this.symbol}@depth20@100ms`;
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.e === 'aggTrade') {
            this.dataPlane.ingest(`${this.symbol}:trade`, message);
          }

          if ((message.bids || message.b) && (message.asks || message.a)) {
            const normalizedData: OrderBookData = {
              b: message.bids || message.b,
              a: message.asks || message.a,
              u: message.lastUpdateId
            };
            this.dataPlane.ingest(`${this.symbol}:depth`, normalizedData);
          }
        } catch (err) {}
      };

      this.ws.onerror = () => { this.endpointIndex++; };

      this.ws.onclose = () => {
        if (!this.isExplicitDisconnect) {
          this.endpointIndex++;
          this.reconnectTimeout = window.setTimeout(() => this.initWebSocket(), 2000);
        }
      };
    } catch (err) {
      if (!this.isExplicitDisconnect) {
        this.reconnectTimeout = window.setTimeout(() => this.initWebSocket(), 3000);
      }
    }
  }

  public disconnect() {
    this.isExplicitDisconnect = true;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) this.ws.close();
  }
}
