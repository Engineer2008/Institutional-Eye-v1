
import React, { useEffect, useState, useRef } from 'react';
import { OrderBookBrain, OrderBookLevel, BookAnalysis } from '../services/OrderBookBrain';
import { MarketType } from '../types';
import { getStreamUrl } from '../services/MarketRegistry';
import { Layers, AlertTriangle, ShieldAlert, Crosshair, Zap, Activity, Eye, Lock, BarChart2, Info } from 'lucide-react';

interface Props {
  symbol: string;
  marketType: MarketType;
  onAnalysis?: (analysis: BookAnalysis) => void;
  onData?: (bids: string[][], asks: string[][]) => void;
}

const DeepBookScanner: React.FC<Props> = ({ symbol, marketType, onAnalysis, onData }) => {
  const [bids, setBids] = useState<OrderBookLevel[]>([]);
  const [asks, setAsks] = useState<OrderBookLevel[]>([]);
  const [analysis, setAnalysis] = useState<BookAnalysis | null>(null);
  const [lastPrice, setLastPrice] = useState(0);
  const [hoveredLevel, setHoveredLevel] = useState<{price: number, qty: number} | null>(null);
  
  const brain = useRef(new OrderBookBrain());
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    setBids([]);
    setAsks([]);
    setAnalysis(null);
    setLastPrice(0);
    brain.current = new OrderBookBrain();

    const url = getStreamUrl(symbol, marketType, ['depth20@100ms']);
    ws.current = new WebSocket(url);

    ws.current.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const data = payload.data;
        if (!data) return;

        const rawBids = data.bids || data.b;
        const rawAsks = data.asks || data.a;

        if (rawBids && rawAsks) {
            const result = brain.current.analyze(rawBids, rawAsks);
            setBids(result.formattedBids.slice(0, 15)); 
            setAsks(result.formattedAsks.slice(0, 15));
            setAnalysis(result.analysis);
            if (onAnalysis) onAnalysis(result.analysis);
            if (onData) onData(rawBids, rawAsks);
            
            if (rawBids.length > 0 && rawAsks.length > 0) {
                const mid = (parseFloat(rawBids[0][0]) + parseFloat(rawAsks[0][0])) / 2;
                setLastPrice(mid);
            }
        }
      } catch (e) {
          console.error("DeepBookScanner Parse Error", e);
      }
    };

    return () => { if (ws.current) ws.current.close(); };
  }, [symbol, marketType, onAnalysis, onData]);

  if (!analysis) {
      return (
        <div className="bg-ai-panel border border-ai-border rounded-xl p-8 flex flex-col items-center justify-center h-full min-h-[400px] text-gray-500 font-mono animate-pulse">
            <Layers size={48} className="mb-4 text-ai-accent opacity-50" />
            <div className="text-sm font-bold">SCANNING {symbol.toUpperCase()} BOOK...</div>
            <div className="text-xs text-ai-accent mt-2 font-mono uppercase tracking-widest">{marketType} PROTOCOLS ACTIVE</div>
        </div>
      );
  }

  const maxVol = Math.max(...bids.map(b => b.qty), ...asks.map(a => a.qty), 1);

  return (
    <div className="bg-ai-dark border border-ai-border rounded-xl overflow-hidden shadow-2xl font-mono text-xs h-full flex flex-col relative">
      
      <div className="bg-ai-panel/50 border-b border-ai-border p-4 flex items-center justify-between flex-shrink-0 z-10">
        <div>
            <h2 className="text-sm font-bold text-cyan-400 flex items-center gap-2 tracking-wider">
                <Eye size={16} /> ORDER BOOK DECRYPTION <span className="text-gray-600">// {symbol.toUpperCase()}</span>
            </h2>
            <div className="flex items-center gap-4 mt-1 text-[10px] text-gray-500">
                <span className="flex items-center gap-1">
                    INTEGRITY: 
                    <span className={analysis.integrityScore > 80 ? 'text-buy font-bold' : 'text-sell font-bold'}>
                        {analysis.integrityScore.toFixed(0)}%
                    </span>
                </span>
                {analysis.liquidityVoid && (
                    <span className="text-sell font-bold flex items-center gap-1 animate-pulse">
                        <AlertTriangle size={10} /> LIQUIDITY VOID
                    </span>
                )}
            </div>
        </div>
        <div className="flex items-center gap-2">
            <div className={`px-2 py-0.5 rounded border text-[10px] font-bold ${marketType === 'SPOT' ? 'bg-blue-900/20 text-blue-400 border-blue-900' : 'bg-purple-900/20 text-purple-400 border-purple-900'}`}>
                {marketType}
            </div>
            <div className="w-2 h-2 rounded-full bg-buy animate-pulse shadow-[0_0_8px_#10B981]"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 flex-1 overflow-hidden">
          
        <div className="lg:col-span-3 p-0 border-r border-ai-border bg-black/10 flex flex-col h-full overflow-hidden">
            <div className="flex border-b border-ai-border/30 bg-ai-panel/30 flex-shrink-0">
                <div className="flex-1 p-2 text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Zap size={10} /> Tape & Depth
                </div>
                <div className="w-40 border-l border-ai-border/30 p-2 text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                    <BarChart2 size={10} /> Volume Profile
                </div>
            </div>

            <div className="flex-1 p-2 flex gap-1 overflow-y-auto custom-scrollbar">
                 <div className="flex-1 flex flex-col">
                    <div className="flex flex-col-reverse gap-[1px]">
                        {asks.map((ask, i) => (
                            <div 
                              key={`ask-${i}`} 
                              className={`flex items-center p-1 px-2 h-6 transition-colors rounded ${ask.isWhale ? 'bg-sell/10' : 'hover:bg-white/5'}`}
                            >
                                <span className={`w-24 font-bold ${ask.isWhale ? 'text-white' : 'text-sell/80'}`}>{ask.price.toFixed(2)}</span>
                                <div className="flex-1 flex justify-end gap-2">
                                     {ask.isSpoof && <span className="text-[9px] text-yellow-500 font-bold flex items-center gap-1"><Zap size={8} /> SPOOF</span>}
                                     {ask.isWhale && <span className="text-[9px] text-sell font-bold flex items-center gap-1 tracking-widest"><Lock size={8} /> WALL</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="py-2 my-1 border-y border-dashed border-ai-border text-center text-gray-500 text-sm flex items-center justify-between px-4 bg-ai-panel/30 font-bold">
                        <Activity size={10} className="text-ai-accent" />
                        <span className="text-white tracking-widest">{lastPrice.toFixed(2)}</span>
                        <span className="text-[9px] text-gray-600 font-mono">MARKET MID</span>
                    </div>

                    <div className="flex flex-col gap-[1px]">
                         {bids.map((bid, i) => (
                            <div 
                              key={`bid-${i}`} 
                              className={`flex items-center p-1 px-2 h-6 transition-colors rounded ${bid.isWhale ? 'bg-buy/10' : 'hover:bg-white/5'}`}
                            >
                                <span className={`w-24 font-bold ${bid.isWhale ? 'text-white' : 'text-buy/80'}`}>{bid.price.toFixed(2)}</span>
                                <div className="flex-1 flex justify-end gap-2">
                                     {bid.isSpoof && <span className="text-[9px] text-yellow-500 font-bold flex items-center gap-1"><Zap size={8} /> SPOOF</span>}
                                     {bid.isWhale && <span className="text-[9px] text-buy font-bold flex items-center gap-1 tracking-widest"><ShieldAlert size={8} /> FLOOR</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>

                 <div className="w-40 flex flex-col border-l border-ai-border/30 bg-black/40 relative group/profile">
                    <div className="flex flex-col-reverse gap-[1px]">
                        {asks.map((ask, i) => (
                             <div 
                                key={`ask-vol-${i}`} 
                                className="h-6 flex items-center relative cursor-help"
                                onMouseEnter={() => setHoveredLevel({price: ask.price, qty: ask.qty})}
                                onMouseLeave={() => setHoveredLevel(null)}
                             >
                                 <div className="absolute inset-y-0 right-0 bg-gradient-to-l from-rose-500/40 to-rose-500/10 rounded-l-sm transition-all duration-300" 
                                      style={{ width: `${(ask.qty / maxVol) * 100}%` }}></div>
                                 <span className="absolute right-1 text-[8px] text-rose-200/50 z-20 font-mono group-hover/profile:text-rose-200">{ask.qty.toFixed(2)}</span>
                             </div>
                        ))}
                    </div>

                    <div className="py-2 my-1 h-[34px] flex items-center">
                        <div className="w-full h-[1px] bg-ai-border/40"></div>
                    </div>

                    <div className="flex flex-col gap-[1px]">
                        {bids.map((bid, i) => (
                             <div 
                                key={`bid-vol-${i}`} 
                                className="h-6 flex items-center relative cursor-help"
                                onMouseEnter={() => setHoveredLevel({price: bid.price, qty: bid.qty})}
                                onMouseLeave={() => setHoveredLevel(null)}
                             >
                                 <div className="absolute inset-y-0 right-0 bg-gradient-to-l from-emerald-500/40 to-emerald-500/10 rounded-l-sm transition-all duration-300" 
                                      style={{ width: `${(bid.qty / maxVol) * 100}%` }}></div>
                                 <span className="absolute right-1 text-[8px] text-emerald-200/50 z-20 font-mono group-hover/profile:text-emerald-200">{bid.qty.toFixed(2)}</span>
                             </div>
                        ))}
                    </div>

                    {hoveredLevel && (
                      <div className="absolute -left-28 top-1/2 -translate-y-1/2 bg-ai-panel border border-ai-accent p-2 rounded shadow-2xl z-[100] animate-in fade-in zoom-in-95 pointer-events-none">
                        <div className="text-[9px] text-gray-500 font-bold uppercase mb-1">AGGREGATED VOLUME</div>
                        <div className="text-xs text-white font-mono">{hoveredLevel.qty.toFixed(4)} <span className="text-gray-500">BTC</span></div>
                        <div className="text-[9px] text-ai-accent mt-1">@ ${hoveredLevel.price.toFixed(2)}</div>
                      </div>
                    )}
                 </div>
            </div>
        </div>

        <div className="lg:col-span-1 bg-ai-panel/10 p-5 flex flex-col gap-6 overflow-y-auto">
            <div>
                <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Activity size={12} className="text-ai-accent" /> Book Pressure Dynamics
                </h3>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-mono">
                    <span className="text-emerald-400 font-bold">BIDS {analysis.bidPressure.toFixed(0)}%</span>
                    <span className="text-rose-400 font-bold">ASKS {analysis.askPressure.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-black rounded-full overflow-hidden flex border border-ai-border">
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full transition-all duration-500 ease-out" style={{ width: `${analysis.bidPressure}%` }}></div>
                    <div className="bg-gradient-to-l from-rose-600 to-rose-400 h-full transition-all duration-500 ease-out" style={{ width: `${analysis.askPressure}%` }}></div>
                </div>
            </div>

            <div className="bg-black/40 border border-ai-border rounded p-4 shadow-inner">
                <div className="mb-4">
                     <div className="text-[9px] text-gray-500 uppercase font-mono mb-1 tracking-widest">Protocol Integrity</div>
                     <div className={`text-xs font-bold flex items-center gap-2 ${analysis.manipulationType !== 'NONE' ? 'text-yellow-500 animate-pulse' : 'text-emerald-500'}`}>
                         {analysis.manipulationType !== 'NONE' ? <AlertTriangle size={14} /> : <ShieldAlert size={14} />}
                         {analysis.manipulationType === 'NONE' ? 'ORDER FLOW CLEAN' : analysis.manipulationType.replace('_', ' ')}
                     </div>
                </div>
                
                <div>
                     <div className="text-[9px] text-gray-500 uppercase font-mono mb-1 tracking-widest">Dominant Liquidity</div>
                     {analysis.dominantWall ? (
                         <div className="animate-in slide-in-from-left-2 duration-300">
                             <div className="text-lg font-black text-white tracking-tighter">${analysis.dominantWall.price.toFixed(2)}</div>
                             <div className={`text-[10px] font-bold ${analysis.dominantWall.side === 'BID' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                 {analysis.dominantWall.side} MAGNET ({analysis.dominantWall.strength.toFixed(2)} BTC)
                             </div>
                         </div>
                     ) : (
                         <div className="text-xs text-gray-600 italic font-mono uppercase tracking-widest">Scanning Walls...</div>
                     )}
                </div>
            </div>

            <div className="bg-ai-accent/5 border border-ai-accent/20 rounded p-3 relative group">
                <div className="absolute inset-0 bg-ai-accent opacity-[0.02] group-hover:opacity-10 transition-opacity"></div>
                <div className="text-[9px] font-bold text-ai-accent uppercase mb-2 flex items-center gap-1">
                    <Crosshair size={10} /> Market Intelligence
                </div>
                <p className="text-[11px] leading-relaxed text-gray-300 font-mono">
                    {analysis.liquidityVoid 
                        ? "ALERT: Liquidity vacuum detected near spread. High volatility expected." 
                        : analysis.bidPressure > 65 
                        ? "Aggressive institutional bids detected. Buyers absorbing all passive sell orders." 
                        : analysis.askPressure > 65 
                            ? "Heavy resistance forming. Passive sellers outnumbering active takers." 
                            : "Balanced book. Neutral flow confirmed. Waiting for whale trigger."
                    }
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DeepBookScanner;
