
import React, { useState, useEffect } from 'react';
import { Shuffle, TrendingUp, Zap, Globe, ArrowRight, ShieldCheck } from 'lucide-react';
import { scanAllOpportunities } from '../services/BridgeArbEngine';
import { ArbOpportunity } from '../types';

export const CrossChainArbMonitor: React.FC = () => {
  const [arbs, setArbs] = useState<ArbOpportunity[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const results = scanAllOpportunities();
      setArbs(results.slice(0, 4));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#050505] border border-ai-border/50 rounded-lg p-3 font-mono flex flex-col gap-2 shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Globe size={12} className="text-ai-accent animate-spin-slow" />
          <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Cross_Chain_Arb_v4.0</span>
        </div>
        <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
           <Zap size={10} className="animate-pulse" /> Scanning_Bridge_Relays
        </div>
      </div>

      <div className="space-y-1.5 overflow-y-auto custom-scrollbar max-h-[160px]">
        {arbs.length === 0 ? (
          <div className="py-8 text-center text-[8px] text-gray-700 uppercase tracking-[0.3em]">
             Establishing chain links...
          </div>
        ) : (
          arbs.map((arb, i) => (
            <div 
              key={i} 
              className={`p-2 rounded border border-white/5 bg-black/40 flex flex-col gap-1.5 transition-all duration-300 animate-in fade-in slide-in-from-right-1 ${arb.isProfitable ? 'border-buy/20 shadow-neon-green/10 bg-buy/[0.02]' : ''}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <span className="text-white font-black text-[10px] tracking-tighter">{arb.token}</span>
                   <div className="flex items-center gap-1 text-[8px] text-gray-600 font-bold">
                      <span className="px-1 bg-white/5 rounded">{arb.sourceChain}</span>
                      <ArrowRight size={8} />
                      <span className="px-1 bg-white/5 rounded">{arb.targetChain}</span>
                   </div>
                </div>
                <div className={`text-[10px] font-black tracking-tighter ${arb.isProfitable ? 'text-buy' : 'text-gray-600'}`}>
                  {arb.isProfitable ? '+' : ''}{arb.expectedROI.toFixed(3)}% ROI
                </div>
              </div>
              
              <div className="flex justify-between items-center text-[7px] text-gray-600 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1">
                   <Shuffle size={8} className="text-ai-accent" />
                   {arb.route.split(' -> ')[1]}
                </div>
                <div className="flex items-center gap-1.5">
                   <span className="tabular-nums">${arb.sourcePrice.toFixed(2)}</span>
                   <ArrowRight size={6} className="opacity-30" />
                   <span className="text-white tabular-nums">${arb.targetPrice.toFixed(2)}</span>
                </div>
              </div>

              {arb.isProfitable && (
                 <div className="h-0.5 w-full bg-buy/20 overflow-hidden rounded-full">
                    <div className="h-full bg-buy animate-progress" style={{ width: '100%' }} />
                 </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-1 pt-2 border-t border-white/5 flex justify-between items-center">
         <div className="flex items-center gap-1 text-[7px] text-gray-700 font-black uppercase">
            <ShieldCheck size={10} className="text-emerald-500" /> Integrity: 99.8% Locked
         </div>
         <span className="text-[7px] text-gray-800 italic">Across_V3_Mainnet_Oracle</span>
      </div>
    </div>
  );
};
