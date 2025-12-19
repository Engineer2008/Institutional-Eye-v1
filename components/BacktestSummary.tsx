
import React from 'react';
import { BacktestResult } from '../services/BacktestEngine';

interface BacktestSummaryProps {
  results: BacktestResult[];
}

export const BacktestSummary: React.FC<BacktestSummaryProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="bg-[#050505] border-t-2 border-ai-border/30 p-4 font-mono text-[9px] text-gray-700 uppercase tracking-widest text-center">
        AWAITING_SIMULATION_DATA
      </div>
    );
  }

  const winRate = (results.filter(r => r.wasSuccessful).length / results.length) * 100;
  const avgSlippage = results.reduce((acc, r) => acc + r.slippage, 0) / results.length;

  return (
    <div className="bg-[#050505] border-t-2 border-blue-500 p-4 font-mono animate-in fade-in slide-in-from-top-1">
      <div className="grid grid-cols-4 gap-4">
        <div className="flex flex-col">
          <span className="text-[9px] text-gray-500 uppercase font-black">Win_Rate</span>
          <span className={`text-xl font-black tabular-nums tracking-tighter ${winRate > 60 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {winRate.toFixed(1)}%
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-gray-500 uppercase font-black">Avg_Slippage</span>
          <span className="text-xl font-black text-white tabular-nums tracking-tighter">
            -{(avgSlippage * 100).toFixed(3)}%
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-gray-500 uppercase font-black">Signals</span>
          <span className="text-xl font-black text-blue-400 tabular-nums tracking-tighter">
            {results.length}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-gray-500 uppercase font-black">Expectancy</span>
          <span className="text-xl font-black text-white tabular-nums tracking-tighter">1.42</span>
        </div>
      </div>
      
      {/* Visual Bar: Profit vs Slippage */}
      <div className="mt-4 h-1 w-full bg-gray-900 flex rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: `${winRate}%` }} />
        <div className="h-full bg-rose-600 transition-all duration-1000" style={{ width: `${100 - winRate}%` }} />
      </div>
    </div>
  );
};

export default BacktestSummary;
