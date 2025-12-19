import React from 'react';
import { DynamicMarketState } from '../types';
import { Brain, Activity, Target, Zap, Waves } from 'lucide-react';

interface DynamicStatsProps {
  state: DynamicMarketState;
  currentPrice: number;
  cvd: number;
}

const DynamicStats: React.FC<DynamicStatsProps> = ({ state, currentPrice, cvd }) => {
  const getRegimeColor = (r: string) => {
    switch (r) {
      case 'MANIPULATION': return 'text-purple-400';
      case 'ACCUMULATION': return 'text-cyan-400';
      case 'DISTRIBUTION': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-ai-panel border border-ai-border rounded-lg p-0 overflow-hidden shadow-lg mb-6">
      <div className="bg-ai-dark/50 border-b border-ai-border p-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Brain size={14} className="text-ai-accent" /> Adaptive Intelligence Core
          </h3>
          <div className="flex items-center gap-1.5 text-[10px] font-mono border-l border-ai-border pl-4">
             STATUS: 
             <span className={`font-bold ${state.status === 'ACTIVE' ? 'text-buy' : 'text-yellow-500'}`}>
               {state.status}
             </span>
          </div>
        </div>
        <span className="text-[10px] text-gray-600 font-mono">REAL-TIME ANALYSIS</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-ai-border">
        {/* PRICE */}
        <div className="p-4 flex flex-col items-center justify-center">
          <span className="text-[10px] text-gray-500 font-mono uppercase mb-1 flex items-center gap-1">
            <Zap size={10} /> Live Price
          </span>
          <span className="text-2xl font-bold text-white tracking-tight font-mono">
            ${currentPrice.toFixed(2)}
          </span>
        </div>

        {/* REGIME */}
        <div className="p-4 flex flex-col items-center justify-center bg-white/5">
          <span className="text-[10px] text-gray-500 font-mono uppercase mb-1 flex items-center gap-1">
            <Activity size={10} /> Market Regime
          </span>
          <span className={`text-lg font-bold font-mono tracking-wider ${getRegimeColor(state.regime)}`}>
            {state.regime}
          </span>
        </div>

        {/* ADAPTIVE THRESHOLD */}
        <div className="p-4 flex flex-col items-center justify-center">
          <span className="text-[10px] text-gray-500 font-mono uppercase mb-1 flex items-center gap-1">
            <Target size={10} /> Dynamic Threshold
          </span>
          <span className="text-lg font-bold text-yellow-400 font-mono">
            ${(state.adaptiveWhaleThreshold / 1000).toFixed(1)}k
          </span>
          <span className="text-[10px] text-gray-600">Avg Flow: {state.avgTradeVol.toFixed(4)} BTC</span>
        </div>

        {/* VOLATILITY */}
        <div className="p-4 flex flex-col items-center justify-center">
          <span className="text-[10px] text-gray-500 font-mono uppercase mb-1 flex items-center gap-1">
             <Waves size={10} /> Volatility
          </span>
          <span className={`text-lg font-bold font-mono ${state.volatility === 'EXTREME' ? 'text-red-500' : state.volatility === 'MEDIUM' ? 'text-orange-400' : 'text-green-500'}`}>
            {state.volatility}
          </span>
          <span className="text-[10px] text-gray-600">CVD: {cvd > 0 ? '+' : ''}{cvd.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default DynamicStats;
