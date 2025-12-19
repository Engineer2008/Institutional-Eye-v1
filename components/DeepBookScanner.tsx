
import React, { useEffect, useState, useRef } from 'react';
import { OrderBookBrain, OrderBookLevel, BookAnalysis } from '../services/OrderBookBrain';
import { MarketType } from '../types';
import { getStreamUrl } from '../services/MarketRegistry';
import { 
  Layers, AlertTriangle, ShieldAlert, Crosshair, Zap, 
  Activity, Eye, Lock, BarChart2, Info, ArrowRight, 
  Magnet, ShieldCheck, RefreshCw, BoxSelect
} from 'lucide-react';

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
  const [hoveredLevel, setHoveredLevel] = useState<{price: number, qty: number, total: number} | null>(null);
  const [isHighlightingDominant, setIsHighlightingDominant] = useState(false);
  
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
        const data = payload.data || payload;
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
            <div className="text-sm font-bold tracking-widest uppercase">Scanning {symbol.toUpperCase()} Book...</div>
            <div className="text-[10px] text-ai-accent mt-2 font-mono uppercase tracking-[0.3em]">{marketType} Protocols Active</div>
        </div>
      );
  }

  const maxQty = Math.max(...bids.map(b => b.qty), ...asks.map(a => a.qty), 1);
  const maxTotal = Math.max(...bids.map(b => b.total), ...asks.map(a => a.total), 1);

  return (
    <div className="bg-ai-dark border border-ai-border rounded-xl overflow-hidden shadow-2xl font-mono text-xs h-full flex flex-col relative">
      
      {/* HUD HEADER */}
      <div className="bg-ai-panel/50 border-b border-ai-border p-4 flex items-center justify-between flex-shrink-0 z-10">
        <div>
            <h2 className="text-sm font-black text-cyan-400 flex items-center gap-2 tracking-widest uppercase">
                <Eye size={16} /> Order Book Decryption <span className="text-gray-600 font-bold tracking-normal ml-2">// {symbol.toUpperCase()}</span>
            </h2>
            <div className="flex items-center gap-4 mt-1 text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                <span className="flex items-center gap-1">
                    Integrity: 
                    <span className={analysis.integrityScore > 80 ? 'text-emerald-500' : 'text-rose-500'}>
                        {analysis.integrityScore.toFixed(0)}%
                    </span>
                </span>
                {analysis.liquidityVoid && (
                    <span className="text-rose-500 flex items-center gap-1 animate-pulse">
                        <AlertTriangle size={10} /> Liquidity Void
                    </span>
                )}
            </div>
        </div>
        <div className="flex items-center gap-3">
            <div className={`px-2 py-0.5 rounded border text-[10px] font-black tracking-widest uppercase ${marketType === 'SPOT' ? 'bg-blue-900/20 text-blue-400 border-blue-900' : 'bg-purple-900/20 text-purple-400 border-purple-900'}`}>
                {marketType}
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 flex-1 overflow-hidden min-h-0">
          
        {/* L2 DATA PANES */}
        <div className="lg:col-span-3 p-0 border-r border-ai-border bg-black/10 flex flex-col h-full overflow-hidden">
            <div className="flex border-b border-ai-border/30 bg-ai-panel/30 flex-shrink-0">
                <div className="flex-1 p-2 text-[9px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                    <Zap size={10} className="text-ai-accent" /> Active Tape Depth
                </div>
                <div className="w-48 border-l border-ai-border/30 p-2 text-[9px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                    <BoxSelect size={10} className="text-ai-accent" /> Depth Profile
                </div>
            </div>

            <div className="flex-1 p-2 flex gap-1 overflow-y-auto custom-scrollbar min-h-0">
                 {/* PRICE / QTY GRID */}
                 <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex flex-col-reverse gap-[1px]">
                        {asks.map((ask, i) => {
                            const isDominant = analysis.dominantWall?.side === 'ASK' && analysis.dominantWall?.price === ask.price;
                            return (
                                <div 
                                  key={`ask-${i}`} 
                                  className={`flex items-center p-1 px-2 h-6 transition-all rounded relative group ${ask.isWhale ? 'bg-rose-500/5' : 'hover:bg-white/5'} ${isDominant && isHighlightingDominant ? 'bg-rose-500/20 ring-1 ring-rose-500/50' : ''}`}
                                >
                                    <span className={`w-24 font-black tracking-tighter ${isDominant ? 'text-rose-400' : ask.isWhale ? 'text-white' : 'text-rose-500/80'}`}>{ask.price.toFixed(2)}</span>
                                    <div className="flex-1 flex justify-end gap-3 px-2">
                                         {ask.isSpoof && <span className="text-[8px] text-amber-500 font-black flex items-center gap-1 animate-pulse"><Zap size={8} /> SPOOF</span>}
                                         {ask.isWhale && (
                                            <span className={`text-[8px] font-black flex items-center gap-1 tracking-[0.2em] ${isDominant ? 'text-white' : 'text-rose-500'}`}>
                                              <Lock size={8} /> {isDominant ? 'PRIMARY_WALL' : 'WALL'}
                                            </span>
                                         )}
                                    </div>
                                    <div className="w-16 text-right text-[9px] text-gray-500 font-bold tabular-nums group-hover:text-gray-300 transition-colors">
                                      {ask.qty.toFixed(2)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="py-2.5 my-1 border-y border-dashed border-ai-border text-center flex items-center justify-between px-4 bg-ai-panel/30 font-black relative overflow-hidden group/mid">
                        <div className="absolute inset-0 bg-ai-accent/5 opacity-0 group-hover/mid:opacity-100 transition-opacity"></div>
                        <Activity size={10} className="text-ai-accent animate-pulse relative z-10" />
                        <span className="text-white tracking-[0.3em] text-base relative z-10 tabular-nums">{lastPrice.toFixed(2)}</span>
                        <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest relative z-10">Market Mid</span>
                    </div>

                    <div className="flex flex-col gap-[1px]">
                         {bids.map((bid, i) => {
                            const isDominant = analysis.dominantWall?.side === 'BID' && analysis.dominantWall?.price === bid.price;
                            return (
                                <div 
                                  key={`bid-${i}`} 
                                  className={`flex items-center p-1 px-2 h-6 transition-all rounded relative group ${bid.isWhale ? 'bg-emerald-500/5' : 'hover:bg-white/5'} ${isDominant && isHighlightingDominant ? 'bg-emerald-500/20 ring-1 ring-emerald-500/50' : ''}`}
                                >
                                    <span className={`w-24 font-black tracking-tighter ${isDominant ? 'text-emerald-400' : bid.isWhale ? 'text-white' : 'text-emerald-500/80'}`}>{bid.price.toFixed(2)}</span>
                                    <div className="flex-1 flex justify-end gap-3 px-2">
                                         {bid.isSpoof && <span className="text-[8px] text-amber-500 font-black flex items-center gap-1 animate-pulse"><Zap size={8} /> SPOOF</span>}
                                         {bid.isWhale && (
                                            <span className={`text-[8px] font-black flex items-center gap-1 tracking-[0.2em] ${isDominant ? 'text-white' : 'text-emerald-500'}`}>
                                              <ShieldAlert size={8} /> {isDominant ? 'PRIMARY_FLOOR' : 'FLOOR'}
                                            </span>
                                         )}
                                    </div>
                                    <div className="w-16 text-right text-[9px] text-gray-500 font-bold tabular-nums group-hover:text-gray-300 transition-colors">
                                      {bid.qty.toFixed(2)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                 </div>

                 {/* FORENSIC DEPTH PROFILE (VISUAL INTEGRATION) */}
                 <div className="w-48 flex flex-col border-l border-ai-border/30 bg-black/40 relative group/profile overflow-hidden min-h-0">
                    <div className="absolute inset-0 flex pointer-events-none opacity-[0.03]">
                      <div className="flex-1 border-r border-white/50"></div>
                      <div className="flex-1 border-r border-white/50"></div>
                      <div className="flex-1 border-r border-white/50"></div>
                    </div>

                    <div className="flex flex-col-reverse gap-[1px]">
                        {asks.map((ask, i) => {
                             const isDominant = analysis.dominantWall?.side === 'ASK' && analysis.dominantWall?.price === ask.price;
                             return (
                                <div 
                                    key={`ask-vol-${i}`} 
                                    className={`h-6 flex items-center relative cursor-crosshair group/item ${isDominant && isHighlightingDominant ? 'z-30' : ''}`}
                                    onMouseEnter={() => setHoveredLevel({price: ask.price, qty: ask.qty, total: ask.total})}
                                    onMouseLeave={() => setHoveredLevel(null)}
                                >
                                    {/* Cumulative Depth Layer */}
                                    <div className="absolute inset-y-0 right-0 bg-rose-500/5 transition-all duration-700" 
                                         style={{ width: `${(ask.total / maxTotal) * 100}%` }}></div>
                                    
                                    {/* Individual Level Pressure Layer */}
                                    <div className={`absolute inset-y-0.5 right-0 bg-gradient-to-l transition-all duration-300 border-r ${
                                        isDominant ? 'from-rose-400 to-rose-600 border-white shadow-[0_0_10px_#EF4444]' : 'from-rose-500/60 to-rose-500/10 border-rose-500'
                                    }`} 
                                    style={{ width: `${(ask.qty / maxQty) * 100}%` }}></div>
                                    
                                    {isDominant && (
                                        <div className="absolute left-0 w-full h-[1px] bg-white/20 animate-pulse pointer-events-none" />
                                    )}

                                    <span className={`absolute right-1 text-[8px] z-20 font-black tabular-nums transition-colors ${isDominant ? 'text-white' : 'text-rose-200/30 group-hover/item:text-rose-200'}`}>
                                      {ask.qty.toFixed(1)}
                                    </span>
                                </div>
                             );
                        })}
                    </div>

                    <div className="py-2.5 my-1 h-[34px] flex items-center relative z-20">
                        <div className="w-full h-[1px] bg-ai-border shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                    </div>

                    <div className="flex flex-col gap-[1px]">
                        {bids.map((bid, i) => {
                             const isDominant = analysis.dominantWall?.side === 'BID' && analysis.dominantWall?.price === bid.price;
                             return (
                                <div 
                                    key={`bid-vol-${i}`} 
                                    className={`h-6 flex items-center relative cursor-crosshair group/item ${isDominant && isHighlightingDominant ? 'z-30' : ''}`}
                                    onMouseEnter={() => setHoveredLevel({price: bid.price, qty: bid.qty, total: bid.total})}
                                    onMouseLeave={() => setHoveredLevel(null)}
                                >
                                    {/* Cumulative Depth Layer */}
                                    <div className="absolute inset-y-0 right-0 bg-emerald-500/5 transition-all duration-700" 
                                         style={{ width: `${(bid.total / maxTotal) * 100}%` }}></div>
                                    
                                    {/* Individual Level Pressure Layer */}
                                    <div className={`absolute inset-y-0.5 right-0 bg-gradient-to-l transition-all duration-300 border-r ${
                                        isDominant ? 'from-emerald-400 to-emerald-600 border-white shadow-[0_0_10px_#10B981]' : 'from-emerald-500/60 to-emerald-500/10 border-emerald-500'
                                    }`} 
                                    style={{ width: `${(bid.qty / maxQty) * 100}%` }}></div>

                                    {isDominant && (
                                        <div className="absolute left-0 w-full h-[1px] bg-white/20 animate-pulse pointer-events-none" />
                                    )}
                                    
                                    <span className={`absolute right-1 text-[8px] z-20 font-black tabular-nums transition-colors ${isDominant ? 'text-white' : 'text-emerald-200/30 group-hover/item:text-emerald-200'}`}>
                                      {bid.qty.toFixed(1)}
                                    </span>
                                </div>
                             );
                        })}
                    </div>

                    {/* INTERACTIVE LEVEL INTELLIGENCE */}
                    {hoveredLevel && (
                      <div className="absolute -left-48 top-1/2 -translate-y-1/2 bg-[#080a0f]/95 border border-ai-accent p-3 rounded shadow-[0_0_30px_rgba(59,130,246,0.3)] z-[100] animate-in fade-in zoom-in-95 pointer-events-none backdrop-blur-md min-w-[180px]">
                        <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-2 border-b border-white/5 pb-1">Level Analysis</div>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center">
                              <span className="text-[8px] text-gray-600 font-black uppercase">Price</span>
                              <span className="text-white font-black tracking-tighter tabular-nums">${hoveredLevel.price.toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-[8px] text-gray-600 font-black uppercase">Depth_Qty</span>
                              <span className="text-ai-accent font-black tracking-tighter tabular-nums">{hoveredLevel.qty.toFixed(4)} BTC</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-[8px] text-gray-600 font-black uppercase">Cumulative</span>
                              <span className="text-emerald-400 font-black tracking-tighter tabular-nums">{hoveredLevel.total.toFixed(2)} BTC</span>
                           </div>
                        </div>
                      </div>
                    )}
                 </div>
            </div>
        </div>

        {/* ANALYSIS SIDEBAR */}
        <div className="lg:col-span-1 bg-ai-panel/10 p-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            <div>
                <h3 className="text-[10px] font-black text-gray-500 uppercase mb-3 flex items-center gap-2 tracking-widest">
                    <Activity size={12} className="text-ai-accent" /> Pressure Dynamics
                </h3>
                <div className="flex justify-between text-[9px] text-gray-400 mb-1.5 font-black uppercase tracking-tighter">
                    <span className="text-emerald-500">Bids {analysis.bidPressure.toFixed(0)}%</span>
                    <span className="text-rose-500">Asks {analysis.askPressure.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-black rounded-full overflow-hidden flex border border-white/5 shadow-inner">
                    <div className="bg-emerald-500 h-full transition-all duration-700 ease-out shadow-[0_0_8px_#10B981]" style={{ width: `${analysis.bidPressure}%` }}></div>
                    <div className="bg-rose-500 h-full transition-all duration-700 ease-out shadow-[0_0_8px_#EF4444]" style={{ width: `${analysis.askPressure}%` }}></div>
                </div>
            </div>

            {/* DOMINANT LIQUIDITY CARD WITH MAGNETIC LINK */}
            <div 
              onMouseEnter={() => setIsHighlightingDominant(true)}
              onMouseLeave={() => setIsHighlightingDominant(false)}
              className={`bg-black/60 border rounded-lg p-4 shadow-2xl relative overflow-hidden transition-all duration-300 group/dominant ${isHighlightingDominant ? 'border-ai-accent shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'border-ai-border'}`}
            >
                <div className="absolute inset-0 bg-ai-accent/5 opacity-0 group-hover/dominant:opacity-100 transition-opacity pointer-events-none" />
                <div className="mb-4 relative z-10">
                     <div className="text-[9px] text-gray-600 uppercase font-black mb-1.5 tracking-[0.2em] flex items-center gap-2">
                       <ShieldCheck size={10} className="text-emerald-500" /> Integrity_Auth
                     </div>
                     <div className={`text-[11px] font-black flex items-center gap-2 tracking-wider ${analysis.manipulationType !== 'NONE' ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`}>
                         {analysis.manipulationType !== 'NONE' ? <AlertTriangle size={14} /> : <ShieldAlert size={14} />}
                         {analysis.manipulationType === 'NONE' ? 'FLOW_SECURE' : analysis.manipulationType.replace(/_/g, ' ')}
                     </div>
                </div>
                
                <div className="relative z-10 pt-3 border-t border-white/5">
                     <div className="text-[9px] text-gray-600 uppercase font-black mb-2 tracking-[0.2em] flex items-center gap-2">
                       <Magnet size={10} className={`transition-colors ${isHighlightingDominant ? 'text-ai-accent animate-ping' : 'text-gray-500'}`} /> Dominant Liquidity
                     </div>
                     {analysis.dominantWall ? (
                         <div className="animate-in slide-in-from-left-2 duration-500">
                             <div className="text-xl font-black text-white tracking-tighter tabular-nums flex items-center gap-2">
                                <span className="text-gray-700 text-xs">$</span>{analysis.dominantWall.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                <ArrowRight size={12} className="text-ai-accent" />
                             </div>
                             <div className={`text-[10px] font-black uppercase tracking-widest mt-1 ${analysis.dominantWall.side === 'BID' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                 {analysis.dominantWall.side} CORE_MAGNET <span className="text-white ml-1">({analysis.dominantWall.strength.toFixed(2)} BTC)</span>
                             </div>
                             <div className="mt-2 text-[8px] text-gray-600 italic font-bold">
                                Hover to localize on depth chart.
                             </div>
                         </div>
                     ) : (
                         <div className="text-[10px] text-gray-700 italic font-black uppercase tracking-[0.3em] flex items-center gap-2">
                            <RefreshCw size={10} className="animate-spin" /> Scanning_Grid...
                         </div>
                     )}
                </div>
            </div>

            {/* NEURAL LOG */}
            <div className="bg-ai-accent/5 border border-ai-accent/20 rounded-lg p-4 relative group shadow-inner">
                <div className="absolute inset-0 bg-ai-accent opacity-[0.02] group-hover:opacity-[0.08] transition-opacity"></div>
                <div className="text-[10px] font-black text-ai-accent uppercase mb-3 flex items-center gap-2 tracking-[0.2em]">
                    <Crosshair size={12} className="animate-pulse" /> Neural_Intel_Log
                </div>
                <p className="text-[11px] leading-relaxed text-gray-300 font-mono tracking-tight">
                    {analysis.liquidityVoid 
                        ? "CRITICAL: Liquidity vacuum identified. Execution paths are destabilized." 
                        : analysis.bidPressure > 65 
                        ? "Institutional accumulation phase in progress. High probability of resistance absorption." 
                        : analysis.askPressure > 65 
                            ? "Resistance cluster solidified. Buy-side aggression insufficient to displace dominant asks." 
                            : "Structural equilibrium detected. Mid-market delta remains neutral."
                    }
                </p>
            </div>
        </div>
      </div>

      <div className="h-8 bg-[#080a0f] border-t border-ai-border flex justify-between items-center px-4 shrink-0 text-[8px] font-black uppercase text-gray-700 tracking-[0.4em] z-20">
         <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><Lock size={10} className="text-emerald-500/50" /> Secure_Stream</span>
            <span className="flex items-center gap-2"><BarChart2 size={10} /> LATENCY: 100ms</span>
         </div>
         <span className="text-ai-accent/60">Forensic_L3_Authenticated</span>
      </div>
    </div>
  );
};

export default DeepBookScanner;
