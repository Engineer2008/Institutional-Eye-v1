
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MarketSignal, ForensicReport, ForensicZone, ForensicWall, ChartPoint } from '../types';
import { BookAnalysis } from '../services/OrderBookBrain';
import { decodeMarketStructure, TradeSetup } from '../services/StrategyDecoder';
import { HFTTransport, TransportMetrics } from '../services/HFTTransport';
import { HFTDataPlane, HFTMetrics } from '../services/HFTDataPlane';
import { useMasterForensicEngine, MarketSignalState } from '../hooks/useMasterForensicEngine';
import MarketChart from './MarketChart';
import { 
  FileText, Activity, Fingerprint, ShieldAlert, Binary, 
  Cpu, Zap, Layers, AlertTriangle, SlidersHorizontal, 
  Terminal, Gauge, BarChart3, Radio, ArrowDown, ArrowUp,
  BarChart2, ShieldCheck, Settings2, Info, Filter, RotateCcw, Target,
  Crosshair, ShieldX, Skull, AlertCircle, TrendingUp, TrendingDown,
  Timer, ChevronDown, ListFilter, LayoutGrid, BoxSelect, Flame
} from 'lucide-react';

interface ForensicEngineProps {
  signals: MarketSignal[];
  bookAnalysis: BookAnalysis | null;
  rawBids?: string[][];
  rawAsks?: string[][];
  currentPrice: number;
  avgVolume: number;
  toxicityScore: number;
  chartData: ChartPoint[];
  symbol?: string;
  onSymbolChange?: (symbol: string) => void;
}

const LatencyHUD: React.FC = () => {
  const [metrics, setMetrics] = useState<HFTMetrics>(HFTDataPlane.getInstance().getLiveMetrics());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<number[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      const m = HFTDataPlane.getInstance().getLiveMetrics();
      setMetrics(m);
      
      historyRef.current.push(m.engineLatency);
      if (historyRef.current.length > 50) historyRef.current.shift();

      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, 100, 30);
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const step = 100 / 50;
        historyRef.current.forEach((val, i) => {
          const x = i * step;
          const y = 30 - (val * 20); 
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-black/60 border border-ai-border/40 p-3 rounded-lg flex items-center justify-between font-mono mb-2">
      <div className="flex gap-6">
        <div className="flex flex-col">
          <span className="text-[8px] text-gray-600 font-black uppercase">Engine_Latency</span>
          <span className={`text-sm font-black tabular-nums ${metrics.engineLatency < 0.5 ? 'text-emerald-500' : 'text-amber-500'}`}>
            {metrics.engineLatency.toFixed(3)}ms
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] text-gray-600 font-black uppercase">Throughput</span>
          <span className="text-sm font-black text-white tabular-nums">
            {metrics.pps} p/s
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <canvas ref={canvasRef} width="100" height="30" className="opacity-60" />
        <div className={`w-2 h-2 rounded-full ${metrics.engineLatency < 12 ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]' : 'bg-red-500'}`}></div>
      </div>
    </div>
  );
};

const ForensicEngine: React.FC<ForensicEngineProps> = ({ 
  signals, 
  bookAnalysis, 
  rawBids, 
  rawAsks, 
  currentPrice, 
  avgVolume, 
  toxicityScore,
  chartData,
  symbol,
  onSymbolChange
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [minSize, setMinSize] = useState(2.0);
  const [minIntensity, setMinIntensity] = useState(15);
  const [minConfidence, setMinConfidence] = useState(50);
  const [activePreset, setActivePreset] = useState<'OFF' | 'INSTITUTIONAL' | 'SCALP' | 'AGGRESSIVE'>('OFF');
  const [showFilters, setShowFilters] = useState(true);

  // INTEGRATED STRUCTURAL DECODER
  const { setups, walls } = useMemo(() => {
    if (!rawBids || !rawAsks) return { structure: null, setups: [], walls: [] };
    const analysis = decodeMarketStructure(rawBids, rawAsks, currentPrice, avgVolume);
    
    const forensicWalls: ForensicWall[] = [];
    if (analysis.structure.dominantSupport) {
      forensicWalls.push({ 
        price: analysis.structure.dominantSupport.price, 
        side: 'BID', 
        strength: analysis.structure.dominantSupport.vol 
      });
    }
    if (analysis.structure.dominantResistance) {
      forensicWalls.push({ 
        price: analysis.structure.dominantResistance.price, 
        side: 'ASK', 
        strength: analysis.structure.dominantResistance.vol 
      });
    }

    return { ...analysis, walls: forensicWalls };
  }, [rawBids, rawAsks, currentPrice, avgVolume]);

  // Transmute setups into ForensicZones for the chart
  const mappedZones: ForensicZone[] = useMemo(() => {
    return setups.map(s => ({
      type: s.direction === 'LONG' ? 'BUY' : 'SELL',
      priceStart: s.entryZone,
      priceEnd: s.entryZone * (s.direction === 'LONG' ? 0.999 : 1.001), // Visualization height
      label: s.reason,
      targets: [s.target1, s.target2],
      invalidation: s.invalidation
    }));
  }, [setups]);

  const handlePresetChange = (preset: typeof activePreset) => {
    setActivePreset(preset);
    switch (preset) {
      case 'INSTITUTIONAL': setMinSize(15.0); setMinIntensity(40); setMinConfidence(85); break;
      case 'SCALP': setMinSize(5.0); setMinIntensity(20); setMinConfidence(65); break;
      case 'AGGRESSIVE': setMinSize(1.5); setMinIntensity(10); setMinConfidence(30); break;
      case 'OFF': setMinSize(0); setMinIntensity(0); setMinConfidence(0); break;
    }
  };

  const allProcessedReports = useMemo(() => {
    return (signals || []).map(s => {
      const ratio = s.size / (s.threshold || 1);
      const l2Bias = bookAnalysis ? (s.type === 'HIDDEN_BUY' ? bookAnalysis.bidPressure : bookAnalysis.askPressure) : 50;
      const spoofRisk = bookAnalysis?.spoofRisk || 0;
      
      let action: ForensicReport['action'] = 'WAIT';
      let risk: ForensicReport['riskLevel'] = 'MEDIUM';
      let confidence = s.confidence;

      if (l2Bias > 75 && ratio > 2.0 && spoofRisk < 15) {
        action = s.type === 'HIDDEN_BUY' ? 'LONG_SCALP' : 'SHORT_SCALP';
        risk = 'LOW';
        confidence = Math.min(99, confidence + 10);
      } else if (spoofRisk > 35) {
        risk = 'HIGH';
        confidence = Math.max(10, confidence - 25);
      }

      const intentSignature = ratio > 3 ? 'RELOADING' : ratio > 2 ? 'ABSORPTION' : 'MOMENTUM_BLOCK';
      const briefing = [
        `Structural ${s.type === 'HIDDEN_BUY' ? 'Accumulation' : 'Distribution'} identified.`,
        `Ratio: ${ratio.toFixed(2)}x. Depth saturation: ${l2Bias.toFixed(1)}%.`,
        `Intent: ${intentSignature} detected.`
      ];

      return { 
        ...s, 
        action, 
        riskLevel: risk, 
        confidenceScore: confidence, 
        intentSignature, 
        interpretation: briefing.join(' ') 
      } as ForensicReport;
    });
  }, [signals, bookAnalysis]);

  const filteredReports = useMemo(() => {
    return allProcessedReports.filter(r => 
      r.size >= minSize && 
      r.intensity >= minIntensity && 
      r.confidenceScore >= minConfidence
    );
  }, [allProcessedReports, minSize, minIntensity, minConfidence]);

  const masterState: MarketSignalState = useMemo(() => ({
    toxicity: toxicityScore,
    forensicRatio: filteredReports[0] ? filteredReports[0].size / (filteredReports[0].threshold || 1) : 1.0,
    obi: bookAnalysis ? (bookAnalysis.bidPressure - 50) / 50 : 0,
    isAtSwingLevel: setups.length > 0,
    deltaSpeed: signals.length * 2
  }), [toxicityScore, filteredReports, bookAnalysis, setups, signals]);

  const masterEngine = useMasterForensicEngine(masterState);

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-4 gap-0 h-full bg-[#020408] border rounded-lg overflow-hidden shadow-2xl font-mono transition-all duration-700 ${masterEngine.isGunpoint ? 'border-red-500 shadow-neon-red ring-1 ring-red-500/20' : 'border-ai-border'}`}>
      
      {/* SCANNER PANEL */}
      <div className="lg:col-span-1 border-r border-ai-border flex flex-col bg-black/40 overflow-hidden">
        <div className="p-4 border-b border-ai-border bg-[#080a0f] flex justify-between items-center shrink-0">
          <h2 className="text-[10px] font-black text-gray-500 flex items-center gap-2 uppercase tracking-widest">
            <Radio size={14} className="text-ai-accent animate-pulse" />
            Ingestion Engine
          </h2>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded transition-all ${showFilters ? 'bg-ai-accent text-white' : 'bg-white/5 text-gray-500'}`}
          >
            <Settings2 size={14} />
          </button>
        </div>

        {showFilters && (
          <div className="p-4 bg-ai-panel/30 border-b border-ai-border space-y-4 animate-in slide-in-from-top-2 overflow-y-auto custom-scrollbar">
            <LatencyHUD />
            
            <div className="grid grid-cols-2 gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
              {(['INSTITUTIONAL', 'SCALP', 'AGGRESSIVE', 'OFF'] as const).map(preset => (
                <button
                  key={preset}
                  onClick={() => handlePresetChange(preset)}
                  className={`py-1.5 text-[8px] font-black rounded transition-all uppercase ${activePreset === preset ? 'bg-ai-accent text-white shadow-sm' : 'text-gray-600 hover:text-gray-300'}`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* ORDER BLOCK STRATEGY POD */}
            <div className="p-2.5 bg-black/60 rounded border border-orange-500/20">
               <div className="flex items-center gap-2 mb-2">
                  <Flame size={12} className="text-orange-500 animate-pulse" />
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Order Block Setups</span>
               </div>
               <div className="space-y-1.5">
                  {setups.length === 0 ? (
                    <div className="text-[8px] text-gray-700 italic">No block triggers identified...</div>
                  ) : (
                    setups.map((s, i) => (
                      <div key={i} className="flex flex-col bg-white/[0.02] p-2 rounded border border-white/5 gap-1.5 group/setup">
                        <div className="flex justify-between items-center">
                          <div className={`text-[10px] font-black tracking-widest ${s.direction === 'LONG' ? 'text-buy' : 'text-sell'}`}>
                            {s.direction}_SETUP
                          </div>
                          <span className="text-[8px] font-black text-gray-600">RR: {s.riskReward.toFixed(1)}x</span>
                        </div>
                        <div className="flex justify-between text-[9px]">
                           <span className="text-gray-500 uppercase">Entry</span>
                           <span className="text-white font-black tabular-nums">${s.entryZone.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[9px]">
                           <span className="text-gray-500 uppercase text-[7px]">Target_1</span>
                           <span className="text-emerald-500 font-bold tabular-nums">${s.target1.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[9px] border-t border-white/5 pt-1 mt-1 opacity-60">
                           <span className="text-gray-600 text-[7px] uppercase">SL_Invalid</span>
                           <span className="text-rose-500 tabular-nums">${s.invalidation.toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </div>

            <div className="space-y-5">
              <div className="group">
                <div className="flex justify-between items-center mb-1">
                   <label className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Min_Size_Ratio</label>
                   <span className="text-[10px] text-ai-accent font-black">{minSize.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0" max="50" step="0.5" 
                  value={minSize} 
                  onChange={e => { setMinSize(Number(e.target.value)); setActivePreset('OFF'); }} 
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-ai-accent" 
                />
              </div>

              <div className="group">
                <div className="flex justify-between items-center mb-1">
                   <label className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Min_Intensity</label>
                   <span className="text-[10px] text-amber-500 font-black">{minIntensity}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="1" 
                  value={minIntensity} 
                  onChange={e => { setMinIntensity(Number(e.target.value)); setActivePreset('OFF'); }} 
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                />
              </div>

              <div className="group">
                <div className="flex justify-between items-center mb-1">
                   <label className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Min_Confidence</label>
                   <span className="text-[10px] text-emerald-500 font-black">{minConfidence}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="1" 
                  value={minConfidence} 
                  onChange={e => { setMinConfidence(Number(e.target.value)); setActivePreset('OFF'); }} 
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {filteredReports.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center p-8 opacity-20 text-center">
                <ListFilter size={40} className="mb-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Packets</span>
             </div>
          ) : (
            filteredReports.map(report => (
              <div 
                key={report.id}
                onClick={() => setSelectedReportId(report.id)}
                className={`p-3 border-b border-ai-border cursor-pointer transition-all relative group ${selectedReportId === report.id ? 'bg-ai-accent/10 shadow-inner' : 'hover:bg-white/5'}`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${report.type === 'HIDDEN_BUY' ? 'bg-buy shadow-[0_0_8px_#10B981]' : 'bg-sell shadow-[0_0_8px_#EF4444]'}`} />
                <div className="flex justify-between items-start">
                  <span className="font-black text-[10px] text-white group-hover:text-ai-accent transition-colors">{(report.symbol || 'UNK').replace('USDT', '')}</span>
                  <span className={`text-[8px] font-black px-1 rounded ${report.type === 'HIDDEN_BUY' ? 'text-buy bg-buy/10' : 'text-sell bg-sell/10'}`}>
                    {report.size.toFixed(2)}x
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AUDIT PANEL */}
      <div className="lg:col-span-3 flex flex-col bg-[#050608] relative overflow-hidden">
        {masterEngine.isGunpoint && <div className="absolute inset-0 bg-red-600/10 animate-pulse pointer-events-none z-0" />}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-6 py-4">
          <div className="sticky top-0 z-50 pt-2 pb-1 bg-[#050608]/90 backdrop-blur-md space-y-2">
            <div className={`grid grid-cols-2 gap-2 bg-black/80 border p-2 rounded-lg transition-colors ${masterEngine.isGunpoint ? 'border-red-500' : 'border-ai-border'}`}>
                <div className="flex flex-col gap-0.5 border-r border-white/5">
                   <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Master_Mode</span>
                   <span className={`text-[11px] font-black tracking-widest ${masterEngine.isGunpoint ? 'text-red-500' : 'text-emerald-500'}`}>{masterEngine.marketMode} // {masterEngine.action}</span>
                </div>
                <div className="flex flex-col gap-0.5 items-end text-right">
                   <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Engine_Conviction</span>
                   <span className={`text-[11px] font-black tabular-nums ${masterEngine.isGunpoint ? 'text-red-500 animate-pulse' : 'text-ai-accent'}`}>{masterEngine.convictionScore}% L0_CERTAINTY</span>
                </div>
            </div>
          </div>
          
          <div className="h-[480px] border border-ai-border rounded-lg overflow-hidden bg-black/40 mt-4 relative">
             <div className="absolute top-4 right-4 z-50 flex flex-col gap-1 items-end pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded flex items-center gap-3">
                   <Target size={12} className="text-ai-accent animate-pulse" />
                   <div className="flex flex-col">
                      <span className="text-[8px] text-gray-600 font-black uppercase">Dominant_Wall_Delta</span>
                      <span className="text-[10px] text-white font-black tabular-nums">
                         {walls[0] ? `$${Math.abs(currentPrice - walls[0].price).toLocaleString()} GAP` : 'SCANNING...'}
                      </span>
                   </div>
                </div>
             </div>
             <MarketChart 
               data={chartData} 
               currentPrice={currentPrice} 
               walls={walls} 
               zones={mappedZones}
               symbol={symbol}
               onSymbolChange={onSymbolChange}
             />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-ai-panel/20 border border-ai-border p-3 rounded flex flex-col group/stat hover:border-ai-accent/30 transition-all">
                <span className="text-[8px] text-gray-600 font-black uppercase mb-1 flex items-center gap-1"><Zap size={10} /> Flow_Integrity</span>
                <span className="text-lg font-black text-ai-accent tracking-tighter">{(masterState.forensicRatio).toFixed(2)}x</span>
              </div>
              <div className="bg-ai-panel/20 border border-ai-border p-3 rounded flex flex-col group/stat hover:border-ai-accent/30 transition-all">
                <span className="text-[8px] text-gray-600 font-black uppercase mb-1 flex items-center gap-1"><Target size={10} /> Market_Mid</span>
                <span className="text-lg font-black text-white tracking-tighter tabular-nums">${currentPrice.toLocaleString()}</span>
              </div>
              <div className="bg-ai-panel/20 border border-ai-border p-3 rounded flex flex-col group/stat hover:border-ai-accent/30 transition-all">
                <span className="text-[8px] text-gray-600 font-black uppercase mb-1 flex items-center gap-1"><ShieldAlert size={10} /> Toxicity</span>
                <span className={`text-lg font-black tracking-tighter ${toxicityScore > 0.6 ? 'text-rose-500' : 'text-emerald-500'}`}>{(toxicityScore * 100).toFixed(1)}%</span>
              </div>
          </div>
        </div>

        <div className="p-3 border-t border-ai-border bg-[#080a0f] flex justify-between items-center text-[8px] font-black text-gray-700 tracking-[0.2em] relative z-20">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 text-emerald-500/80"><Zap size={10} /> Acceleration: FPGA_G3</span>
            <span className="flex items-center gap-1.5"><LayoutGrid size={10} /> Structural Architecture: V2.1</span>
          </div>
          <span className="text-ai-accent uppercase tracking-widest">AUTHENTICATED_FORENSIC_CHANNEL</span>
        </div>
      </div>
    </div>
  );
};

export default ForensicEngine;
