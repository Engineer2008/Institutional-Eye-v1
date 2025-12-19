
import React from 'react';

export const AITag: React.FC<{ probability: number, fingerprint: string }> = ({ probability, fingerprint }) => {
  if (probability < 0.8) return null;

  return (
    <div className="flex items-center gap-1 border border-blue-500/30 bg-blue-900/10 px-1.5 py-0.5 rounded animate-in fade-in zoom-in-95 duration-300">
      <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse shadow-[0_0_4px_#60A5FA]" />
      <span className="text-[8px] text-blue-300 font-mono tracking-tighter uppercase font-black">
        AI_FINGERPRINT: {fingerprint} ({ (probability * 100).toFixed(0) }%)
      </span>
    </div>
  );
};

export default AITag;
