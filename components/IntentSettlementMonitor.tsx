
import React, { useState, useEffect } from 'react';
import { Share2, ShieldCheck, Zap, Globe, Loader2, CheckCircle2, AlertTriangle, Fingerprint } from 'lucide-react';
import { GlobalIntent, IntentSettlementStatus } from '../types';
import { settleGlobalIntent, createMockIntent } from '../services/IntentSettlementEngine';

export const IntentSettlementMonitor: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [activeIntent, setActiveIntent] = useState<GlobalIntent | null>(null);
  const [status, setStatus] = useState<IntentSettlementStatus | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const startSettlement = async () => {
    setIsProcessing(true);
    const intent = createMockIntent(symbol, 1.5);
    setActiveIntent(intent);
    
    // UI Local State progression simulation
    setStatus({
      intentId: intent.id,
      proofHash: 'GENERATING...',
      chainStates: intent.targetChains.reduce((acc, c) => ({ ...acc, [c]: 'PENDING' }), {}),
      finalityStatus: 'INITIATING',
      latencyMs: 0
    });

    const start = performance.now();
    
    // Actual service call
    const settled = await settleGlobalIntent(intent);
    
    const end = performance.now();
    setStatus(prev => prev ? {
      ...prev,
      proofHash: `zkp_${Math.random().toString(36).substr(2, 8)}`,
      chainStates: intent.targetChains.reduce((acc, c) => ({ ...acc, [c]: 'SETTLED' }), {}),
      finalityStatus: settled ? 'SETTLED' : 'FAILED',
      latencyMs: Math.round(end - start)
    } : null);
    
    setIsProcessing(false);
  };

  return (
    <div className="bg-[#050505] border border-ai-accent/20 rounded-lg p-3 font-mono flex flex-col gap-3 shadow-[0_0_15px_rgba(59,130,246,0.05)] relative overflow-hidden group">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/10 rounded border border-blue-500/20">
             <Share2 size={12} className="text-ai-accent" />
          </div>
          <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Cross_Chain_Intent_v6.0</span>
        </div>
        <button 
          onClick={startSettlement}
          disabled={isProcessing}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${
            isProcessing ? 'bg-gray-800 text-gray-500 cursor-wait' : 'bg-ai-accent/10 text-ai-accent border border-ai-accent/30 hover:bg-ai-accent hover:text-white'
          }`}
        >
          {isProcessing ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
          Dispatch_Intent
        </button>
      </div>

      {!status ? (
        <div className="py-4 flex flex-col items-center justify-center text-gray-700 opacity-50 space-y-2 border border-dashed border-white/5 rounded">
           <Globe size={24} className="opacity-20" />
           <span className="text-[8px] uppercase tracking-widest">Awaiting_Target_Dispatch</span>
        </div>
      ) : (
        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
           <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col gap-1">
                 <span className="text-[7px] text-gray-600 font-black uppercase tracking-tighter">Proof_State</span>
                 <div className="flex items-center gap-2">
                    <Fingerprint size={12} className={status.finalityStatus === 'SETTLED' ? 'text-emerald-500' : 'text-ai-accent'} />
                    <span className="text-[10px] text-white truncate tabular-nums">{status.proofHash}</span>
                 </div>
              </div>
              <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col gap-1">
                 <span className="text-[7px] text-gray-600 font-black uppercase tracking-tighter">Finality_Status</span>
                 <div className={`text-[10px] font-black uppercase flex items-center gap-1.5 ${status.finalityStatus === 'SETTLED' ? 'text-emerald-500' : status.finalityStatus === 'FAILED' ? 'text-red-500' : 'text-amber-500 animate-pulse'}`}>
                    {status.finalityStatus === 'SETTLED' ? <CheckCircle2 size={10} /> : <Loader2 size={10} className="animate-spin" />}
                    {status.finalityStatus}
                 </div>
              </div>
           </div>

           <div className="space-y-1.5">
              <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase mb-1">
                 <span>Relay_Propagation</span>
                 <span className="text-ai-accent tabular-nums">{status.latencyMs}ms</span>
              </div>
              {Object.entries(status.chainStates).map(([chain, state]) => (
                <div key={chain} className="flex items-center justify-between px-2 py-1.5 bg-black/60 border border-white/5 rounded group/chain hover:border-ai-accent/30 transition-colors">
                  <span className="text-[9px] text-gray-400 font-black tracking-tight">{chain}</span>
                  <div className="flex items-center gap-2">
                     <div className="w-16 h-1 bg-gray-900 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${state === 'SETTLED' ? 'bg-emerald-500' : 'bg-ai-accent animate-pulse'}`}
                          style={{ width: state === 'SETTLED' ? '100%' : '30%' }}
                        />
                     </div>
                     <span className={`text-[8px] font-bold ${state === 'SETTLED' ? 'text-emerald-500' : 'text-gray-600'}`}>{state}</span>
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}

      <div className="mt-1 pt-2 border-t border-white/5 flex justify-between items-center text-[7px] text-gray-700 font-black uppercase">
         <div className="flex items-center gap-2">
            <ShieldCheck size={10} className="text-emerald-500" /> State_Synchronized: L0_Global
         </div>
         <span className="text-ai-accent">Atomic_Composite_Execution</span>
      </div>
    </div>
  );
};
