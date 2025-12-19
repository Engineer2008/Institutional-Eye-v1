
import React, { useState } from 'react';
import { Play, History, TrendingUp, TrendingDown, Zap, ShieldCheck } from 'lucide-react';
import { runForensicBacktest, BacktestResult } from '../services/BacktestEngine';
import { BacktestSummary } from './BacktestSummary';

interface ForensicBacktestUIProps {
  historicalData: any[]; // Expects array of ticks/points with price, toxicity, forensicRatio, etc.
}

export const ForensicBacktestUI: React.FC<ForensicBacktestUIProps> = ({ historicalData }) => {
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeType, setActiveType] = useState<'GUNPOINT' | 'SWEEP' | 'ABSORPTION'>('GUNPOINT');

  const handleSimulate = () => {
    setIsSimulating(true);
    // Artificial delay for "computation" effect
    setTimeout(() => {
      const bResults = runForensicBacktest(historicalData, activeType);
      setResults(bResults);
      setIsSimulating(false);
    }, 800);
  };

  return (
    <div className="bg-black/60 border border-ai-border rounded-lg h-full flex flex-col font-mono overflow-hidden">
      <div className="p-3 bg-[#080a0f] border-b border-ai-border flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <History size={14} className="text-ai-accent" />
          <span className="text-[10px] text-white font-black uppercase tracking-widest">Forensic_Replay_Engine</span>
        </div>
        <div className="flex gap-2">
          {(['GUNPOINT', 'SWEEP', 'ABSORPTION'] as const).map(type => (
            <button
              key={type}
              onClick={() => {
                setActiveType(type);
                setResults([]); // Clear previous results when changing strategy
              }}
              className={`text-[8px] px-2 py-0.5 rounded border transition-all font-black ${
                activeType === type ? 'bg-ai-accent border-ai-accent text-white' : 'border-ai-border text-gray-600 hover:text-gray-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col gap-2">
        {/* Statistics Header Integrated via BacktestSummary */}
        <BacktestSummary results={results} />

        <div className="flex-1 overflow-hidden flex flex-col p-4 pt-0 gap-4">
          {/* Action Bar */}
          <button
            onClick={handleSimulate}
            disabled={isSimulating || historicalData.length < 101}
            className="w-full bg-ai-accent/10 border border-ai-accent/30 hover:bg-ai-accent hover:text-white py-2 rounded text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 group"
          >
            {isSimulating ? (
              <Zap size={14} className="animate-spin" />
            ) : (
              <Play size={14} className="group-hover:scale-110 transition-transform" />
            )}
            {isSimulating ? 'Processing_Ticks...' : 'Run_Forensic_Simulation'}
          </button>

          {/* Results Stream */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 bg-black/40 border border-ai-border p-2 rounded">
            {results.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-[9px] font-black uppercase tracking-widest text-center">
                <ShieldCheck size={32} className="mb-2" />
                Awaiting_Backtest_Execution
              </div>
            ) : (
              results.map((res, i) => (
                <div key={i} className="text-[9px] border-b border-white/5 py-1.5 flex justify-between items-center group/item hover:bg-white/5 px-2 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`font-black p-0.5 rounded ${res.wasSuccessful ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                      {res.wasSuccessful ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-gray-300 font-bold tabular-nums">${res.entryPrice.toFixed(2)} → ${res.exitPrice.toFixed(2)}</span>
                      <span className="text-gray-600 text-[7px] uppercase tracking-tighter">Slippage: {(res.slippage * 100).toFixed(3)}%</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                     <span className={`font-black ${res.wasSuccessful ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {res.wasSuccessful ? '+' : ''}{(((res.exitPrice - res.entryPrice) / res.entryPrice) * 100).toFixed(2)}%
                     </span>
                     <span className="text-[7px] text-gray-700 font-bold">DD: {(res.maxDrawdown * 100).toFixed(2)}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="p-2 border-t border-ai-border bg-[#080a0f] text-[7px] text-gray-700 font-black tracking-widest flex justify-between">
        <span>DATA_POOL: {historicalData.length} PKTS</span>
        <span className="text-ai-accent">ENGINE_V1.2_STABLE</span>
      </div>
    </div>
  );
};
