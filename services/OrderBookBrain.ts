
export interface OrderBookLevel {
  price: number;
  qty: number;
  total: number;
  isWhale: boolean;
  isSpoof?: boolean;
}

export interface BookAnalysis {
  bidPressure: number;
  askPressure: number;
  integrityScore: number;
  intentBias: 'STAY' | 'PULL' | 'PUSH';
  spoofRisk: number;
  dominantWall: { price: number; side: 'BID' | 'ASK'; strength: number } | null;
  liquidityVoid: boolean;
  manipulationType: 'NONE' | 'SPOOFING' | 'LAYERING' | 'WASH_TRADING_PROXY';
}

export class OrderBookBrain {
  private lastSnapshot: Map<number, number> = new Map();
  private pullThreshold = 0.45; // 45% reduction in size = spoof suspect

  public analyze(bids: string[][], asks: string[][]): { analysis: BookAnalysis, formattedBids: OrderBookLevel[], formattedAsks: OrderBookLevel[] } {
    let pulledQty = 0;
    let addedQty = 0;
    
    const parseLevel = (level: string[]) => {
      const p = parseFloat(level[0]);
      const q = parseFloat(level[1]);
      
      const prevQ = this.lastSnapshot.get(p);
      let isSpoof = false;
      
      if (prevQ !== undefined) {
        const delta = q - prevQ;
        if (delta < -prevQ * this.pullThreshold) {
          pulledQty += Math.abs(delta);
          isSpoof = true;
        } else if (delta > prevQ * 1.5) {
          addedQty += delta;
        }
      }
      
      this.lastSnapshot.set(p, q);
      return { price: p, qty: q, total: 0, isWhale: false, isSpoof };
    };

    const cleanBids = bids.map(b => parseLevel(b));
    const cleanAsks = asks.map(a => parseLevel(a));

    // Calculate Cumulative Totals
    let bidTotal = 0;
    cleanBids.forEach(b => {
      bidTotal += b.qty;
      b.total = bidTotal;
    });

    let askTotal = 0;
    cleanAsks.forEach(a => {
      askTotal += a.qty;
      a.total = askTotal;
    });

    const avgBid = cleanBids.reduce((a, b) => a + b.qty, 0) / (cleanBids.length || 1);
    const whaleThreshold = avgBid * 4.5;

    cleanBids.forEach(b => b.isWhale = b.qty > whaleThreshold);
    cleanAsks.forEach(a => a.isWhale = a.qty > whaleThreshold);

    const bidPower = cleanBids.slice(0, 10).reduce((acc, lvl) => acc + lvl.qty, 0);
    const askPower = cleanAsks.slice(0, 10).reduce((acc, lvl) => acc + lvl.qty, 0);
    const totalPower = bidPower + askPower + 1e-9;
    const bidPressure = (bidPower / totalPower) * 100;

    const spoofRisk = (pulledQty / (pulledQty + addedQty + 1e-9)) * 100;
    
    let manipulationType: BookAnalysis['manipulationType'] = 'NONE';
    if (spoofRisk > 35) manipulationType = 'SPOOFING';
    else if (addedQty > totalPower * 0.8) manipulationType = 'LAYERING';

    let dominantWall: BookAnalysis['dominantWall'] = null;
    const allLevels = [
      ...cleanBids.map(b => ({...b, side: 'BID' as const})), 
      ...cleanAsks.map(a => ({...a, side: 'ASK' as const}))
    ];
    const topLevel = allLevels.sort((a, b) => b.qty - a.qty)[0];
    if (topLevel && topLevel.qty > whaleThreshold) {
      dominantWall = { price: topLevel.price, side: topLevel.side, strength: topLevel.qty };
    }

    return {
      formattedBids: cleanBids,
      formattedAsks: cleanAsks,
      analysis: {
        bidPressure,
        askPressure: 100 - bidPressure,
        integrityScore: Math.max(0, 100 - (spoofRisk * 1.8)),
        intentBias: pulledQty > addedQty ? 'PULL' : 'STAY',
        spoofRisk,
        dominantWall,
        liquidityVoid: totalPower < (avgBid * 0.6),
        manipulationType
      }
    };
  }
}
