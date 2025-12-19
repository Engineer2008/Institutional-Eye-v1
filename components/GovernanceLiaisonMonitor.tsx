
import React, { useState } from 'react';
import { Vote, ShieldCheck, Zap, Loader2, CheckCircle2, XCircle, Info, Scale, Fingerprint, BrainCircuit } from 'lucide-react';
import { evaluateProposal, getMockProposals } from '../services/GovernanceLiaisonEngine';
import { DAOProposal, GovernanceResult } from '../types';

export const GovernanceLiaisonMonitor: React.FC = () => {
  const [proposals] = useState<DAOProposal[]>(getMockProposals());
  const [results, setResults] = useState<Record<string, GovernanceResult>>({});
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  const handleEvaluate = async (prop: DAOProposal) => {
    setProcessing(prev => ({ ...prev, [prop.id]: true }));
    try {
      const result = await evaluateProposal(prop);
      setResults(prev => ({ ...prev, [prop.id]: result }));
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(prev => ({ ...prev, [prop.id]: false }));
    }
  };

  return (
    <div className="bg-[#050505] border border-ai-accent/20 rounded-lg p-3 font-mono flex flex-col gap-3 shadow-xl relative overflow-hidden group">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-500/10 rounded border border-purple-500/20">
             <Scale size={12} className="text-purple-400" />
          </div>
          <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Gov_Liaison_v6.0</span>
        </div>
        <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-500 uppercase">
           <BrainCircuit size={10} className="animate-pulse" /> Autonomy_Active
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto custom-scrollbar max-h-[220px]">
        {proposals.map((prop) => {
          const isProcessing = processing[prop.id];
          const result = results[prop.id];

          return (
            <div key={prop.id} className="bg-black/40 border border-white/5 p-3 rounded flex flex-col gap-2 group/prop hover:border-ai-accent/30 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                   <span className="text-[7px] text-gray-600 font-black uppercase mb-0.5">{prop.category} // {prop.id}</span>
                   <h4 className="text-[10px] font-black text-white leading-tight">{prop.title}</h4>
                </div>
                {!result ? (
                  <button 
                    onClick={() => handleEvaluate(prop)}
                    disabled={isProcessing}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${
                      isProcessing ? 'bg-gray-800 text-gray-500' : 'bg-ai-accent/10 text-ai-accent border border-ai-accent/30 hover:bg-ai-accent hover:text-white'
                    }`}
                  >
                    {isProcessing ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                    Run_Audit
                  </button>
                ) : (
                  <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase ${result.status === 'VOTED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {result.status === 'VOTED' ? <CheckCircle2 size={10} /> : <Info size={10} />}
                    {result.status}
                  </div>
                )}
              </div>

              {!result && !isProcessing && (
                <p className="text-[8px] text-gray-500 italic line-clamp-1">{prop.description}</p>
              )}

              {result && (
                <div className="mt-1 space-y-2 animate-in fade-in zoom-in-95 duration-300">
                   {result.status === 'VOTED' && (
                     <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 p-1.5 rounded">
                        <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">
                          Cast_Vote: {result.voteCast}
                        </span>
                        <div className="flex items-center gap-1 text-[8px] text-gray-600 font-mono">
                           <Fingerprint size={10} />
                           {result.ballotHash?.substring(0, 12)}...
                        </div>
                     </div>
                   )}
                   <div className="bg-black/60 p-2 rounded border border-white/5">
                      <div className="text-[7px] text-gray-700 font-black uppercase mb-1">Impact_Reasoning</div>
                      <p className="text-[9px] text-gray-400 leading-relaxed italic">
                        "{result.reason}"
                      </p>
                   </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-1 pt-2 border-t border-white/5 flex justify-between items-center text-[7px] text-gray-700 font-black uppercase">
         <div className="flex items-center gap-2">
            <ShieldCheck size={10} className="text-emerald-500" /> Delegate_Rights: Verified
         </div>
         <span className="text-ai-accent">L0_DAO_Synchronizer</span>
      </div>
    </div>
  );
};
