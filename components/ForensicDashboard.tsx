
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { WhaleSignal, ChartPoint, ForensicZone, ForensicWall, GlobalLiquidityState, UserSubscription, Transaction, MempoolToxicityReport, UserSettings, RoutingConfig, Position, PortfolioHealthReport, ForensicStyle, ForensicTheme } from '../types';
import MarketChart from './MarketChart';
import { ToxicityEngine } from './ToxicityEngine';
import { ForensicRatios } from './ForensicRatios';
import { PredictiveDisplay } from './PredictiveEngine';
import { useToxicity } from '../hooks/useToxicity';
import { useMasterForensicEngine, MarketSignalState } from '../hooks/useMasterForensicEngine';
// Fix: Added missing Target icon import from lucide-react
import { 
  Activity, Zap, Binary, Globe, Fingerprint, 
  Crown, Lock, Cpu, Crosshair, ShieldCheck, Skull, 
  Database, LayoutGrid, ChevronDown,
  Settings, Terminal, Box, Sparkles, Orbit, Sun, Star,
  Infinity as InfinityIcon, Power, Waves, Eye, ShieldAlert,
  Dna, Cpu as AgentIcon, Radio, Layers, HeartPulse,
  Maximize2, Layout, Monitor, List, BarChart3, Settings2,
  Target
} from 'lucide-react';
import { IntegratedCore } from './IntegratedCore';
import { AlertLog, AlertEntry } from './AlertLog';
import { ForensicBacktestUI } from './ForensicBacktestUI';
import { checkCrossExchangeCongruence } from '../services/CrossExchangeEngine';
import { useNeuralFingerprint } from '../hooks/useNeuralFingerprint';
import { NeuralFingerprintDisplay } from './NeuralFingerprintDisplay';
import { checkSubscriptionAccess } from '../services/SubscriptionService';
import { checkMempoolToxicity, generateMockMempool } from '../services/MempoolForensics';
import { MempoolMonitor } from './MempoolMonitor';
import { routeTransaction } from '../services/MevShieldEngine';
import { MevShieldIndicator } from './MevShieldIndicator';
import { calculateGlobalHealth, generateMockPositions } from '../services/PortfolioHealthEngine';
import { PortfolioHealthMonitor } from './PortfolioHealthMonitor';
import { CORE_CONFIG } from '../constants';
import { AgenticSwarmMonitor } from './AgenticSwarmMonitor';
import { InterstellarTradeMonitor } from './InterstellarTradeMonitor';
import { GalacticIntentMonitor } from './GalacticIntentMonitor';
import { OmegaRealityMonitor } from './OmegaRealityMonitor';
import InstitutionalTape from './InstitutionalTape';

interface ForensicDashboardProps {
  symbol: string;
  history: WhaleSignal[];
  chartData: ChartPoint[];
  currentPrice: number;
  zones: ForensicZone[];
  walls: ForensicWall[];
  rawBids: string[][];
  rawAsks: string[][];
  incomingTrade: any;
  onSymbolChange?: (symbol: string) => void;
}

type DashboardLayout = 'INTEL_BALANCED' | 'CHART_FOCUSED' | 'TAPE_DOMINANT' | 'STRATEGIC_CMD';

const THEMES: { id: ForensicTheme; label: string; accent: string; glow: string; border: string }[] = [
  { id: 'NEURAL_BLUE', label: 'Neural Blue', accent: 'text-ai-accent', glow: 'shadow-neon-blue', border: 'border-ai-accent/30' },
  { id: 'KINETIC_AMBER', label: 'Kinetic Amber', accent: 'text-amber-500', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]', border: 'border-amber-500/30' },
  { id: 'TERMINAL_GREEN', label: 'Terminal Green', accent: 'text-emerald-500', glow: 'shadow-neon-green', border: 'border-emerald-500/30' },
  { id: 'SYNTH_PURPLE', label: 'Synth Purple', accent: 'text-purple-500', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]', border: 'border-purple-500/30' }
];

type ProtocolID = 'COSMIC' | 'STELLAR' | 'GALACTIC' | 'OMEGA' | 'OMNI' | 'GENESIS' | 'AGENTIC' | 'ZK_AUDIT';

// ENHANCED TACTICAL POD
const UnifiedIntelPod: React.FC<{ 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  status?: string; 
  theme: typeof THEMES[0];
  isBusy?: boolean;
}> = ({ title, icon, children, status = "STABLE", theme, isBusy }) => (
  <div className={`bg-black/60 border ${theme.border} rounded-xl overflow-hidden flex flex-col group/pod hover:bg-black/80 transition-all shadow-2xl relative`}>
    <div className="bg-white/5 p-2 px-3 border-b border-white/5 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-2">
        <div className={`${theme.accent} group-hover/pod:scale-110 transition-transform`}>{icon}</div>
        <span className="text-[9px] font-black text-white/90 tracking-widest uppercase">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[8px] font-black tracking-tighter uppercase ${isBusy ? 'text-amber-500 animate-pulse' : 'text-emerald-500/60'}`}>
          {isBusy ? 'PROCESSING' : status}
        </span>
        <div className={`w-1.5 h-1.5 rounded-full ${isBusy ? 'bg-amber-500 shadow-neon-red' : 'bg-emerald-500 shadow-neon-green'}`} />
      </div>
    </div>
    <div className="flex-1 min-h-0 relative z-10">{children}</div>
  </div>
);

const ForensicDashboard: React.FC<ForensicDashboardProps> = ({
  symbol,
  history,
  chartData,
  currentPrice,
  zones,
  walls,
  rawBids,
  rawAsks,
  incomingTrade,
  onSymbolChange
}) => {
  const [activeThemeId, setActiveThemeId] = useState<ForensicTheme>('NEURAL_BLUE');
  const [layoutMode, setLayoutMode] = useState<DashboardLayout>('INTEL_BALANCED');
  const [uiDensity, setUiDensity] = useState<'RAW' | 'CLEAN' | 'MINIMAL'>('CLEAN');
  const [activeProtocols, setActiveProtocols] = useState<Set<ProtocolID>>(new Set(['AGENTIC']));
  const [isCommandHubOpen, setCommandHubOpen] = useState(false);
  
  const toxicity = useToxicity(incomingTrade);
  const [mempoolTx, setMempoolTx] = useState<Transaction[]>([]);
  const [mempoolReport, setMempoolReport] = useState<MempoolToxicityReport>({ status: 'STABLE' });
  const [positions, setPositions] = useState<Position[]>(generateMockPositions());
  const [healthReport, setHealthReport] = useState<PortfolioHealthReport>(calculateGlobalHealth(generateMockPositions()));
  const [evacActive, setEvacActive] = useState(false);
  const [coinbasePrice, setCoinbasePrice] = useState(currentPrice);
  const [userData, setUserData] = useState<UserSubscription | null>(null);

  const currentTheme = useMemo(() => THEMES.find(t => t.id === activeThemeId) || THEMES[0], [activeThemeId]);

  useEffect(() => {
    const fetchTier = async () => {
      const access = await checkSubscriptionAccess('demo_user', 'BASIC_TAPE');
      if (access.user) setUserData(access.user);
    };
    fetchTier();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMempoolTx(generateMockMempool());
      setMempoolReport(checkMempoolToxicity(mempoolTx));
      setHealthReport(calculateGlobalHealth(positions));
      setEvacActive(toxicity >= CORE_CONFIG.AUTO_EVAC_TRIGGER_TOXICITY);
      setCoinbasePrice(currentPrice + (Math.random() - 0.5) * (currentPrice * 0.0015));
    }, 4000);
    return () => clearInterval(interval);
  }, [toxicity, positions, currentPrice]);

  const tradeWindow = useMemo(() => 
    incomingTrade ? [{ q: incomingTrade.q, T: Date.now(), m: incomingTrade.m }] : []
  , [incomingTrade]);

  const fingerprint = useNeuralFingerprint(tradeWindow);
  const congruenceState = useMemo(() => checkCrossExchangeCongruence(currentPrice, coinbasePrice), [currentPrice, coinbasePrice]);

  const buyRatio = useMemo(() => {
    const buySignals = history.filter(h => h.side === 'BUY');
    const totalVal = history.reduce((a, b) => a + b.valueUSD, 0);
    return (buySignals.reduce((a, b) => a + b.valueUSD, 0) / (totalVal / (history.length || 1) || 1));
  }, [history]);

  const sellRatio = useMemo(() => {
    const sellSignals = history.filter(h => h.side === 'SELL');
    const totalVal = history.reduce((a, b) => a + b.valueUSD, 0);
    return (sellSignals.reduce((a, b) => a + b.valueUSD, 0) / (totalVal / (history.length || 1) || 1));
  }, [history]);

  const forensicState: MarketSignalState = useMemo(() => ({
    toxicity, forensicRatio: Math.max(buyRatio, sellRatio), obi: 0, isAtSwingLevel: zones.length > 0, deltaSpeed: incomingTrade ? incomingTrade.q * 10 : 0
  }), [toxicity, buyRatio, sellRatio, zones, incomingTrade]);

  const engineResult = useMasterForensicEngine(forensicState);

  const toggleProtocol = (id: ProtocolID) => {
    setActiveProtocols(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const tier = userData?.tier || 'FREE';

  return (
    <div className={`h-full flex flex-col bg-[#020408] text-gray-300 font-mono overflow-hidden relative selection:bg-ai-accent transition-colors duration-700`}>
      <div className={`scanner-sweep opacity-20 ${currentTheme.accent.replace('text-', 'bg-')}`} />
      
      {/* OPERATION COMMAND HEADER */}
      <div className={`border-b p-4 flex justify-between items-center z-[100] shadow-2xl transition-all duration-500 backdrop-blur-md ${evacActive ? 'bg-red-950 border-red-500' : 'bg-[#080a0f]/90 border-ai-border'}`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 group cursor-pointer">
            <Binary size={22} className={`${evacActive ? 'text-white' : currentTheme.accent} transition-colors duration-500 group-hover:rotate-12`} />
            <div className="flex flex-col">
               <div className="flex items-center gap-3">
                  <h2 className="text-xs font-black tracking-[0.4em] uppercase leading-none text-white">Forensic_v4.2_Runtime</h2>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[8px] font-black uppercase ${tier === 'ELITE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-ai-accent/10 text-ai-accent border-ai-accent/30'}`}>
                    {tier === 'ELITE' ? <Crown size={10} /> : <Zap size={10} />} {tier}_ACCESS
                  </div>
               </div>
            </div>
          </div>
          
          <div className="h-8 w-[1px] bg-white/10" />
          
          {/* LAYOUT SELECTOR */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
             {[
               { id: 'INTEL_BALANCED', icon: <Layout size={12}/>, label: 'Balanced' },
               { id: 'CHART_FOCUSED', icon: <Monitor size={12}/>, label: 'Visual' },
               { id: 'TAPE_DOMINANT', icon: <List size={12}/>, label: 'Tape' },
               { id: 'STRATEGIC_CMD', icon: <Target size={12}/>, label: 'Strat' },
             ].map(l => (
               <button 
                key={l.id}
                onClick={() => setLayoutMode(l.id as DashboardLayout)}
                className={`flex items-center gap-2 px-3 py-1.5 text-[8px] font-black rounded uppercase transition-all ${layoutMode === l.id ? `${currentTheme.accent.replace('text-', 'bg-')} text-white ${currentTheme.glow}` : 'text-gray-600 hover:text-white'}`}
                title={l.label}
               >
                 {l.icon}
                 <span className="hidden xl:inline">{l.label}</span>
               </button>
             ))}
          </div>

          <div className="h-8 w-[1px] bg-white/10" />

          {/* DENSITY TOGGLE */}
          <div className="flex items-center gap-1 bg-black/20 p-1 rounded border border-white/5">
             {(['MINIMAL', 'CLEAN', 'RAW'] as const).map(d => (
               <button 
                key={d}
                onClick={() => setUiDensity(d)}
                className={`px-2 py-1 text-[8px] font-black rounded uppercase transition-all ${uiDensity === d ? 'text-white border border-white/20 bg-white/5' : 'text-gray-700 hover:text-gray-400'}`}
               >
                 {d}
               </button>
             ))}
          </div>

          <div className="h-8 w-[1px] bg-white/10" />

          {/* THEME SELECTOR DROPDOWN */}
          <div className="relative">
             <button 
                onClick={() => setCommandHubOpen(!isCommandHubOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded border border-white/10 text-[9px] font-black uppercase tracking-widest hover:border-white/30 transition-all ${isCommandHubOpen ? 'bg-white/10' : ''}`}
             >
                <Settings2 size={14} className={currentTheme.accent} />
                Matrix_Config
                <ChevronDown size={10} className={`transition-transform ${isCommandHubOpen ? 'rotate-180' : ''}`} />
             </button>

             {isCommandHubOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCommandHubOpen(false)} />
                  <div className="absolute top-full left-0 mt-3 w-72 bg-[#080a0f] border border-ai-border rounded-xl shadow-2xl z-[110] overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 bg-white/5 border-b border-white/5 flex justify-between items-center">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Monitor size={14} className={currentTheme.accent} /> System Appearance
                      </span>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-2 border-b border-white/5">
                       {THEMES.map(t => (
                         <button 
                            key={t.id}
                            onClick={() => setActiveThemeId(t.id)}
                            className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${activeThemeId === t.id ? `${t.border} bg-white/5` : 'border-transparent hover:bg-white/5'}`}
                         >
                            <div className={`w-3 h-3 rounded-full ${t.accent.replace('text-', 'bg-')} ${t.id === activeThemeId ? t.glow : ''}`} />
                            <span className={`text-[10px] font-bold ${activeThemeId === t.id ? 'text-white' : 'text-gray-500'}`}>{t.label}</span>
                         </button>
                       ))}
                    </div>
                    <div className="p-2 space-y-1 bg-black/40">
                      <span className="text-[8px] text-gray-700 font-black px-2 uppercase tracking-widest">Active_Protocols</span>
                      {[
                        { id: 'AGENTIC', label: 'Agentic Swarm (v5)', icon: <AgentIcon size={12} />, tier: 'PRO' },
                        { id: 'ZK_AUDIT', label: 'ZK Compliance (v6)', icon: <Lock size={12} />, tier: 'ELITE' },
                        { id: 'COSMIC', label: 'Interstellar (v7)', icon: <Orbit size={12} />, tier: 'ELITE' },
                        { id: 'GALACTIC', label: 'Galactic Logic (v9)', icon: <Star size={12} />, tier: 'ELITE' },
                        { id: 'OMEGA', label: 'Omega Reality (v10)', icon: <InfinityIcon size={12} />, tier: 'ELITE' },
                      ].map((p) => {
                        const isLocked = tier === 'FREE' && p.tier !== 'FREE';
                        const isActive = activeProtocols.has(p.id as ProtocolID);
                        return (
                          <button
                            key={p.id}
                            disabled={isLocked}
                            onClick={() => toggleProtocol(p.id as ProtocolID)}
                            className={`w-full flex items-center justify-between p-2 rounded-md transition-all text-[9px] font-bold uppercase ${isActive ? `${currentTheme.accent} bg-white/5` : 'text-gray-600 hover:text-gray-400'} ${isLocked ? 'opacity-20 cursor-not-allowed' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              {p.icon}
                              <span>{p.label}</span>
                            </div>
                            {isActive && <div className={`w-1 h-1 rounded-full ${currentTheme.accent.replace('text-', 'bg-')} animate-pulse`} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
             )}
          </div>
        </div>

        <div className="flex items-center gap-5">
           <ToxicityEngine bucketSize={10} windowSize={15} incomingTrade={incomingTrade} />
           <div className="flex flex-col items-end">
             <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Global_Conviction</span>
             <span className={`text-xl font-black ${engineResult.isGunpoint || evacActive ? 'text-red-500 animate-pulse' : currentTheme.accent}`}>{engineResult.convictionScore}%</span>
           </div>
           <div className={`px-4 py-2 rounded border text-[10px] font-black uppercase tracking-widest transition-all ${evacActive ? 'bg-red-950 text-white border-red-500 animate-pulse shadow-neon-red' : `bg-black/40 ${currentTheme.accent} border-white/10`}`}>
             {evacActive ? 'EMERGENCY_EVAC' : `${engineResult.marketMode} // ${engineResult.action}`}
           </div>
        </div>
      </div>

      {/* DYNAMIC LAYOUT GRID */}
      <div className="flex-1 overflow-hidden p-2 relative flex flex-col gap-2">
        {layoutMode === 'INTEL_BALANCED' && (
          <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden min-h-0">
             {/* LEFT: PRIMARY INTELLIGENCE */}
             <div className="col-span-12 lg:col-span-8 flex flex-col gap-2 min-h-0">
                <div className="flex-1 relative rounded-xl border border-white/10 overflow-hidden bg-[#050608] shadow-2xl">
                   <PredictiveDisplay bids={rawBids} asks={rawAsks} lastPrice={currentPrice} toxicityScore={toxicity} />
                   <MarketChart data={chartData} currentPrice={currentPrice} zones={zones} walls={walls} symbol={symbol} onSymbolChange={onSymbolChange} />
                </div>
                
                {uiDensity !== 'MINIMAL' && (
                  <div className="h-40 grid grid-cols-3 gap-2 shrink-0 animate-in slide-in-from-bottom-4">
                     <UnifiedIntelPod title="Neural Signature" icon={<Fingerprint size={12}/>} theme={currentTheme}>
                        <NeuralFingerprintDisplay isBot={fingerprint.isBot} fingerprintID={fingerprint.fingerprintID} threatLevel={fingerprint.threatLevel} probability={fingerprint.botProbability} features={fingerprint.features} />
                     </UnifiedIntelPod>
                     <UnifiedIntelPod title="Mempool Forensic" icon={<Terminal size={12}/>} theme={currentTheme}>
                        <MempoolMonitor pendingTx={mempoolTx} report={mempoolReport} />
                     </UnifiedIntelPod>
                     <UnifiedIntelPod title="Portfolio Vitals" icon={<HeartPulse size={12}/>} theme={currentTheme}>
                        <PortfolioHealthMonitor report={healthReport} positions={positions} />
                     </UnifiedIntelPod>
                  </div>
                )}
             </div>
             
             {/* RIGHT: REAL-TIME TAPE & CORE */}
             <div className="col-span-12 lg:col-span-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar min-h-0">
                <IntegratedCore state={forensicState} />
                
                <div className="grid grid-cols-2 gap-2 shrink-0">
                  <UnifiedIntelPod title="Absorption [B]" icon={<Layers size={10} />} theme={currentTheme}>
                    <ForensicRatios type="BUY" ratio={buyRatio} />
                  </UnifiedIntelPod>
                  <UnifiedIntelPod title="Absorption [S]" icon={<Layers size={10} />} theme={currentTheme}>
                    <ForensicRatios type="SELL" ratio={sellRatio} />
                  </UnifiedIntelPod>
                </div>

                <div className="flex-1 min-h-[300px]">
                  <UnifiedIntelPod title="Institutional Tape" icon={<Activity size={12}/>} theme={currentTheme}>
                    <InstitutionalTape signals={history} />
                  </UnifiedIntelPod>
                </div>
             </div>
          </div>
        )}

        {layoutMode === 'CHART_FOCUSED' && (
          <div className="flex-1 flex flex-col gap-2 overflow-hidden">
             <div className="flex-1 relative rounded-2xl border border-white/10 overflow-hidden bg-[#050608] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <PredictiveDisplay bids={rawBids} asks={rawAsks} lastPrice={currentPrice} toxicityScore={toxicity} />
                <MarketChart data={chartData} currentPrice={currentPrice} zones={zones} walls={walls} symbol={symbol} onSymbolChange={onSymbolChange} />
             </div>
             {uiDensity !== 'MINIMAL' && (
               <div className="h-28 flex gap-2 shrink-0 overflow-x-auto custom-scrollbar pb-1">
                  <div className="min-w-[300px]"><IntegratedCore state={forensicState} /></div>
                  <div className="min-w-[200px]"><UnifiedIntelPod title="Fingerprint" icon={<Fingerprint size={10}/>} theme={currentTheme}><NeuralFingerprintDisplay isBot={fingerprint.isBot} fingerprintID={fingerprint.fingerprintID} threatLevel={fingerprint.threatLevel} probability={fingerprint.botProbability} features={fingerprint.features} /></UnifiedIntelPod></div>
                  <div className="min-w-[200px]"><UnifiedIntelPod title="Mempool" icon={<Terminal size={10}/>} theme={currentTheme}><MempoolMonitor pendingTx={mempoolTx} report={mempoolReport} /></UnifiedIntelPod></div>
                  <div className="min-w-[250px]"><UnifiedIntelPod title="Vitals" icon={<HeartPulse size={10}/>} theme={currentTheme}><PortfolioHealthMonitor report={healthReport} positions={positions} /></UnifiedIntelPod></div>
                  <div className="min-w-[200px] flex gap-2">
                     <ForensicRatios type="BUY" ratio={buyRatio} />
                     <ForensicRatios type="SELL" ratio={sellRatio} />
                  </div>
               </div>
             )}
          </div>
        )}

        {layoutMode === 'TAPE_DOMINANT' && (
          <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden">
             <div className="col-span-12 lg:col-span-4 flex flex-col gap-2">
                <div className="h-1/2 min-h-0 relative rounded-xl border border-white/10 overflow-hidden bg-[#050608]">
                   <MarketChart data={chartData} currentPrice={currentPrice} zones={zones} walls={walls} symbol={symbol} onSymbolChange={onSymbolChange} />
                </div>
                <div className="flex-1">
                  <IntegratedCore state={forensicState} />
                </div>
                <div className="h-32 grid grid-cols-2 gap-2">
                   <ForensicRatios type="BUY" ratio={buyRatio} />
                   <ForensicRatios type="SELL" ratio={sellRatio} />
                </div>
             </div>
             <div className="col-span-12 lg:col-span-8 flex flex-col min-h-0">
                <UnifiedIntelPod title="High-Fidelity Transaction Stream" icon={<Activity size={14}/>} theme={currentTheme}>
                   <InstitutionalTape signals={history} />
                </UnifiedIntelPod>
             </div>
          </div>
        )}

        {layoutMode === 'STRATEGIC_CMD' && (
          <div className="flex-1 grid grid-cols-4 grid-rows-2 gap-4 p-4 overflow-y-auto custom-scrollbar">
             <div className="col-span-2 row-span-1"><IntegratedCore state={forensicState} /></div>
             <div className="col-span-1 row-span-1"><UnifiedIntelPod title="Mempool Analytics" icon={<Terminal size={14}/>} theme={currentTheme}><MempoolMonitor pendingTx={mempoolTx} report={mempoolReport} /></UnifiedIntelPod></div>
             <div className="col-span-1 row-span-1"><UnifiedIntelPod title="Risk Assessment" icon={<ShieldAlert size={14}/>} theme={currentTheme}><PortfolioHealthMonitor report={healthReport} positions={positions} /></UnifiedIntelPod></div>
             <div className="col-span-1 row-span-1"><UnifiedIntelPod title="Algo Identification" icon={<Fingerprint size={14}/>} theme={currentTheme}><NeuralFingerprintDisplay isBot={fingerprint.isBot} fingerprintID={fingerprint.fingerprintID} threatLevel={fingerprint.threatLevel} probability={fingerprint.botProbability} features={fingerprint.features} /></UnifiedIntelPod></div>
             <div className="col-span-1 row-span-1 flex flex-col gap-2">
                <ForensicRatios type="BUY" ratio={buyRatio} />
                <ForensicRatios type="SELL" ratio={sellRatio} />
             </div>
             <div className="col-span-2 row-span-1 bg-[#050608] rounded-2xl border border-white/10 p-4">
                <PredictiveDisplay bids={rawBids} asks={rawAsks} lastPrice={currentPrice} toxicityScore={toxicity} />
                <div className="mt-20 text-[10px] text-gray-500 font-mono italic leading-relaxed">
                   AI-Projected Market Sentiment based on current Order Book Imbalance and Flow Toxicity scores. Strategic Command recommends monitoring for institutional displacement zones before engaging deep liquidity.
                </div>
             </div>
          </div>
        )}

        {/* ADVANCED OVERLAY PODS */}
        {(activeProtocols.size > 0 && uiDensity !== 'MINIMAL') && (
          <div className="fixed bottom-12 right-6 flex flex-col gap-4 z-50 pointer-events-none max-w-sm w-full">
            {activeProtocols.has('AGENTIC') && <div className="pointer-events-auto animate-in slide-in-from-right-10 duration-700"><AgenticSwarmMonitor targetSymbol={symbol} /></div>}
            {activeProtocols.has('COSMIC') && <div className="pointer-events-auto border-2 border-blue-500/50 rounded-xl overflow-hidden shadow-neon-blue backdrop-blur-xl animate-in fade-in zoom-in-95"><InterstellarTradeMonitor symbol={symbol} /></div>}
            {activeProtocols.has('GALACTIC') && <div className="pointer-events-auto border-2 border-indigo-500/50 rounded-xl overflow-hidden backdrop-blur-xl"><GalacticIntentMonitor symbol={symbol} /></div>}
            {activeProtocols.has('OMEGA') && <div className="pointer-events-auto animate-in slide-in-from-bottom-10"><OmegaRealityMonitor symbol={symbol} /></div>}
          </div>
        )}
      </div>

      {/* SYSTEM STATUS BAR */}
      <div className="h-10 bg-black border-t border-white/5 flex justify-between items-center px-6 shrink-0 text-[9px] font-black uppercase text-gray-600 tracking-[0.2em] relative z-[101]">
         <div className="flex items-center gap-8">
            <span className="flex items-center gap-2 group cursor-help"><Database size={12} className="group-hover:text-ai-accent" /> L0_NODES: 1.4k [READY]</span>
            <span className="flex items-center gap-2 text-emerald-500/50"><ShieldCheck size={12}/> CRYPTO_LAYER: PHOENIX_V4.2_AES256</span>
            <span className="flex items-center gap-2"><Activity size={12}/> Active_Logic: {activeProtocols.size} PROTOS</span>
         </div>
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/10">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]"></span>
               <span className="text-emerald-500 tracking-[0.3em]">Neural_Sync_Locked</span>
            </div>
            <span className="text-gray-700 opacity-40">ENV_MD5: {Math.random().toString(16).substr(2, 8).toUpperCase()}</span>
         </div>
      </div>
    </div>
  );
};

export default ForensicDashboard;
