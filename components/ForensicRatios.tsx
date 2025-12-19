
import React from 'react';
import { Target, TrendingUp, TrendingDown } from 'lucide-react';

interface ForensicRatiosProps {
  type: 'BUY' | 'SELL';
  ratio: number;
}

export const ForensicRatios: React.FC<ForensicRatiosProps> = ({ type, ratio }) => {
  const isHigh = ratio > 1.5;
  const color = type === 'BUY' ? 'text-emerald-500' : 'text-red-500';
  const bgColor = type === 'BUY' ? 'bg-emerald-500/10' : 'bg-red-500/10';
  const borderColor = type === 'BUY' ? 'border-emerald-500/20' : 'border-red-500/20';

  return (
    <div className={`p-4 border-r border-gray-800 flex flex-col justify-center gap-2 ${isHigh ? bgColor : ''} transition-colors`}>
      <div className="flex justify-between items-center">
        <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-1">
          {type === 'BUY' ? <TrendingUp size={12} className={color} /> : <TrendingDown size={12} className={color} />}
          {type}_Absorption
        </span>
        {isHigh && (
          <span className={`text-[8px] font-black px-1.5 rounded animate-pulse ${color} border ${borderColor}`}>
            HIGH_CONVICTION
          </span>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-3xl font-black tabular-nums tracking-tighter ${color}`}>
          {ratio.toFixed(2)}<span className="text-sm opacity-50 ml-1">x</span>
        </span>
      </div>
      <div className="text-[8px] text-gray-700 font-mono italic">
        Ratio relative to 24h normalized baseline.
      </div>
    </div>
  );
};
