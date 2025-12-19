
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { IcebergSignal, VolatilityState, SystemStatus, MarketType } from '../types';
import { OrderBookBrain, BookAnalysis } from '../services/OrderBookBrain';
import { getStreamUrl } from '../services/MarketRegistry';
import { Brain, Activity, Target, Waves, Cpu, Crosshair, Layers, AlertTriangle, ShieldCheck, Binary } from 'lucide-react';

// FORENSIC ADAPTIVE SETTINGS
const LEARNING_BUFFER = 50; 
const SENSITIVITY_MULTIPLIER = 50;
const CLUSTER_WINDOW_MS = 1200;

interface Props {
  symbol: string;
  marketType: MarketType;
}

interface Trade {
  p: number;
  q: number;
  m: boolean;
  T: number;
}

interface MarketStats {
  price: number;
  avgTradeVol: number;
  volatility: VolatilityState;
  dynamicThreshold: number;
  status: SystemStatus;
}

interface Cluster {
  price: number;
  volume: number;
  isBuyTaker: boolean;
  lastUpdate: number;
}

const AdaptiveIcebergEngine: React.FC<Props> = ({ symbol, marketType }) => {
  const [stats, setStats] = useState<MarketStats>({
    price: 0,
    avgTradeVol: 0,
    volatility: 'LOW',
    dynamicThreshold: 10,
    status: 'LEARNING'
  });
  
  const [signals, setSignals] = useState<IcebergSignal[]>([]);
  const [bookAnalysis, setBookAnalysis] = useState<BookAnalysis | null>(null);
  
  const clusterMap = useRef<Map<number, Cluster>>(new Map());
  const recentVolumes = useRef<number[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const orderBookBrain = useRef(new OrderBookBrain());

  useEffect(() => {
    setStats({
        price: 0,
        avgTradeVol: 0,
        volatility: 'LOW',
        dynamicThreshold: 10,
        status: 'LEARNING'
    });
    setSignals([]);
    setBookAnalysis(null);
    clusterMap.current = new Map();
    recentVolumes.current = [];
    orderBookBrain.current = new OrderBookBrain();
  }, [symbol, marketType]);

  const processTick = useCallback((t: Trade) => {
    const now = Date.now();
    const isBuyTaker = t.m;

    recentVolumes.current.push(t.q);
    if (recentVolumes.current.length > 500) recentVolumes.current.shift();

    const sumVol = recentVolumes.current.reduce((a, b) => a + b, 0);
    const avgVol = sumVol / recentVolumes.current.length || 0.01;
    const liveThreshold = avgVol * SENSITIVITY_MULTIPLIER;
    
    let volState: VolatilityState = 'NORMAL';
    if (liveThreshold > 5) volState = 'HIGH';
    if (liveThreshold < 1) volState = 'LOW';

    const isReady = recentVolumes.current.length >= LEARNING_BUFFER;

    setStats({
      price: t.p,
      avgTradeVol: avgVol,
      volatility: volState,
      dynamicThreshold: liveThreshold,
      status: isReady ? 'ACTIVE' : 'LEARNING'
    });

    if (!isReady) return;

    let cluster = clusterMap.current.get(t.p);
    if (!cluster) {
      cluster = { price: t.p, volume: t.q, isBuyTaker, lastUpdate: now };
      clusterMap.current.set(t.p, cluster);
    } else {
      if (cluster.isBuyTaker !== isBuyTaker) {
        cluster = { price: t.p, volume: t.q, isBuyTaker, lastUpdate: now };
      } else {
        cluster.volume += t.q;
        cluster.lastUpdate = now;
      }
      clusterMap.current.set(t.p, cluster);
    }

    if (cluster.volume > liveThreshold) {
      const type = isBuyTaker ? 'HIDDEN_SELL' : 'HIDDEN_BUY';
      const newSig: IcebergSignal = {
        id: `ICE-${t.p}-${now}`,
        type,
        price: t.p,
        volAbsorbed: cluster.volume,
        thresholdAtTime: liveThreshold,
        timestamp: now
      };

      setSignals(prev => {
        const existing = prev.find(s => s.price === t.p && s.type === type);
        if (existing && cluster!.volume < existing.volAbsorbed * 1.1) {
          return prev;
        }
        const filtered = prev.filter(s => !(s.price === t.p && s.type === type));
        return [newSig, ...filtered].slice(0, 30);
      });
    }

    // Cleanup stale clusters
    if (clusterMap.current.size > 150) {
      for (const [key, val] of clusterMap.current) {
        if (now - val.lastUpdate > CLUSTER_WINDOW_MS) clusterMap.current.delete(key);
      }
    }
  }, []);

  const processDepth = useCallback((bids: string[][], asks: string[][]) => {
      const result = orderBookBrain.current.analyze(bids, asks);
      setBookAnalysis(result.analysis);
  }, []);

  useEffect(() => {
    const url = getStreamUrl(symbol, marketType, ['aggTrade', 'depth20@100ms']);
    if (ws.current) ws.current.close();
    ws.current = new WebSocket(url);
    ws.current.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        const data = payload.data || payload;
        const stream = payload.stream || '';

        if (stream.includes('aggTrade') || data.e === 'aggTrade') {
            processTick({ p: parseFloat(data.p), q: parseFloat(data.q), m: data.m, T: data.T });
        } else if (stream.includes('depth20') || data.bids) {
            const bids = data.bids || data.b;
            const asks = data.asks || data.a;
            if (bids && asks) processDepth(bids, asks);
        }
      } catch (err) {}
    };
    return () => { if (ws.current) ws.current.close(); };
  }, [symbol, marketType, processTick, processDepth]);

  return (
    <div className="bg-[#020408] border border-ai-border rounded-xl overflow-hidden shadow-2xl h-full flex flex-col font-mono animate-in fade-in duration-700">
      
      {/* FORENSIC HEADER */}
      <div className="bg-[#080a0f] border-b border-ai-border p-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
               <Brain size={16} className="text-ai-accent" />
               Structural Forensic Engine <span className="text-gray-600">// {(symbol || 'UNK').replace('USDT', '')}</span>
            </h2>
            <div className="flex items-center gap-2 mt-1 text-[10px]">
               <span className="text-gray-600">LAYER_0:</span> <span className="text-ai-accent font-bold uppercase">{marketType}</span>
               <span className="text-gray-800">|</span>
               <span className="text-gray-600">STATUS:</span> <span className={stats.status === 'ACTIVE' ? 'text-emerald-500 font-black' : 'text-yellow-500 font-black'}>{stats.status}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-gray-700 font-black tracking-widest">TELEMETRY_PRICE</div>
            <div className="text-xl font-black text-white tracking-tighter">${stats.price.toFixed(2)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-black/40 border border-ai-border rounded p-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Waves size={16} /></div>
            <div className="text-[9px] text-gray-700 font-black uppercase mb-1">Structural Volatility</div>
            <div className={`text-lg font-black ${stats.volatility === 'HIGH' ? 'text-sell' : stats.volatility === 'NORMAL' ? 'text-yellow-500' : 'text-emerald-500'}`}>{stats.volatility}</div>
          </div>
          <div className="bg-black/40 border border-ai-border rounded p-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Activity size={16} /></div>
            <div className="text-[9px] text-gray-700 font-black uppercase mb-1">Organic Flow Avg</div>
            <div className="text-lg font-black text-white">{stats.avgTradeVol.toFixed(4)} <span className="text-[10px] text-gray-700">BTC</span></div>
          </div>
          <div className="bg-black/40 border border-ai-border rounded p-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Target size={16} /></div>
            <div className="text-[9px] text-gray-700 font-black uppercase mb-1">Anomaly Threshold</div>
            <div className="text-lg font-black text-yellow-400">{'>'} {stats.dynamicThreshold.toFixed(2)}</div>
          </div>
        </div>
        
        {bookAnalysis && (
            <div className="bg-ai-panel/30 border border-ai-border rounded p-3 relative overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-[9px] font-black text-gray-600 uppercase flex items-center gap-1">
                        <Layers size={10} className="text-ai-accent" /> Depth Congruence
                    </div>
                    {bookAnalysis.manipulationType !== 'NONE' && (
                        <div className="flex items-center gap-1 text-[9px] font-black text-sell bg-sell/10 px-2 rounded border border-sell/20 animate-pulse">
                            <AlertTriangle size={10} /> DETECTION: {bookAnalysis.manipulationType}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] text-emerald-500 w-8 text-right font-black">{bookAnalysis.bidPressure.toFixed(0)}%</span>
                    <div className="flex-1 h-1.5 bg-gray-900 rounded-full overflow-hidden flex border border-white/5">
                        <div className="bg-buy h-full transition-all duration-300 shadow-[0_0_8px_#10B981]" style={{ width: `${bookAnalysis.bidPressure}%` }} />
                        <div className="bg-sell h-full transition-all duration-300 shadow-[0_0_8px_#EF4444]" style={{ width: `${bookAnalysis.askPressure}%` }} />
                    </div>
                    <span className="text-[9px] text-sell w-8 font-black">{bookAnalysis.askPressure.toFixed(0)}%</span>
                </div>
            </div>
        )}
      </div>

      {/* ANOMALY FEED */}
      <div className="flex-1 flex flex-col bg-[#050608] overflow-hidden">
        <div className="p-3 border-b border-ai-border bg-ai-panel/30 flex justify-between items-center">
             <h3 className="text-[10px] font-black text-gray-500 flex items-center gap-2 uppercase tracking-widest">
                <Binary size={14} className="text-ai-accent" /> Detection Telemetry
             </h3>
             <span className="text-[8px] text-gray-700 font-black">PKT_COUNT: {signals.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {signals.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-700 opacity-40">
                    <Crosshair size={32} className="mb-2 animate-spin-slow" />
                    <div className="text-[10px] font-black uppercase tracking-[0.3em]">Auditing Order Flow...</div>
                </div>
            )}
            {signals.map(s => (
                <div key={s.id} className={`flex justify-between items-center p-3 rounded-lg bg-black/40 border border-white/5 border-l-4 animate-in slide-in-from-right-2 ${s.type === 'HIDDEN_BUY' ? 'border-l-buy' : 'border-l-sell'}`}>
                    <div className="flex items-center gap-3">
                        <div>
                            <div className="text-[9px] text-gray-700 font-black">{new Date(s.timestamp).toLocaleTimeString([], { hour12: false })}</div>
                            <div className={`text-[11px] font-black uppercase tracking-widest ${s.type === 'HIDDEN_BUY' ? 'text-emerald-500' : 'text-sell'}`}>
                                {(s.type || 'UNK').replace('_', ' ')}
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-[8px] text-gray-700 uppercase font-black">Audit_Price</div>
                        <div className="text-sm font-black text-white">${s.price.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[8px] text-gray-700 uppercase font-black">Forensic_Ratio</div>
                        <div className="text-[11px] font-black text-ai-accent">{(s.volAbsorbed / s.thresholdAtTime).toFixed(2)}x</div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AdaptiveIcebergEngine;
