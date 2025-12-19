
import React, { useMemo } from 'react';
import { ShieldAlert, Activity, Zap, AlertTriangle, Terminal } from 'lucide-react';
import { Transaction, MempoolToxicityReport } from '../types';

interface MempoolMonitorProps {
  pendingTx: Transaction[];
  report: MempoolToxicityReport;
}

export const MempoolMonitor: React.FC<MempoolMonitorProps> = ({ pendingTx, report }) => {
  const isHighAlert = report.status === 'HIGH_ALERT';

  return (
    <div className={`bg-black/60 border rounded-lg p-3 font-mono flex flex-col gap-2 shadow-2xl transition-all duration-500 ${isHighAlert ? 'border-red-500 shadow-neon-red' : 'border-ai-border'}`}>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <Terminal size={12} className={isHighAlert ? "text-red-500" : "text-ai-accent"} />
          <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Mempool_Audit_v4.0</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[8px] font-black tracking-widest uppercase transition-colors ${
          isHighAlert ? 'bg-red-500/20 text-red-500 border-red-500/30 animate-pulse' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        }`}>
          {isHighAlert ? <AlertTriangle size={10} /> : <Zap size={10} />}
          {report.status}
        </div>
      </div>

      <div className="flex items-end justify-between border-b border-white/5 pb-2">
        <div className="flex flex-col">
          <span className="text-[8px] text-gray-700 font-black uppercase">Pending_Anomalies</span>
          <span className={`text-xl font-black tabular-nums tracking-tighter ${isHighAlert ? 'text-red-500' : 'text-white'}`}>
            {pendingTx.filter(tx => tx.impact > 0.02).length} <span className="text-[10px] text-gray-600 font-normal">NODES</span>
          </span>
        </div>
        {report.estimatedPriceImpact !== undefined && (
          <div className="text-right flex flex-col items-end">
            <span className="text-[8px] text-gray-700 font-black uppercase">Proj_Impact</span>
            <span className={`text-[12px] font-black tracking-widest ${isHighAlert ? 'text-red-500' : 'text-gray-400'}`}>
              -{(report.estimatedPriceImpact * 100).toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1.5 mt-1 overflow-hidden">
        {pendingTx.slice(0, 3).map((tx) => (
          <div key={tx.hash} className="flex justify-between items-center group/tx">
            <div className="flex items-center gap-2">
              <div className={`w-1 h-1 rounded-full ${tx.isSell ? 'bg-red-500' : 'bg-emerald-500'}`} />
              <span className="text-[8px] text-gray-500 group-hover/tx:text-white transition-colors">{tx.hash}</span>
            </div>
            <div className="flex items-center gap-2">
               <span className={`text-[8px] font-black ${tx.isSell ? 'text-red-400' : 'text-emerald-400'}`}>
                 ${(tx.value / 1000).toFixed(0)}k
               </span>
               <span className="text-[8px] text-gray-700 font-bold">{(tx.impact * 100).toFixed(1)}% IMP</span>
            </div>
          </div>
        ))}
        {pendingTx.length > 3 && (
           <div className="text-[7px] text-gray-700 font-black tracking-widest text-center border-t border-white/5 pt-1 uppercase">
             + {pendingTx.length - 3} additional packets in buffer
           </div>
        )}
      </div>

      {isHighAlert && (
        <div className="mt-1 flex items-center gap-1.5 text-[8px] text-red-500 font-black uppercase animate-in slide-in-from-top-1">
          <ShieldAlert size={10} /> {report.reason}
        </div>
      )}
    </div>
  );
};
