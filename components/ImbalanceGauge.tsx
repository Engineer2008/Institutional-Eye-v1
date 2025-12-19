import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Activity, Info } from 'lucide-react';

interface ImbalanceGaugeProps {
  imbalance: number; // 0-100, where >50 is Buy dominance
}

const ImbalanceGauge: React.FC<ImbalanceGaugeProps> = ({ imbalance }) => {
  const [hoveredSide, setHoveredSide] = useState<'BIDS' | 'ASKS' | null>(null);
  
  const buyPercent = Math.min(Math.max(imbalance, 5), 95); // Ensure visibility
  const sellPercent = 100 - buyPercent;
  
  // Interpretation
  const isAccumulation = sellPercent > 60; 
  const isSpoofing = buyPercent > 65;

  return (
    <div className="bg-ai-panel border border-ai-border rounded-lg p-5 shadow-lg relative group overflow-hidden">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-ai-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Activity size={14} className="text-ai-accent" /> Order Book Pressure
        </h3>
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 font-mono bg-black/30 px-2 py-0.5 rounded border border-ai-border">L1 DEPTH-20</span>
        </div>
      </div>

      {/* The Bar Container */}
      <div className="relative h-10 w-full bg-black/40 rounded-md p-1 border border-ai-border/50 flex items-center">
        
        {/* Buy Side Segment */}
        <div 
          onMouseEnter={() => setHoveredSide('BIDS')}
          onMouseLeave={() => setHoveredSide(null)}
          className="h-full bg-gradient-to-r from-emerald-600/60 to-emerald-400/40 transition-all duration-500 ease-out flex items-center justify-start px-3 rounded-l-sm cursor-help relative group/buy border-r border-white/5"
          style={{ width: `${buyPercent}%` }}
        >
           {buyPercent > 25 && (
             <span className="text-[10px] font-black text-white tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {buyPercent.toFixed(1)}% BIDS
             </span>
           )}
           
           {/* Tooltip for BIDS */}
           {hoveredSide === 'BIDS' && (
             <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-ai-dark border border-emerald-500/50 p-2 rounded shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                <div className="text-[9px] text-emerald-400 font-bold uppercase mb-1">Buy Liquidity</div>
                <div className="text-xs text-white font-mono whitespace-nowrap">Ratio: {buyPercent.toFixed(2)}%</div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-ai-dark" />
             </div>
           )}
        </div>

        {/* Sell Side Segment */}
        <div 
          onMouseEnter={() => setHoveredSide('ASKS')}
          onMouseLeave={() => setHoveredSide(null)}
          className="h-full bg-gradient-to-l from-rose-600/60 to-rose-400/40 transition-all duration-500 ease-out flex items-center justify-end px-3 rounded-r-sm cursor-help relative group/sell"
          style={{ width: `${sellPercent}%` }}
        >
           {sellPercent > 25 && (
             <span className="text-[10px] font-black text-white tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                ASKS {sellPercent.toFixed(1)}%
             </span>
           )}

           {/* Tooltip for ASKS */}
           {hoveredSide === 'ASKS' && (
             <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-ai-dark border border-rose-500/50 p-2 rounded shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                <div className="text-[9px] text-rose-400 font-bold uppercase mb-1">Sell Liquidity</div>
                <div className="text-xs text-white font-mono whitespace-nowrap">Ratio: {sellPercent.toFixed(2)}%</div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-ai-dark" />
             </div>
           )}
        </div>

        {/* Mid-point Marker */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10 z-0" />
      </div>

      {/* Analysis Footer */}
      <div className="mt-4 flex justify-between items-center bg-black/20 p-2 rounded-md border border-ai-border/50 relative z-10">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
           <Info size={10} className="text-ai-accent" />
           LIQUIDITY BIAS: <span className={buyPercent > 50 ? 'text-emerald-500' : 'text-rose-500'}>
             {buyPercent > 50 ? 'BUYER DOMINANCE' : 'SELLER DOMINANCE'}
           </span>
        </div>
        
        <div className="flex items-center gap-3">
          {isAccumulation && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 animate-pulse bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
              <ArrowDown size={10} /> ACCUMULATION ZONE
            </div>
          )}
          {isSpoofing && (
             <div className="flex items-center gap-1 text-[10px] font-bold text-orange-400 animate-pulse bg-orange-400/10 px-2 py-0.5 rounded border border-orange-400/20">
              <ArrowUp size={10} /> POTENTIAL SPOOFING
            </div>
          )}
          {!isAccumulation && !isSpoofing && (
            <div className="text-[10px] text-gray-600 font-mono flex items-center gap-1">
              <Activity size={10} /> NEUTRAL FLOW
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImbalanceGauge;