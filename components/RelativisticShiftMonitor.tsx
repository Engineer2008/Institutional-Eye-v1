
import React, { useState, useEffect, useMemo } from 'react';
import { Timer, Wind, Infinity, Zap, Activity, ShieldCheck, Gauge, FlaskConical } from 'lucide-react';
import { RelativisticEngine } from '../services/RelativisticEngine';
import { RelativisticState } from '../types';

export const RelativisticShiftMonitor: React.FC<{ volatility: number }> = ({ volatility }) => {
  const [metrics, setMetrics] = useState<RelativisticState | null>(null);

  useEffect(() => {
    const updatePhysics = () => {
      const v = RelativisticEngine.getMarketVelocity(volatility || 0.1);
      const state = RelativisticEngine.calculateDilation(1.0, v);
      setMetrics(state);
    };

    updatePhysics();
    const interval = setInterval(updatePhysics, 2000);
    return () => clearInterval(interval);
  }, [volatility]);

  if (!metrics) return null;

  return (
    <div className="bg-[#050505] border border-blue-500/30 rounded-lg p-3 font-mono flex flex-col gap-3 shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
      
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/10 rounded border border-blue-500/20">
             <Wind size={12} className="text-blue-400 animate-pulse" />
          </div>
          <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Relativistic_Shift_v7.5</span>
        </div>
        <div className="flex items-center gap-1.5 text-[8px] font-black text-blue-500 uppercase tracking-widest">
           <FlaskConical size={10} /> Lorentz_Correction_Active
        </div>
      </div>

      {/* Physics Visualizer */}
      <div className="bg-black/60 border border-white/5 p-3 rounded flex flex-col gap-4">
        <div className="flex justify-between items-end">
           <div className="flex flex-col">
              <span className="text-[7px] text-gray-600 font-black uppercase">Lorentz_Factor (γ)</span>
              <span className="text-2xl font-black text-white tabular-nums tracking-tighter">
                {metrics.lorentzFactor.toFixed(6)}
              </span>
           </div>
           <div className="text-right flex flex-col items-end">
              <span className="text-[7px] text-gray-600 font-black uppercase">Proper_Time (Δt)</span>
              <span className="text-xs font-bold text-blue-400 tabular-nums">1.000000s</span>
           </div>
        </div>

        <div className="space-y-1">
           <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter">
              <span className="text-gray-500">Relativistic_Velocity</span>
              <span className="text-blue-500">{(metrics.cPercent).toFixed(2)}% of c</span>
           </div>
           <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden flex border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-ai-accent transition-all duration-1000 shadow-[0_0_8px_#3B82F6]" 
                style={{ width: `${metrics.cPercent}%` }}
              />
           </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
           <div className="p-2 bg-blue-950/20 border border-blue-500/20 rounded flex flex-col gap-1">
              <span className="text-[7px] text-blue-400 font-black uppercase">Dilated_Time (Δt')</span>
              <span className="text-sm font-black text-white tabular-nums">
                {metrics.dilatedTime.toFixed(6)}s
              </span>
           </div>
           <div className="p-2 bg-purple-950/20 border border-purple-500/20 rounded flex flex-col gap-1">
              <span className="text-[7px] text-purple-400 font-black uppercase">Temporal_Skew</span>
              <span className="text-sm font-black text-white tabular-nums">
                +{(metrics.dilatedTime - metrics.properTime).toFixed(6)}s
              </span>
           </div>
        </div>
      </div>

      {/* The Formula Integration */}
      <div className="bg-black/80 border border-ai-accent/20 p-2 rounded relative group/formula overflow-hidden">
         <div className="absolute top-0 right-0 p-1 opacity-20"><Infinity size={12} /></div>
         <div className="text-[7px] text-gray-600 font-black uppercase mb-1.5 tracking-widest">Theoretical_Baseline</div>
         <div className="text-[10px] font-serif italic text-blue-300 text-center py-1 scale-110 group-hover:text-white transition-colors">
           Δt' = Δt / √(1 - v²/c²)
         </div>
      </div>

      <div className="mt-1 pt-2 border-t border-white/5 flex justify-between items-center text-[7px] text-gray-700 font-black uppercase">
         <div className="flex items-center gap-2">
            <ShieldCheck size={10} className="text-emerald-500" /> Relativistic_Finality: Verified
         </div>
         <span className="text-blue-500">Einstein_Field_Link_S7</span>
      </div>
    </div>
  );
};
