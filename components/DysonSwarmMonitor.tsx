import React, { useState, useEffect } from 'react';
import { Sun, Zap, ShieldCheck, ShieldAlert, Loader2, CheckCircle2, Target, Gauge, Radio, FlaskConical, Milestone } from 'lucide-react';
import { allocateSolarFlux } from '../services/StellarPowerEngine';
import { CivilizationalGoal, StellarAllocationResult } from '../types';

export const DysonSwarmMonitor: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [result, setResult] = useState<StellarAllocationResult | null>(null);
  const [errorReason, setErrorReason] = useState<string | null>(null);
  const [isAllocating, setIsAllocating] = useState(false);
  const [pulse, setPulse] = useState(false);

  const startAllocation = async () => {
    setIsAllocating(true);
    setResult(null);
    setErrorReason(null);

    const goal: CivilizationalGoal = {
      id: `GOAL-${Date.now()}`,
      name: 'Planetary_Solvency_Expansion',
      targetCoordinates: 'MARS_EQUATORIAL_NODE_4',
      jouleRequirement: 12000, // 12,000 Petajoules
      ethicalJustification: `Securing multi-planetary liquidity for the ${symbol} ecosystem to ensure civilizational sustainability through deep-time fluctuations.`
    };

    try {
      const response = await allocateSolarFlux(goal);
      // Fix: Property 'reasoning' does not exist on type 'StellarAllocationResult | { status: "ETHICAL_REJECTION"; reasoning: string; }'.
      // Use type casting to narrow the union type when status matches 'ETHICAL_REJECTION'.
      if (response.status === 'ETHICAL_REJECTION') {
        setErrorReason((response as { status: 'ETHICAL_REJECTION'; reasoning: string }).reasoning);
      } else {
        setResult(response as StellarAllocationResult);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAllocating(false);
    }
  };

  useEffect(() => {
    if (result?.status === 'BEAM_ACTIVE') {
      const interval = setInterval(() => setPulse(p => !p), 1000);
      return () => clearInterval(interval);
    }
  }, [result]);

  return (
    <div className="bg-[#050505] border border-orange-500/30 rounded-lg p-3 font-mono flex flex-col gap-3 shadow-[0_0_30px_rgba(249,115,22,0.15)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-orange-500/[0.03] pointer-events-none" />
      
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2 text-orange-500">
          <div className="p-1.5 bg-orange-500/10 rounded border border-orange-500/20">
             <Sun size={12} className={isAllocating ? "animate-spin-slow" : pulse ? "scale-110 transition-transform" : ""} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Dyson_Swarm_v8.0</span>
        </div>
        <button 
          onClick={startAllocation}
          disabled={isAllocating || result?.status === 'BEAM_ACTIVE'}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${
            isAllocating || result?.status === 'BEAM_ACTIVE' ? 'bg-gray-800 text-gray-500' : 'bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500 hover:text-white shadow-neon-red'
          }`}
        >
          {isAllocating ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
          {result?.status === 'BEAM_ACTIVE' ? 'Allocation_Locked' : 'Request_Solar_Flux'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col gap-1">
             <span className="text-[7px] text-gray-600 font-black uppercase tracking-tighter">Swarm_Efficiency</span>
             <div className="flex items-center gap-2">
                <Gauge size={12} className="text-orange-500" />
                <span className="text-[9px] text-white font-bold tabular-nums">99.984%</span>
             </div>
          </div>
          <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col gap-1">
             <span className="text-[7px] text-gray-600 font-black uppercase tracking-tighter">Power_Vector</span>
             <div className="flex items-center gap-2">
                <Target size={12} className="text-ai-accent" />
                <span className="text-[8px] text-white font-black tracking-tighter">SOL_CORE_OUT</span>
             </div>
          </div>
      </div>

      {isAllocating && (
        <div className="py-4 flex flex-col items-center justify-center text-orange-500/60 space-y-2 bg-orange-500/[0.03] border border-orange-500/10 rounded animate-pulse">
           <FlaskConical size={20} />
           <span className="text-[7px] font-black uppercase tracking-[0.2em]">Verifying Ethical Clearances...</span>
        </div>
      )}

      {result && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
           <div className="bg-orange-500/5 border border-orange-500/20 p-2 rounded space-y-2">
              <div className="flex justify-between items-center text-[7px] font-black uppercase">
                 <span className="text-gray-500">Status: {result.status}</span>
                 <span className={`${pulse ? 'text-orange-400' : 'text-orange-600'} flex items-center gap-1 transition-colors`}>
                   <Radio size={8} /> FLUX_ACTIVE
                 </span>
              </div>
              
              <div className="p-1.5 bg-black/60 border border-white/5 rounded">
                 <div className="text-[6px] text-gray-600 font-black uppercase mb-0.5">Allocation_ZKP</div>
                 <div className="text-[8px] text-orange-200/70 truncate tabular-nums font-mono">
                   {result.zkProof}
                 </div>
              </div>

              <div className="flex items-center justify-between text-[7px] font-bold uppercase">
                 <span className="text-gray-600">Target_Node</span>
                 <span className="text-orange-300">{result.target}</span>
              </div>
              <div className="flex items-center justify-between text-[7px] font-bold uppercase">
                 <span className="text-gray-600">Flux_Intensity</span>
                 <span className="text-white tabular-nums">{result.allocatedJoules.toLocaleString()} PJ</span>
              </div>
           </div>

           <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded text-[8px] font-black uppercase">
              <CheckCircle2 size={10} /> Species-Benefit Validated by Sentinel
           </div>
        </div>
      )}

      {errorReason && (
        <div className="bg-red-500/10 border border-red-500/30 p-2 rounded flex flex-col gap-1 animate-in zoom-in-95">
           <div className="flex items-center gap-2 text-red-500">
              <ShieldAlert size={14} />
              <span className="text-[8px] font-black uppercase tracking-widest">Ethical_Violation_Detected</span>
           </div>
           <p className="text-[9px] text-gray-400 leading-tight italic">
             "{errorReason}"
           </p>
        </div>
      )}

      <div className="mt-1 pt-2 border-t border-white/5 flex justify-between items-center text-[7px] text-gray-700 font-black uppercase">
         <div className="flex items-center gap-2">
            <ShieldCheck size={10} className="text-orange-500" /> Stellar_Authority: L0_ROOT
         </div>
         <span className="text-orange-500">Flux_Redirection_Armed</span>
      </div>
    </div>
  );
};

export default DysonSwarmMonitor;