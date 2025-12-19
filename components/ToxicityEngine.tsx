
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Activity, ShieldAlert } from 'lucide-react';

interface Trade {
  p: number;
  q: number;
  m: boolean;
}

interface ToxicityEngineProps {
  bucketSize: number;
  windowSize: number;
  incomingTrade: Trade | null;
}

export const ToxicityEngine: React.FC<ToxicityEngineProps> = ({ bucketSize, windowSize, incomingTrade }) => {
  const [toxicity, setToxicity] = useState(0);
  const buyVol = useRef(0);
  const sellVol = useRef(0);
  const currentBucketVol = useRef(0);
  const bucketImbalances = useRef<number[]>([]);

  useEffect(() => {
    if (!incomingTrade) return;

    const { q, m } = incomingTrade;
    if (m) sellVol.current += q;
    else buyVol.current += q;
    
    currentBucketVol.current += q;

    if (currentBucketVol.current >= bucketSize) {
      const imbalance = Math.abs(buyVol.current - sellVol.current);
      bucketImbalances.current.push(imbalance);
      
      if (bucketImbalances.current.length > windowSize) {
        bucketImbalances.current.shift();
      }

      // Calculate Toxicity (VPIN Proxy)
      const sumImbalance = bucketImbalances.current.reduce((a, b) => a + b, 0);
      const totalVolInWindow = bucketImbalances.current.length * bucketSize;
      const score = totalVolInWindow > 0 ? sumImbalance / totalVolInWindow : 0;
      
      setToxicity(score);

      // Reset bucket
      buyVol.current = 0;
      sellVol.current = 0;
      currentBucketVol.current = 0;
    }
  }, [incomingTrade, bucketSize, windowSize]);

  const status = useMemo(() => {
    if (toxicity > 0.7) return { label: 'TOXIC', color: 'text-red-500' };
    if (toxicity > 0.4) return { label: 'ELEVATED', color: 'text-yellow-500' };
    return { label: 'STABLE', color: 'text-emerald-500' };
  }, [toxicity]);

  return (
    <div className="flex items-center gap-4 bg-black/40 px-3 py-1 rounded border border-white/5 font-mono">
      <div className="flex flex-col">
        <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest flex items-center gap-1">
          <Activity size={10} className="text-ai-accent" /> Flow_Toxicity
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-black transition-colors ${status.color}`}>
            {(toxicity * 100).toFixed(1)}%
          </span>
          <span className={`text-[9px] font-bold ${status.color} opacity-70`}>{status.label}</span>
        </div>
      </div>
      <div className="h-6 w-[1px] bg-white/10" />
      <div className="flex flex-col">
        <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest">Informed_Flow</span>
        <div className="flex gap-0.5 mt-0.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={i} 
              className={`w-1 h-2 rounded-full ${toxicity * 10 > i ? (toxicity > 0.6 ? 'bg-red-500' : 'bg-ai-accent') : 'bg-gray-800'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
