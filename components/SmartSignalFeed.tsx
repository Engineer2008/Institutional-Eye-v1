import React from 'react';
import { SmartSignal } from '../types';
import { Cpu, CheckCircle } from 'lucide-react';

interface SmartSignalFeedProps {
  signals: SmartSignal[];
}

const SmartSignalFeed: React.FC<SmartSignalFeedProps> = ({ signals }) => {
  return (
    <div className="bg-black border border-ai-border rounded-lg shadow-lg h-[400px] flex flex-col font-mono overflow-hidden">
      <div className="bg-gray-900 border-b border-gray-800 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-300">
          <Cpu size={14} className="text-purple-500" />
          <span>Smart Execution Feed</span>
        </div>
        <div className="text-[10px] text-gray-500 border border-gray-700 px-2 py-0.5 rounded">
          FILTERED
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-xs">
          <thead className="bg-gray-900/50 text-gray-500 sticky top-0">
            <tr>
              <th className="text-left p-2 font-normal">TIME</th>
              <th className="text-left p-2 font-normal">SIGNAL</th>
              <th className="text-left p-2 font-normal hidden sm:table-cell">NOTE</th>
              <th className="text-right p-2 font-normal">CONFIDENCE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {signals.length === 0 ? (
               <tr>
                 <td colSpan={4} className="text-center py-12 text-gray-600 italic">
                   <div className="flex flex-col items-center gap-2">
                     <span className="animate-pulse">●</span>
                     Analyzing Market Micro-structure...
                   </div>
                 </td>
               </tr>
            ) : (
              signals.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-2 text-gray-400">{s.time}</td>
                  <td className="p-2">
                    <span 
                      className={`
                        px-2 py-0.5 rounded text-[10px] font-bold border
                        ${s.type.includes('BUY') || s.type.includes('LONG')
                          ? 'bg-green-900/30 text-green-400 border-green-800' 
                          : 'bg-red-900/30 text-red-400 border-red-800'}
                      `}
                    >
                      {s.type}
                    </span>
                  </td>
                  <td className="p-2 text-gray-500 hidden sm:table-cell">{s.note}</td>
                  <td className="p-2 flex justify-end items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${s.confidence > 90 ? 'bg-purple-500' : 'bg-ai-accent'}`} 
                        style={{ width: `${s.confidence}%` }} 
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 w-6 text-right">{s.confidence}%</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SmartSignalFeed;