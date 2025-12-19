
import React, { useState, useMemo } from 'react';
import { ForensicData } from '../types';
import { IntelligenceMetadata } from '../services/AdaptiveBrain';
import { 
  Activity, 
  ArrowLeft, 
  Fingerprint, 
  Scan, 
  Wifi, 
  ShieldCheck, 
  Binary, 
  Crosshair,
  GitCommit,
  Search,
  Filter,
  SlidersHorizontal,
  Unlock,
  Radio,
  Zap,
  ChevronRight,
  TrendingUp,
  Target,
  Layers,
  AlertTriangle,
  BrainCircuit
} from 'lucide-react';

interface LiveIntelligenceFeedProps {
  history: (ForensicData & { intel?: IntelligenceMetadata })[];
  selectedId: string | undefined;
  onSelect: (item: any) => void;
  onClearSelection: () => void;
}

const LiveIntelligenceFeed: React.FC<LiveIntelligenceFeedProps> = ({ 
  history, 
  selectedId, 
  onSelect, 
  onClearSelection 
}) => {
  const [filterSymbol, setFilterSymbol] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [minConfidence, setMinConfidence] = useState(0);

  const filteredHistory = useMemo(() => {
    return (history || []).filter(item => {
      const matchSymbol = (item.symbol || '').toLowerCase().includes(filterSymbol.toLowerCase());
      const matchType = filterType === 'ALL' 
        ? true 
        : filterType === 'BUY' ? item.type === 'HIDDEN_BUY' : item.type === 'HIDDEN_SELL';
      const matchConf = (item.confidence || 0) >= minConfidence;
      return matchSymbol && matchType && matchConf;
    });
  }, [history, filterSymbol, filterType, minConfidence]);

  return (
    <div className="w-full flex flex-col bg-[#080a0f] h-full flex-shrink-0 font-mono">
      
      {/* HEADER: TELEMETRY STATUS */}
      <div className="p-4 border-b border-ai-border bg-ai-panel/80 backdrop-blur-xl flex items-center justify-between shadow-2xl sticky top-0 z-20">
        <div className="flex items-center gap-4">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <Radio size={18} className="text-emerald-500 animate-pulse" />
            </div>
            <div>
                <h3 className="text-[11px] font-black text-white tracking-[0.2em] uppercase flex items-center gap-2">
                  GLOBAL_INTEL_SCANNER
                  <Unlock size={10} className="text-emerald-500" />
                </h3>
                <div className="flex items-center gap-3 text-[9px] text-gray-500 mt-1">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold"><Wifi size={10} /> HFT_LINK_ACTIVE</span>
                    <div className="w-[1px] h-2.5 bg-white/10" />
                    <span className="text-emerald-500 font-black flex items-center gap-1.5 uppercase">
                      Synchronized <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"/>
                    </span>
                </div>
            </div>
        </div>
        {selectedId && (
            <button 
                onClick={(e) => { e.stopPropagation(); onClearSelection(); }}
                className="text-[10px] text-gray-300 font-black hover:text-white flex items-center gap-2 bg-white/5 px-4 py-2.5 rounded-xl border border-white/10 hover:border-ai-accent transition-all active:scale-95"
            >
                <ArrowLeft size={14} /> SYSTEM_GRID
            </button>
        )}
      </div>

      {/* CONTROL BAR: FILTERS */}
      <div className="p-4 border-b border-ai-border bg-ai-panel/20 flex flex-col gap-4 shadow-inner">
         <div className="flex gap-3">
             <div className="relative flex-1 group">
                 <Search className="absolute left-3.5 top-3 text-gray-600 group-focus-within:text-ai-accent transition-colors" size={16} />
                 <input 
                    type="text" 
                    placeholder="LOCATE ASSET..." 
                    className="w-full bg-black/60 border border-ai-border rounded-xl px-4 pl-11 py-3 text-[11px] text-gray-200 focus:outline-none focus:border-ai-accent transition-all uppercase tracking-widest placeholder:text-gray-700"
                    value={filterSymbol}
                    onChange={e => setFilterSymbol(e.target.value)}
                 />
             </div>
             <div className="flex bg-black/60 rounded-xl border border-ai-border p-1.5">
                 {(['ALL', 'BUY', 'SELL'] as const).map((t) => (
                    <button 
                        key={t}
                        onClick={() => setFilterType(t)}
                        className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all tracking-widest ${
                            filterType === t 
                            ? t === 'BUY' ? 'bg-buy/20 text-buy' : t === 'SELL' ? 'bg-sell/20 text-sell' : 'bg-white/10 text-white shadow-inner'
                            : 'text-gray-600 hover:text-gray-400'
                        }`}
                    >{t}</button>
                 ))}
             </div>
         </div>
         
         <div className="flex items-center gap-5 text-[10px] text-gray-500 font-black tracking-widest">
             <div className="flex items-center gap-2.5 min-w-[140px]">
                 <SlidersHorizontal size={14} className="text-ai-accent" />
                 <span>Min_Confidence: <span className="text-white">{minConfidence}%</span></span>
             </div>
             <input 
                type="range" 
                min="0" 
                max="99" 
                step="1"
                value={minConfidence} 
                onChange={e => setMinConfidence(Number(e.target.value))}
                className="flex-1 h-1.5 bg-gray-800 rounded-full appearance-none cursor-pointer accent-ai-accent"
             />
         </div>
      </div>

      {/* FEED CONTENT */}
      <div className="overflow-y-auto flex-1 custom-scrollbar p-3 space-y-4 bg-[#050608]">
         {filteredHistory.length === 0 && (
            <div className="p-16 text-center text-gray-600 text-xs flex flex-col items-center justify-center h-full opacity-60">
              {history.length === 0 ? (
                  <div className="animate-in fade-in duration-1000">
                    <BrainCircuit size={64} className="mb-6 animate-spin-slow text-ai-accent opacity-50" />
                    <div className="mb-3 text-white font-black tracking-[0.3em] uppercase">Aggregating Cognitive Flow</div>
                    <div className="text-[10px] text-ai-accent/60 flex items-center gap-2.5">
                      <Zap size={14} className="animate-pulse" /> Deciphering Institutional Intents...
                    </div>
                  </div>
              ) : (
                  <>
                    <Filter size={64} className="mb-6 text-gray-800 opacity-50" />
                    <div className="mb-2 text-gray-500 font-black tracking-widest">NO MATCHING INTEL</div>
                    <div className="text-[10px]">Adjust filtration nodes.</div>
                  </>
              )}
            </div>
         )}

         {filteredHistory.map((item, idx) => {
            const isSelected = selectedId === item.id;
            const isBuy = item.type === 'HIDDEN_BUY';
            const colorClass = isBuy ? 'text-emerald-400' : 'text-rose-400';
            const borderClass = isBuy ? 'border-emerald-500/30' : 'border-rose-500/30';
            const glowClass = isBuy ? 'shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'shadow-[0_0_20px_rgba(239,68,68,0.1)]';
            
            const confidence = item.confidence || 0;
            const proximity = Math.min((item.size / (item.threshold || 1)) * 10, 100);

            return (
                <div 
                  key={item.id} 
                  onClick={() => onSelect(item)}
                  className={`
                    relative group cursor-pointer transition-all duration-500
                    border rounded-2xl bg-ai-panel/40 overflow-hidden
                    hover:bg-white/[0.03] active:scale-[0.99] animate-in slide-in-from-right-3
                    ${isSelected ? `border-ai-accent ring-1 ring-ai-accent/40 ${glowClass}` : `border-ai-border/40 ${borderClass}`}
                  `}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                   {/* Sync Grid Overlay */}
                   <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />

                   <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-700 ${isBuy ? 'bg-emerald-500 shadow-[2px_0_10px_#10B981]' : 'bg-rose-500 shadow-[2px_0_10px_#EF4444]'}`} />

                   <div className="p-5 relative z-10">
                       
                       {/* HEADER: ASSET & PATTERN */}
                       <div className="flex justify-between items-start mb-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                           <div className="flex items-center gap-3">
                               <span className="text-white bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                                 {new Date(item.timestamp).toLocaleTimeString([], { hour12: false })}
                               </span>
                               <span className="flex items-center gap-1.5 text-ai-accent">
                                 <Fingerprint size={12} />
                                 {(item.traceId || item.id).substring(0, 8)}
                               </span>
                           </div>
                           <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border bg-black/40 ${item.intel?.pattern === 'SPOOF_TRAP' ? 'text-amber-500 border-amber-500/30 animate-pulse' : 'text-gray-400 border-white/5'}`}>
                               <ShieldCheck size={12} />
                               {item.intel?.pattern || 'GENERIC_FLOW'}
                           </div>
                       </div>

                       <div className="flex justify-between items-center mb-5">
                          <div className="flex items-center gap-4">
                              <h4 className="font-black text-2xl text-white tracking-tighter tabular-nums">{(item.symbol || '').toUpperCase()}</h4>
                              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border font-black text-[10px] tracking-widest uppercase bg-black/40 ${colorClass} border-current/10`}>
                                {isBuy ? <TrendingUp size={12} /> : <Zap size={12} />}
                                {(item.type || '').replace('HIDDEN_', '')}
                              </div>
                          </div>
                          <div className="text-right">
                             <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-0.5">Cluster_Price</div>
                             <div className="text-lg font-black text-white tracking-tighter tabular-nums">${item.price.toLocaleString()}</div>
                          </div>
                       </div>

                       {/* INTELLIGENCE METRICS GRID */}
                       <div className="grid grid-cols-2 gap-3 mb-5">
                           <div className="bg-black/60 p-3 rounded-xl border border-white/5 flex flex-col gap-1.5 group/stat">
                              <div className="flex justify-between items-center text-[9px] text-gray-600 font-black uppercase tracking-tighter">
                                 <div className="flex items-center gap-1.5"><Layers size={10} className="text-ai-accent" /> Pressure_Ratio</div>
                                 <span className="text-gray-400">{(item.size / (item.threshold || 1)).toFixed(2)}x</span>
                              </div>
                              <div className="h-1 w-full bg-gray-900 rounded-full overflow-hidden">
                                 <div 
                                    className={`h-full transition-all duration-1000 ease-out ${isBuy ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                                    style={{ width: `${proximity}%` }}
                                 />
                              </div>
                           </div>
                           <div className="bg-black/60 p-3 rounded-xl border border-white/5 flex flex-col gap-1.5">
                              <div className="flex justify-between items-center text-[9px] text-gray-600 font-black uppercase tracking-tighter">
                                 <div className="flex items-center gap-1.5"><Activity size={10} className="text-purple-500" /> Entropy_Skew</div>
                                 <span className={`font-black ${item.intel?.entropy! < 0.3 ? 'text-emerald-400' : 'text-gray-400'}`}>{(item.intel?.entropy || 0).toFixed(4)}</span>
                              </div>
                              <div className="h-1 w-full bg-gray-900 rounded-full overflow-hidden">
                                 <div 
                                    className="h-full bg-purple-500 transition-all duration-1000" 
                                    style={{ width: `${(item.intel?.entropy || 0) * 100}%` }}
                                 />
                              </div>
                           </div>
                       </div>

                       {/* FOOTER: ANALYTICS SYNC */}
                       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest pt-4 border-t border-white/5">
                           <div className="flex items-center gap-5">
                               <div className="flex items-center gap-2">
                                   <ShieldCheck size={12} className="text-emerald-500" />
                                   <span className="text-gray-400">L0_Integrity: <span className="text-white">99%</span></span>
                               </div>
                               <div className="flex items-center gap-2">
                                   <Activity size={12} className="text-ai-accent" />
                                   <span className="text-gray-400">Confidence: <span className={confidence > 85 ? 'text-emerald-400 animate-pulse' : 'text-white'}>{confidence.toFixed(0)}%</span></span>
                               </div>
                           </div>
                           <div className={`px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 shadow-2xl transition-transform hover:scale-105 active:scale-95 ${
                             item.action === 'LONG' ? 'bg-buy text-black' : 
                             item.action === 'SHORT' ? 'bg-sell text-black' : 'bg-gray-800 text-gray-300 border border-white/10'
                          }`}>
                              {item.action === 'LONG' ? <ChevronRight size={14} /> : item.action === 'SHORT' ? <Zap size={14} /> : <Target size={14} />}
                              {item.action || 'MONITOR'}
                          </div>
                       </div>
                   </div>
                </div>
             );
         })}
      </div>
      
      {/* SYSTEM TELEMETRY */}
      <div className="bg-ai-panel/80 p-3 border-t border-ai-border text-[9px] text-gray-600 flex justify-between items-center shadow-inner relative z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                  <Fingerprint size={12} className="text-ai-accent" />
                  <span className="font-bold tracking-widest">GATEWAY_NODES: {filteredHistory.length}L</span>
              </div>
          </div>
          <div className="flex items-center gap-4 font-black tracking-[0.2em]">
             <span className="text-emerald-500/60 uppercase">Heuristic Matrix Operational</span>
          </div>
      </div>
    </div>
  );
};

export default LiveIntelligenceFeed;
