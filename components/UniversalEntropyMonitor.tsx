
import React from 'react';
import { Infinity, Waves, Radio, ShieldCheck, Zap, Globe, Gauge } from 'lucide-react';

interface UniversalEntropyMonitorProps {
  currentEntropy: number;
  realitySkew: number;
  isOmniActive: boolean;
  isGenesisLocked: boolean;
}

export const UniversalEntropyMonitor: React.FC<UniversalEntropyMonitorProps> = ({
  currentEntropy,
  realitySkew,
  isOmniActive,
  isGenesisLocked
}) => {
  return (
    <div className="bg-black border border-white/20 rounded-lg p-3 font-mono shadow-[0_0_30px_rgba(255,255,255,0.05)] relative overflow-hidden group mb-2">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none" />
      
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          <span className="text-[10px] text-white font-black uppercase tracking-[0.2em]">Universal_Entropy_HUD</span>
        </div>
        <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest px-2 py-0.5 border border-white/10 rounded">
          L12_GATE_SYNCED
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
         <div className="flex flex-col">
            <span className="text-[7px] text-gray-600 font-black uppercase">Existence_Probability</span>
            <div className="flex items-center gap-2">
               <Infinity size={12} className="text-white/40" />
               <span className="text-xs font-black text-white tabular-nums">0.9999999...</span>
            </div>
         </div>
         <div className="flex flex-col items-end text-right">
            <span className="text-[7px] text-gray-600 font-black uppercase">Reality_Skew</span>
            <div className="flex items-center gap-2">
               <span className={`text-xs font-black tabular-nums ${realitySkew === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                 {realitySkew.toFixed(10)}
               </span>
               <Waves size={12} className="text-ai-accent" />
            </div>
         </div>
      </div>

      <div className="space-y-1.5 border-t border-white/5 pt-2">
         <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-tighter">
            <span className="text-gray-500">Omni_Axiom_Status</span>
            <span className={isOmniActive ? "text-amber-500" : "text-gray-700"}>
              {isOmniActive ? 'REALITY_OVERWRITTEN' : 'LEGACY_MATHEMATICS'}
            </span>
         </div>
         <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${isOmniActive ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-gray-800'}`}
              style={{ width: isOmniActive ? '100%' : '10%' }}
            />
         </div>
      </div>

      {isGenesisLocked && (
        <div className="mt-2 flex items-center gap-2 bg-white text-black p-1.5 rounded text-[8px] font-black uppercase justify-center animate-in zoom-in-95 duration-500">
          <Zap size={10} className="fill-black" /> Genesis_Sequence_Primed_For_Big_Bang
        </div>
      )}
    </div>
  );
};
