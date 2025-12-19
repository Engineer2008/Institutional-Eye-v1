
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Zap, LayoutTemplate, Columns, Monitor, 
  Grid as GridIcon, Radio, Cpu, Square,
  LayoutDashboard
} from 'lucide-react';
import Scanner from './components/Scanner';
import { Signal } from './services/AdaptiveBrain';
import { MarketType, ForensicData, WhaleSignal, GlobalStrategicState, ChartPoint, ForensicZone, ForensicWall } from './types';
import { BookAnalysis } from './services/OrderBookBrain';
import { decodeMarketStructure } from './services/StrategyDecoder';
import AdaptiveIcebergEngine from './components/AdaptiveIcebergEngine';
import DeepBookScanner from './components/DeepBookScanner';
import StrategicEntryEngine from './components/StrategicEntryEngine';
import MarketSelector from './components/MarketSelector';
import LiveIntelligenceFeed from './components/LiveIntelligenceFeed';
import InstitutionalTape from './components/InstitutionalTape';
import AdvancedDynamicIntelligenceEngine from './components/AdvancedDynamicIntelligenceEngine';
import DecisionIntelligenceHub from './components/DecisionIntelligenceHub';
import ThemeToggle from './components/ThemeToggle';
import EngineSignalsMenu from './components/EngineSignalsMenu';
import MarketChart from './components/MarketChart';
import ForensicEngine from './components/ForensicEngine';
import { getStreamUrl } from './services/MarketRegistry';
import { TechnicalAnalysisEngine } from './services/TechnicalAnalysisEngine';
import { ForensicIntelligenceSuite } from './services/ForensicIntelligenceSuite';

// --- LAYOUT ARCHITECTURE ---
type LayoutMode = 'COMMAND' | 'TACTICAL' | 'ZEN' | 'GRID' | 'FORENSIC';

const LAYOUTS: { id: LayoutMode; icon: React.ReactNode; label: string }[] = [
  { id: 'COMMAND', icon: <LayoutTemplate size={14} />, label: 'Command Center' },
  { id: 'TACTICAL', icon: <Columns size={14} />, label: 'Tactical Depth' },
  { id: 'GRID', icon: <GridIcon size={14} />, label: 'Quad Grid' },
  { id: 'ZEN', icon: <Monitor size={14} />, label: 'Zen Focus' },
  { id: 'FORENSIC', icon: <LayoutDashboard size={14} />, label: 'Forensic Audit' }
];

const App: React.FC = () => {
  const [activeSymbol, setActiveSymbol] = useState('BTCUSDT');
  const [activeMarket, setActiveMarket] = useState<MarketType>('SPOT');
  const [history, setHistory] = useState<ForensicData[]>([]);
  const [tapeHistory, setTapeHistory] = useState<WhaleSignal[]>([]);
  const [selected, setSelected] = useState<ForensicData | null>(null);
  const [showConnectionEngine, setShowConnectionEngine] = useState(false);
  const [globalData, setGlobalData] = useState<GlobalStrategicState[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [bookAnalysis, setBookAnalysis] = useState<BookAnalysis | null>(null);
  const [rawBids, setRawBids] = useState<string[][]>([]);
  const [rawAsks, setRawAsks] = useState<string[][]>([]);
  
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    const saved = localStorage.getItem('APP_LAYOUT_MODE');
    return (saved as LayoutMode) || 'COMMAND';
  });
  
  const [isFeedOpen, setFeedOpen] = useState(false);
  const taEngine = useRef(new TechnicalAnalysisEngine());
  const forensicSuite = useRef(new ForensicIntelligenceSuite());
  const cvdRef = useRef(0);

  useEffect(() => {
    localStorage.setItem('APP_LAYOUT_MODE', layoutMode);
  }, [layoutMode]);

  useEffect(() => {
    const url = "wss://stream.binance.com:9443/ws/!miniTicker@arr";
    const ws = new WebSocket(url);
    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (Array.isArray(data)) {
                const processed = taEngine.current.processGlobalTickers(data);
                setGlobalData(processed);
            }
        } catch (err) {}
    };
    return () => ws.close();
  }, []);

  const tapeWs = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = getStreamUrl(activeSymbol, activeMarket, ['aggTrade']);
    if (tapeWs.current) tapeWs.current.close();
    const ws = new WebSocket(url);
    tapeWs.current = ws;

    setChartData([]);
    cvdRef.current = 0;

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const data = payload.data || payload;

        if (data.e === 'aggTrade') {
          const p = parseFloat(data.p);
          const q = parseFloat(data.q);
          const isSell = data.m;
          const val = p * q;
          
          cvdRef.current += isSell ? -q : q;

          const btcData = globalData.find(g => g.symbol === 'BTCUSDT');
          const targetData = globalData.find(g => g.symbol === activeSymbol);
          const currentBeta = targetData && btcData ? (targetData.change24h / (btcData.change24h || 1)) : 1.0;

          setChartData(prev => {
            const last = prev[prev.length - 1];
            if (last && Date.now() - last.time < 1000) return prev;
            
            const newPoint: ChartPoint = {
              time: Date.now(),
              price: p,
              cvd: cvdRef.current,
              rotationBeta: currentBeta,
              volume: q
            };
            return [...prev, newPoint].slice(-100);
          });

          if (val >= 50000) {
            const newSignal: WhaleSignal = {
              id: `TAPE-${Date.now()}-${data.f}`,
              time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              type: val >= 500000 ? 'INSTITUTIONAL' : 'WHALE',
              side: isSell ? 'SELL' : 'BUY',
              price: p,
              valueUSD: val,
              isLiquidationLikely: val >= 1000000
            };
            setTapeHistory(prev => [newSignal, ...prev].slice(0, 50));
          }
        }
      } catch (err) {}
    };

    return () => {
      if (tapeWs.current) tapeWs.current.close();
    };
  }, [activeSymbol, activeMarket, globalData]);

  // Forensic Zones & Walls logic
  const forensicAnalytics = useMemo(() => {
    const currentPrice = chartData[chartData.length - 1]?.price || 0;
    const avgVol = globalData.find(d => d.symbol === activeSymbol)?.volume24h ? (globalData.find(d => d.symbol === activeSymbol)!.volume24h / 1440) : 1;
    
    if (!rawBids.length || !rawAsks.length) return { zones: [], walls: [] };
    
    const { structure, setups } = decodeMarketStructure(rawBids, rawAsks, currentPrice, avgVol);
    
    const zones: ForensicZone[] = setups.map(s => ({
      type: s.direction === 'LONG' ? 'BUY' : 'SELL',
      priceStart: s.entryZone,
      priceEnd: s.invalidation,
      label: s.reason
    }));

    const walls: ForensicWall[] = [];
    if (structure.dominantSupport) walls.push({ price: structure.dominantSupport.price, side: 'BID', strength: structure.dominantSupport.vol });
    if (structure.dominantResistance) walls.push({ price: structure.dominantResistance.price, side: 'ASK', strength: structure.dominantResistance.vol });

    return { zones, walls };
  }, [rawBids, rawAsks, chartData, activeSymbol, globalData]);

  const combinedWhaleSignals = useMemo(() => {
    const forensicWhales = history.map(h => ({
      id: `FOR-${h.id}`,
      time: h.time,
      type: h.detectionLayer === 'AI_CORE' ? 'ICEBERG' : 'WHALE' as any,
      side: h.type === 'HIDDEN_BUY' ? 'BUY' : 'SELL' as 'BUY' | 'SELL',
      price: h.price,
      valueUSD: h.size * h.price,
      isLiquidationLikely: h.risk === 'HIGH'
    }));
    return [...tapeHistory, ...forensicWhales]
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, 60);
  }, [tapeHistory, history]);

  const handleMarketChange = (symbol: string, market: MarketType) => {
    const symSafe = (symbol || 'BTCUSDT').toUpperCase();
    setActiveSymbol(symSafe);
    setActiveMarket(market);
    setTapeHistory([]);
    setBookAnalysis(null);
    setRawBids([]);
    setRawAsks([]);
  };

  const handleGlobalAssetSelect = (symbol: string) => {
    const symSafe = (symbol || 'BTCUSDT').toUpperCase();
    setActiveSymbol(symSafe);
  };

  const handleNewSignal = useCallback((sig: Signal) => {
    if (!sig) return;
    const ratio = sig.size / (sig.threshold || 1);
    let interpretation = sig.type === 'HIDDEN_BUY' ? 'Buy Absorption' : 'Sell Distribution';
    let action: ForensicData['action'] = ratio > 2.0 ? (sig.type === 'HIDDEN_BUY' ? 'LONG' : 'SHORT') : 'WAIT';
    
    const enhanced: ForensicData = { 
        id: sig.id,
        symbol: sig.symbol || 'UNK',
        type: sig.type,
        price: sig.price,
        size: sig.size, 
        intensity: sig.intensity || 0,
        threshold: sig.threshold || 1,
        confidence: sig.confidence || 0,
        timestamp: sig.timestamp,
        time: new Date(sig.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
        interpretation, 
        action, 
        risk: ratio > 3 ? 'LOW' : 'MED',
        spoofRisk: 0,
        detectionLayer: 'AI_CORE',
        integrity: 0.95,
        traceId: sig.id || Math.random().toString(36).substr(2, 9)
    };
    
    setHistory(prev => [enhanced, ...prev].slice(0, 100));
  }, []);

  return (
    <div className="h-screen w-screen transition-colors duration-300 dark:bg-[#050608] bg-slate-50 text-slate-800 dark:text-slate-300 font-sans selection:bg-ai-accent selection:text-white flex flex-col overflow-hidden">
      
      {/* 1. GLOBAL COMMAND BAR */}
      <header className="h-14 bg-white dark:bg-[#080a0f] border-b border-light-border dark:border-ai-border flex items-center justify-between px-4 z-50 flex-shrink-0 shadow-sm">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
               <div className="bg-ai-accent/10 p-1.5 rounded-md border border-ai-accent/20">
                  <Zap className="text-ai-accent fill-ai-accent" size={18} />
               </div>
               <div className="flex flex-col">
                  <h1 className="font-mono font-bold dark:text-white text-slate-900 tracking-tight text-sm leading-none">
                     INSTITUTIONAL EYE <span className="text-ai-accent">PRO</span>
                  </h1>
                  <span className="text-[9px] text-gray-500 font-mono tracking-wider uppercase">Structural Integrity Matrix</span>
               </div>
            </div>

            <div className="h-6 w-[1px] bg-light-border dark:bg-ai-border/50"></div>

            <MarketSelector 
               activeSymbol={activeSymbol} 
               activeMarket={activeMarket} 
               onChange={handleMarketChange} 
            />
            
            <div className="h-6 w-[1px] bg-light-border dark:bg-ai-border/50"></div>

            <EngineSignalsMenu symbol={activeSymbol} />
            
            <div className="h-6 w-[1px] bg-light-border dark:bg-ai-border/50"></div>
            
            <div className="relative">
                <button
                   onClick={() => setFeedOpen(!isFeedOpen)}
                   className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold border transition-all
                      ${isFeedOpen 
                         ? 'bg-ai-accent/10 text-ai-accent border-ai-accent/30 shadow-[0_0_10px_rgba(59,130,246,0.15)]' 
                         : 'bg-black/5 dark:bg-black/20 text-gray-500 border-light-border dark:border-ai-border/50 hover:text-ai-accent'}
                   `}
                >
                   <Radio size={14} className={isFeedOpen ? 'animate-pulse' : ''} />
                   <span className="hidden xl:inline tracking-widest uppercase text-[10px]">Forensic Feed</span>
                </button>

                {isFeedOpen && (
                    <div className="absolute top-full left-0 mt-3 w-[420px] h-[70vh] bg-white dark:bg-[#080a0f] border border-light-border dark:border-ai-border rounded-xl shadow-2xl z-[60] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2">
                        <LiveIntelligenceFeed 
                            history={history}
                            selectedId={selected?.id}
                            onSelect={(item) => {
                                setSelected(item);
                                if (item.symbol) setActiveSymbol(item.symbol.toUpperCase());
                                setFeedOpen(false); 
                            }}
                            onClearSelection={() => setSelected(null)}
                        />
                    </div>
                )}
            </div>
         </div>

         <div className="flex items-center gap-3">
             <ThemeToggle />
             <div className="h-6 w-[1px] bg-light-border dark:bg-ai-border/50"></div>

             <DecisionIntelligenceHub 
                symbol={activeSymbol}
                history={history}
                marketData={globalData}
             />

             <div className="h-6 w-[1px] bg-light-border dark:bg-ai-border/50"></div>

             <div className="flex items-center bg-black/5 dark:bg-black/40 rounded-lg p-1 border border-light-border dark:border-ai-border/50">
                {LAYOUTS.map(l => (
                  <button 
                    key={l.id}
                    onClick={() => setLayoutMode(l.id)}
                    className={`p-1.5 rounded-md transition-all ${layoutMode === l.id ? 'bg-ai-accent text-white shadow-sm' : 'text-gray-500 hover:text-ai-accent'}`}
                    title={l.label}
                  >
                     {l.icon}
                  </button>
                ))}
             </div>

             <div className="h-6 w-[1px] bg-light-border dark:bg-ai-border/50"></div>

             <Scanner 
               onSignal={handleNewSignal} 
               variant="compact" 
               onDetailsClick={() => setShowConnectionEngine(true)}
             />
         </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
         <main className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0B0E14] dark:to-[#050608] relative overflow-hidden flex flex-col">
            <div className="flex-1 p-2 h-full overflow-hidden">
               {layoutMode === 'COMMAND' && (
                  <div className="grid grid-cols-12 grid-rows-[65%_35%] gap-2 h-full">
                     <div className="col-span-12 relative">
                        <StrategicEntryEngine symbol={activeSymbol} marketType={activeMarket} onAssetSelect={handleGlobalAssetSelect} />
                     </div>
                     <div className="col-span-12 md:col-span-6 relative">
                        <AdaptiveIcebergEngine symbol={activeSymbol} marketType={activeMarket} />
                     </div>
                     <div className="col-span-12 md:col-span-6 relative">
                        <DeepBookScanner 
                          symbol={activeSymbol} 
                          marketType={activeMarket} 
                          onAnalysis={setBookAnalysis} 
                          onData={(b, a) => { setRawBids(b); setRawAsks(a); }}
                        />
                     </div>
                  </div>
               )}
               {layoutMode === 'TACTICAL' && (
                  <div className="grid grid-cols-12 grid-rows-12 gap-2 h-full">
                      <div className="col-span-12 lg:col-span-8 row-span-8 relative">
                          <MarketChart 
                            data={chartData} 
                            currentPrice={chartData[chartData.length-1]?.price || 0} 
                            zones={forensicAnalytics.zones}
                            walls={forensicAnalytics.walls}
                          />
                      </div>
                      <div className="col-span-12 lg:col-span-4 row-span-8">
                          <DeepBookScanner 
                            symbol={activeSymbol} 
                            marketType={activeMarket} 
                            onAnalysis={setBookAnalysis} 
                            onData={(b, a) => { setRawBids(b); setRawAsks(a); }}
                          />
                      </div>
                      <div className="col-span-12 lg:col-span-6 row-span-4">
                          <AdaptiveIcebergEngine symbol={activeSymbol} marketType={activeMarket} />
                      </div>
                      <div className="col-span-12 lg:col-span-6 row-span-4">
                          <StrategicEntryEngine symbol={activeSymbol} marketType={activeMarket} onAssetSelect={handleGlobalAssetSelect} />
                      </div>
                  </div>
               )}
               {layoutMode === 'GRID' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-2 h-full">
                      <div className="relative">
                         <StrategicEntryEngine symbol={activeSymbol} marketType={activeMarket} onAssetSelect={handleGlobalAssetSelect} />
                      </div>
                      <div className="relative">
                          <DeepBookScanner 
                            symbol={activeSymbol} 
                            marketType={activeMarket} 
                            onAnalysis={setBookAnalysis} 
                            onData={(b, a) => { setRawBids(b); setRawAsks(a); }}
                          />
                      </div>
                      <div className="relative">
                         <AdaptiveIcebergEngine symbol={activeSymbol} marketType={activeMarket} />
                      </div>
                      <div className="relative overflow-hidden flex flex-col">
                          <InstitutionalTape signals={combinedWhaleSignals} />
                      </div>
                  </div>
               )}
               {layoutMode === 'ZEN' && (
                  <div className="w-full h-full relative">
                     <StrategicEntryEngine symbol={activeSymbol} marketType={activeMarket} onAssetSelect={handleGlobalAssetSelect} />
                     <div className="absolute bottom-4 right-4 w-96 h-64 opacity-90 hover:opacity-100 transition-opacity shadow-2xl z-20">
                        <AdaptiveIcebergEngine symbol={activeSymbol} marketType={activeMarket} />
                     </div>
                  </div>
               )}
               {layoutMode === 'FORENSIC' && (
                  <div className="grid grid-cols-12 gap-2 h-full">
                    <div className="col-span-12 lg:col-span-9 relative">
                      <ForensicEngine 
                        signals={history} 
                        bookAnalysis={bookAnalysis} 
                        rawBids={rawBids} 
                        rawAsks={rawAsks}
                        currentPrice={chartData[chartData.length-1]?.price || 0}
                        avgVolume={globalData.find(d => d.symbol === activeSymbol)?.volume24h ? (globalData.find(d => d.symbol === activeSymbol)!.volume24h / 1440) : 1}
                      />
                    </div>
                    <div className="col-span-12 lg:col-span-3 relative">
                      <DeepBookScanner 
                        symbol={activeSymbol} 
                        marketType={activeMarket} 
                        onAnalysis={setBookAnalysis} 
                        onData={(b, a) => { setRawBids(b); setRawAsks(a); }}
                      />
                    </div>
                  </div>
               )}
            </div>
         </main>
      </div>

      {showConnectionEngine && (
         <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
             <div className="w-full max-w-3xl relative bg-white dark:bg-[#050608] border border-light-border dark:border-ai-border rounded-xl shadow-2xl overflow-hidden">
                 <div className="bg-gray-50 dark:bg-ai-panel border-b border-light-border dark:border-ai-border p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Cpu className="text-ai-accent" size={18} />
                        <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">System Intelligence Hub</span>
                    </div>
                    <button onClick={() => setShowConnectionEngine(false)} className="p-2 text-gray-500 hover:text-ai-accent">
                      <Square size={16} />
                    </button>
                 </div>
                 <div className="max-h-[85vh] overflow-y-auto">
                    <AdvancedDynamicIntelligenceEngine />
                 </div>
             </div>
         </div>
      )}
    </div>
  );
};

export default App;
