import { OrderBookLevel } from './OrderBookBrain';

export interface AdvancedSignal {
  id: string;
  type: 'FVG' | 'ORDER_BLOCK' | 'LIQUIDITY_SWEEP' | 'SPOOFING' | 'SMR_REVERSAL';
  symbol: string;
  side: 'BULLISH' | 'BEARISH';
  priceRange: [number, number];
  confidence: number;
  note: string;
  timestamp: number;
}

export class AdvancedSignalsEngine {
  private priceHistory: number[] = [];
  
  public detectSMC(symbol: string, currentPrice: number, bids: OrderBookLevel[], asks: OrderBookLevel[]): AdvancedSignal[] {
    const signals: AdvancedSignal[] = [];
    const now = Date.now();
    
    // 1. Fair Value Gap (FVG) Detection (Simplified proxy)
    // In a real high-freq app, we'd use 1m candles. Here we simulate with liquidity voids.
    const spread = asks[0].price - bids[0].price;
    if (spread > currentPrice * 0.002) {
      signals.push({
        id: `SMC-FVG-${now}`,
        type: 'FVG',
        symbol,
        side: bids[0].qty > asks[0].qty ? 'BULLISH' : 'BEARISH',
        priceRange: [bids[0].price, asks[0].price],
        confidence: 75,
        note: 'Price inefficiency detected. Expect retrace to fill void.',
        timestamp: now
      });
    }

    // 2. Order Block (OB) Detection
    // Large clusters sitting just outside the current range
    const buyOB = bids.find(b => b.qty > bids[0].qty * 5);
    const sellOB = asks.find(a => a.qty > asks[0].qty * 5);

    if (buyOB) {
      signals.push({
        id: `SMC-OB-BUY-${now}`,
        type: 'ORDER_BLOCK',
        symbol,
        side: 'BULLISH',
        priceRange: [buyOB.price * 0.999, buyOB.price],
        confidence: 85,
        note: 'Institutional accumulation block identified.',
        timestamp: now
      });
    }

    if (sellOB) {
      signals.push({
        id: `SMC-OB-SELL-${now}`,
        type: 'ORDER_BLOCK',
        symbol,
        side: 'BEARISH',
        priceRange: [sellOB.price, sellOB.price * 1.001],
        confidence: 85,
        note: 'Heavy distribution block identified.',
        timestamp: now
      });
    }

    return signals;
  }

  public detectManipulation(bids: OrderBookLevel[], asks: OrderBookLevel[]): AdvancedSignal | null {
    // Spoofing detection logic
    const topBid = bids[0];
    const topAsk = asks[0];
    
    if (topBid?.isSpoof) {
      return {
        id: `MAN-SPOOF-${Date.now()}`,
        type: 'SPOOFING',
        symbol: '',
        side: 'BEARISH', // Fake bids usually pull to trap buyers
        priceRange: [topBid.price, topBid.price],
        confidence: 90,
        note: 'High-frequency bid cancellation detected. Trap likely.',
        timestamp: Date.now()
      };
    }
    return null;
  }
}