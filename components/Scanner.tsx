
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AdaptiveBrain, Trade, EngineMode, IntelligenceMetadata } from '../services/AdaptiveBrain';
import { 
  Wifi, Activity, Database, Radio, RefreshCw, Zap, 
  Settings2, Binary, Gauge, Server, ShieldCheck, Cpu, 
  Layers, Network, Search, Globe
} from 'lucide-react';
import { Signal } from '../services/AdaptiveBrain';

interface ScannerProps {
  onSignal: (sig: Signal & { intel?: IntelligenceMetadata }) => void;
  variant?: 'full' | 'compact';
  onDetailsClick?: () => void;
}

const SYNC_PROFILES = [
  { id: 'CLINICAL', label: 'Institutional (v4)', color: 'text-ai-accent', desc: 'High confidence clusters' },
  { id: 'AGGRESSIVE', label: 'Aggressive Scalp', color: 'text-amber-500', desc: 'Sensitive to micro-sweeps' },
  { id: 'HFT', label: 'HFT Discovery', color: 'text-purple-500', desc: 'Predictive order flow' },
  { id: 'STEALTH', label: 'Whale Stealth', color: 'text-emerald-500', desc: 'Deep time split detection' }
];

type ProtocolState = 'REST_MESH' | 'DYN_PROTO' | 'NEURAL_SYNC';
type ConnectionStatus = 'IDLE' | 'SYNCING' | 'LOCKED' | 'PARTITIONED';

const Scanner: React.FC<ScannerProps> = ({ onSignal, variant = 'full', onDetailsClick }) => {
  const [protocol, setProtocol] = useState<ProtocolState>('REST_MESH');
  const [status, setStatus] = useState<ConnectionStatus>('IDLE');
  const [engineMode, setEngineMode] = useState<EngineMode>('CLINICAL');
  const [pairsCount, setPairsCount] = useState(0);
  const [latency, setLatency] = useState(0);
  const [pps, setPps] = useState(0);
  const [showConfig, setShowConfig] = useState(false);
  
  const brain = useRef(new AdaptiveBrain());
  const streamWs = useRef<WebSocket | null>(null);
  const ppsCounter = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPps(ppsCounter.current);
      ppsCounter.current = 0;
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const initSync = useCallback(async (mode: EngineMode) => {
    setStatus('SYNCING');
    setProtocol('REST_MESH');
    brain.current.setMode(mode);

    try {
      const resp = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      if (!resp.ok) throw new Error('REST_BLOCK');
      
      const data = await resp.json();
      const markets = data
        .filter((t: any) => t.symbol.endsWith('USDT'))
        .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice(0, 150)
        .map((t: any) => t.symbol.toLowerCase());

      setPairsCount(markets.length);
      connectMesh(markets);
    } catch (e) {
      setProtocol('DYN_PROTO');
      fallbackDiscovery();
    }
  }, []);

  const fallbackDiscovery = useCallback(() => {
    const ws = new WebSocket('wss://stream.binance.com:443/ws/!miniTicker@arr');
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (Array.isArray(data)) {
        const markets = data
          .filter((t: any) => t.s.endsWith('USDT'))
          .sort((a: any, b: any) => parseFloat(b.q) - parseFloat(a.q))
          .slice(0, 100)
          .map((t: any) => t.s.toLowerCase());
        setPairsCount(markets.length);
        ws.close();
        connectMesh(markets);
      }
    };
  }, []);

  const connectMesh = (markets: string[]) => {
    if (streamWs.current) streamWs.current.close();
    setProtocol('NEURAL_SYNC');
    
    const ws = new WebSocket('wss://stream.binance.com:443/stream');
    streamWs.current = ws;

    ws.onopen = () => {
      setStatus('LOCKED');
      const batchSize = 50;
      for (let i = 0; i < markets.length; i += batchSize) {
        const chunk = markets.slice(i, i + batchSize).map(s => `${s}@aggTrade`);
        ws.send(JSON.stringify({ method: 'SUBSCRIBE', params: chunk, id: i }));
      }
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.data && msg.data.e === 'aggTrade') {
        const d = msg.data;
        ppsCounter.current++;
        setLatency(l => (l * 0.95) + ((Date.now() - d.E) * 0.05));
        
        const sig = brain.current.process({
          s: d.s,
          p: parseFloat(d.p),
          q: parseFloat(d.q),
          m: d.m,
          T: d.T
        });
        if (sig) onSignal(sig);
      }
    };

    ws.onclose = () => {
      if (status !== 'IDLE') {
        setStatus('PARTITIONED');
        setTimeout(() => initSync(engineMode), 5000);
      }
    };
  };

  useEffect(() => {
    initSync(engineMode);
    return () => streamWs.current?.close();
  }, [initSync]);

  const changeMode = (mode: EngineMode) => {
    setEngineMode(mode);
    initSync(mode);
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 h-full">
        <button 
          onClick={onDetailsClick}
          className={`flex items-center gap-4 bg-black/40 border ${status === 'LOCKED' ? 'border-ai-accent/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-amber-500/30'} hover:border-ai-accent transition-all rounded-xl px-4 py-1.5 h-full group`}
        >
          <div className="flex items-center gap-2 relative">
             <div className={`w-2 h-2 rounded-full ${status === 'LOCKED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
             <div className="flex flex-col items-start">
                <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">{status}</span>
                <span className="text-[7px] text-gray-500 font-bold uppercase tracking-tighter">{protocol}</span>
             </div>
          </div>
          <div className="h-6 w-[1px] bg-white/10" />
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <Zap size={10} className="text-ai-accent" />
              <span className="text-gray-300 font-bold tabular-nums">{latency.toFixed(0)}ms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity size={10} className="text-emerald-500" />
              <span className="text-gray-300 font-bold tabular-nums">{pps} p/s</span>
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#080a0f] border-b border-ai-border/60 p-4 shadow-2xl relative overflow-hidden font-mono">
      {/* Background Pipeline Animation */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.3)_0,transparent_100%)]" />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="bg-ai-accent/10 p-2.5 rounded-xl border border-ai-accent/20 shadow-neon-blue/20">
                <Radio size={20} className="text-ai-accent animate-pulse" />
             </div>
             <div className="flex flex-col">
                <h2 className="text-xs font-black text-white tracking-[0.4em] uppercase leading-none">Global_Liquidity_Scanner_v4.5</h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Database size={10} /> Nodes: {pairsCount}
                  </span>
                  <div className="h-2 w-[1px] bg-white/10" />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${status === 'LOCKED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    Status: {status}
                  </span>
                </div>
             </div>
          </div>

          {/* PROTOCOL VISUALIZER */}
          <div className="hidden lg:flex items-center gap-3">
             {['REST_MESH', 'DYN_PROTO', 'NEURAL_SYNC'].map((p, i) => (
                <React.Fragment key={p}>
                   <div className={`px-3 py-1 rounded-lg text-[9px] font-black border transition-all duration-500 ${protocol === p ? 'bg-ai-accent text-white border-ai-accent shadow-neon-blue' : 'text-gray-700 border-white/5 opacity-50'}`}>
                      {p}
                   </div>
                   {i < 2 && <div className="w-6 h-[1px] bg-white/10" />}
                </React.Fragment>
             ))}
          </div>
        </div>

        <div className="flex items-center gap-5">
          {/* ENGINE MODE SELECTOR */}
          <div className="relative">
             <button 
                onClick={() => setShowConfig(!showConfig)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:border-white/30 transition-all ${showConfig ? 'bg-white/10 border-white/30' : ''}`}
             >
                <Settings2 size={16} className="text-ai-accent" />
                Logic: {engineMode}
             </button>
             {showConfig && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowConfig(false)} />
                  <div className="absolute top-full right-0 mt-3 w-64 bg-[#0d1117] border border-ai-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                     <div className="p-3 bg-white/5 text-[9px] font-black text-gray-500 uppercase border-b border-white/5 tracking-widest">Select Operation Profile</div>
                     {SYNC_PROFILES.map(m => (
                        <button 
                           key={m.id}
                           onClick={() => { changeMode(m.id as EngineMode); setShowConfig(false); }}
                           className={`w-full text-left p-4 hover:bg-white/5 transition-all flex flex-col gap-1 border-b border-white/5 last:border-0 ${engineMode === m.id ? 'bg-ai-accent/10' : ''}`}
                        >
                           <span className={`text-[11px] font-black ${engineMode === m.id ? 'text-white' : 'text-gray-400'}`}>{m.label}</span>
                           <span className="text-[9px] text-gray-600 font-bold tracking-tight">{m.desc}</span>
                        </button>
                     ))}
                  </div>
                </>
             )}
          </div>

          <div className="h-10 w-[1px] bg-white/10" />

          {/* TELEMETRY METRICS */}
          <div className="flex items-center gap-8">
             <div className="flex flex-col items-end">
                <span className="text-[8px] text-gray-700 font-black uppercase tracking-widest mb-1">E2E_Latency</span>
                <div className="flex items-center gap-2">
                   <Zap size={12} className={latency < 100 ? 'text-emerald-500' : 'text-amber-500'} />
                   <span className="text-sm font-black text-white tabular-nums">{latency.toFixed(1)}ms</span>
                </div>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[8px] text-gray-700 font-black uppercase tracking-widest mb-1">Discovery_Rate</span>
                <div className="flex items-center gap-2">
                   <Activity size={12} className="text-ai-accent" />
                   <span className="text-sm font-black text-white tabular-nums">{pps} p/s</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* SYNAPSE BRIDGE VISUALIZER */}
      <div className="mt-5 h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-[2px]">
         {Array.from({ length: 40 }).map((_, i) => (
            <div 
               key={i} 
               className={`h-full flex-1 transition-all duration-700 ${pps / 10 > i ? 'bg-ai-accent shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'bg-gray-800/20'}`}
               style={{ opacity: 0.3 + (Math.random() * 0.7) }}
            />
         ))}
      </div>
    </div>
  );
};

export default Scanner;
