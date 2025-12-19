
import React from 'react';
import { MarketSignalState, useMasterForensicEngine } from '../hooks/useMasterForensicEngine';
import { ShieldAlert, Zap, Activity } from 'lucide-react';

interface IntegratedCoreProps {
  state: MarketSignalState;
}

export const IntegratedCore: React.FC<IntegratedCoreProps> = ({ state }) => {
  const { convictionScore, marketMode, isGunpoint, action } = useMasterForensicEngine(state);

  return (
    <div className="p-4 bg-black border-l-4 border-blue-600 shadow-neon-blue rounded-r-lg font-mono min-h-[180px] flex flex-col justify-between relative overflow-hidden group">
      {/* Background scanline effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-[10px] text-blue-500 font-black tracking-[0.2em] mb-1">MASTER_LOGIC_CORE</div>
            <div className="text-3xl font-black text-white leading-none">
              {convictionScore}% <span className="text-[10px] text-gray-500 font-normal">CONVICTION</span>
            </div>
          </div>
          <div className={`px-2 py-1 text-[10px] font-bold rounded border ${
            isGunpoint ? 'bg-red-900/40 text-red-400 border-red-500/50 animate-pulse' : 'bg-gray-900 text-gray-500 border-gray-800'
          }`}>
            {isGunpoint ? 'FORCE_EXECUTION_DETECTED' : 'SYSTEM_STABLE'}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-[9px] text-gray-600 font-black uppercase mb-1">STRATEGIC_BIAS</div>
            <div className="text-sm font-bold text-white underline decoration-blue-500 underline-offset-4 decoration-2">
              {action} // {marketMode}
            </div>
          </div>

          {/* Sub-Metrics Detail */}
          <div className="space-y-2">
            <div className="flex justify-between text-[9px] text-gray-500 font-bold">
              <span className="flex items-center gap-1"><Activity size={10} /> ABSORPTION_INDEX</span>
              <span className="text-white">{state.forensicRatio.toFixed(2)}x</span>
            </div>
            <div className="w-full h-1 bg-gray-900 overflow-hidden rounded-full">
              <div 
                className="h-full bg-blue-500 transition-all duration-700 shadow-[0_0_8px_#3B82F6]"
                style={{ width: `${Math.min(100, (state.forensicRatio / 2.5) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Decryption Key */}
      <div className="mt-4 pt-2 border-t border-white/5 flex justify-between items-center text-[8px] text-gray-700 font-black">
        <span className="flex items-center gap-1"><Zap size={8} className="text-yellow-500" /> HFT_LINK_ACTIVE</span>
        <span className="opacity-50">CORE_HASH: {Math.random().toString(36).substring(7).toUpperCase()}</span>
      </div>
    </div>
  );
};

export default IntegratedCore;
