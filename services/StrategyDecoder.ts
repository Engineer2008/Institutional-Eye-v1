
export interface TradeSetup {
  direction: 'LONG' | 'SHORT';
  entryZone: number; 
  invalidation: number; 
  target1: number; 
  target2: number; 
  strength: number; 
  riskReward: number; 
  reason: string;
}

export interface MarketStructure {
  price: number;
  spread: number;
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  bids: { price: number; vol: number }[];
  asks: { price: number; vol: number }[];
  dominantSupport: { price: number; vol: number } | null;
  dominantResistance: { price: number; vol: number } | null;
}

const WALL_SENSITIVITY = 3.5; // Stricter threshold for institutional zones

export const decodeMarketStructure = (
  bids: string[][], 
  asks: string[][], 
  currentPrice: number,
  avgVolume: number
): { structure: MarketStructure, setups: TradeSetup[] } => {
  
  const parse = (list: string[][]) => list.map(i => ({ price: parseFloat(i[0]), vol: parseFloat(i[1]) }));
  const cleanBids = parse(bids);
  const cleanAsks = parse(asks);

  const safeAvg = avgVolume || 0.1;
  const threshold = safeAvg * WALL_SENSITIVITY;
  
  const dominantSupport = cleanBids.find(b => b.vol > threshold) || null;
  const dominantResistance = cleanAsks.find(a => a.vol > threshold) || null;

  const topBid = cleanBids[0]?.price || currentPrice;
  const topAsk = cleanAsks[0]?.price || currentPrice;
  const spread = Math.abs(topAsk - topBid) || 0.01;
  
  const setups: TradeSetup[] = [];

  if (dominantSupport) {
    const buffer = spread * 1.5;
    const entry = dominantSupport.price + buffer;
    const stop = dominantSupport.price - (buffer * 2);
    const target = dominantResistance ? dominantResistance.price - buffer : currentPrice * 1.005;
    
    if (entry < currentPrice * 1.05 && entry > currentPrice * 0.95) {
      setups.push({
        direction: 'LONG',
        entryZone: entry,
        invalidation: stop,
        target1: entry + (target - entry) * 0.5,
        target2: target,
        strength: Math.min(99, (dominantSupport.vol / threshold) * 60),
        riskReward: (target - entry) / Math.abs(entry - stop),
        reason: `Institutional Floor: ${dominantSupport.vol.toFixed(1)} BTC @ $${dominantSupport.price.toFixed(2)}`
      });
    }
  }

  if (dominantResistance) {
    const buffer = spread * 1.5;
    const entry = dominantResistance.price - buffer;
    const stop = dominantResistance.price + (buffer * 2);
    const target = dominantSupport ? dominantSupport.price + buffer : currentPrice * 0.995;

    if (entry < currentPrice * 1.05 && entry > currentPrice * 0.95) {
      setups.push({
        direction: 'SHORT',
        entryZone: entry,
        invalidation: stop,
        target1: entry - (entry - target) * 0.5,
        target2: target,
        strength: Math.min(99, (dominantResistance.vol / threshold) * 60),
        riskReward: (entry - target) / Math.abs(stop - entry),
        reason: `Institutional Ceiling: ${dominantResistance.vol.toFixed(1)} BTC @ $${dominantResistance.price.toFixed(2)}`
      });
    }
  }

  return {
    structure: {
      price: currentPrice,
      spread,
      volatility: spread > currentPrice * 0.001 ? 'HIGH' : 'LOW',
      bids: cleanBids,
      asks: cleanAsks,
      dominantSupport,
      dominantResistance
    },
    setups
  };
};
