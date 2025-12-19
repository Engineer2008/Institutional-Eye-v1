import React, { useState, useMemo } from 'react';
import { Search, TrendingUp, Zap, Hexagon, X } from 'lucide-react';
import { MarketType } from '../types';
import { getMarketPairs } from '../services/MarketRegistry';

interface MarketSelectorProps {
  activeSymbol: string;
  activeMarket: MarketType;
  onChange: (symbol: string, market: MarketType) => void;
}

const MarketSelector: React.FC<MarketSelectorProps> = ({ activeSymbol, activeMarket, onChange }) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const pairs = useMemo(() => getMarketPairs(activeMarket), [activeMarket]);

  const filtered = useMemo(() => {
    return pairs.filter(p => p.symbol.includes(search.toUpperCase())).slice(0, 100);
  }, [pairs, search]);

  return (
    <div className="relative z-50">
      {/* TRIGGER BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-ai-panel border border-ai-border hover:border-ai-accent transition-colors px-4 py-2 rounded-lg group"
      >
        <div className={`p-1.5 rounded ${activeMarket === 'SPOT' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
          {activeMarket === 'SPOT' ? <Hexagon size={16} /> : <Zap size={16} />}
        </div>
        <div className="text-left">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{activeMarket} MARKET</div>
          <div className="text-sm font-bold text-white font-mono flex items-center gap-2">
            {activeSymbol.toUpperCase()}
            <span className="text-gray-600 text-[10px]">▼</span>
          </div>
        </div>
      </button>

      {/* DROPDOWN */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-80 bg-ai-dark border border-ai-border rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* TABS */}
            <div className="flex border-b border-ai-border">
              <button 
                onClick={() => onChange(activeSymbol, 'SPOT')}
                className={`flex-1 py-3 text-xs font-bold text-center transition-colors ${activeMarket === 'SPOT' ? 'bg-blue-500/10 text-blue-400 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
              >
                SPOT MARKET
              </button>
              <button 
                onClick={() => onChange(activeSymbol, 'PERP')}
                className={`flex-1 py-3 text-xs font-bold text-center transition-colors ${activeMarket === 'PERP' ? 'bg-purple-500/10 text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
              >
                FUTURES (PERP)
              </button>
            </div>

            {/* SEARCH */}
            <div className="p-3 border-b border-ai-border relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input 
                autoFocus
                type="text" 
                placeholder="SEARCH ASSETS..." 
                className="w-full bg-ai-panel border border-ai-border rounded-lg pl-9 pr-8 py-2 text-xs text-white focus:outline-none focus:border-ai-accent font-mono uppercase placeholder:text-gray-600"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* LIST */}
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {filtered.map(pair => (
                <button
                  key={pair.symbol}
                  onClick={() => {
                    onChange(pair.symbol, activeMarket);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-ai-border/30 last:border-0 ${activeSymbol === pair.symbol ? 'bg-white/10' : ''}`}
                >
                  <span className="font-bold text-sm text-gray-200 font-mono">{pair.symbol}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${activeMarket === 'SPOT' ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'}`}>
                    {activeMarket}
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-500 font-mono">
                  NO ASSETS FOUND.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MarketSelector;