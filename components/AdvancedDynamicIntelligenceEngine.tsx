import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Activity, Radio, Database, RefreshCw, Server, ShieldCheck, Zap, Globe, Lock, Wifi, Network, CheckCircle2 } from 'lucide-react';

/**
 * ------------------------------------------------------------------
 * CONFIGURATION: PRODUCTION ENDPOINTS & TRANSPORT MODELS
 * ------------------------------------------------------------------
 * Architected to bypass strict corporate/ISP firewalls using 
 * multi-model transport negotiation and port hopping.
 */
const CONFIG = {
  REST_ENDPOINT: 'https://data-api.binance.vision/api/v3/ticker/24hr',
  TIMEOUT_MS: 1500, // Aggressive timeout to trigger failover quickly
  CACHE_KEY: 'NEURAL_MARKET_CACHE_V1',
  CACHE_TTL: 1000 * 60 * 60 * 24, // 24 Hours
  
  // TRANSPORT LAYERS FOR FIREWALL BYPASS & LATENCY OPTIMIZATION
  // CRITICAL FIX: Aligned with Spot Market architecture (stream.binance.com:443)
  TRANSPORTS: [
    {
      id: 'Direct_443',
      name: 'TLS v1.3 Tunnel (443)',
      endpoint: 'wss://stream.binance.com:443/ws/!miniTicker@arr',
      type: 'SECURE_SOCKET',
      priority: 1
    },
    {
      id: 'Alt_9443',
      name: 'Port Hopping (9443)',
      endpoint: 'wss://stream.binance.com:9443/ws/!miniTicker@arr',
      type: 'ALT_PORT',
      priority: 2
    },
    {
      id: 'Vision_Edge',
      name: 'Vision Edge (CloudFront)',
      endpoint: 'wss://data-stream.binance.vision/ws/!miniTicker@arr', // Fallback
      type: 'EDGE_ROUTING',
      priority: 3
    }
  ]
};

// Protocol States
type ProtocolState = 'REST_MESH' | 'DYN_PROTO' | 'NEURAL_CACHE';
type NetworkStatus = 'CONNECTING' | 'STABLE' | 'PARTITIONED' | 'NEGOTIATING';

// Data Interfaces based on actual Binance API responses
interface MarketTicker {
  s: string; // Symbol (e.g., BTCUSDT)
  c: string; // Close Price
  v: string; // Volume
}

interface ProtocolMetric {
  latency: number;
  marketCount: number;
  source: string;
  transportId?: string;
}

export const AdvancedDynamicIntelligenceEngine: React.FC = () => {
  const [protocol, setProtocol] = useState<ProtocolState>('REST_MESH');
  const [status, setStatus] = useState<NetworkStatus>('CONNECTING');
  const [markets, setMarkets] = useState<MarketTicker[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<ProtocolMetric>({ latency: 0, marketCount: 0, source: 'INIT' });
  const [activeTransportName, setActiveTransportName] = useState<string>('AUTO');
  
  const wsRef = useRef<WebSocket | null>(null);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 6));

  /**
   * ----------------------------------------------------------------
   * LEVEL 3: NEURAL CACHE (OFFLINE FALLBACK)
   * ----------------------------------------------------------------
   * Retrieves last known good state from local storage if network is dead.
   */
  const engageNeuralCache = useCallback(() => {
    addLog('CRITICAL: Network Mesh Partitioned.');
    
    try {
      const cachedRaw = localStorage.getItem(CONFIG.CACHE_KEY);
      if (cachedRaw) {
        const { timestamp, data } = JSON.parse(cachedRaw);
        const age = Date.now() - timestamp;

        if (age < CONFIG.CACHE_TTL) {
          setProtocol('NEURAL_CACHE');
          setMarkets(data);
          setStatus('PARTITIONED'); // It's working, but offline
          addLog(`ADAPTIVE INTEL: Engaged Offline Neural Cache (${(age / 3600000).toFixed(1)}h old).`);
          setMetrics({ latency: 0, marketCount: data.length, source: 'LOCAL_STORAGE' });
          return;
        } else {
          addLog('NEURAL CACHE: Data expired. purge initiated.');
        }
      }
    } catch (e) {
      addLog('NEURAL CACHE: Corrupted or empty.');
    }
    
    setStatus('PARTITIONED');
    addLog('SYSTEM FAILURE: All discovery protocols exhausted.');
  }, []);

  /**
   * ----------------------------------------------------------------
   * TRANSPORT NEGOTIATION (RACE TO LOCK)
   * ----------------------------------------------------------------
   * Probes all defined transports simultaneously to find the 
   * lowest latency route through the firewall.
   */
  const negotiateBestTransport = useCallback(async (): Promise<{ id: string, name: string, ws: WebSocket, latency: number } | null> => {
      setStatus('NEGOTIATING');
      addLog('NEGOTIATOR: Initiating Poly-Model Race...');
      
      // Helper to wrap promise with successful resolution only
      const probe = (transport: typeof CONFIG.TRANSPORTS[0]) => {
          return new Promise<{ id: string, name: string, ws: WebSocket, latency: number }>((resolve, reject) => {
              const start = performance.now();
              const socket = new WebSocket(transport.endpoint);
              
              const timeout = setTimeout(() => {
                  if (socket.readyState === WebSocket.CONNECTING) {
                      socket.close();
                      reject(new Error(`Timeout: ${transport.name}`));
                  }
              }, 2500);

              socket.onopen = () => {
                  clearTimeout(timeout);
                  const latency = performance.now() - start;
                  resolve({ id: transport.id, name: transport.name, ws: socket, latency });
              };
              
              socket.onerror = () => {
                  clearTimeout(timeout);
                  socket.close();
                  reject(new Error(`Blocked: ${transport.name}`));
              };
          });
      };

      try {
          // Race all transports. First to open wins.
          const promises = CONFIG.TRANSPORTS.map(t => probe(t));
          
          // Polyfill for Promise.any for better compatibility
          const winner = await new Promise<{ id: string, name: string, ws: WebSocket, latency: number }>((resolve, reject) => {
              let rejectedCount = 0;
              const total = promises.length;
              if (total === 0) return reject(new Error('No transports configured'));
              
              promises.forEach(p => {
                  p.then(resolve).catch(() => {
                      rejectedCount++;
                      if (rejectedCount === total) {
                          reject(new Error('All transports failed'));
                      }
                  });
              });
          });
          
          addLog(`NEGOTIATOR: Winner Locked -> ${winner.name} (${winner.latency.toFixed(0)}ms)`);
          return winner;

      } catch (error) {
          addLog('NEGOTIATOR: All Transport Models Failed.');
          return null;
      }
  }, []);

  /**
   * ----------------------------------------------------------------
   * LEVEL 2: DYNAMIC DISCOVERY PROTOCOL (!miniTicker)
   * ----------------------------------------------------------------
   * Synthesizes market list from live WebSocket stream when REST is blocked.
   */
  const engageDynamicDiscoveryProtocol = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // 1. Negotiate Transport
    const winner = await negotiateBestTransport();

    if (!winner) {
        engageNeuralCache();
        return;
    }

    addLog('INIT: Engaging Dynamic Discovery Protocol...');
    setProtocol('DYN_PROTO');
    setStatus('STABLE');
    setActiveTransportName(winner.name);

    const ws = winner.ws;
    wsRef.current = ws;

    // 2. Set up handlers on the winning socket
    ws.onmessage = (event) => {
      try {
        const data: MarketTicker[] = JSON.parse(event.data);
        
        if (Array.isArray(data) && data.length > 0) {
          setMarkets(prev => {
             if (data.length >= prev.length) return data;
             return prev;
          });

          setMetrics({
            latency: Math.floor(winner.latency), // Use handshake latency as baseline
            marketCount: data.length,
            source: 'WSS_STREAM',
            transportId: winner.id
          });

          // Cache Success
          localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: data
          }));
        }
      } catch (e) { /* Ignore parsing errors on streams */ }
    };

    ws.onerror = () => {
      addLog('DYN_PROTO: Connection Severed.');
      ws.close();
      engageNeuralCache();
    };

    ws.onclose = () => {
       if (status !== 'PARTITIONED') {
          addLog('DYN_PROTO: Stream Ended.');
       }
    };

  }, [status, engageNeuralCache, negotiateBestTransport]);

  /**
   * ----------------------------------------------------------------
   * LEVEL 1: REST MESH (STANDARD DISCOVERY)
   * ----------------------------------------------------------------
   * Tries to hit the standard API. Fails fast if blocked.
   */
  const initDiscovery = useCallback(async () => {
    setProtocol('REST_MESH');
    setStatus('CONNECTING');
    addLog('INIT: Attempting Standard REST Handshake...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);
    const start = performance.now();

    try {
      const response = await fetch(CONFIG.REST_ENDPOINT, { 
        signal: controller.signal,
        method: 'GET'
      });

      if (!response.ok) throw new Error(`HTTP_${response.status}`);

      const data = await response.json();
      
      // Transform standard REST response
      // For Ticker endpoint, data is the array
      let validMarkets = [];
      if (Array.isArray(data)) {
          validMarkets = data
            .filter((s: any) => s.symbol.endsWith('USDT'))
            .map((s: any) => ({ s: s.symbol, c: parseFloat(s.lastPrice).toFixed(2), v: s.volume }));
      }

      setMarkets(validMarkets);
      setStatus('STABLE');
      addLog(`REST_MESH: Connection Secure. ${validMarkets.length} Mkts Found.`);
      
      setMetrics({
        latency: Math.floor(performance.now() - start),
        marketCount: validMarkets.length,
        source: 'HTTPS_REST'
      });

      localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: validMarkets
      }));

    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        addLog('REST_MESH: Latency Violation (Timeout).');
      } else {
        addLog(`REST_MESH: Blocked/Unreachable. Engaging Poly-Model.`);
      }
      // FAILOVER TRIGGER -> WEBSOCKET RACE
      engageDynamicDiscoveryProtocol();
    }
  }, [engageDynamicDiscoveryProtocol]);

  // Initial Boot
  useEffect(() => {
    initDiscovery();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [initDiscovery]);

  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-950 text-slate-300 font-mono text-sm border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
      {/* HEADER & TELEMETRY CHIPS */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className="text-emerald-500 w-5 h-5" />
          <h1 className="font-bold text-slate-100 tracking-wider">ADAPTIVE INTEL ENGINE</h1>
        </div>
        
        {/* PROTOCOL INDICATOR CHIP */}
        <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-all duration-500
              ${protocol === 'REST_MESH' ? 'bg-blue-900/30 text-blue-400 border-blue-800' : ''}
              ${protocol === 'DYN_PROTO' ? 'bg-purple-900/30 text-purple-400 border-purple-800' : ''}
              ${protocol === 'NEURAL_CACHE' ? 'bg-amber-900/30 text-amber-400 border-amber-800' : ''}
            `}>
              {protocol === 'REST_MESH' && <Server className="w-3 h-3" />}
              {protocol === 'DYN_PROTO' && <RefreshCw className="w-3 h-3 animate-spin" />}
              {protocol === 'NEURAL_CACHE' && <Database className="w-3 h-3" />}
              <span>{protocol}</span>
            </div>

            <div className={`w-2 h-2 rounded-full ${status === 'STABLE' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : status === 'NEGOTIATING' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
        </div>
      </div>

      {/* MAIN DASHBOARD */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LIVE METRICS */}
        <div className="space-y-4">
            <div className="p-4 bg-black/40 rounded border border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase flex items-center gap-2">
                    <Globe size={12} /> Active Transport
                </h3>
                <div className="flex items-center gap-2 text-white font-bold">
                     {activeTransportName === 'AUTO' ? <Network size={16} className="text-gray-500" /> : <Zap size={16} className="text-emerald-500" />}
                     <span>{activeTransportName}</span>
                </div>
            </div>
            
            <div className="flex gap-4">
                <div className="p-4 bg-black/40 rounded border border-slate-800 flex-1">
                    <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase">Markets Synthesized</h3>
                    <div className="text-2xl text-emerald-400 font-bold">{metrics.marketCount}</div>
                </div>
                <div className="p-4 bg-black/40 rounded border border-slate-800 flex-1">
                    <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase">Latency</h3>
                    <div className="text-2xl text-blue-400 font-bold">{metrics.latency}<span className="text-sm text-slate-600">ms</span></div>
                </div>
            </div>

            {/* Manual Override Controls */}
            <div className="flex gap-2 mt-4">
                <button onClick={initDiscovery} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs border border-slate-700 transition-colors flex items-center gap-2">
                    <RefreshCw size={12} /> Retry Handshake
                </button>
                <button onClick={engageDynamicDiscoveryProtocol} className="px-4 py-2 bg-purple-900/20 hover:bg-purple-900/40 text-purple-400 rounded text-xs border border-purple-900/50 transition-colors flex items-center gap-2">
                    <Zap size={12} /> Force Transport Race
                </button>
            </div>
        </div>

        {/* SYSTEM LOGS */}
        <div className="bg-black border border-slate-800 rounded p-3 font-mono text-xs h-64 overflow-y-auto relative">
            <div className="absolute top-2 right-2 opacity-20"><ShieldCheck className="w-12 h-12" /></div>
            {logs.length === 0 && <span className="text-slate-600">System initialization...</span>}
            {logs.map((log, i) => (
                <div key={i} className={`mb-1.5 border-l-2 pl-2 ${
                    log.includes('CRITICAL') || log.includes('FAILURE') ? 'border-red-500 text-red-400' :
                    log.includes('NEGOTIATOR') || log.includes('Winner') ? 'border-purple-500 text-purple-300' :
                    log.includes('ADAPTIVE') ? 'border-amber-500 text-amber-300' :
                    'border-emerald-500 text-slate-300'
                }`}>
                    {log}
                </div>
            ))}
        </div>
      </div>

      {/* MARKET PREVIEW (Verify Data Reality) */}
      <div className="border-t border-slate-800 p-4 bg-slate-900/50">
        <h4 className="text-xs text-slate-500 mb-3 uppercase flex items-center gap-2">
            <Radio className="w-3 h-3" /> Live Data Stream Preview (Top 5)
        </h4>
        <div className="grid grid-cols-5 gap-2 text-xs">
            {markets.slice(0, 5).map((m) => (
                <div key={m.s} className="bg-slate-950 p-2 rounded border border-slate-800 text-center relative overflow-hidden group">
                    <div className="font-bold text-slate-200 relative z-10">{m.s}</div>
                    {protocol === 'DYN_PROTO' && (
                        <div className="text-emerald-500 mt-1 relative z-10">{m.c}</div>
                    )}
                    <div className="absolute inset-0 bg-emerald-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </div>
            ))}
            {markets.length === 0 && <div className="col-span-5 text-center text-slate-600 py-2">Waiting for stream...</div>}
        </div>
      </div>
    </div>
  );
};

export default AdvancedDynamicIntelligenceEngine;