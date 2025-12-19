import React, { useEffect, useState, useRef } from 'react';
import { Brain, Activity, Target, Zap, Waves, Cpu, Crosshair } from 'lucide-react';
import { DynamicMarketState, SmartSignal } from '../types';
import { getStreamUrl } from '../services/MarketRegistry';

// --- CONFIGURATION ---
const PAIR = 'btcusdt';

interface Trade {
  p: number; // Price
  q: number; // Quantity
  isBuyerMaker: boolean; // Sell = True, Buy = False
  timestamp: number;
}

const DynamicExecutionEngine: React.FC = () => {
  // --- REAL-TIME STATE ---
  const [market, setMarket] = useState<DynamicMarketState>({
    currentPrice: 0,
    volatility: 'LOW',
    regime: 'NEUTRAL',
    adaptiveWhaleThreshold: 50000,
    avgTradeVol: 0
  });
  
  const [signals, setSignals] = useState<SmartSignal[]>([]);
  const [cvd, setCvd] = useState<number>(0);
  
  // Refs for high-frequency logic
  const ws = useRef<WebSocket | null>(null);
  const recentTrades = useRef<Trade[]>([]);
  
  // --- DYNAMIC INTELLIGENCE ENGINE ---
  const processMarketData = (trade: Trade) => {
    const { p, q, isBuyerMaker } = trade;
    const valueUSD = p * q;
    
    // 1. UPDATE LEARNING MODEL (Rolling Average)
    recentTrades.current.push(trade);
    if (recentTrades.current.length > 200) recentTrades.current.shift();
    
    // Calculate Average Trade Size of last 200 ticks
    const avgTradeSize = recentTrades.current.reduce((acc, t) => acc + (t.p * t.q), 0) / recentTrades.current.length;
    
    // 2. DYNAMIC THRESHOLD ADJUSTMENT
    const dynamicThreshold = avgTradeSize * 50;

    // 3. REGIME DETECTION (Price vs CVD Divergence)
    let currentRegime: DynamicMarketState['regime'] = 'NEUTRAL';
    const firstPrice = recentTrades.current[0]?.p || p;
    const priceChange = p - firstPrice;
    
    if (priceChange > 0 && cvd < 0) currentRegime = 'MANIPULATION'; // Price Up, Volume Selling
    else if (priceChange < 0 && cvd > 0) currentRegime = 'ACCUMULATION'; // Price Down, Volume Buying
    else if (priceChange > 0 && cvd > 0) currentRegime = 'DISTRIBUTION'; // Price Up, Volume Buying (Trend)
    
    // 4. GENERATE SIGNALS (The Output)
    if (valueUSD > dynamicThreshold) {
      const type = isBuyerMaker ? 'WHALE_SELL' : 'WHALE_BUY';
      
      const newSignal: SmartSignal = {
        id: Math.random().toString(36).substr(2, 9),
        time: new Date().toLocaleTimeString(),
        type,
        confidence: currentRegime === 'MANIPULATION' ? 95 : 75,
        note: `Vol: $${Math.floor(valueUSD).toLocaleString()} (x${(valueUSD/avgTradeSize).toFixed(1)} avg)`
      };
      
      setSignals(prev => [newSignal, ...prev].slice(0, 10));
    }

    // Update State
    setMarket({
      currentPrice: p,
      volatility: avgTradeSize > 10000 ? 'EXTREME' : 'LOW',
      regime: currentRegime,
      adaptiveWhaleThreshold: dynamicThreshold,
      avgTradeVol: avgTradeSize
    });
    
    // Update CVD
    setCvd(prev => isBuyerMaker ? prev - q : prev + q);
  };

  // --- LIVE CONNECTION ---
  useEffect(() => {
    // CRITICAL FIX: Use Port 443 via MarketRegistry to bypass firewalls
    const url = getStreamUrl(PAIR, 'SPOT', ['aggTrade']);
    
    ws.current = new WebSocket(url);

    ws.current.onopen = () => console.log('--- DYNAMIC ENGINE CONNECTED (TUNNELED) ---');
    
    ws.current.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        
        // Handle Combined Stream Format ({ stream: "...", data: {...} })
        const data = payload.data || payload;

        if (data.e === 'aggTrade') {
          const trade: Trade = {
            p: parseFloat(data.p),
            q: parseFloat(data.q),
            isBuyerMaker: data.m,
            timestamp: data.T
          };
          processMarketData(trade);
        }
      } catch (e) {
        // Ignore parse errors or heartbeat frames
      }
    };

    return () => { if (ws.current) ws.current.close(); };
  }, []);

  const getRegimeColor = (r: string) => {
    switch (r) {
      case 'MANIPULATION': return 'text-purple-500';
      case 'ACCUMULATION': return 'text-cyan-400';
      case 'DISTRIBUTION': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  // --- RENDER (THE HUD) ---
  return (
    <div className="bg-ai-dark border border-ai-border rounded-xl p-0 overflow-hidden shadow-2xl h-full flex flex-col animate-in fade-in duration-700">
      
      {/* SECTION 1: THE BRAIN (DYNAMIC PARAMETERS) */}
      <div className="bg-ai-panel/50 border-b border-ai-border p-5">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-sm font-bold text-gray-200 flex items-center gap-2">
             <Brain size={16} className="text-ai-accent" />
             DYNAMIC INTELLIGENCE CORE <span className="text-gray-600">// {PAIR.toUpperCase()}</span>
           </h2>
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-buy animate-pulse"></span>
              <span className="text-[10px] text-buy font-mono font-bold">LIVE ANALYSIS</span>
           </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-ai-dark border border-ai-border rounded p-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Zap /></div>
            <div className="text-[10px] text-gray-500 font-mono mb-1">LIVE PRICE</div>
            <div className="text-2xl font-mono font-bold text-white tracking-tight">${market.currentPrice.toFixed(2)}</div>
          </div>

          <div className="bg-ai-dark border border-ai-border rounded p-3 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Activity /></div>
            <div className="text-[10px] text-gray-500 font-mono mb-1">MARKET REGIME</div>
            <div className={`text-lg font-mono font-bold tracking-tight ${getRegimeColor(market.regime)}`}>
              {market.regime}
            </div>
          </div>

          <div className="bg-ai-dark border border-ai-border rounded p-3 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Target /></div>
            <div className="text-[10px] text-gray-500 font-mono mb-1">ADAPTIVE THRESHOLD</div>
            <div className="text-lg font-mono font-bold text-yellow-400">
              ${Math.floor(market.adaptiveWhaleThreshold).toLocaleString()}
            </div>
            <div className="text-[9px] text-gray-600 mt-1">
               Based on Volatility
            </div>
          </div>

          <div className="bg-ai-dark border border-ai-border rounded p-3 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Waves /></div>
            <div className="text-[10px] text-gray-500 font-mono mb-1">CVD (DELTA)</div>
            <div className={`text-lg font-mono font-bold tracking-tight ${cvd > 0 ? 'text-buy' : 'text-sell'}`}>
                {cvd > 0 ? '+' : ''}{cvd.toFixed(3)}
            </div>
             <div className="text-[9px] text-gray-600 mt-1">
               BTC Net Flow
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: THE FEED (INTELLIGENT SIGNALS) */}
      <div className="flex-1 flex flex-col bg-ai-dark">
        <div className="p-3 border-b border-ai-border bg-ai-panel/30 flex justify-between items-center">
             <h3 className="text-xs font-bold text-gray-400 flex items-center gap-2">
                <Cpu size={14} /> EXECUTION FEED
             </h3>
             <span className="text-[10px] text-gray-500 border border-ai-border px-2 rounded">FILTERED</span>
        </div>
        
        <div className="overflow-y-auto flex-1 p-0">
            {signals.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50 space-y-3">
                   <Crosshair size={40} className="animate-spin-slow" />
                   <div className="text-xs font-mono text-center">
                     ANALYZING MICRO-STRUCTURE<br/>WAITING FOR ANOMALY...
                   </div>
                </div>
            ) : (
                <table className="w-full text-xs font-mono">
                    <thead className="bg-ai-dark sticky top-0 z-10 text-gray-600 border-b border-ai-border">
                        <tr>
                        <th className="text-left p-3 font-normal">TIME</th>
                        <th className="text-left p-3 font-normal">TYPE</th>
                        <th className="text-left p-3 font-normal">NOTE</th>
                        <th className="text-right p-3 font-normal">CONFIDENCE</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ai-border/50">
                        {signals.map(s => (
                        <tr key={s.id} className="hover:bg-white/5 transition-colors group">
                            <td className="p-3 text-gray-400">{s.time}</td>
                            <td className="p-3">
                            <span className={`
                                px-2 py-0.5 rounded text-[10px] font-bold border
                                ${s.type.includes('BUY') 
                                    ? 'bg-buy/10 text-buy border-buy/20' 
                                    : 'bg-sell/10 text-sell border-sell/20'}
                            `}>
                                {s.type.replace('_', ' ')}
                            </span>
                            </td>
                            <td className="p-3 text-gray-400 group-hover:text-gray-200">{s.note}</td>
                            <td className="p-3">
                                <div className="flex items-center justify-end gap-2">
                                    <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                        className={`h-full ${s.confidence > 90 ? 'bg-purple-500' : 'bg-ai-accent'}`} 
                                        style={{ width: `${s.confidence}%` }} 
                                        />
                                    </div>
                                    <span className="text-[10px] text-gray-500">{s.confidence}%</span>
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>

    </div>
  );
};

export default DynamicExecutionEngine;