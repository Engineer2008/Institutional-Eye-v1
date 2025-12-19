import React from 'react';
import { WhaleSignal } from '../types';
import { Disc, TrendingUp, TrendingDown } from 'lucide-react';

interface WhaleFeedProps {
  signals: WhaleSignal[];
}

const WhaleFeed: React.FC<WhaleFeedProps> = ({ signals }) => {
  return (
    <div className="bg-ai-panel border border-ai-border rounded-lg p-5 shadow-lg h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
          <Disc size={16} /> Smart Money Flow
        </h3>
        <span className="text-xs text-gray-500 font-mono">THRESHOLD: $100k+</span>
      </div>

      <div className="overflow-y-auto pr-2 flex-grow space-y-1">
        <div className="grid grid-cols-5 text-xs text-gray-500 pb-2 border-b border-ai-border font-mono uppercase">
          <div className="col-span-1">Time</div>
          <div className="col-span-1">Type</div>
          <div className="col-span-1 text-center">Side</div>
          <div className="col-span-1 text-right">Price</div>
          <div className="col-span-1 text-right">Val (USD)</div>
        </div>
        
        {signals.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full text-gray-600 text-sm font-mono opacity-50">
             <div className="animate-spin mb-2">✦</div>
             Scanning for whales...
           </div>
        ) : (
          signals.map((signal) => (
            <div 
              key={signal.id} 
              className="grid grid-cols-5 text-xs py-2 border-b border-ai-border/50 hover:bg-white/5 transition-colors font-mono items-center animate-in fade-in slide-in-from-top-1 duration-300"
            >
              <div className="col-span-1 text-gray-400">{signal.time}</div>
              <div className="col-span-1">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  signal.type === 'INSTITUTIONAL' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                  signal.type === 'WHALE' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                }`}>
                  {signal.type}
                </span>
              </div>
              <div className={`col-span-1 text-center font-bold flex items-center justify-center gap-1 ${signal.side === 'BUY' ? 'text-buy' : 'text-sell'}`}>
                {signal.side === 'BUY' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {signal.side}
              </div>
              <div className="col-span-1 text-right text-gray-300">${signal.price.toFixed(2)}</div>
              <div className="col-span-1 text-right font-medium text-gray-200">
                ${(signal.valueUSD / 1000).toFixed(1)}k
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WhaleFeed;