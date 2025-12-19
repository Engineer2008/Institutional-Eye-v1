
import React from 'react';

export const AdminStats: React.FC<{ mrr: number, activeSubs: number }> = ({ mrr, activeSubs }) => {
  return (
    <div className="grid grid-cols-3 gap-2 bg-black p-4 border-b border-gray-800 font-mono">
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Current_MRR</span>
        <span className="text-2xl font-black text-emerald-500 shadow-neon-green tabular-nums">
          ${mrr.toLocaleString()}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Active_Elite_Nodes</span>
        <span className="text-2xl font-black text-blue-400 tabular-nums">
          {activeSubs}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">System_Load</span>
        <span className="text-2xl font-black text-white italic tracking-tighter">OPTIMAL</span>
      </div>
    </div>
  );
};

export default AdminStats;