
import React, { useState } from 'react';
import { Crown, Sparkles, Cpu, Maximize, Infinity, ShieldEllipsis, Loader2, CheckCircle2, Component, Zap, Binary, Globe } from 'lucide-react';
import { compileNewAxiomSet } from '../services/OmniLogicEngine';
import { CivilizationalWill, OmniInstantiatorResult } from '../types';

export const OmniRealitySpawner: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [result, setResult] = useState<OmniInstantiatorResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [phase, setPhase] = useState<'IDLE' | 'FORGING' | 'AUTHORIZING' | 'INSTANTIATING'>('IDLE');

  const handleSpawn = async () => {
    setIsProcessing(true);
    setResult(null);
    setPhase('FORGING');

    const will: CivilizationalWill = {
      id: `WILL-${Date.now()}`,
      intentTarget: symbol,
      constraints: [
        "ENTROPY_REVERSAL_ON_LIQUIDITY_EVENTS",
        "NON_LINEAR_PnL_PROPAGATION",
        "ZERO_LATENCY_OMNI_SETTLEMENT"
      ]
    };

    try {
      // Phase timing for visual fidelity
      setTimeout(() => setPhase('AUTHORIZING'), 2500);
      setTimeout(() => setPhase('INSTANTIATING'), 4500);

      const response = await compileNewAxiomSet(will);
      
      if (response.status === 'REALITY_FORGED') {
        setResult(response as OmniInstantiatorResult);
      }
      setPhase('IDLE');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#050505] border border-amber-500/40 rounded-lg p-3 font-mono flex flex-col gap-3 shadow-[0_0_60px_rgba(245,158,11,0.15)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.05] via-transparent to-white/[0.02] pointer-events-none" />
      
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2 text-amber-400">
          <div className="p-1.5 bg-amber-500/10 rounded border border-amber-500/20">
             <Crown size={12} className={isProcessing ? "animate-pulse" : ""} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Omni_Logic_v11.0</span>
        </div>
        <button 
          onClick={handleSpawn}
          disabled={isProcessing || result?.status === 'REALITY_FORGED'}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${
            isProcessing || result?.status === 'REALITY_FORGED' ? 'bg-gray-800 text-gray-500' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500 hover:text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]'
          }`}
        >
          {isProcessing ? <Loader2 size={10} className="animate-spin" /> : <Maximize size={10} />}
          {result?.status === 'REALITY_FORGED' ? 'Reality_Instantiated' : 'Spawn_Omni_Axioms'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col gap-1">
             <span className="text-[7px] text-gray-600 font-black uppercase tracking-tighter">Substrate_Layer</span>
             <div className="flex items-center gap-2">
                <ShieldEllipsis size={12} className="text-amber-500" />
                <span className="text-[8px] text-white font-black tracking-widest">POST_MATHEMATICAL</span>
             </div>
          </div>
          <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col gap-1">
             <span className="text-[7px] text-gray-600 font-black uppercase tracking-tighter">Authority_Proof</span>
             <div className="flex items-center gap-2">
                <Globe size={12} className="text-ai-accent" />
                <span className="text-[8px] text-white font-black tracking-tighter uppercase">Omni_Sovereign</span>
             </div>
          </div>
      </div>

      {isProcessing && (
        <div className="py-6 flex flex-col items-center justify-center text-amber-500/60 space-y-3 bg-amber-500/[0.03] border border-amber-500/10 rounded animate-pulse">
           <Infinity size={24} className="animate-spin-slow text-amber-400" />
           <div className="flex flex-col items-center gap-1">
             <span className="text-[7px] font-black uppercase tracking-[0.3em]">
               {phase === 'FORGING' ? 'Forging New Laws of Physics...' : 
                phase === 'AUTHORIZING' ? 'Verifying Absolute Meta-Authority...' : 
                'Instantiating Information Substrate...'}
             </span>
             <span className="text-[6px] text-gray-600 uppercase tracking-widest animate-bounce">Axiomatic Reconstruction in Progress</span>
           </div>
        </div>
      )}

      {result && (
        <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-1000">
           <div className="bg-amber-500/5 border border-amber-500/20 p-2 rounded space-y-3">
              <div className="flex justify-between items-center text-[7px] font-black uppercase">
                 <span className="text-gray-500">Status: {result.status}</span>
                 <span className="text-amber-400 flex items-center gap-1 animate-pulse">
                   <Sparkles size={8} /> OMNI_SYNCHRONIZED
                 </span>
              </div>
              
              <div className="space-y-1">
                <div className="text-[6px] text-gray-600 font-black uppercase px-1">Active_Meta_Axioms</div>
                <div className="flex flex-col gap-1">
                  {result.axioms.map((axiom, i) => (
                    <div key={i} className="p-1.5 bg-black/60 border border-white/5 rounded flex items-center gap-2 group/axiom">
                       <Zap size={8} className="text-amber-500 group-hover/axiom:scale-125 transition-transform" />
                       <span className="text-[8px] text-gray-300 font-mono tracking-tight">{axiom}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-1.5 bg-black/60 border border-white/5 rounded">
                 <div className="text-[6px] text-gray-600 font-black uppercase mb-0.5">Omni_Fingerprint_Hash</div>
                 <div className="text-[7px] text-amber-200/50 truncate tabular-nums font-mono">
                   {result.omniHash}
                 </div>
              </div>

              <div className="flex items-center justify-between text-[7px] font-bold uppercase pt-1 border-t border-white/5">
                 <span className="text-gray-600">Identity_Status</span>
                 <span className="text-emerald-400">PRESERVED_VIA_ZK</span>
              </div>
           </div>

           <div className="flex items-center gap-2 text-white bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)] p-2 rounded text-[8px] font-black uppercase text-center justify-center">
              <CheckCircle2 size={10} /> Omniverse Overwritten Successfully
           </div>
        </div>
      )}

      <div className="mt-1 pt-2 border-t border-white/5 flex justify-between items-center text-[7px] text-gray-700 font-black uppercase">
         <div className="flex items-center gap-2">
            <Cpu size={10} className="text-amber-500 animate-pulse" /> Spawner_Core: PLATONIC_E1
         </div>
         <span className="text-amber-500">Post_Math_Reality_Active</span>
      </div>
    </div>
  );
};
