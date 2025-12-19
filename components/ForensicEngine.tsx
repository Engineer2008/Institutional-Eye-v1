
import React, { useState, useMemo, useEffect } from 'react';
import { MarketSignal, ForensicReport, ForensicZone, ForensicWall } from '../types';
import { BookAnalysis } from '../services/OrderBookBrain';
import { decodeMarketStructure } from '../services/StrategyDecoder';
import { HFTTransport, TransportMetrics } from '../services/HFTTransport';
import { 
  FileText, Activity, Fingerprint, ShieldAlert, Binary, 
  Cpu, Zap, Layers, AlertTriangle, SlidersHorizontal, 
  Terminal, Gauge, BarChart3, Radio
} from 'lucide-react';

interface ForensicEngineProps {
  signals: MarketSignal[];
  bookAnalysis: BookAnalysis | null;
  rawBids?: string[][];
  rawAsks?: string[][];
  currentPrice: number;
  avgVolume: number;
}

const TelemetryHUD: React.FC<{ metrics: TransportMetrics }> = ({ metrics }) => (
  <div className="grid grid-cols-4 gap-2 mb-4 bg-black/60 border border-ai-border/40 p-2 rounded-lg font-mono text-[8px] uppercase tracking-widest font-black">
    <div className="flex flex-col gap-1 px-2 border-r border-ai-border/30">
      <span className="text-gray-600">Protocol</span>
      <span className="text-ai-accent">{metrics.protocol} (BINARY)</span>
    </div>
    <div className="flex flex-col gap-1 px-2 border-r border-ai-border/30">
      <span className="text-gray-600">Engine</span>
      <span className="text-emerald-500">{metrics.acceleration} ACCEL</span>
    </div>
    <div className="flex flex-col gap-1 px-2 border-r border-ai-border/30">
      <span className="text-gray-600">Latency</span>
      <span className="text-white">{metrics.latencyMicros.toFixed(3)}μs</span>
    </div>
    <div className="flex flex-col gap-1 px-2">
      <span className="text-gray-600">Health</span>
      <span className={metrics.packetHealth > 99 ? 'text-emerald-500' : 'text-yellow-500'}>
        {metrics.packetHealth.toFixed(2)}%
      </span>
    </div>
  </div>
);

const ForensicEngine: React.FC<ForensicEngineProps> = ({ signals, bookAnalysis, rawBids, rawAsks, currentPrice, avgVolume }) => {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<TransportMetrics>(HFTTransport.getInstance().getLiveTelemetry());
  
  // High-Integrity Filter States
  const [minSize, setMinSize] = useState(0);
  const [minIntensity, setMinIntensity] = useState(0);
  const [minConfidence, setMinConfidence] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(HFTTransport.getInstance().getLiveTelemetry());
    }, 500);
    return () => clearInterval(timer);
  }, []);

  const { structure, setups } = useMemo(() => {
    if (!rawBids || !rawAsks) return { structure: null, setups: [] };
    return decodeMarketStructure(rawBids, rawAsks, currentPrice, avgVolume);
  }, [rawBids, rawAsks, currentPrice, avgVolume]);

  const reports = useMemo(() => {
    return (signals || [])
      .map(s => {
        // Clinical Audit Logic
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

        return {
          ...s,
          action,
          riskLevel: risk,
          confidenceScore: confidence,
          interpretation: `Structural ${s.type === 'HIDDEN_BUY' ? 'Accumulation' : 'Distribution'} detected via ${telemetry.protocol}. L2 Bias: ${l2Bias.toFixed(1)}%. Risk: ${risk}.`
        };
      })
      .filter(r => r.size >= minSize && r.intensity >= minIntensity && r.confidenceScore >= minConfidence);
  }, [signals, bookAnalysis, telemetry.protocol, minSize, minIntensity, minConfidence]);

  const activeReport = selectedReportId ? reports.find(r => r.id === selectedReportId) : reports[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 h-full bg-[#020408] border border-ai-border rounded-lg overflow-hidden shadow-2xl font-mono">
      
      {/* SCANNER PANEL: BINARY INGESTION FEED */}
      <div className="lg:col-span-1 border-r border-ai-border flex flex-col bg-black/40">
        <div className="p-4 border-b border-ai-border bg-[#080a0f] flex justify-between items-center">
          <h2 className="text-[10px] font-black text-gray-500 flex items-center gap-2 uppercase tracking-widest">
            <Radio size={14} className="text-ai-accent animate-pulse" />
            Ingestion Engine
          </h2>
          <span className="text-[9px] bg-ai-border px-2 py-0.5 rounded text-gray-400 font-bold">{reports.length} RX</span>
        </div>

        {/* FPGA GATE CONTROLS */}
        <div className="p-4 bg-ai-panel/30 border-b border-ai-border space-y-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[8px] font-black text-gray-500 uppercase tracking-widest">
              <span>MIN_PKT_SIZE</span>
              <span className="text-ai-accent">{minSize.toFixed(1)}</span>
            </div>
            <input type="range" min="0" max="50" step="0.5" value={minSize} onChange={e => setMinSize(Number(e.target.value))} className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-ai-accent" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[8px] font-black text-gray-500 uppercase tracking-widest">
              <span>MIN_CONFIDENCE</span>
              <span className="text-ai-accent">{minConfidence.toFixed(0)}%</span>
            </div>
            <input type="range" min="0" max="95" step="5" value={minConfidence} onChange={e => setMinConfidence(Number(e.target.value))} className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-ai-accent" />
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {reports.map(report => (
            <div 
              key={report.id}
              onClick={() => setSelectedReportId(report.id)}
              className={`p-3 border-b border-ai-border cursor-pointer transition-all relative ${selectedReportId === report.id ? 'bg-ai-accent/5' : 'hover:bg-white/5'}`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${report.type === 'HIDDEN_BUY' ? 'bg-buy' : 'bg-sell'}`} />
              <div className="flex justify-between items-start">
                <span className="font-black text-[10px] text-white">{(report.symbol || 'UNK').replace('USDT', '')}</span>
                <span className={`text-[8px] font-black px-1 rounded ${report.type === 'HIDDEN_BUY' ? 'text-buy bg-buy/10' : 'text-sell bg-sell/10'}`}>
                  {report.size.toFixed(2)}x
                </span>
              </div>
              <div className="text-[9px] text-gray-600 mt-1 uppercase font-bold tracking-tighter">Confidence: {report.confidenceScore.toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* AUDIT PANEL */}
      <div className="lg:col-span-3 flex flex-col bg-[#050608] relative">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ai-accent via-transparent to-transparent"></div>
        
        <div className="p-6 flex-1 flex flex-col overflow-y-auto custom-scrollbar relative z-10">
          <TelemetryHUD metrics={telemetry} />

          {activeReport ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xs font-black text-white tracking-[0.4em] uppercase mb-1 flex items-center gap-2">
                    <Binary size={16} className="text-ai-accent" /> Packet_Audit_Log
                  </h1>
                  <span className="text-[9px] text-gray-700 font-bold uppercase tracking-[0.2em]">Hash: {activeReport.id.split('-').pop()}</span>
                </div>
                <div className={`px-4 py-1.5 rounded text-[10px] font-black border uppercase tracking-widest ${activeReport.action === 'LONG_SCALP' ? 'bg-buy text-black' : activeReport.action === 'SHORT_SCALP' ? 'bg-sell text-black' : 'bg-gray-800 text-gray-500 border-gray-700'}`}>
                  {activeReport.action}
                </div>
              </div>

              <div className="bg-black/60 border border-ai-border rounded-lg p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Fingerprint size={100} /></div>
                <h3 className="text-[9px] font-black text-ai-accent uppercase mb-3 tracking-widest flex items-center gap-2">
                  <FileText size={12} /> Clinical Interpretation
                </h3>
                <p className="text-[12px] leading-relaxed text-gray-300 font-mono italic">
                  {activeReport.interpretation}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-ai-panel/20 border border-ai-border p-3 rounded flex flex-col">
                  <span className="text-[8px] text-gray-600 font-black uppercase mb-1">Strike_Price</span>
                  <span className="text-lg font-black text-white tracking-tighter">${activeReport.price.toLocaleString()}</span>
                </div>
                <div className="bg-ai-panel/20 border border-ai-border p-3 rounded flex flex-col">
                  <span className="text-[8px] text-gray-600 font-black uppercase mb-1">Size_Ratio</span>
                  <span className="text-lg font-black text-ai-accent tracking-tighter">{(activeReport.size / activeReport.threshold).toFixed(2)}x</span>
                </div>
                <div className="bg-ai-panel/20 border border-ai-border p-3 rounded flex flex-col">
                  <span className="text-[8px] text-gray-600 font-black uppercase mb-1">Risk_Level</span>
                  <span className={`text-lg font-black tracking-tighter ${activeReport.riskLevel === 'LOW' ? 'text-emerald-500' : 'text-rose-500'}`}>{activeReport.riskLevel}</span>
                </div>
              </div>

              {structure && (
                <div className="p-5 bg-black/40 border border-ai-border rounded-lg">
                  <h3 className="text-[9px] font-black text-gray-600 uppercase mb-4 tracking-[0.3em] flex items-center gap-2">
                    <Layers size={14} className="text-ai-accent" /> Structural_Wall_Matrix
                  </h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">Support_Cluster</span>
                      {structure.dominantSupport ? (
                        <div className="text-xl font-black text-white tracking-tighter">
                          ${structure.dominantSupport.price.toFixed(2)}
                          <span className="ml-2 text-[10px] text-gray-700">{structure.dominantSupport.vol.toFixed(1)} BTC</span>
                        </div>
                      ) : <span className="text-[10px] text-gray-800">No established floor.</span>}
                    </div>
                    <div className="flex flex-col gap-1 text-right">
                      <span className="text-[8px] text-rose-500 font-black uppercase tracking-widest">Resistance_Cluster</span>
                      {structure.dominantResistance ? (
                        <div className="text-xl font-black text-white tracking-tighter">
                          ${structure.dominantResistance.price.toFixed(2)}
                          <span className="ml-2 text-[10px] text-gray-700">{structure.dominantResistance.vol.toFixed(1)} BTC</span>
                        </div>
                      ) : <span className="text-[10px] text-gray-800">No established ceiling.</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-800 opacity-20">
              <Terminal size={80} className="mb-6 animate-pulse" />
              <div className="text-[10px] font-black tracking-[1em] uppercase">SYSTEM_IDLE: AWAITING_RX_PACKET</div>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-ai-border bg-[#080a0f] flex justify-between items-center text-[8px] font-black text-gray-700 tracking-[0.2em] relative z-20">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 text-emerald-500/80"><Zap size={10} /> Acceleration: FPGA_G3</span>
            <span className="flex items-center gap-1.5"><Activity size={10} /> Stream: SBE_SYNCHRONIZED</span>
          </div>
          <button className="text-ai-accent hover:text-white transition-colors">DUMP_CORE_EVIDENCE</button>
        </div>
      </div>
    </div>
  );
};

export default ForensicEngine;
