
import React, { useEffect, useState } from 'react';
import { ShieldAlert, Zap } from 'lucide-react';

export const SweepAlert: React.FC<{ data: any }> = ({ data }) => {
  const [activeSweep, setActiveSweep] = useState<any | null>(null);

  useEffect(() => {
    // Logic to detect price gaps in rapid succession
    // Simplified for this implementation
    if (data?.isSweep) {
      setActiveSweep(data);
      const timer = setTimeout(() => setActiveSweep(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (!activeSweep) return null;

  return (
    <div className="p-3 bg-red-500/10 border border-red-500/30 mx-2 my-1 rounded animate-in zoom-in-95 duration-200">
      <div className="flex items-center gap-2 text-red-500 mb-1">
        <ShieldAlert size={14} className="animate-pulse" />
        <span className="text-[10px] font-black tracking-widest uppercase">Aggressive_Sweep_Detected</span>
      </div>
      <div className="text-[9px] text-gray-400 font-mono">
        Levels Cleared: <span className="text-white font-bold">{activeSweep.levels}</span>
        <br />
        Impact Vol: <span className="text-white font-bold">{activeSweep.vol.toFixed(2)} BTC</span>
      </div>
    </div>
  );
};
