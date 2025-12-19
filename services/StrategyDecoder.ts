
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
  
  // Find multiple potential blocks, not just the dominant one
  const supportBlocks = cleanBids.filter(b => b.vol > threshold).sort((a, b) => b.vol - a.vol);
  const resistanceBlocks = cleanAsks.filter(a => a.vol > threshold).sort((a, b) => b.vol - a.vol);

  const dominantSupport = supportBlocks[0] || null;
  const dominantResistance = resistanceBlocks[0] || null;

  const topBid = cleanBids[0]?.price || currentPrice;
  const topAsk = cleanAsks[0]?.price || currentPrice;
  const spread = Math.abs(topAsk - topBid) || 0.01;
  
  const setups: TradeSetup[] = [];

  // Generate LONG setup from Support Blocks
  if (dominantSupport) {
    const entry = dominantSupport.price;
    const stop = dominantSupport.price - (spread * 5); // Exit below block
    const t1 = currentPrice + (spread * 10);
    const t2 = dominantResistance ? dominantResistance.price : currentPrice * 1.01;
    
    if (Math.abs(entry - currentPrice) / currentPrice < 0.02) {
      setups.push({
        direction: 'LONG',
        entryZone: entry,
        invalidation: stop,
        target1: t1,
        target2: t2,
        strength: Math.min(99, (dominantSupport.vol / threshold) * 40),
        riskReward: Math.abs(t2 - entry) / Math.abs(entry - stop),
        reason: `Order Block Accumulation [${dominantSupport.vol.toFixed(1)} BTC]`
      });
    }
  }

  // Generate SHORT setup from Resistance Blocks
  if (dominantResistance) {
    const entry = dominantResistance.price;
    const stop = dominantResistance.price + (spread * 5); // Exit above block
    const t1 = currentPrice - (spread * 10);
    const t2 = dominantSupport ? dominantSupport.price : currentPrice * 0.99;

    if (Math.abs(entry - currentPrice) / currentPrice < 0.02) {
      setups.push({
        direction: 'SHORT',
        entryZone: entry,
        invalidation: stop,
        target1: t1,
        target2: t2,
        strength: Math.min(99, (dominantResistance.vol / threshold) * 40),
        riskReward: Math.abs(entry - t2) / Math.abs(stop - entry),
        reason: `Order Block Distribution [${dominantResistance.vol.toFixed(1)} BTC]`
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
