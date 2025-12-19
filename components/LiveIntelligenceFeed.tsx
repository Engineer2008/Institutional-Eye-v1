
import React, { useState, useMemo } from 'react';
import { ForensicData } from '../types';
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
  TrendingUp
} from 'lucide-react';

interface LiveIntelligenceFeedProps {
  history: ForensicData[];
  selectedId: string | undefined;
  onSelect: (item: ForensicData) => void;
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

  // --- FILTERING LOGIC ---
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
    <div className="w-full flex flex-col bg-[#080a0f] h-full flex-shrink-0">
      
      {/* HEADER: TELEMETRY STATUS */}
      <div className="p-4 border-b border-ai-border bg-ai-panel/80 backdrop-blur-md flex items-center justify-between shadow-lg sticky top-0 z-20">
        <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Radio size={16} className="text-emerald-500 animate-pulse" />
            </div>
            <div>
                <h3 className="text-xs font-black text-white tracking-widest font-mono flex items-center gap-2">
                  GLOBAL LIQUIDITY SCANNER
                  <Unlock size={10} className="text-emerald-500" />
                </h3>
                <div className="flex items-center gap-2 text-[9px] text-gray-500 font-mono mt-0.5">
                    <span className="flex items-center gap-1 text-emerald-400/80 font-bold"><Wifi size={8} /> 1.2 GB/S STREAM</span>
                    <span className="text-gray-800">|</span>
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      DECRYPTED <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                    </span>
                </div>
            </div>
        </div>
        {selectedId && (
            <button 
                onClick={(e) => { e.stopPropagation(); onClearSelection(); }}
                className="text-[10px] text-gray-300 font-bold hover:text-white flex items-center gap-1.5 bg-white/5 px-3 py-2 rounded border border-white/10 hover:border-ai-accent transition-all active:scale-95"
            >
                <ArrowLeft size={12} /> DASHBOARD
            </button>
        )}
      </div>

      {/* CONTROL BAR: FILTERS */}
      <div className="p-4 border-b border-ai-border bg-ai-panel/20 flex flex-col gap-4 shadow-inner">
         {/* Row 1: Search & Type */}
         <div className="flex gap-3">
             <div className="relative flex-1 group">
                 <Search className="absolute left-3 top-2.5 text-gray-600 group-focus-within:text-ai-accent transition-colors" size={14} />
                 <input 
                    type="text" 
                    placeholder="SCAN SYMBOL..." 
                    className="w-full bg-black/60 border border-ai-border rounded-lg px-3 pl-9 py-2 text-xs text-gray-200 focus:outline-none focus:border-ai-accent transition-colors font-mono uppercase tracking-widest placeholder:text-gray-700"
                    value={filterSymbol}
                    onChange={e => setFilterSymbol(e.target.value)}
                 />
             </div>
             <div className="flex bg-black/60 rounded-lg border border-ai-border p-1">
                 {(['ALL', 'BUY', 'SELL'] as const).map((t) => (
                    <button 
                        key={t}
                        onClick={() => setFilterType(t)}
                        className={`px-3 py-1 text-[10px] font-black rounded-md transition-all tracking-widest ${
                            filterType === t 
                            ? t === 'BUY' ? 'bg-buy/20 text-buy' : t === 'SELL' ? 'bg-sell/20 text-sell' : 'bg-white/10 text-white'
                            : 'text-gray-600 hover:text-gray-400'
                        }`}
                    >{t}</button>
                 ))}
             </div>
         </div>
         
         {/* Row 2: Confidence Slider */}
         <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono font-bold tracking-widest">
             <div className="flex items-center gap-2 min-w-[120px]">
                 <SlidersHorizontal size={12} className="text-ai-accent" />
                 <span>THRESHOLD: <span className="text-white">{minConfidence}%</span></span>
             </div>
             <input 
                type="range" 
                min="0" 
                max="99" 
                step="1"
                value={minConfidence} 
                onChange={e => setMinConfidence(Number(e.target.value))}
                className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-ai-accent hover:accent-blue-400"
             />
         </div>
      </div>

      {/* FEED CONTENT */}
      <div className="overflow-y-auto flex-1 custom-scrollbar p-3 space-y-3 bg-[#050608]">
         {filteredHistory.length === 0 && (
            <div className="p-12 text-center text-gray-600 text-xs font-mono flex flex-col items-center justify-center h-full opacity-60">
              {history.length === 0 ? (
                  <div className="animate-in fade-in duration-700">
                    <Scan size={48} className="mb-4 animate-spin-slow text-emerald-500 opacity-50" />
                    <div className="mb-2 text-white font-black tracking-widest uppercase">Initializing Stream</div>
                    <div className="text-[10px] text-emerald-400/50 flex items-center gap-2">
                      <Zap size={10} className="animate-pulse" /> Injecting Neural Probes...
                    </div>
                  </div>
              ) : (
                  <>
                    <Filter size={48} className="mb-4 text-gray-700 opacity-50" />
                    <div className="mb-2 text-gray-400 font-black tracking-widest">NO SIGNALS MATCHED</div>
                    <div className="text-[10px]">Filter parameters out of range.</div>
                  </>
              )}
            </div>
         )}

         {filteredHistory.map((item, idx) => {
            const isSelected = selectedId === item.id;
            const isBuy = item.type === 'HIDDEN_BUY';
            const colorClass = isBuy ? 'text-buy' : 'text-sell';
            const borderClass = isBuy ? 'border-buy/40' : 'border-sell/40';
            const bgClass = isBuy ? 'bg-buy/5' : 'bg-sell/5';
            const glowClass = isBuy ? 'shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'shadow-[0_0_20px_rgba(239,68,68,0.1)]';
            
            // Confidence Intensity (Visual Scaling)
            const confidence = item.confidence || 0;
            const isHighConfidence = confidence >= 90;
            const proximity = Math.min((item.size / (item.threshold || 1)) * 10, 100);

            return (
                <div 
                  key={item.id} 
                  onClick={() => onSelect(item)}
                  className={`
                    relative group cursor-pointer transition-all duration-300
                    border rounded-xl bg-ai-panel/30 overflow-hidden
                    hover:bg-white/5 active:scale-[0.98] animate-in slide-in-from-right-2
                    ${isSelected ? `border-ai-accent ring-1 ring-ai-accent/30 ${glowClass}` : `border-ai-border ${borderClass}`}
                    ${isHighConfidence ? 'shadow-[0_0_15px_rgba(59,130,246,0.05)]' : ''}
                  `}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                   {/* Background Trace Stream */}
                   <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none overflow-hidden font-mono text-[6px] break-all leading-none select-none">
                        {(item.traceId || '').repeat(50)}
                   </div>

                   {/* Flash Effect on Selection */}
                   <div className={`absolute left-0 top-0 bottom-0 w-1 ${isBuy ? 'bg-buy' : 'bg-sell'} ${isHighConfidence ? 'animate-pulse' : ''} opacity-80 z-20`}></div>

                   <div className="p-4 relative z-10">
                       
                       {/* ROW 1: HEADER & TELEMETRY */}
                       <div className="flex justify-between items-start mb-3 font-mono text-[10px] text-gray-600">
                           <div className="flex items-center gap-2">
                               <span className="text-white font-bold tracking-tighter bg-black/40 px-2 py-0.5 rounded border border-white/5">
                                 {new Date(item.timestamp).toLocaleTimeString()}
                               </span>
                               <span className="text-gray-600 font-bold opacity-70">.{item.latencyMs || 0}ms LAG</span>
                           </div>
                           <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                               <Binary size={12} className="text-ai-accent" />
                               <span className="tracking-widest">{(item.traceId || '').substring(0, 12).toUpperCase()}</span>
                           </div>
                       </div>

                       {/* ROW 2: PRIMARY TARGET SIGNAL */}
                       <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                              <h4 className="font-black text-lg text-white tracking-tighter">{(item.symbol || '').toUpperCase()}</h4>
                              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border font-black text-[9px] tracking-widest uppercase ${bgClass} ${colorClass} border-current/20`}>
                                {isBuy ? <TrendingUp size={10} /> : <Zap size={10} />}
                                {(item.type || '').replace('HIDDEN_', '')}
                              </div>
                          </div>
                          <div className={`text-[11px] font-black px-3 py-1 rounded-lg flex items-center gap-2 shadow-xl border border-white/10 transition-transform group-hover:scale-110 ${
                             item.action === 'LONG' ? 'bg-buy text-black' : 
                             item.action === 'SHORT' ? 'bg-sell text-black' : 'bg-gray-800 text-gray-300'
                          }`}>
                              {item.action === 'LONG' && <ChevronRight size={12} />}
                              {item.action}
                          </div>
                       </div>

                       {/* ROW 3: STRENGTH BAR (Proximity to Threshold) */}
                       <div className="mb-4">
                          <div className="flex justify-between items-center mb-1.5 text-[9px] font-black tracking-widest text-gray-600">
                             <div className="flex items-center gap-1">
                                <Crosshair size={10} className="text-ai-accent" /> ABSORPTION INTENSITY
                             </div>
                             <span className="text-gray-400">{(item.size / (item.threshold || 1)).toFixed(1)}x THRESHOLD</span>
                          </div>
                          <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                             <div 
                                className={`h-full transition-all duration-1000 ease-out rounded-full ${isBuy ? 'bg-buy shadow-[0_0_10px_#10B981]' : 'bg-sell shadow-[0_0_10px_#EF4444]'}`} 
                                style={{ width: `${proximity}%` }}
                             ></div>
                          </div>
                       </div>

                       {/* ROW 4: ANALYTICS GRID */}
                       <div className="grid grid-cols-2 gap-3 text-[10px] font-mono border-t border-dashed border-white/5 pt-4">
                           <div className="flex flex-col gap-1">
                               <div className="flex items-center gap-1.5 text-gray-500 font-bold tracking-widest">
                                   <ShieldCheck size={10} className="text-emerald-500" /> INTEGRITY
                               </div>
                               <div className={`text-sm font-black tracking-tighter ${item.integrity > 0.85 ? 'text-white' : 'text-gray-500'}`}>
                                 {(item.integrity * 100).toFixed(1)}%
                               </div>
                           </div>
                           <div className="flex flex-col gap-1 items-end">
                               <div className="flex items-center gap-1.5 text-gray-500 font-bold tracking-widest">
                                   <Activity size={10} className="text-ai-accent" /> CONFIDENCE
                               </div>
                               <div className={`text-sm font-black tracking-tighter ${isHighConfidence ? 'text-ai-accent animate-pulse' : 'text-gray-500'}`}>
                                 {confidence.toFixed(1)}%
                               </div>
                           </div>
                           <div className="col-span-2 flex items-center justify-between bg-black/60 p-2 rounded-lg border border-white/5 mt-1 group-hover:border-ai-accent/30 transition-colors">
                               <span className="flex items-center gap-2 text-[9px] text-gray-600 font-black tracking-widest">
                                   <GitCommit size={12} className="text-emerald-500" /> PROTOCOL_LAYER
                               </span>
                               <span className="text-gray-400 font-black tracking-widest text-[9px]">{item.detectionLayer}</span>
                           </div>
                       </div>
                   </div>
                </div>
             );
         })}
      </div>
      
      {/* FOOTER: SYSTEM TELEMETRY */}
      <div className="bg-ai-panel p-3 border-t border-ai-border text-[9px] font-mono text-gray-600 flex justify-between items-center shadow-2xl relative z-20">
          <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded border border-white/5">
              <Fingerprint size={12} className="text-ai-accent" />
              <span className="tracking-widest">SENSOR_LOCK: {Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 font-black tracking-widest">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10B981]"></span>
                <span className="text-emerald-500">DECRYPTED STREAM ACTIVE</span>
             </div>
          </div>
      </div>
    </div>
  );
};

export default LiveIntelligenceFeed;
