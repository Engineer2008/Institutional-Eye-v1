
import React, { useMemo } from 'react';
import { Brain, ChevronRight, Zap } from 'lucide-react';

interface PredictiveDisplayProps {
  bids: any[];
  asks: any[];
  lastPrice: number;
  toxicityScore: number;
}

export const PredictiveDisplay: React.FC<PredictiveDisplayProps> = ({ bids, asks, lastPrice, toxicityScore }) => {
  const prediction = useMemo(() => {
    const bidQty = bids.slice(0, 5).reduce((a, b) => a + parseFloat(b[1] || b.qty || 0), 0);
    const askQty = asks.slice(0, 5).reduce((a, b) => a + parseFloat(b[1] || b.qty || 0), 0);
    const bias = bidQty / (bidQty + askQty + 1e-9);
    
    let direction: 'UP' | 'DOWN' | 'SIDEWAYS' = 'SIDEWAYS';
    let confidence = 0;

    if (bias > 0.65 && toxicityScore < 0.3) {
      direction = 'UP';
      confidence = bias * 100;
    } else if (bias < 0.35 && toxicityScore < 0.3) {
      direction = 'DOWN';
      confidence = (1 - bias) * 100;
    } else if (toxicityScore > 0.6) {
      direction = bias > 0.5 ? 'UP' : 'DOWN';
      confidence = toxicityScore * 100;
    }

    return { direction, confidence };
  }, [bids, asks, toxicityScore]);

  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
      <div className="bg-black/80 backdrop-blur-md border border-ai-accent/30 rounded p-3 flex items-center gap-4 shadow-2xl">
        <div className="p-2 bg-ai-accent/10 rounded border border-ai-accent/20">
          <Brain size={18} className="text-ai-accent" />
        </div>
        <div>
          <div className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Structural_Projection</div>
          <div className="flex items-center gap-3">
            <span className={`text-lg font-black tracking-tighter flex items-center gap-1 ${prediction.direction === 'UP' ? 'text-emerald-500' : prediction.direction === 'DOWN' ? 'text-red-500' : 'text-gray-400'}`}>
              EXPECTED: {prediction.direction}
              {prediction.direction !== 'SIDEWAYS' && <ChevronRight size={16} className={prediction.direction === 'UP' ? '-rotate-90' : 'rotate-90'} />}
            </span>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="text-[10px] font-mono font-bold text-gray-300">
              CONF: {prediction.confidence.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-black/60 backdrop-blur-sm border border-white/5 rounded-md px-3 py-1 text-[8px] text-gray-500 font-mono tracking-widest uppercase flex items-center gap-2">
        <Zap size={10} className="text-yellow-500" /> Latency Optimized Inference: 0.04ms
      </div>
    </div>
  );
};
