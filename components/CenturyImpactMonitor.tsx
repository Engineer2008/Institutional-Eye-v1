
import React, { useState } from 'react';
// Added XCircle to the import list from lucide-react
import { FastForward, ShieldCheck, Globe, Zap, Loader2, CheckCircle2, History, Scale, Sparkles, Binary, XCircle } from 'lucide-react';
import { simulateCenturyImpact } from '../services/CenturyImpactEngine';
import { CenturyImpactReport, FutureScenario } from '../types';

export const CenturyImpactMonitor: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [report, setReport] = useState<CenturyImpactReport | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = async () => {
    setIsSimulating(true);
    setReport(null);
    try {
      const result = await simulateCenturyImpact(symbol);
      setReport(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="bg-[#050505] border border-ai-accent/20 rounded-lg p-3 font-mono flex flex-col gap-3 shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-purple-500/5 pointer-events-none" />
      
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-500/10 rounded border border-purple-500/20">
             <FastForward size={12} className="text-purple-400" />
          </div>
          <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Century_Finality_v7.0</span>
        </div>
        <button 
          onClick={runSimulation}
          disabled={isSimulating}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${
            isSimulating ? 'bg-gray-800 text-gray-500' : 'bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500 hover:text-white'
          }`}
        >
          {isSimulating ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
          Financial_Time_Travel
        </button>
      </div>

      {!report ? (
        <div className="py-6 flex flex-col items-center justify-center text-gray-700 opacity-40 space-y-2">
           <History size={24} className="animate-spin-slow" />
           <span className="text-[8px] uppercase tracking-[0.3em]">Projecting Civilizational Impact...</span>
        </div>
      ) : (
        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
           <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col gap-1">
                 <span className="text-[7px] text-gray-600 font-black uppercase tracking-tighter">Sustainability_Root</span>
                 <div className={`text-[10px] font-black uppercase flex items-center gap-1.5 ${report.sustainablePath ? 'text-emerald-500' : 'text-red-500'}`}>
                    {report.sustainablePath ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    {report.sustainablePath ? 'PATH_LOCKED' : 'CIV_DIVERGENCE'}
                 </div>
              </div>
              <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col gap-1 overflow-hidden">
                 <span className="text-[7px] text-gray-600 font-black uppercase tracking-tighter">Future_Proof_ZKP</span>
                 <div className="flex items-center gap-2">
                    <Binary size={12} className="text-ai-accent" />
                    <span className="text-[9px] text-white truncate tabular-nums">{report.zkProof || 'N/A'}</span>
                 </div>
              </div>
           </div>

           <div className="space-y-1.5">
              <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase mb-1">
                 <span>Civilizational_Timeline_2100</span>
                 <span className="text-ai-accent">v7.0_PROJECTION</span>
              </div>
              <div className="flex gap-1 h-8">
                 {report.scenarios.map((s, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-sm relative group/scene transition-all ${s.planetaryHealth > 0.85 ? 'bg-emerald-500/30' : 'bg-white/5'}`}
                    >
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/scene:opacity-100 bg-black/80 rounded transition-opacity p-2 z-20 pointer-events-none">
                          <p className="text-[6px] text-white leading-tight text-center">{s.narrative}</p>
                       </div>
                       <div 
                         className="absolute bottom-0 left-0 right-0 bg-ai-accent transition-all duration-1000"
                         style={{ height: `${s.planetaryHealth * 100}%`, opacity: s.planetaryHealth > 0.85 ? 0.8 : 0.2 }}
                       />
                       <span className="absolute -top-3 left-0 right-0 text-center text-[6px] text-gray-600 font-bold">{s.year}</span>
                    </div>
                 ))}
              </div>
           </div>

           {report.sustainablePath && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-2 rounded flex flex-col gap-1 animate-in slide-in-from-top-1">
                 <div className="flex items-center gap-2 text-emerald-400 text-[8px] font-black uppercase">
                    <Scale size={10} /> Sustainment Vector Confirmed
                 </div>
                 <p className="text-[8px] text-gray-500 leading-relaxed italic">
                    "{report.sustainablePath.narrative}"
                 </p>
              </div>
           )}
        </div>
      )}

      <div className="mt-1 pt-2 border-t border-white/5 flex justify-between items-center text-[7px] text-gray-700 font-black uppercase">
         <div className="flex items-center gap-2">
            <Globe size={10} className="text-emerald-500" /> Multi-Planetary Balance: Verified
         </div>
         <span className="text-ai-accent">Civilization_Sentinel_Armed</span>
      </div>
    </div>
  );
};
