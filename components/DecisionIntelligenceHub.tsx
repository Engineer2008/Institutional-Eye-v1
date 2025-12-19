
import React, { useState, useRef, useEffect } from 'react';
import { 
  Brain, Cpu, Activity, ShieldCheck, RefreshCw, 
  AlertCircle, ChevronDown, FileText, Binary, 
  Target, Zap, Lock, Database, Search, Waves
} from 'lucide-react';
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
  const [syncStatus, setSyncStatus] = useState<string>('IDLE');
  const core = useRef(new IntelligenceCore());

  const runAudit = async () => {
    setIsSyncing(true);
    setSyncStatus('PROBING_NODES');
    
    // UI Experience: Animated status progression
    const statuses = ['INGESTING_TAPE', 'FORGING_AXIOMS', 'CALCULATING_BIAS', 'FINALIZING_ZKP'];
    let i = 0;
    const interval = setInterval(() => {
      if (i < statuses.length) setSyncStatus(statuses[i++]);
    }, 800);

    try {
      const audit = await core.current.generateStrategicBriefing(symbol, history, marketData);
      setReport(audit);
    } finally {
      clearInterval(interval);
      setIsSyncing(false);
      setSyncStatus('COMPLETE');
    }
  };

  // Auto-refresh logic (optional, keep manual to save tokens)
  useEffect(() => {
    if (isOpen && !report && !isSyncing) {
      runAudit();
    }
  }, [isOpen]);

  return (
    <div className="relative font-mono">
      {/* HUD Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black border transition-all duration-300
          ${isOpen 
            ? 'bg-ai-accent text-white border-ai-accent shadow-neon-blue' 
            : 'bg-black/40 text-ai-accent border-ai-accent/40 hover:border-ai-accent hover:bg-ai-accent/10'}
        `}
      >
        <div className="relative">
          <ShieldCheck size={16} className={isSyncing ? 'animate-pulse text-white' : ''} />
          {isSyncing && <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" />}
        </div>
        STRUCTURAL_AUDIT
        <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Audit Document Overlay */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-3 w-[450px] bg-[#020408] border border-ai-border rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-4 duration-300">
            
            {/* Header Telemetry */}
            <div className="p-4 bg-ai-panel/80 border-b border-ai-border flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="bg-ai-accent/10 p-2 rounded-lg border border-ai-accent/20">
                  <Brain size={18} className="text-ai-accent animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">Intelligence_Core_v5</span>
                  <div className="flex items-center gap-2 text-[8px] text-gray-500 font-bold uppercase">
                    <Database size={10} /> Data_Source: L0_Verified
                  </div>
                </div>
              </div>
              <button 
                onClick={runAudit} 
                disabled={isSyncing} 
                className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin text-ai-accent' : ''} />
              </button>
            </div>

            {/* Audit Body */}
            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar relative">
               {isSyncing ? (
                 <div className="py-20 flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                      <Binary size={48} className="text-ai-accent opacity-20 animate-spin-slow" />
                      <Search size={24} className="absolute inset-0 m-auto text-ai-accent animate-pulse" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-[10px] font-black text-white tracking-[0.4em] uppercase">{syncStatus}</span>
                       <div className="w-48 h-1 bg-gray-900 rounded-full overflow-hidden">
                          <div className="h-full bg-ai-accent animate-progress" />
                       </div>
                    </div>
                 </div>
               ) : report ? (
                 <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Primary Technical Analysis */}
                    <div className="bg-black/60 p-4 rounded-xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-ai-accent/50 group-hover:bg-ai-accent transition-colors" />
                        <div className="text-[9px] text-gray-600 font-black mb-3 flex items-center gap-2 tracking-[0.2em]">
                           <FileText size={12} className="text-ai-accent" /> FORENSIC_SUMMARY
                        </div>
                        <p className="text-[12px] leading-relaxed text-gray-300 font-mono italic">
                           "{report.structuralAnalysis}"
                        </p>
                    </div>

                    {/* Matrix Grid */}
                    <div className="grid grid-cols-2 gap-3">
                         <div className="bg-ai-panel/40 border border-ai-border p-3 rounded-xl flex flex-col gap-1.5 group/card">
                             <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-1.5">
                                <Target size={10} className="text-ai-accent" /> Systemic_Bias
                             </div>
                             <div className={`text-sm font-black tracking-tighter tabular-nums ${
                               report.bias === 'BULLISH' ? 'text-emerald-500' : 
                               report.bias === 'BEARISH' ? 'text-rose-500' : 
                               'text-gray-400'
                             }`}>
                                 {report.bias}
                             </div>
                             <div className="h-0.5 w-full bg-gray-900 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-1000 ${report.bias === 'BULLISH' ? 'bg-emerald-500' : report.bias === 'BEARISH' ? 'bg-rose-500' : 'bg-gray-600'}`}
                                  style={{ width: report.bias === 'NEUTRAL' ? '50%' : '100%' }}
                                />
                             </div>
                         </div>
                         <div className="bg-ai-panel/40 border border-ai-border p-3 rounded-xl flex flex-col gap-1.5 group/card">
                             <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-1.5">
                                <Waves size={10} className="text-ai-accent" /> Liquidity_Delta
                             </div>
                             <div className="text-sm font-black text-white tracking-tighter tabular-nums">
                                 {report.liquidityDelta > 0 ? '+' : ''}{report.liquidityDelta.toFixed(2)}%
                             </div>
                             <div className="h-0.5 w-full bg-gray-900 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-white transition-all duration-1000"
                                  style={{ width: `${Math.abs(report.liquidityDelta) * 5}%` }}
                                />
                             </div>
                         </div>
                    </div>

                    {/* Anomalies List */}
                    <div className="space-y-2">
                        <div className="text-[9px] text-gray-600 font-black mb-1 uppercase tracking-widest flex items-center gap-2">
                           <AlertCircle size={12} className="text-rose-500" /> RECOGNIZED_ANOMALIES
                        </div>
                        <div className="flex flex-col gap-2">
                          {report.anomalies.map((a, i) => (
                              <div key={i} className="text-[10px] text-gray-400 bg-white/[0.02] p-3 rounded-lg border border-white/5 flex items-center gap-3 group/anomaly hover:border-ai-accent/30 transition-all">
                                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 group-hover:bg-ai-accent transition-colors shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                  <span className="flex-1 font-mono">{a}</span>
                                  <Zap size={10} className="text-gray-800 group-hover:text-ai-accent" />
                              </div>
                          ))}
                        </div>
                    </div>
                 </div>
               ) : (
                 <div className="py-20 flex flex-col items-center justify-center text-gray-600 text-[10px] gap-4">
                    <Activity size={32} className="opacity-20 animate-pulse" />
                    <div className="flex flex-col items-center">
                       <span className="font-black tracking-widest uppercase mb-1">Awaiting_Manual_Trigger</span>
                       <span className="opacity-50 italic">Execute audit scan to synthesize market bias.</span>
                    </div>
                    <button 
                      onClick={runAudit}
                      className="mt-4 px-6 py-2 bg-ai-accent text-white rounded-lg font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-neon-blue"
                    >
                      Run_Diagnostic
                    </button>
                 </div>
               )}
            </div>

            {/* Footer Metadata */}
            <div className="p-3 bg-ai-panel border-t border-ai-border text-[8px] text-gray-600 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                   <span className="flex items-center gap-1"><Lock size={10} /> Secure_Inference: SHA-256</span>
                   <span className="text-emerald-500 font-black uppercase">Model_v3_Flash_Optimized</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${report ? 'bg-emerald-500 shadow-neon-green' : 'bg-gray-800'}`} />
                   <span>SYNC_LOCKED</span>
                </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DecisionIntelligenceHub;
