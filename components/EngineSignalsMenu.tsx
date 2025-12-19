import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, TrendingUp, TrendingDown, Layers, 
  Zap, Brain, ChevronDown, Activity, Crosshair, 
  Maximize2, Radar, Target, Filter
} from 'lucide-react';
import { AdvancedSignalsEngine, AdvancedSignal } from '../services/AdvancedSignalsEngine';
import { OrderBookBrain } from '../services/OrderBookBrain';
import { getStreamUrl } from '../services/MarketRegistry';

interface Props {
  symbol: string;
}

const EngineSignalsMenu: React.FC<Props> = ({ symbol }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeEngine, setActiveEngine] = useState<'SMC' | 'MANIPULATION' | 'SR' | 'ICT'>('SMC');
  const [signals, setSignals] = useState<AdvancedSignal[]>([]);
  
  const engine = useRef(new AdvancedSignalsEngine());
  const bookBrain = useRef(new OrderBookBrain());
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = getStreamUrl(symbol, 'SPOT', ['depth20@100ms']);
    if (ws.current) ws.current.close();
    ws.current = new WebSocket(url);

    ws.current.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const data = payload.data;
        if (!data) return;

        const { formattedBids, formattedAsks } = bookBrain.current.analyze(data.bids || data.b, data.asks || data.a);
        const mid = (formattedBids[0].price + formattedAsks[0].price) / 2;
        
        const smcSignals = engine.current.detectSMC(symbol, mid, formattedBids, formattedAsks);
        const manSignal = engine.current.detectManipulation(formattedBids, formattedAsks);
        
        const combined = [...smcSignals];
        if (manSignal) combined.push(manSignal);
        
        setSignals(prev => [...combined, ...prev].slice(0, 15));
      } catch (e) {}
    };

    return () => ws.current?.close();
  }, [symbol]);

  const filteredSignals = signals.filter(s => {
    if (activeEngine === 'SMC') return s.type === 'FVG' || s.type === 'ORDER_BLOCK';
    if (activeEngine === 'MANIPULATION') return s.type === 'SPOOFING';
    if (activeEngine === 'SR') return s.type === 'ORDER_BLOCK'; // Proxy for SR
    if (activeEngine === 'ICT') return s.type === 'LIQUIDITY_SWEEP' || s.type === 'FVG';
    return true;
  });

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold border transition-all
          ${isOpen ? 'bg-ai-accent text-white border-ai-accent' : 'bg-black/20 dark:bg-black/40 text-ai-accent border-ai-accent/30 hover:border-ai-accent'}
        `}
      >
        <Radar size={14} className={isOpen ? 'animate-pulse' : ''} />
        <span className="hidden xl:inline">ADAPTIVE ENGINES</span>
        <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-3 w-[400px] bg-white dark:bg-[#080a0f] border border-light-border dark:border-ai-border rounded-xl shadow-2xl z-[70] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2">
            
            {/* Engine Tabs */}
            <div className="grid grid-cols-4 bg-gray-50 dark:bg-ai-panel border-b border-light-border dark:border-ai-border p-1">
              {(['SMC', 'MANIPULATION', 'SR', 'ICT'] as const).map(engineId => (
                <button
                  key={engineId}
                  onClick={() => setActiveEngine(engineId)}
                  className={`py-2 text-[9px] font-black rounded transition-all uppercase tracking-tighter ${
                    activeEngine === engineId 
                    ? 'bg-ai-accent text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {engineId}
                </button>
              ))}
            </div>

            {/* Signal List */}
            <div className="max-h-[400px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {filteredSignals.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3 opacity-50">
                   <Target size={32} className="animate-pulse" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Scanning {activeEngine} Patterns...</span>
                </div>
              ) : (
                filteredSignals.map(sig => (
                  <div key={sig.id} className="p-3 bg-gray-50 dark:bg-black/40 border border-light-border dark:border-ai-border/50 rounded-lg flex flex-col gap-2 animate-in slide-in-from-right-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${sig.side === 'BULLISH' ? 'bg-buy' : 'bg-sell'} animate-pulse`} />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{sig.type}</span>
                      </div>
                      <span className="text-[10px] font-mono text-ai-accent">{sig.confidence}% CONF.</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-xs font-bold text-gray-700 dark:text-gray-200">
                        {sig.side === 'BULLISH' ? 'LONG BIAS' : 'SHORT BIAS'} @ ${sig.priceRange[0].toFixed(2)}
                      </div>
                      <div className="text-[9px] text-gray-500 font-mono">
                        {new Date(sig.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <p className="text-[10px] leading-relaxed text-gray-500 dark:text-gray-400 font-mono border-t border-light-border dark:border-white/5 pt-2">
                      {sig.note}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-100 dark:bg-ai-panel border-t border-light-border dark:border-ai-border text-[9px] font-mono text-gray-500 flex justify-between">
              <span className="flex items-center gap-1">
                <Activity size={10} className="text-ai-accent" /> ENGINE_ACTIVE
              </span>
              <span className="uppercase">{activeEngine}_STRATEGY_LAYER_V1.2</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EngineSignalsMenu;