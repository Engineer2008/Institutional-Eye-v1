
import React from 'react';

interface SignalConfidenceProps {
  type: string;
  currentToxicity: number;
}

export const SignalConfidence: React.FC<SignalConfidenceProps> = ({ type, currentToxicity }) => {
  // Logic: Lower confidence if Toxicity is too high for a "Manual" trade
  const calculateProbability = () => {
    if (type === 'GUNPOINT') return currentToxicity > 0.9 ? 45 : 72;
    if (type === 'SWEEP') return 65;
    return 58;
  };

  return (
    <div className="mt-2 p-2 bg-blue-900/10 border border-blue-900/30 rounded group-hover:border-blue-500/50 transition-colors">
      <div className="flex justify-between text-[9px] font-mono">
        <span className="text-blue-400 font-black tracking-widest">SIGNAL_PROBABILITY</span>
        <span className="text-white font-black">{calculateProbability()}%</span>
      </div>
      <div className="w-full h-1 bg-gray-900 mt-1 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 shadow-neon-blue transition-all duration-1000 ease-out"
          style={{ width: `${calculateProbability()}%` }}
        />
      </div>
    </div>
  );
};

export default SignalConfidence;
