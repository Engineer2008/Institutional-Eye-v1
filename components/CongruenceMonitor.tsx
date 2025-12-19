
import React from 'react';
import { Network, Zap, AlertCircle, ShieldCheck } from 'lucide-react';
// Fix: Import CongruenceState from central types file
import { CongruenceState } from '../types';

interface CongruenceMonitorProps {
  state: CongruenceState;
  binancePrice: number;
  coinbasePrice: number;
}

export const CongruenceMonitor: React.FC<CongruenceMonitorProps> = ({ state, binancePrice, coinbasePrice }) => {
  return (
    <div className="bg-black/40 border border-ai-border/50 rounded p-3 flex flex-col gap-2 font-mono relative group overflow-hidden">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <Network size={12} className="text-ai-accent" />
          <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Cross_Exchange_Audit</span>
        </div>
        <div className={`flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 rounded border ${
          state.opportunity === 'ARBITRAGE_DETECTED' 
          ? 'bg-amber-500/20 text-amber-500 border-amber-500/30 animate-pulse' 
          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        }`}>
          {state.opportunity === 'ARBITRAGE_DETECTED' ? <Zap size={10} /> : <ShieldCheck size={10} />}
          {state.opportunity}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <span className="text-[8px] text-gray-700 font-black uppercase">Binance_Ref</span>
          <span className="text-xs font-black text-white tabular-nums">${binancePrice.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-end text-right">
          <span className="text-[8px] text-gray-700 font-black uppercase">Coinbase_Sourced</span>
          <span className="text-xs font-black text-gray-400 tabular-nums">${coinbasePrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-2 space-y-1">
        <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter">
          <span className="text-gray-600 text-[10px]">Spread_Delta</span>
          <span className={state.isCongruent ? 'text-emerald-500' : 'text-amber-500'}>
            {state.spreadPercent.toFixed(4)}%
          </span>
        </div>
        <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${state.isCongruent ? 'bg-ai-accent' : 'bg-amber-500'}`}
            style={{ width: `${Math.min(100, state.intensity * 20)}%` }}
          />
        </div>
      </div>

      {state.opportunity === 'ARBITRAGE_DETECTED' && (
        <div className="mt-1 flex items-center gap-1.5 text-[8px] text-amber-500 font-bold uppercase animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={10} /> Liquidity fragmentation detected in global pool
        </div>
      )}
    </div>
  );
};

export default CongruenceMonitor;
