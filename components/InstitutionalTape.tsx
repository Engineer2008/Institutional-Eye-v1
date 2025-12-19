
import React, { memo } from 'react';
import { WhaleSignal } from '../types';
import { Terminal, AlertTriangle, Zap, Activity } from 'lucide-react';

interface InstitutionalTapeProps {
  signals: WhaleSignal[];
}

const InstitutionalTape: React.FC<InstitutionalTapeProps> = ({ signals }) => {
  return (
    <div className="bg-[#050608] border border-ai-border rounded-xl shadow-2xl h-full flex flex-col font-mono text-emerald-500 overflow-hidden relative group">
      {/* Background Matrix-like Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      {/* Header Styled as Advanced Terminal Title Bar */}
      <div className="bg-[#0D1117] border-b border-ai-border p-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            <Terminal size={14} className="text-emerald-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest text-white">Institutional Tape</span>
            <div className="flex items-center gap-2 text-[8px] text-emerald-500/50">
              <Activity size={8} />
              REAL-TIME EXECUTION CLUSTER v2.5
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500/40"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/40"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></div>
          </div>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 overflow-y-auto p-0 custom-scrollbar relative z-10 bg-black/40">
        <table className="w-full text-[11px] border-collapse">
          <thead className="bg-[#0D1117]/80 sticky top-0 z-20 backdrop-blur-sm text-gray-500 font-black uppercase tracking-widest border-b border-ai-border">
            <tr>
              <th className="text-left px-4 py-2 font-black text-[9px]">Time</th>
              <th className="text-center px-4 py-2 font-black text-[9px]">Source</th>
              <th className="text-center px-4 py-2 font-black text-[9px]">Side</th>
              <th className="text-right px-4 py-2 font-black text-[9px]">Price</th>
              <th className="text-right px-4 py-2 font-black text-[9px]">Value (USD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {signals.length === 0 ? (
               <tr>
                 <td colSpan={5} className="text-center py-20 text-gray-700 italic animate-pulse">
                   <div className="flex flex-col items-center gap-3">
                      <Zap size={24} className="opacity-20" />
                      <span>// SYNCHRONIZING WITH DATA PIPELINES...</span>
                   </div>
                 </td>
               </tr>
            ) : (
              signals.map((signal) => {
                const isInstitutional = signal.valueUSD >= 500000;
                const isWhale = signal.valueUSD >= 100000;
                
                return (
                  <tr 
                    key={signal.id} 
                    className={`
                      hover:bg-white/5 transition-colors group/row border-l-2
                      ${signal.side === 'BUY' ? 'border-l-buy/20' : 'border-l-sell/20'}
                      ${signal.isLiquidationLikely ? 'bg-red-950/20' : ''}
                      animate-in slide-in-from-right-2 duration-300
                    `}
                  >
                    <td className="px-4 py-2 text-gray-500 group-hover/row:text-white transition-colors">{signal.time}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded-[2px] text-[8px] font-black tracking-widest uppercase border ${
                        signal.type === 'INSTITUTIONAL' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                        signal.type === 'WHALE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                        'bg-gray-800/40 text-gray-400 border-gray-700'
                      }`}>
                        {signal.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center font-black">
                      <span className={`flex items-center justify-center gap-1 ${signal.side === 'BUY' ? 'text-buy' : 'text-sell'}`}>
                        {signal.side === 'BUY' ? '▲' : '▼'} {signal.side}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-300 tabular-nums">
                      {signal.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-2 text-right tabular-nums font-black ${
                      isInstitutional ? 'text-white' : isWhale ? 'text-gray-200' : 'text-gray-500'
                    }`}>
                      <div className="flex items-center justify-end gap-2">
                         {signal.isLiquidationLikely && <AlertTriangle size={10} className="text-yellow-500 animate-pulse" />}
                         ${(signal.valueUSD / 1000).toFixed(1)}k
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer Status Line */}
      <div className="bg-[#0D1117] border-t border-ai-border p-2 px-4 text-[9px] text-gray-600 font-black tracking-widest flex justify-between relative z-20">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1.5">
             <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></span>
             UDP_STREAM: ACTIVE
           </div>
           <div>BUFFER_LOAD: {signals.length}/50</div>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-ai-accent">SECURE_INTELLIGENCE_CHANNEL</span>
        </div>
      </div>
    </div>
  );
};

export default memo(InstitutionalTape);
