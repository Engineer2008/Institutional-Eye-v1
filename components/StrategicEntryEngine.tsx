
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { TechnicalAnalysisEngine } from '../services/TechnicalAnalysisEngine';
import { ForensicIntelligenceSuite } from '../services/ForensicIntelligenceSuite';
import { MarketType, GlobalStrategicState } from '../types';
import { Binary, Database, ShieldCheck, Search, Activity, Cpu, Compass } from 'lucide-react';

interface Props {
  symbol: string;
  marketType: MarketType;
  onAssetSelect?: (symbol: string) => void;
}

const StrategicEntryEngine: React.FC<Props> = ({ symbol, marketType, onAssetSelect }) => {
  const [globalData, setGlobalData] = useState<GlobalStrategicState[]>([]);
  const [search, setSearch] = useState('');
  
  const engine = useRef(new TechnicalAnalysisEngine());
  const forensic = useRef(new ForensicIntelligenceSuite());
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = "wss://stream.binance.com:9443/ws/!miniTicker@arr";
    ws.current = new WebSocket(url);
    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (Array.isArray(data)) {
            const processed = engine.current.processGlobalTickers(data);
            setGlobalData(processed.map(p => ({
                ...p,
                rotationBeta: p.symbol ? forensic.current.calculateRotationBeta(p.symbol, processed) : 1.0
            })));
        }
      } catch (err) {
        console.error("Structural Matrix Update Failure", err);
      }
    };
    return () => ws.current?.close();
  }, []);

  const filtered = useMemo(() => 
    globalData.filter(d => (d.symbol || '').includes((search || '').toUpperCase())).slice(0, 100)
  , [globalData, search]);

  return (
    <div className="bg-[#020408] border border-ai-border rounded-lg h-full flex flex-col overflow-hidden font-mono shadow-2xl">
      {/* Forensic Header */}
      <div className="p-3 bg-[#080a0f] border-b border-ai-border flex justify-between items-center shrink-0">
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <Binary size={16} className="text-ai-accent" />
                <span className="text-xs font-black text-white tracking-[0.2em] uppercase">Structural Integrity Matrix</span>
            </div>
            <div className="hidden lg:flex items-center gap-4 text-[10px] text-gray-700 border-l border-ai-border pl-6">
                <span className="flex items-center gap-1.5"><Database size={12}/> NODES: {globalData.length}</span>
                <span className="flex items-center gap-1.5 text-emerald-500/80"><ShieldCheck size={12}/> DATA_INTEGRITY: LOCKED</span>
            </div>
        </div>
        
        <div className="relative group">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" />
            <input 
                className="bg-black/80 border border-ai-border rounded px-3 pl-8 py-1.5 text-[10px] text-gray-300 w-48 focus:border-ai-accent focus:outline-none placeholder:text-gray-700"
                placeholder="LOCATE SYMBOL..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
        </div>
      </div>

      {/* Forensic List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">
        <div className="grid grid-cols-6 text-[9px] text-gray-700 font-black p-3 bg-[#050608] border-b border-ai-border/50 sticky top-0 z-10 tracking-widest uppercase">
            <span>Ident_Code</span>
            <span className="text-right">Unit_Price</span>
            <span className="text-right">Delta_24h</span>
            <span className="text-right">Vol_Flow</span>
            <span className="text-right">Rotation_Beta</span>
            <span className="text-right">Structural_State</span>
        </div>
        {filtered.map(asset => {
            const sym = asset.symbol || '';
            return (
              <button 
                  key={sym}
                  onClick={() => onAssetSelect?.(sym)}
                  className={`grid grid-cols-6 w-full p-3 text-[11px] items-center hover:bg-white/[0.03] border-b border-white/[0.01] transition-colors ${sym === symbol ? 'bg-ai-accent/10' : ''}`}
              >
                  <span className="text-left font-black text-white">{sym.replace('USDT', '')}</span>
                  <span className="text-right text-gray-500">${(asset.price || 0).toFixed(asset.price < 1 ? 4 : 2)}</span>
                  <span className={`text-right font-bold ${asset.change24h > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {asset.change24h > 0 ? '+' : ''}{(asset.change24h || 0).toFixed(2)}%
                  </span>
                  <span className="text-right text-gray-600">{((asset.volume24h || 0) / 1000000).toFixed(1)}M</span>
                  <span className={`text-right font-black ${asset.rotationBeta > 1.2 ? 'text-ai-accent' : 'text-gray-700'}`}>
                      {(asset.rotationBeta || 1.0).toFixed(2)}
                  </span>
                  <span className="text-right">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${asset.trend === 'UP' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                          {asset.trend || 'N/A'}
                      </span>
                  </span>
              </button>
            );
        })}
      </div>

      <div className="p-2 px-4 bg-[#080a0f] border-t border-ai-border flex justify-between items-center text-[9px] text-gray-700 tracking-[0.1em]">
         <div className="flex items-center gap-4 font-black">
             <div className="flex items-center gap-2 uppercase">
                <Compass size={12}/> {(symbol || '---').replace('USDT', '')} Focus
             </div>
             <div className="flex items-center gap-2 uppercase">
                <Activity size={12}/> Telemetry_Stable
             </div>
         </div>
         <div className="flex items-center gap-2 text-ai-accent uppercase font-black">
             <Cpu size={12}/> V2.5.4_Forensic_Core
         </div>
      </div>
    </div>
  );
};

export default StrategicEntryEngine;
