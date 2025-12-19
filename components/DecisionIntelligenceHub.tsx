
import React, { useState, useRef } from 'react';
import { Brain, Cpu, Activity, ShieldCheck, RefreshCw, AlertCircle, ChevronDown, ListFilter, FileText } from 'lucide-react';
import { IntelligenceCore } from '../services/IntelligenceCore';
import { ForensicData, IntelligenceReport, GlobalStrategicState } from '../types';

interface Props {
  symbol: string;
  history: ForensicData[];
  marketData: GlobalStrategicState[];
}

const DecisionIntelligenceHub: React.FC<Props> = ({ symbol, history, marketData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const core = useRef(new IntelligenceCore());

  const runAudit = async () => {
    setIsSyncing(true);
    const audit = await core.current.generateStrategicBriefing(symbol, history, marketData);
    setReport(audit);
    setIsSyncing(false);
  };

  return (
    <div className="relative font-mono">
      <button 
        onClick={() => { setIsOpen(!isOpen); if(!report) runAudit(); }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-black border transition-all ${isOpen ? 'bg-ai-accent text-white border-ai-accent' : 'bg-black/40 text-ai-accent border-ai-accent/30'}`}
      >
        <ShieldCheck size={14} className={isSyncing ? 'animate-spin' : ''} />
        AUDIT HUB
        <ChevronDown size={12} className={isOpen ? 'rotate-180' : ''} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-[400px] bg-[#020408] border border-ai-border rounded shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2">
            <div className="p-3 bg-ai-panel/50 border-b border-ai-border flex justify-between items-center">
              <span className="text-[10px] font-black text-white tracking-widest uppercase flex items-center gap-2">
                  <Cpu size={14} className="text-ai-accent" /> Structural Audit
              </span>
              <button onClick={runAudit} disabled={isSyncing} className="p-1 hover:text-white text-gray-600 transition-colors">
                  <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
               {report ? (
                 <div className="space-y-4">
                    <div className="bg-black/60 p-3 rounded border border-white/5 text-[11px] leading-relaxed text-gray-400">
                        <div className="text-[9px] text-gray-600 font-black mb-2 flex items-center gap-2"><FileText size={10}/> AUDIT_SUMMARY</div>
                        {report.structuralAnalysis}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                         <div className="bg-ai-panel/30 border border-ai-border p-2 rounded">
                             <div className="text-[8px] text-gray-600 font-black mb-1">STRATEGY_BIAS</div>
                             <div className={`text-xs font-black ${report.bias === 'BULLISH' ? 'text-buy' : report.bias === 'BEARISH' ? 'text-sell' : 'text-gray-400'}`}>
                                 {report.bias}
                             </div>
                         </div>
                         <div className="bg-ai-panel/30 border border-ai-border p-2 rounded">
                             <div className="text-[8px] text-gray-600 font-black mb-1">LIQUIDITY_DELTA</div>
                             <div className="text-xs font-black text-white">{report.liquidityDelta > 0 ? '+' : ''}{report.liquidityDelta}%</div>
                         </div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-[8px] text-gray-600 font-black mb-1 uppercase tracking-widest flex items-center gap-2"><AlertCircle size={10}/> Detected Anomalies</div>
                        {report.anomalies.map((a, i) => (
                            <div key={i} className="text-[10px] text-red-400 bg-red-950/20 p-2 rounded border border-red-950/40">
                                {a}
                            </div>
                        ))}
                    </div>
                 </div>
               ) : (
                 <div className="py-12 flex flex-col items-center justify-center text-gray-600 text-[10px] gap-2">
                    <RefreshCw size={24} className="animate-spin text-ai-accent" />
                    RUNNING STRUCTURAL ANALYSIS...
                 </div>
               )}
            </div>

            <div className="p-2 bg-ai-panel/50 border-t border-ai-border text-[8px] text-gray-600 flex justify-between">
                <span>INTEL_VERSION: V2.1.0_STABLE</span>
                <span>DATA_STREAM: AUTHENTICATED</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DecisionIntelligenceHub;
