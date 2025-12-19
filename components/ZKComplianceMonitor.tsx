
import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Lock, Fingerprint, Loader2, CheckCircle2, ShieldAlert, Key } from 'lucide-react';
import { generateComplianceProof, getMockIdentity } from '../services/ZKComplianceEngine';
import { TradeIntent, ZKComplianceProof } from '../types';

export const ZKComplianceMonitor: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [proof, setProof] = useState<ZKComplianceProof | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runComplianceCheck = async () => {
    setIsVerifying(true);
    setError(null);
    setProof(null);

    const identity = getMockIdentity();
    const trade: TradeIntent = {
      symbol,
      action: 'MARKET_BUY',
      quantity: 1.0,
      reasoning: 'Forensic cluster identified',
      hash: `tx_${Math.random().toString(36).substr(2, 12)}`
    };

    try {
      const result = await generateComplianceProof(identity, trade);
      setProof(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-[#050505] border border-ai-accent/20 rounded-lg p-3 font-mono flex flex-col gap-3 shadow-2xl relative overflow-hidden group">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
             <ShieldCheck size={12} className="text-emerald-500" />
          </div>
          <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">ZK_Compliance_v6.0</span>
        </div>
        <button 
          onClick={runComplianceCheck}
          disabled={isVerifying}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${
            isVerifying ? 'bg-gray-800 text-gray-500 cursor-wait' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white'
          }`}
        >
          {isVerifying ? <Loader2 size={10} className="animate-spin" /> : <Lock size={10} />}
          Verify_Eligibility
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col gap-1">
             <span className="text-[7px] text-gray-600 font-black uppercase tracking-tighter">Private_ID_Lock</span>
             <div className="flex items-center gap-2">
                <Fingerprint size={12} className="text-ai-accent" />
                <span className="text-[9px] text-white truncate tabular-nums">ID-PROD-9982-AX</span>
             </div>
          </div>
          <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col gap-1">
             <span className="text-[7px] text-gray-600 font-black uppercase tracking-tighter">SNARK_Status</span>
             <div className={`text-[9px] font-black uppercase flex items-center gap-1.5 ${proof ? 'text-emerald-500' : error ? 'text-red-500' : 'text-gray-600'}`}>
                {proof ? <CheckCircle2 size={10} /> : error ? <ShieldAlert size={10} /> : <div className="w-2 h-2 rounded-full bg-gray-800" />}
                {proof ? 'VERIFIED' : error ? 'REJECTED' : 'IDLE'}
             </div>
          </div>
      </div>

      {proof && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-2 rounded animate-in zoom-in-95 duration-300">
           <div className="flex items-center gap-2 mb-1.5">
              <Key size={10} className="text-emerald-500" />
              <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">Eligibility_Proof_Generated</span>
           </div>
           <div className="text-[8px] text-gray-500 break-all font-mono leading-tight bg-black/40 p-1.5 rounded border border-white/5">
              {proof.proof}
           </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-2 rounded flex items-center gap-2 text-red-500 animate-pulse">
           <ShieldAlert size={14} />
           <span className="text-[8px] font-black uppercase tracking-widest">{error}</span>
        </div>
      )}

      <div className="mt-1 pt-2 border-t border-white/5 flex justify-between items-center text-[7px] text-gray-700 font-black uppercase">
         <div className="flex items-center gap-2">
            <UserCheck size={10} className="text-emerald-500" /> Identity_Shield: Active
         </div>
         <span className="text-ai-accent">SNARK_v2_Optimized</span>
      </div>
    </div>
  );
};
