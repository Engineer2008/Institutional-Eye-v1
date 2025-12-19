import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AdaptiveBrain, Trade, Signal } from '../services/AdaptiveBrain';
import { Wifi, ShieldAlert, Activity, Database, Radio, Server, RefreshCw, Zap, Network, Router, Globe, AlertTriangle } from 'lucide-react';
import { NETWORK_CONFIG } from './PolyModelDiscoveryEngine';

interface ScannerProps {
  onSignal: (sig: Signal) => void;
  variant?: 'full' | 'compact';
  onDetailsClick?: () => void;
}

const SCANNER_CONFIG = {
  REST_ENDPOINTS: [
    'https://api.binance.com/api/v3/ticker/24hr',
    'https://data-api.binance.vision/api/v3/ticker/24hr',
    'https://corsproxy.io/?https://api.binance.com/api/v3/ticker/24hr'
  ],
  DISCOVERY_TOPIC: '!miniTicker@arr', 
  TIMEOUT_MS: 15000, // Increased to 15s to allow for slower network handshakes
  CACHE_KEY: 'NEURAL_MARKET_SNAPSHOT',
  MAX_MARKETS: 200,
  MAX_DISCOVERY_RETRIES: 5,
  MAX_STREAM_RETRIES: 10,
  BACKOFF: {
    BASE_DELAY_MS: 2000,
    MAX_DELAY_MS: 30000,
    FACTOR: 1.5,
    JITTER_MS: 1000
  }
};

type ProtocolState = 'REST_MESH' | 'DYN_PROTO' | 'NEURAL_CACHE';
type ConnectionStatus = 'IDLE' | 'NEGOTIATING' | 'CONNECTING' | 'ACTIVE' | 'PARTITIONED' | 'RECONNECTING';

const Scanner: React.FC<ScannerProps> = ({ onSignal, variant = 'full', onDetailsClick }) => {
  const [protocol, setProtocol] = useState<ProtocolState>('REST_MESH');
  const [status, setStatus] = useState<ConnectionStatus>('IDLE');
  const [pairsCount, setPairsCount] = useState(0);
  const [latency, setLatency] = useState(0);
  const [activeModel, setActiveModel] = useState(NETWORK_CONFIG.MODELS[0]);
  const [retryAttempt, setRetryAttempt] = useState(0);
  
  const brain = useRef(new AdaptiveBrain());
  const discoveryWs = useRef<WebSocket | null>(null);
  const streamWs = useRef<WebSocket | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const failedTransports = useRef<Set<string>>(new Set());
  
  const streamRetryCount = useRef(0);
  const discoveryRetryCount = useRef(0);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const discoveryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHandlingError = useRef(false);

  const getBackoffDelay = (attempt: number) => {
    const { BASE_DELAY_MS, MAX_DELAY_MS, FACTOR, JITTER_MS } = SCANNER_CONFIG.BACKOFF;
    return Math.min(BASE_DELAY_MS * Math.pow(FACTOR, attempt) + Math.random() * JITTER_MS, MAX_DELAY_MS);
  };

  const negotiateTransport = useCallback(async () => {
      setStatus('NEGOTIATING');
      let candidates = NETWORK_CONFIG.MODELS.filter(m => !failedTransports.current.has(m.id));
      if (candidates.length === 0) {
          failedTransports.current.clear();
          candidates = NETWORK_CONFIG.MODELS;
      }

      const promises = candidates.map(model => {
          return new Promise<{model: typeof model, latency: number} | null>(resolve => {
              const start = performance.now();
              try {
                  const ws = new WebSocket(model.endpoint);
                  const timeout = setTimeout(() => { if (ws.readyState === WebSocket.CONNECTING) ws.close(); resolve(null); }, 5000);
                  ws.onopen = () => { clearTimeout(timeout); const lat = performance.now() - start; ws.close(); resolve({ model, latency: lat }); };
                  ws.onerror = () => { clearTimeout(timeout); ws.close(); resolve(null); };
              } catch (e) { resolve(null); }
          });
      });

      const results = (await Promise.all(promises)).filter(r => r !== null) as {model: any, latency: number}[];
      if (results.length > 0) {
          results.sort((a, b) => a.latency - b.latency);
          setActiveModel(results[0].model);
          return results[0].model;
      }
      return NETWORK_CONFIG.MODELS[0];
  }, []);

  const handleDiscoveryFailure = useCallback((transport: typeof activeModel, errorContext?: string) => {
      if (isHandlingError.current) return;
      isHandlingError.current = true;
      setTimeout(() => { isHandlingError.current = false; }, 1000);

      if (discoveryRetryCount.current < SCANNER_CONFIG.MAX_DISCOVERY_RETRIES) {
          discoveryRetryCount.current += 1;
          const delay = getBackoffDelay(discoveryRetryCount.current);
          console.warn(`[Scanner] Discovery Failure: ${errorContext || 'WebSocket Error'}. Retrying in ${delay.toFixed(0)}ms.`);
          setStatus('RECONNECTING');
          setRetryAttempt(discoveryRetryCount.current);
          if (discoveryTimeout.current) clearTimeout(discoveryTimeout.current);
          discoveryTimeout.current = setTimeout(() => initDiscovery(), delay);
      } else {
          engageNeuralCache();
      }
  }, [activeModel]);

  const engageNeuralCache = useCallback(() => {
    setProtocol('NEURAL_CACHE');
    setStatus('PARTITIONED');
    const cached = localStorage.getItem(SCANNER_CONFIG.CACHE_KEY);
    if (cached) {
      try {
        const m = JSON.parse(cached);
        if (Array.isArray(m) && m.length > 0) { 
          setPairsCount(m.length); 
          connectScanningStream(m, activeModel); 
        }
      } catch (e) {}
    }
  }, [activeModel]);

  const engageDynamicDiscoveryProtocol = useCallback((transport: typeof activeModel) => {
    setProtocol('DYN_PROTO');
    setStatus('CONNECTING');
    if (discoveryWs.current) discoveryWs.current.close();

    try {
        // Optimization: Use the stream path directly for discovery to bypass SUBSCRIBE command issues
        const discoveryUrl = `${transport.endpoint}/${SCANNER_CONFIG.DISCOVERY_TOPIC}`;
        const ws = new WebSocket(discoveryUrl);
        discoveryWs.current = ws;

        const timeout = setTimeout(() => {
            if (ws.readyState !== WebSocket.OPEN) {
                ws.close();
                failedTransports.current.add(transport.id);
                handleDiscoveryFailure(transport, 'Protocol Negotiation Timeout');
            }
        }, SCANNER_CONFIG.TIMEOUT_MS);

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (Array.isArray(data) && data.length > 10) {
                clearTimeout(timeout);
                discoveryRetryCount.current = 0;
                setRetryAttempt(0);
                const mkts = data.filter((t: any) => t.s.endsWith('USDT')).sort((a: any, b: any) => parseFloat(b.q) - parseFloat(a.q)).slice(0, SCANNER_CONFIG.MAX_MARKETS).map((t: any) => t.s.toLowerCase());
                if (mkts.length > 0) { 
                  localStorage.setItem(SCANNER_CONFIG.CACHE_KEY, JSON.stringify(mkts)); 
                  setPairsCount(mkts.length); 
                  ws.close(); 
                  connectScanningStream(mkts, transport); 
                }
            }
          } catch (err) {}
        };

        ws.onerror = (error) => {
            failedTransports.current.add(transport.id);
            clearTimeout(timeout);
            handleDiscoveryFailure(transport, 'Handshake Error');
        };
    } catch (e) {
        handleDiscoveryFailure(transport, 'Initialization Error');
    }
  }, [handleDiscoveryFailure]);

  const initDiscovery = useCallback(async () => {
    const transport = await negotiateTransport();
    setStatus('CONNECTING');
    setProtocol('REST_MESH');

    let success = false, mkts: string[] = [];
    for (const endpoint of SCANNER_CONFIG.REST_ENDPOINTS) {
        try {
            abortController.current = new AbortController();
            const res = await fetch(endpoint, { signal: abortController.current.signal });
            if (!res.ok) continue;
            const data = await res.json();
            if (Array.isArray(data)) {
                mkts = data.filter((t: any) => (t.symbol || t.s || '').endsWith('USDT')).sort((a: any, b: any) => parseFloat(b.quoteVolume || b.q || 0) - parseFloat(a.quoteVolume || a.q || 0)).slice(0, SCANNER_CONFIG.MAX_MARKETS).map((t: any) => (t.symbol || t.s).toLowerCase());
                if (mkts.length > 0) { success = true; break; }
            }
        } catch (e) { continue; }
    }

    if (success && mkts.length > 0) {
        discoveryRetryCount.current = 0;
        localStorage.setItem(SCANNER_CONFIG.CACHE_KEY, JSON.stringify(mkts));
        setPairsCount(mkts.length);
        connectScanningStream(mkts, transport);
    } else {
        engageDynamicDiscoveryProtocol(transport);
    }
  }, [engageDynamicDiscoveryProtocol, negotiateTransport]);

  const connectScanningStream = (mkts: string[], transport: typeof activeModel) => {
      setStatus('ACTIVE');
      setRetryAttempt(0);
      if (streamWs.current) streamWs.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      
      try {
        const ws = new WebSocket(transport.endpoint);
        streamWs.current = ws;
        ws.onopen = () => {
            streamRetryCount.current = 0;
            const batch = 50;
            for (let i = 0; i < mkts.length; i += batch) {
                const p = mkts.slice(i, i + batch).map(s => `${s}@aggTrade`);
                if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ method: 'SUBSCRIBE', params: p, id: i }));
            }
        };
        ws.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data);
                if (msg.e === 'aggTrade') {
                    setLatency(l => (l * 19 + (Date.now() - msg.E)) / 20);
                    const sig = brain.current.process({ s: msg.s, p: parseFloat(msg.p), q: parseFloat(msg.q), m: msg.m, T: msg.T });
                    if (sig) onSignal(sig);
                }
            } catch(e) {}
        };
        ws.onclose = () => {
            if (status !== 'IDLE') {
                const attempt = streamRetryCount.current + 1;
                const delay = getBackoffDelay(attempt);
                setStatus('RECONNECTING');
                setRetryAttempt(attempt);
                streamRetryCount.current = attempt;
                if (streamRetryCount.current >= SCANNER_CONFIG.MAX_STREAM_RETRIES) {
                     failedTransports.current.add(transport.id);
                     initDiscovery();
                     return;
                }
                reconnectTimeout.current = setTimeout(() => connectScanningStream(mkts, transport), delay);
            }
        };
      } catch (e) {}
  };

  useEffect(() => {
      initDiscovery();
      return () => {
          if (discoveryWs.current) discoveryWs.current.close();
          if (streamWs.current) streamWs.current.close();
          if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
          if (discoveryTimeout.current) clearTimeout(discoveryTimeout.current);
          if (abortController.current) abortController.current.abort();
      };
  }, []);

  const getStatusStyle = (s: ConnectionStatus) => {
    switch (s) {
        case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        case 'CONNECTING': 
        case 'NEGOTIATING': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'RECONNECTING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  if (variant === 'compact') {
      return (
        <button onClick={onDetailsClick} className="flex items-center gap-3 bg-black/20 border border-ai-border/50 hover:border-ai-accent/50 hover:bg-ai-accent/5 transition-all rounded-md px-3 py-1.5 h-full group">
            <div className="flex items-center gap-2">
                <div className={`relative flex h-2 w-2`}>
                   {(status === 'ACTIVE' || status === 'CONNECTING') && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>}
                   <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'ACTIVE' ? 'bg-emerald-500' : status === 'CONNECTING' ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                </div>
                <span className={`text-[10px] font-bold font-mono tracking-wider ${status === 'ACTIVE' ? 'text-emerald-500' : status === 'CONNECTING' ? 'text-blue-500' : 'text-amber-500'}`}>
                    {status === 'ACTIVE' ? 'ONLINE' : status}
                </span>
            </div>
            <div className="h-3 w-[1px] bg-ai-border/50"></div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-gray-300">
                <div className="flex items-center gap-1.5">
                    <Zap size={10} className={latency < 50 ? 'text-emerald-500' : 'text-yellow-500'} />
                    <span>{latency.toFixed(0)}ms</span>
                </div>
            </div>
        </button>
      );
  }

  return (
      <div className="bg-ai-panel border-b border-ai-border p-3 flex items-center justify-between text-xs font-mono shadow-md">
        <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-tight"><Activity size={14} /> Discovery Engine</div>
             <div className="h-4 w-[1px] bg-ai-border"></div>
             <div className={`flex items-center gap-2 px-2 py-0.5 rounded text-[10px] font-bold border ${protocol === 'REST_MESH' ? 'text-blue-400 border-blue-500/30' : 'text-purple-400 border-purple-500/30'}`}>
                {protocol}
             </div>
             <div className={`flex items-center gap-2 px-2.5 py-0.5 rounded-full border ${getStatusStyle(status)}`}>
                 <div className={`w-1.5 h-1.5 rounded-full ${status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-current'}`} />
                 <span className="text-[10px] font-bold uppercase tracking-wider">{status}</span>
             </div>
        </div>
        <div className="flex items-center gap-4">
             <div className={`flex items-center gap-1 font-bold ${latency < 100 ? 'text-emerald-400' : 'text-yellow-500'}`}><Zap size={10} /> {latency.toFixed(0)}ms</div>
             <RefreshCw size={12} className={status === 'RECONNECTING' ? 'animate-spin text-amber-500' : 'text-gray-500'} />
        </div>
      </div>
  );
}

export default Scanner;
