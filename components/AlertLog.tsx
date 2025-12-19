
import React from 'react';
import { SignalConfidence } from './SignalConfidence';

export interface AlertEntry {
  id: string;
  timestamp: string;
  type: 'GUNPOINT' | 'SWEEP' | 'TOXICITY';
  price: number;
  message: string;
  toxicityAtTime: number;
}

interface AlertLogProps {
  logs: AlertEntry[];
  onClear: () => void;
}

export const AlertLog: React.FC<AlertLogProps> = ({ logs, onClear }) => {
  return (
    <div className="bg-black border border-gray-800 h-full flex flex-col font-mono rounded overflow-hidden shadow-inner">
      <div className="p-2 border-b border-gray-800 bg-[#080a0f] flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Intelligence_Log</span>
        </div>
        <button 
          onClick={onClear}
          className="text-[9px] text-gray-600 hover:text-white transition uppercase font-bold tracking-tighter"
        >
          CLEAR_SESSION
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-1 p-2 custom-scrollbar bg-black/40">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[9px] text-gray-700 uppercase tracking-[0.3em] opacity-50">
            <span className="mb-2">●</span>
            Monitoring_Active
          </div>
        ) : (
          logs.map((log) => (
            <div 
              key={log.id} 
              className="text-[10px] border-l-2 border-gray-800 pl-2 py-2 hover:bg-white/5 transition animate-in slide-in-from-left-1 duration-300 group"
            >
              <div className="flex justify-between items-center">
                <span className={`font-black text-[9px] tracking-widest ${
                  log.type === 'GUNPOINT' ? 'text-red-500' : 
                  log.type === 'SWEEP' ? 'text-purple-500' : 'text-orange-500'
                }`}>
                  [{log.type}]
                </span>
                <span className="text-gray-600 text-[8px] font-bold">{log.timestamp}</span>
              </div>
              <div className="text-gray-300 mt-1 tabular-nums leading-tight">
                <span className="text-white font-bold">${log.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className="mx-1 opacity-20">—</span>
                <span className="opacity-80 tracking-tight">{log.message}</span>
              </div>
              
              {/* Integrated Signal Confidence Component */}
              <SignalConfidence type={log.type} currentToxicity={log.toxicityAtTime} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertLog;
