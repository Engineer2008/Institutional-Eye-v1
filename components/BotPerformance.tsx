
import React from 'react';

export const BotPerformance: React.FC = () => {
  return (
    <div className="bg-black border border-blue-900/50 p-3 rounded font-mono shadow-neon-blue">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] text-blue-500 font-bold tracking-widest uppercase">Execution_Status: Active</span>
        <div className="w-2 h-2 bg-buy rounded-full animate-ping" />
      </div>
      <div className="space-y-1 mt-2">
        <div className="flex justify-between text-[11px] items-center">
          <span className="text-gray-500 font-bold uppercase text-[9px]">Open_Positions</span>
          <span className="text-white font-black tracking-tighter">BTC/USDT [LONG]</span>
        </div>
        <div className="flex justify-between text-[11px] items-center">
          <span className="text-gray-500 font-bold uppercase text-[9px]">Unrealized_PnL</span>
          <span className="text-buy font-black tracking-tighter shadow-neon-blue">+$420.69 (1.2%)</span>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center">
        <span className="text-[7px] text-gray-700 font-black uppercase">Session_Alpha_V3</span>
        <span className="text-[7px] text-ai-accent font-black uppercase">Risk_Managed</span>
      </div>
    </div>
  );
};

export default BotPerformance;
