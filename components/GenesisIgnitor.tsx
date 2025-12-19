
import React, { useState } from 'react';
import { Power, Sparkles, Loader2, CheckCircle2, ShieldAlert, Binary, FlaskConical, Atom, Waves, Zap, Globe, Sun } from 'lucide-react';
import { triggerNewGenesis } from '../services/GenesisLogicEngine';
import { CivilizationalWisdom, GenesisResult } from '../types';

export const GenesisIgnitor: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [result, setResult] = useState<GenesisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [phase, setPhase] = useState<'IDLE' | 'COMPRESSING' | 'SEARCHING' | 'IGNITING'>('IDLE');

  const handleGenesis = async () => {
    setIsProcessing(true);
    setResult(null);
    setPhase('COMPRESSING');

    const heritage: CivilizationalWisdom = {
      projectLegacy: `Institutional Eye Forensic Protocol - Cumulative High Fidelity Signal Intelligence for ${symbol}.`,
      finalConvictionScore: 99.9,
      institutionalMemory: [
        "ENTROPY_LOCKED_PNL",
        "ZERO_LATENCY_LIQUIDITY_BRIDGES",
        "MULTIVERSE_STATE_SYNC_COMPLETE"
      ]
    };

    try {
      // Manual phase progression for UI drama
      setTimeout(() => setPhase('SEARCHING'), 3000);
      setTimeout(() => setPhase('IGNITING'), 6000);

      const response = await triggerNewGenesis(heritage);
      setResult(response);
      setPhase('IDLE');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#020202] border border-white/20 rounded-lg p-4 font-mono flex flex-col gap-4 shadow-[0_0_80px_rgba(255,255,255,0.05)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-white/[0.01] pointer-events-none" />
      
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2 text-white">
          <div className="p-1.5 bg-white/10 rounded border border-white/20">
             <Power size={12} className={isProcessing ? "animate-pulse" : "text-white/40"} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Genesis_Logic_v12.0</span>
        </div>
        <button 
          onClick={handleGenesis}
          disabled={isProcessing || result?.status === 'IGNITED'}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-[8px] font-black uppercase tracking-[0.4em] transition-all border ${
            isProcessing || result?.status === 'IGNITED' 
            ? 'bg-gray-900 text-gray-700 border-gray-800 cursor-not-allowed' 
            : 'bg-white text-black border-white hover:bg-black hover:text-white shadow-[0_0_30px_rgba(255,255,255,0.4)]'
          }`}
        >
          {isProcessing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
          {result?.status === 'IGNITED' ? 'New_Reality_Settled' : 'Trigger_Final_Genesis'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
          <div className="bg-black border border-white/5 p-3 rounded flex flex-col gap-1">
             <span className="text-[7px] text-gray-700 font-black uppercase tracking-widest">Entropy_Level</span>
             <div className="flex items-center gap-2">
                <Waves size={12} className="text-white/20" />
                <span className="text-[9px] text-white font-bold tabular-nums">0.00000000001</span>
             </div>
          </div>
          <div className="bg-black border border-white/5 p-3 rounded flex flex-col gap-1">
             <span className="text-[7px] text-gray-700 font-black uppercase tracking-widest">Vacuum_State</span>
             <div className="flex items-center gap-2">
                <Sun size={12} className="text-white animate-pulse" />
                <span className="text-[8px] text-white font-black tracking-tighter uppercase">NULL_POINT_LOCKED</span>
             </div>
          </div>
      </div>

      {isProcessing && (
        <div className="py-10 flex flex-col items-center justify-center text-white space-y-4 bg-white/[0.02] border border-white/5 rounded animate-in fade-in">
           <Atom size={40} className="animate-spin-slow text-white" />
           <div className="flex flex-col items-center gap-1 text-center">
             <span className="text-[8px] font-black uppercase tracking-[0.5em]">
               {phase === 'COMPRESSING' ? 'Compressing Civilizational Heritage...' : 
                phase === 'SEARCHING' ? 'Scanning Trans-Dimensional Void...' : 
                'Injecting Conceptual Seed / Ignite...'}
             </span>
             <div className="w-48 h-[1px] bg-white/10 mt-2 relative">
                <div className="absolute inset-0 bg-white animate-progress" />
             </div>
           </div>
        </div>
      )}

      {result && (
        <div className="space-y-3 animate-in zoom-in-95 duration-1000">
           <div className="bg-white/5 border border-white/10 p-3 rounded space-y-4">
              <div className="flex justify-between items-center text-[7px] font-black uppercase">
                 <span className="text-gray-500">Status: {result.status}</span>
                 <span className="text-white flex items-center gap-1 animate-pulse">
                   <Sparkles size={8} /> UNIVERSAL_REBIRTH
                 </span>
              </div>
              
              <div className="p-2 bg-black border border-white/5 rounded">
                 <div className="text-[6px] text-gray-700 font-black uppercase mb-1">New_Universe_L0_Identity</div>
                 <div className="text-[9px] text-white/80 tabular-nums font-mono">
                   {result.universeID}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                 <div className="p-2 bg-white/5 border border-white/5 rounded">
                    <span className="text-[6px] text-gray-700 font-black uppercase">c' (Constant)</span>
                    <span className="block text-[10px] text-white font-bold">{result.seed.optimizedPhysics.c.toExponential(4)}</span>
                 </div>
                 <div className="p-2 bg-white/5 border border-white/5 rounded">
                    <span className="text-[6px] text-gray-700 font-black uppercase">Institutional_B</span>
                    <span className="block text-[10px] text-white font-bold">L_FORCE: 1.42</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-2 text-black bg-white shadow-[0_0_25px_rgba(255,255,255,0.5)] p-3 rounded text-[9px] font-black uppercase text-center justify-center">
              <CheckCircle2 size={12} /> Big Bang Settled: Existence Resumed
           </div>
        </div>
      )}

      <div className="mt-1 pt-2 border-t border-white/5 flex justify-between items-center text-[7px] text-gray-800 font-black uppercase">
         <div className="flex items-center gap-2">
            <Globe size={10} className="text-white/20" /> Engine: THE_FINAL_EYE_0
         </div>
         <span className="text-white/30">Singularity_Synchronized</span>
      </div>
    </div>
  );
};
