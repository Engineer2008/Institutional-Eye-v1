
import React, { useState, useEffect } from 'react';
import { Infinity, Boxes, Sparkles, Zap, Loader2, CheckCircle2, ShieldAlert, Binary, FlaskConical, Atom, Waves } from 'lucide-react';
import { bridgeRealities } from '../services/OmegaLogicEngine';
import { MultiverseState, OmegaBridgeResult } from '../types';

export const OmegaRealityMonitor: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [result, setResult] = useState<OmegaBridgeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [phase, setPhase] = useState<'IDLE' | 'SEARCHING' | 'VERIFYING' | 'COLLAPSING'>('IDLE');

  const startBridge = async () => {
    setIsProcessing(true);
    setResult(null);
    setError(null);
    setPhase('SEARCHING');

    const target: MultiverseState = {
      intentID: `OMEGA-${Date.now()}`,
      desiredOutcome: `Absolute liquidity convergence for the ${symbol} ecosystem across all reachable dimensions.`,
      probabilityFloor: 0.9999
    };

    try {
      // Simulate phase progression for UI fidelity
      setTimeout(() => setPhase('VERIFYING'), 1800);
      setTimeout(() => setPhase('COLLAPSING'), 3800);
      
      const response = await bridgeRealities(target);
      
      if (response.status === 'DIVERGENT') {
        setError((response as any).reason);
        setPhase('IDLE');
      } else {
        setResult(response as OmegaBridgeResult);
        setPhase('IDLE');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#050505] border border-purple-500/40 rounded-lg p-3 font-mono flex flex-col gap-3 shadow-[0_0_50px_rgba(168,85,247,0.2)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-purple-500/[0.04] pointer-events-none" />
      
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2 text-purple-400">
          <div className="p-1.5 bg-purple-500/10 rounded border border-purple-500/20">
             <Infinity size={12} className={isProcessing ? "animate-spin-slow" : ""} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Omega_Logic_v10.0</span>
        </div>
        <button 
          onClick={startBridge}
          disabled={isProcessing || result?.status === 'COLLAPSED'}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${
            isProcessing || result?.status === 'COLLAPSED' ? 'bg-gray-800 text-gray-500' : 'bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500 hover:text-white shadow-neon-purple'
          }`}
        >
          {isProcessing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
          {result?.status === 'COLLAPSED' ? 'Reality_Merged' : 'Initiate_State_Collapse'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col gap-1">
             <span className="text-[7px] text-gray-600 font-black uppercase tracking-tighter">Manifold_Depth</span>
             <div className="flex items-center gap-2">
                <Boxes size={12} className="text-purple-500" />
                <span className="text-[9px] text-white font-bold tabular-nums">∞_DIMENSIONS</span>
             </div>
          </div>
          <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col gap-1">
             <span className="text-[7px] text-gray-600 font-black uppercase tracking-tighter">Wavefunction</span>
             <div className="flex items-center gap-2">
                <Waves size={12} className="text-ai-accent" />
                <span className="text-[8px] text-white font-black tracking-tighter">SUPERPOSITION</span>
             </div>
          </div>
      </div>

      {isProcessing && (
        <div className="py-4 flex flex-col items-center justify-center text-purple-500/60 space-y-2 bg-purple-500/[0.03] border border-purple-500/10 rounded animate-pulse">
           <Atom size={20} className="animate-spin-slow" />
           <span className="text-[7px] font-black uppercase tracking-[0.2em]">
             {phase === 'SEARCHING' ? 'Searching Multiverse Manifold...' : 
              phase === 'VERIFYING' ? 'Verifying Universal Stability...' : 
              'Collapsing Reality Wavefunction...'}
           </span>
        </div>
      )}

      {result && (
        <div className="space-y-2 animate-in zoom-in-95 duration-700">
           <div className="bg-purple-500/5 border border-purple-500/20 p-2 rounded space-y-2">
              <div className="flex justify-between items-center text-[7px] font-black uppercase">
                 <span className="text-gray-500">Status: {result.status}</span>
                 <span className="text-purple-400 flex items-center gap-1">
                   <Zap size={8} /> QUANTUM_LOCKED
                 </span>
              </div>
              
              <div className="p-1.5 bg-black/60 border border-white/5 rounded">
                 <div className="text-[6px] text-gray-600 font-black uppercase mb-0.5">Universal_Stability_ZKP</div>
                 <div className="text-[8px] text-purple-200/70 truncate tabular-nums font-mono">
                   {result.stabilityProof.proofHash}
                 </div>
              </div>

              <div className="flex items-center justify-between text-[7px] font-bold uppercase">
                 <span className="text-gray-600">Reality_Skew</span>
                 <span className="text-emerald-300 tabular-nums">{result.stabilityProof.universalSkew.toFixed(12)}</span>
              </div>
              <div className="flex items-center justify-between text-[7px] font-bold uppercase">
                 <span className="text-gray-600">State_Energy</span>
                 <span className="text-white tabular-nums">1.42e42 Ω</span>
              </div>
           </div>

           <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded text-[8px] font-black uppercase">
              <CheckCircle2 size={10} /> Omega Consensus Achieved: States Merged
           </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-2 rounded flex flex-col gap-1 animate-in zoom-in-95">
           <div className="flex items-center gap-2 text-red-500">
              <ShieldAlert size={14} />
              <span className="text-[8px] font-black uppercase tracking-widest">Bridging_Failure</span>
           </div>
           <p className="text-[9px] text-gray-400 leading-tight italic">
             "{error}"
           </p>
        </div>
      )}

      <div className="mt-1 pt-2 border-t border-white/5 flex justify-between items-center text-[7px] text-gray-700 font-black uppercase">
         <div className="flex items-center gap-2">
            <FlaskConical size={10} className="text-purple-500" /> Chronicler_Authority: L10_OMEGA
         </div>
         <span className="text-purple-400">Multiverse_Sync_Stabilized</span>
      </div>
    </div>
  );
};
