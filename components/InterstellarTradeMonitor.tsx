
import React, { useState, useEffect } from 'react';
import { Rocket, Zap, Timer, Globe, Binary, ShieldCheck, Loader2, CheckCircle2, Milestone, Gauge, FlaskConical, Atom } from 'lucide-react';
import { executeInterstellarTrade } from '../services/InterstellarSettlementEngine';
import { CivilizationalIntent, InterstellarTradeResult } from '../types';

export const InterstellarTradeMonitor: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [tradeResult, setTradeResult] = useState<InterstellarTradeResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const startTrade = async () => {
    setIsProcessing(true);
    setTradeResult(null);
    
    const intent: CivilizationalIntent = {
      id: `CIV-${Date.now()}`,
      jouleRequirement: 750, // 750 Terajoules for higher security
      action: 'ATOMIC_LIQUIDITY_SETTLEMENT',
      targetNode: 'MARS_CENTRAL_LEDGER',
      timestamp: Date.now()
    };

    try {
      const result = await executeInterstellarTrade(intent);
      setTradeResult(result);
      setCountdown(30); // Demo countdown
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (tradeResult && countdown === 0 && tradeResult.status === 'DISPATCHED') {
      setTradeResult({ ...tradeResult, status: 'SETTLED' });
    }
  }, [countdown, tradeResult]);

  return (
    <div className="bg-[#050505] border border-orange-500/20 rounded-lg p-3 font-mono flex flex-col gap-3 shadow-[0_0_20px_rgba(249,115,22,0.1)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-orange-500/[0.02] pointer-events-none" />
      
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-500/10 rounded border border-orange-500/20">
             <Atom size={12} className="text-orange-400 animate-pulse" />
          </div>
          <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Deep_Time_Settlement_v7.0</span>
        </div>
        <button 
          onClick={startTrade}
          disabled={isProcessing || (tradeResult?.status === 'DISPATCHED')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${
            isProcessing || (tradeResult?.status === 'DISPATCHED') ? 'bg-gray-800 text-gray-500' : 'bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500 hover:text-white'
          }`}
        >
          {isProcessing ? <Loader2 size={10} className="animate-spin" /> : <Rocket size={10} />}
          {tradeResult?.status === 'DISPATCHED' ? 'Mesh_Broadcast_Active' : 'Initiate_Energy_Proof'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col gap-1">
             <span className="text-[7px] text-gray-600 font-black uppercase tracking-tighter">Energy_Payload</span>
             <div className="flex items-center gap-2">
                <Gauge size={12} className="text-orange-500" />
                <span className="text-[9px] text-white font-bold tabular-nums">750.00 TJ</span>
             </div>
          </div>
          <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col gap-1">
             <span className="text-[7px] text-gray-600 font-black uppercase tracking-tighter">Target_Ledger</span>
             <div className="flex items-center gap-2">
                <Globe size={12} className="text-ai-accent" />
                <span className="text-[8px] text-white font-black tracking-tighter">MARS_CENTRAL</span>
             </div>
          </div>
      </div>

      {isProcessing && (
        <div className="py-4 flex flex-col items-center justify-center text-orange-500/60 space-y-2 bg-orange-500/[0.03] border border-orange-500/10 rounded animate-pulse">
           <FlaskConical size={20} />
           <span className="text-[7px] font-black uppercase tracking-[0.2em]">Synthesizing Energy-Based ZK-Proof...</span>
        </div>
      )}

      {tradeResult && (
        <div className="space-y-2 animate-in zoom-in-95 duration-300">
           <div className="bg-orange-500/5 border border-orange-500/20 p-2 rounded space-y-2">
              <div className="flex justify-between items-center text-[7px] font-black uppercase">
                 <span className="text-gray-500">Status: {tradeResult.status}</span>
                 <span className="text-orange-400 flex items-center gap-1">
                   <Timer size={8} /> RELATIVISTIC_ETA: {countdown}s
                 </span>
              </div>
              
              <div className="p-1.5 bg-black/60 border border-white/5 rounded">
                 <div className="text-[6px] text-gray-600 font-black uppercase mb-0.5">Energy_Solvency_Certificate</div>
                 <div className="text-[8px] text-orange-200/70 truncate tabular-nums font-mono">
                   {tradeResult.energyProof}
                 </div>
              </div>

              <div className="flex items-center justify-between text-[7px] font-bold uppercase">
                 <span className="text-gray-600">Dilation_Skew (Δt')</span>
                 <span className="text-orange-300">+{tradeResult.timeDilationOffset.toFixed(8)}s</span>
              </div>
           </div>

           {tradeResult.status === 'SETTLED' && (
              <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded text-[8px] font-black uppercase animate-in fade-in">
                 <CheckCircle2 size={10} /> Intent Finalized at Mars Central Ledger
              </div>
           )}
        </div>
      )}

      <div className="mt-1 pt-2 border-t border-white/5 flex justify-between items-center text-[7px] text-gray-700 font-black uppercase">
         <div className="flex items-center gap-2">
            <ShieldCheck size={10} className="text-orange-500" /> Mesh_Integrity: VERIFIED
         </div>
         <span className="text-orange-400">Deep_Space_Mesh_Active</span>
      </div>
    </div>
  );
};
