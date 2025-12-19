
import React, { useState, useEffect } from 'react';
import { Orbit, Radio, Globe, Zap, Loader2, CheckCircle2, ShieldCheck, Timer, Satellite } from 'lucide-react';
import { syncInterstellarState, getLocalPlanetaryState } from '../services/InterstellarSettlementEngine';
import { PlanetaryState, InterstellarTransmission } from '../types';

export const InterstellarSettlementMonitor: React.FC = () => {
  const [activeTx, setActiveTx] = useState<InterstellarTransmission | null>(null);
  const [localState, setLocalState] = useState<PlanetaryState>(getLocalPlanetaryState());
  const [isProving, setIsProving] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const startSync = async () => {
    setIsProving(true);
    const state = getLocalPlanetaryState();
    setLocalState(state);

    // Initial state setup (UI only)
    const dummyProof = "state_zkp_generating...";
    
    const start = performance.now();
    // Use the actual service
    // Note: The service itself handles the full lifecycle
    // We update UI local state to reflect stages
    
    // Stage 1: Proving
    await new Promise(r => setTimeout(r, 2000));
    setIsProving(false);

    // Stage 2: Transmit
    const tx: InterstellarTransmission = {
        id: `TX-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        destination: 'MARS_HUB_1',
        payload: 'zkp_verified',
        status: 'TRANSMITTING',
        eta: 15, // 15s demo
        signalStrength: 0.99
    };
    setActiveTx(tx);
    setCountdown(tx.eta);
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (activeTx && countdown === 0 && activeTx.status !== 'SETTLED') {
      setActiveTx({ ...activeTx, status: 'SETTLED' });
    }
  }, [countdown, activeTx]);

  return (
    <div className="bg-[#050505] border border-blue-500/20 rounded-lg p-3 font-mono flex flex-col gap-3 shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
      {activeTx?.status === 'TRANSMITTING' && (
          <div className="absolute top-0 left-0 h-0.5 bg-ai-accent animate-pulse" style={{ width: `${(countdown / 15) * 100}%` }} />
      )}

      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-ai-accent/10 rounded border border-ai-accent/20">
             <Orbit size={12} className="text-ai-accent animate-spin-slow" />
          </div>
          <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Interstellar_Settlement_v7.0</span>
        </div>
        <button 
          onClick={startSync}
          disabled={isProving || (activeTx?.status === 'TRANSMITTING')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${
            isProving || (activeTx?.status === 'TRANSMITTING') ? 'bg-gray-800 text-gray-500' : 'bg-ai-accent/10 text-ai-accent border border-ai-accent/30 hover:bg-ai-accent hover:text-white'
          }`}
        >
          {isProving ? <Loader2 size={10} className="animate-spin" /> : <Radio size={10} />}
          Ignite_Link
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col gap-1">
             <span className="text-[7px] text-gray-600 font-black uppercase">Planetary_Origin</span>
             <div className="flex items-center gap-2">
                <Globe size={12} className="text-emerald-500" />
                <span className="text-[9px] text-white font-bold tracking-tighter">{localState.planet}_SYS_0</span>
             </div>
          </div>
          <div className="bg-black/40 border border-white/5 p-2 rounded flex flex-col gap-1">
             <span className="text-[7px] text-gray-600 font-black uppercase">Laser_Link_Status</span>
             <div className={`text-[9px] font-black uppercase flex items-center gap-1.5 ${activeTx?.status === 'SETTLED' ? 'text-emerald-500' : activeTx?.status === 'TRANSMITTING' ? 'text-amber-500 animate-pulse' : 'text-gray-600'}`}>
                <Satellite size={10} />
                {activeTx?.status || 'OFFLINE'}
             </div>
          </div>
      </div>

      {activeTx && (
        <div className="bg-ai-accent/5 border border-ai-accent/20 p-2 rounded animate-in zoom-in-95 duration-300 space-y-2">
           <div className="flex justify-between items-center text-[7px] font-black uppercase">
              <span className="text-gray-500">Transmission_ID: {activeTx.id}</span>
              <span className="text-ai-accent flex items-center gap-1">
                <Timer size={8} /> T-MINUS: {countdown}s
              </span>
           </div>
           
           <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[7px] text-gray-600 font-bold uppercase">
                 <span>Signal_Integrity</span>
                 <span>{(activeTx.signalStrength * 100).toFixed(1)}%</span>
              </div>
              <div className="h-1 bg-black rounded-full overflow-hidden flex">
                 <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${activeTx.signalStrength * 100}%` }} />
              </div>
           </div>

           {activeTx.status === 'SETTLED' && (
              <div className="flex items-center gap-2 text-emerald-500 text-[8px] font-black uppercase animate-in fade-in">
                 <CheckCircle2 size={10} /> State synchronized with Mars node
              </div>
           )}
        </div>
      )}

      <div className="mt-1 pt-2 border-t border-white/5 flex justify-between items-center text-[7px] text-gray-700 font-black uppercase">
         <div className="flex items-center gap-2">
            <ShieldCheck size={10} className="text-emerald-500" /> Relativistic_Proof: Verified
         </div>
         <span className="text-ai-accent">Deep_Space_Relay_Armed</span>
      </div>
    </div>
  );
};
