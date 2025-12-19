import React from 'react';
import { IcebergSignal } from '../types';

interface IcebergFeedProps {
  signals: IcebergSignal[];
}

const IcebergFeed: React.FC<IcebergFeedProps> = ({ signals }) => {
  return (
    <div className="bg-ai-panel border border-ai-border rounded-lg p-5 h-[400px] flex flex-col shadow-lg overflow-hidden">
      <div className="flex justify-between items-center mb-4 border-b border-ai-border pb-3">
        <h2 className="text-sm font-bold text-gray-200">ADAPTIVE ICEBERG ENGINE</h2>
        <div className="text-buy border border-buy px-2 py-0.5 text-[10px] font-bold tracking-wider rounded">
          LIVE
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-4 font-mono">
        DETECTING HIDDEN WALLS {'>'} DYNAMIC THRESHOLD
      </p>

      <div className="overflow-y-auto custom-scrollbar flex-grow space-y-2">
        {signals.length === 0 ? (
          <div className="text-center py-10 text-gray-600 italic text-xs">
            Scanning order flow...
          </div>
        ) : (
          signals.map((s) => (
            <div 
              key={s.id} 
              className={`
                bg-ai-dark p-3 flex justify-between items-center text-xs rounded
                border-l-[4px] ${s.type === 'HIDDEN_BUY' ? 'border-buy' : 'border-sell'}
                animate-in fade-in slide-in-from-right-1 duration-200
              `}
            >
              <div>
                <div className="text-gray-500 mb-0.5 font-mono">{new Date(s.timestamp).toLocaleTimeString()}</div>
                <div className={`font-bold ${s.type === 'HIDDEN_BUY' ? 'text-buy' : 'text-sell'}`}>
                  {s.type.replace('_', ' ')}
                </div>
              </div>
              
              <div className="text-center font-mono">
                <div className="text-gray-600 text-[10px]">LEVEL</div>
                <div className="font-bold text-white text-sm">${s.price.toFixed(2)}</div>
              </div>

              <div className="text-right font-mono">
                <div className="text-gray-600 text-[10px]">ABSORBED / THRESHOLD</div>
                <div className="font-bold text-gray-300">
                  {s.volAbsorbed.toFixed(2)} <span className="text-gray-600">/ {s.thresholdAtTime.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IcebergFeed;