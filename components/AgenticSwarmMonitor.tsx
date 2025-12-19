
import React, { useState, useEffect, useRef } from 'react';
import { Bot, ShieldCheck, Zap, Activity, Users, MessageSquareCode, Play, UserCog, Scale, CheckCircle2, XCircle, BrainCircuit, ShieldAlert, HeartPulse, RotateCcw } from 'lucide-react';
import { AgenticSwarmEngine } from '../services/AgenticSwarmEngine';
import { SwarmMessage, InvestmentGoal, ConsensusResult, SwarmHealthState } from '../types';
import { SWARM_CONFIG } from '../constants';

export const AgenticSwarmMonitor: React.FC<{ targetSymbol: string }> = ({ targetSymbol }) => {
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<SwarmMessage[]>([]);
  const [consensus, setConsensus] = useState<ConsensusResult | null>(null);
  const [health, setHealth] = useState<SwarmHealthState>({
    confidence: 0,
    actualPnL: 0,
    driftScore: 0,
    status: 'OPTIMAL'
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const swarm = useRef<AgenticSwarmEngine>(
    new AgenticSwarmEngine(
      (msg) => setMessages(prev => [...prev, msg].slice(-40)),
      (res) => setConsensus(res),
      (h) => setHealth(h)
    )
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStart = async () => {
    setIsActive(true);
    setConsensus(null);
    const goal: InvestmentGoal = {
      strategy: 'SCALP',
      riskTolerance: 'MED',
      targetSymbol
    };
    await swarm.current.startAgenticSwarm(goal);
    setIsActive(false);
  };

  const personaColor = 
    SWARM_CONFIG.currentPersona === 'AGGRESSIVE_DEGEN' ? 'text-red-400 border-red-500/30' :
    SWARM_CONFIG.currentPersona === 'HEDGE_FUND_MANAGER' ? 'text-amber-400 border-amber-500/30' :
    'text-ai-accent border-ai-accent/30';

  const isEStop = health.status === 'EMERGENCY_STOP';

  return (
    <div className={`bg-[#050505] border rounded-lg p-3 font-mono flex flex-col gap-3 shadow-[0_0_20px_rgba(59,130,246,0.1)] relative overflow-hidden h-[380px] transition-all duration-700 ${isEStop ? 'border-red-500 shadow-neon-red' : 'border-ai-accent/30'}`}>
      <div className="absolute inset-0 bg-blue-500/5 opacity-5 pointer-events-none" />
      {isEStop && <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />}
      
      <div className="flex justify-between items-start shrink-0">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border transition-all ${isEStop ? 'bg-red-500/10 border-red-500/30' : 'bg-ai-accent/10 border-ai-accent/30'}`}>
            {isEStop ? <ShieldAlert size={14} className="text-red-500" /> : <Users size={14} className="text-ai-accent" />}
          </div>
          <div>
            <span className="text-[10px] text-white font-black uppercase tracking-widest">Agentic_Swarm_v5.0</span>
            <div className="flex items-center gap-2 text-[8px] text-gray-500">
              <span className={`flex items-center gap-1 ${isEStop ? 'text-red-400' : ''}`}><Bot size={8} /> {isEStop ? 'HALTED' : '4_AGENTS_ACTIVE'}</span>
              <span className="flex items-center gap-1 text-emerald-500/70"><BrainCircuit size={8} /> REFLEX_ON</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[8px] font-black tracking-widest uppercase bg-black/40 ${personaColor}`}>
             <UserCog size={10} /> {SWARM_CONFIG.currentPersona}
          </div>
          <div className="flex gap-2">
            {isEStop && (
                <button 
                  onClick={() => swarm.current.resetSafety()}
                  className="flex items-center gap-2 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white border border-emerald-500 hover:scale-105 transition-all"
                >
                  <RotateCcw size={10} /> Override_Reset
                </button>
            )}
            <button 
              onClick={handleStart}
              disabled={isActive || isEStop}
              className={`flex items-center gap-2 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all ${
                isEStop ? 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed' :
                isActive ? 'bg-gray-800 text-gray-500 border border-gray-700' : 'bg-ai-accent text-white border border-ai-accent shadow-neon-blue hover:scale-105'
              }`}
            >
              {isActive ? <Zap size={10} className="animate-spin" /> : <Play size={10} />}
              {isEStop ? 'Logic_Halt' : isActive ? 'Cycle_Running' : 'Ignite_Swarm'}
            </button>
          </div>
        </div>
      </div>

      {/* SAFETY HUD SECTION */}
      <div className="grid grid-cols-3 gap-2 shrink-0">
          <div className="bg-black/40 border border-white/5 p-1.5 rounded flex flex-col items-center justify-center gap-0.5">
             <span className="text-[7px] text-gray-600 font-black uppercase">Drift_Score</span>
             <span className={`text-[10px] font-black tabular-nums ${health.driftScore > 0.6 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {health.driftScore.toFixed(3)}
             </span>
          </div>
          <div className="bg-black/40 border border-white/5 p-1.5 rounded flex flex-col items-center justify-center gap-0.5">
             <span className="text-[7px] text-gray-600 font-black uppercase">Session_PnL</span>
             <span className={`text-[10px] font-black tabular-nums ${health.actualPnL < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {health.actualPnL > 0 ? '+' : ''}{(health.actualPnL * 100).toFixed(2)}%
             </span>
          </div>
          <div className={`bg-black/40 border p-1.5 rounded flex flex-col items-center justify-center gap-0.5 transition-colors ${isEStop ? 'border-red-500/50' : 'border-white/5'}`}>
             <span className="text-[7px] text-gray-600 font-black uppercase">Health_Status</span>
             <span className={`text-[8px] font-black tracking-tighter transition-all ${isEStop ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                {health.status}
             </span>
          </div>
      </div>

      {/* CONSENSUS DASHBOARD */}
      {consensus && (
        <div className="bg-black/60 border border-white/10 rounded p-2 animate-in zoom-in-95 duration-500">
           <div className="flex justify-between items-center mb-2">
              <span className="text-[8px] text-gray-500 font-black uppercase tracking-tighter">Swarm_Consensus_Audit</span>
              <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${consensus.status === 'APPROVED' ? 'text-emerald-500' : 'text-red-500'}`}>
                {consensus.status === 'APPROVED' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                {consensus.status}: {consensus.reason}
              </div>
           </div>
           <div className="grid grid-cols-4 gap-2">
              {consensus.votes?.map((v, idx) => (
                <div key={idx} className="flex flex-col gap-1 border-r border-white/5 last:border-0 pr-1">
                  <span className="text-[7px] text-gray-600 font-bold uppercase truncate">{v.agent}</span>
                  <div className="h-1 w-full bg-gray-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${v.score > 0.7 ? 'bg-emerald-500' : v.score < 0.3 ? 'bg-red-500' : 'bg-ai-accent'}`}
                      style={{ width: `${v.score * 100}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-gray-400 font-black">{(v.score * 100).toFixed(0)}%</span>
                </div>
              ))}
           </div>
        </div>
      )}

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar bg-black/40 border border-white/5 rounded p-2 space-y-2 text-[10px]"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-700 opacity-50 space-y-2">
             <MessageSquareCode size={24} />
             <span className="text-[8px] uppercase tracking-[0.3em]">Awaiting_Cognitive_Initialization</span>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="flex flex-col gap-1 animate-in fade-in slide-in-from-left-1">
              <div className="flex items-center gap-2">
                <span className={`px-1 rounded-[2px] font-black text-[8px] tracking-tighter ${
                  m.agent === 'ANALYST' ? 'bg-blue-500/20 text-blue-400' :
                  m.agent === 'SENTINEL' ? 'bg-amber-500/20 text-amber-400' :
                  m.agent === 'NEGOTIATOR' ? 'bg-purple-500/20 text-purple-400' :
                  m.agent === 'SCIENTIST' ? 'bg-teal-500/20 text-teal-400' :
                  m.agent === 'SCAVENGER' ? 'bg-emerald-500/20 text-emerald-400' :
                  m.agent === 'CORE_OS' ? (m.content.includes('CRITICAL') ? 'bg-red-500 text-white' : 'bg-indigo-900/40 text-indigo-400 border border-indigo-500/30') :
                  'bg-gray-800 text-gray-400'
                }`}>
                  [{m.agent}]
                </span>
                <span className="text-[8px] text-gray-600 tabular-nums">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour12: false })}
                </span>
              </div>
              <p className={`text-gray-300 leading-relaxed pl-2 border-l ml-1 ${m.content.includes('CRITICAL') ? 'border-red-500 text-red-300' : m.content.includes('heuristic updated') ? 'border-emerald-500 text-emerald-400' : 'border-white/10'}`}>
                {m.content}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="mt-1 pt-2 border-t border-white/5 flex justify-between items-center shrink-0">
         <div className="flex items-center gap-3">
           <div className={`flex items-center gap-1.5 text-[8px] font-black uppercase ${isEStop ? 'text-red-500' : 'text-gray-600'}`}>
              <ShieldCheck size={10} className={isEStop ? 'text-red-500' : 'text-emerald-500'} /> Safety_Lock: {isEStop ? 'TRIPPED' : 'ENGAGED'}
           </div>
           <div className="text-[7px] text-gray-800 font-bold uppercase tracking-tighter bg-white/5 px-1.5 py-0.5 rounded border border-white/5 flex items-center gap-1">
              <HeartPulse size={8} className={isEStop ? 'text-red-500 animate-pulse' : 'text-emerald-500'} /> Core_Vitals: {isEStop ? 'DEAD' : 'STABLE'}
           </div>
         </div>
         <span className="text-[7px] text-gray-800 italic uppercase">Hive_Mind_Loop_Active</span>
      </div>
    </div>
  );
};
