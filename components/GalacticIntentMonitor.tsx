
import React, { useState, useEffect } from 'react';
import { Atom, Globe, Zap, Maximize, Infinity, Star, Loader2, CheckCircle2, ShieldAlert, Binary, Radio, Cpu } from 'lucide-react';
import { executeGalacticIntent } from '../services/GalacticSettlementEngine';
import { GalacticIntent, GalacticDispatchResult } from '../types';

export const GalacticIntentMonitor: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [result, setResult] = useState<GalacticDispatchResult | null>(null);
  const [rejection, setRejection] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [phase, setPhase] = useState<'IDLE' | 'STABILIZING' | 'CONSENSUS' | 'DISPATCHING'>('IDLE');

  const startReallocation = async () => {
    setIsProcessing(true);
    setResult(null);
    setRejection(null);
    setPhase('STABILIZING');

    const intent: GalacticIntent = {
      id: `GAL-${Date.now()}`,
      sourceID: 'SOL_SYSTEM_TERRA',
      targetID: 'ALPHA_CENTAURI_HUB',
      targetCoordinates: 'GC-9921-X-442',
      joules: 5.8e32, // Yottajoules
      reasoning: `Establishing inter-galactic liquidity bridge for the ${symbol} protocol to hedge against heat-death volatility in the local cluster.`
    };

    try {
      // Logic Hook: Phase progression simulation for UI
      setTimeout(() => setPhase('CONSENSUS'), 1800);
      
      const response = await executeGalacticIntent(intent);
      
      if (response.status === 'REJECTED') {
        setRejection((response as any).narrative);
      } else {
        setResult(response as GalacticDispatchResult);
        setPhase('IDLE');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#050505] border border-indigo-500/30 rounded-lg p-3 font-mono flex flex-col gap-3 shadow-[0_0_40px_rgba(99,102,241,0.15)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-indigo-500/[0.03] pointer-events-none" />
      
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2 text-indigo-400">
          <div className="p-1.5 bg-indigo-500/10 rounded border border-indigo-500/20">
             <Star size={12} className={isProcessing ? "animate-pulse" : ""} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Galactic_Logic_v9.0</span>
        </div>
        <button 
          onClick={startReallocation}
          disabled={isProcessing || result?.status === 'SWAP_COMPLETE'}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${
            isProcessing || result?.status === 'SWAP_COMPLETE' ? 'bg-gray-800 text-gray-500' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white shadow-neon-blue'
          }`}
        >
          {isProcessing ? <Loader2 size={10} className="animate-spin" /> : <Maximize size={10} />}
          {result?.status === 'SWAP_COMPLETE' ? 'State_Swapped' : 'Execute_Superluminal_Intent'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col gap-1">
             <span className="text-[7px] text-gray-600 font-black uppercase tracking-tighter">Manifold_Curvature</span>
             <div className="flex items-center gap-2">
                <Infinity size={12} className="text-indigo-500" />
                <span className="text-[9px] text-white font-bold tabular-nums">0.99999...</span>
             </div>
          </div>
          <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col gap-1">
             <span className="text-[7px] text-gray-600 font-black uppercase tracking-tighter">Consensus_Quorum</span>
             <div className="flex items-center gap-2">
                <Radio size={12} className="text-cyan-500" />
                <span className="text-[8px] text-white font-black tracking-tighter">L9_COUNCIL_LOCKED</span>
             </div>
          </div>
      </div>

      {isProcessing && (
        <div className="py-4 flex flex-col items-center justify-center text-indigo-500/60 space-y-2 bg-indigo-500/[0.03] border border-indigo-500/10 rounded animate-pulse">
           <Cpu size={20} className="animate-spin-slow" />
           <span className="text-[7px] font-black uppercase tracking-[0.2em]">
             {phase === 'STABILIZING' ? 'Stabilizing Space-Time Curvature...' : 'Querying Hive Mind Quorum...'}
           </span>
        </div>
      )}

      {result && (
        <div className="space-y-2 animate-in zoom-in-95 duration-500">
           <div className="bg-indigo-500/5 border border-indigo-500/20 p-2 rounded space-y-2">
              <div className="flex justify-between items-center text-[7px] font-black uppercase">
                 <span className="text-gray-500">Status: {result.status}</span>
                 <span className="text-indigo-400 flex items-center gap-1">
                   <Star size={8} /> ATOMIC_SETTLED
                 </span>
              </div>
              
              <div className="p-1.5 bg-black/60 border border-white/5 rounded">
                 <div className="text-[6px] text-gray-600 font-black uppercase mb-0.5">Manifold_Proof_Hash</div>
                 <div className="text-[8px] text-indigo-200/70 truncate tabular-nums font-mono">
                   {result.manifoldProof}
                 </div>
              </div>

              <div className="flex items-center justify-between text-[7px] font-bold uppercase">
                 <span className="text-gray-600">Transit_Latency</span>
                 <span className="text-cyan-300 tabular-nums">0.00042μs</span>
              </div>
              <div className="flex items-center justify-between text-[7px] font-bold uppercase">
                 <span className="text-gray-600">Reallocated_Mass</span>
                 <span className="text-white tabular-nums">5.8e32 J</span>
              </div>
           </div>

           <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded text-[8px] font-black uppercase">
              <CheckCircle2 size={10} /> Galactic Consensus Verified via ZK-Proof
           </div>
        </div>
      )}

      {rejection && (
        <div className="bg-red-500/10 border border-red-500/30 p-2 rounded flex flex-col gap-1 animate-in slide-in-from-top-2">
           <div className="flex items-center gap-2 text-red-500">
              <ShieldAlert size={14} />
              <span className="text-[8px] font-black uppercase tracking-widest">Quorum_Veto_Detected</span>
           </div>
           <p className="text-[9px] text-gray-400 leading-tight italic">
             "{rejection}"
           </p>
        </div>
      )}

      <div className="mt-1 pt-2 border-t border-white/5 flex justify-between items-center text-[7px] text-gray-700 font-black uppercase">
         <div className="flex items-center gap-2">
            <Atom size={10} className="text-indigo-500 animate-spin-slow" /> Transit_Authority: GALACTIC_HUB
         </div>
         <span className="text-indigo-400">Zero_Latency_Relay_Synced</span>
      </div>
    </div>
  );
};
