
import React, { useMemo } from 'react';
import { Layers } from 'lucide-react';

interface Cluster {
  price: number;
  volume: number;
}

export const ClusterHeatmap: React.FC<{ trades: any[] }> = ({ trades }) => {
  const clusters = useMemo(() => {
    const map = new Map<number, number>();
    trades.forEach(t => {
      const rounded = Math.round(parseFloat(t.p) / 10) * 10;
      map.set(rounded, (map.get(rounded) || 0) + parseFloat(t.q));
    });
    return Array.from(map.entries())
      .map(([price, volume]) => ({ price, volume }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 12);
  }, [trades]);

  const maxVol = Math.max(...clusters.map(c => c.volume), 1);

  return (
    <div className="flex-1 bg-[#0a0a0a] border border-gray-800 p-2 overflow-hidden flex flex-col">
      <h4 className="text-[9px] text-ai-accent font-black uppercase mb-3 flex items-center gap-2 tracking-widest">
        <Layers size={12} /> Volume_Cluster_Heatmap
      </h4>
      <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
        {clusters.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[8px] text-gray-800 font-black uppercase">Scanning Cluster Density...</div>
        ) : (
          clusters.map((c, i) => (
            <div key={i} className="flex items-center gap-2 h-5 group">
              <span className="text-[9px] font-mono text-gray-500 w-16 group-hover:text-white transition-colors">
                ${c.price.toLocaleString()}
              </span>
              <div className="flex-1 h-2 bg-black rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-ai-accent opacity-40 rounded-full transition-all duration-700"
                  style={{ width: `${(c.volume / maxVol) * 100}%` }}
                />
              </div>
              <span className="text-[8px] font-mono text-gray-700 w-10 text-right">
                {c.volume.toFixed(2)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
