
import React from 'react';
import { ShoppingCart, CheckCircle2, Loader2, Zap } from 'lucide-react';

export interface ExecutionLog {
  id: string;
  type: string;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
  qty: string;
  price: string;
  timestamp: string;
}

export const ExecutionStatus: React.FC<{ logs: ExecutionLog[] }> = ({ logs }) => {
  return (
    <div className="flex-1 bg-[#050505] border border-ai-border/50 rounded p-3 flex flex-col font-mono overflow-hidden">
      <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
        <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-1.5">
          <ShoppingCart size={12} className="text-ai-accent" /> Active_Execution_Buffer
        </span>
        <span className="text-[8px] text-emerald-500 font-black">API_LOCKED_2ms</span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[8px] text-gray-800 uppercase tracking-widest italic py-8">
            Waiting for algorithmic trigger...
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="flex items-center justify-between p-1.5 bg-black/40 border border-white/5 rounded text-[9px] animate-in fade-in slide-in-from-bottom-1">
              <div className="flex items-center gap-2">
                {log.status === 'PENDING' ? (
                  <Loader2 size={10} className="text-ai-accent animate-spin" />
                ) : (
                  <CheckCircle2 size={10} className="text-emerald-500" />
                )}
                <div className="flex flex-col">
                  <span className="text-white font-bold tracking-tighter">BUY {log.qty} BTC</span>
                  <span className="text-[7px] text-gray-600 uppercase">{log.type} @ ${log.price}</span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className={`font-black tracking-widest ${log.status === 'FILLED' ? 'text-emerald-500' : 'text-blue-400'}`}>
                  {log.status}
                </span>
                <span className="text-[7px] text-gray-700">{log.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center">
         <div className="flex items-center gap-1.5 text-[8px] font-black text-gray-600 uppercase">
           <Zap size={10} className="text-yellow-500" /> Engine: Smart_Slicer_v3
         </div>
      </div>
    </div>
  );
};
