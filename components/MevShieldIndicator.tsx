
import React from 'react';
import { Shield, ShieldAlert, Cpu, Network, Zap } from 'lucide-react';
import { RoutingConfig } from '../types';

interface MevShieldIndicatorProps {
  config: RoutingConfig;
}

export const MevShieldIndicator: React.FC<MevShieldIndicatorProps> = ({ config }) => {
  const isStealth = config.label === "STEALTH_EXECUTION";

  return (
    <div className={`bg-black/60 border rounded-lg p-3 font-mono flex flex-col gap-2 transition-all duration-500 ${isStealth ? 'border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'border-ai-border'}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {isStealth ? <Shield size={12} className="text-purple-400" /> : <Network size={12} className="text-blue-400" />}
          <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Routing_Matrix_v4.0</span>
        </div>
        <div className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${isStealth ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
          {config.label}
        </div>
      </div>

      <div className="flex flex-col gap-1 mt-1">
        <div className="flex justify-between items-center text-[8px]">
          <span className="text-gray-600 uppercase font-bold">Active_RPC</span>
          <span className="text-gray-300 truncate max-w-[150px]">{config.rpc.replace('https://', '')}</span>
        </div>
        <div className="flex justify-between items-center text-[8px]">
          <span className="text-gray-600 uppercase font-bold">MEV_Share</span>
          <span className={config.useMevShare ? "text-emerald-500 font-black" : "text-gray-700"}>
            {config.useMevShare ? "ENCRYPTED_REBATE" : "DISABLED"}
          </span>
        </div>
        <div className="flex justify-between items-center text-[8px]">
          <span className="text-gray-600 uppercase font-bold">Builder_Priority</span>
          <span className="text-ai-accent font-black tracking-tighter">{config.priorityFee}</span>
        </div>
      </div>

      {isStealth && (
        <div className="mt-1 flex items-center gap-1.5 text-[7px] text-purple-400 font-black uppercase animate-pulse">
          <ShieldAlert size={10} /> Pre-emptive sandwich protection engaged
        </div>
      )}
    </div>
  );
};
