
import React, { useState, useEffect } from 'react';
import { AlertEngine, MarketAlert } from '../services/AlertEngine';
import { ShieldAlert, Zap, Skull, Bell, X, ShieldCheck, Activity } from 'lucide-react';

export const AlertToaster: React.FC = () => {
  const [toasts, setToasts] = useState<MarketAlert[]>([]);

  useEffect(() => {
    const handleNewAlert = (alert: MarketAlert) => {
      setToasts(prev => [...prev, alert].slice(-5));
      
      // Auto-remove after 6 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== alert.id));
      }, 6000);
    };

    AlertEngine.getInstance().subscribe(handleNewAlert);
    return () => AlertEngine.getInstance().unsubscribe(handleNewAlert);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed top-20 right-6 z-[1000] flex flex-col gap-3 w-80 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`
            pointer-events-auto relative overflow-hidden rounded-lg border bg-black/90 backdrop-blur-xl shadow-2xl p-4
            animate-in slide-in-from-right-10 duration-500
            ${toast.priority === 'CRITICAL' ? 'border-red-500 shadow-neon-red' : toast.priority === 'HIGH' ? 'border-amber-500' : 'border-ai-accent'}
          `}
        >
          {/* Progress Bar Background */}
          <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full" />
          <div 
            className={`absolute bottom-0 left-0 h-1 transition-all duration-[6000ms] ease-linear
              ${toast.priority === 'CRITICAL' ? 'bg-red-500' : 'bg-ai-accent'}
            `}
            style={{ width: '0%', animation: 'progress-shrink 6s linear forwards' }}
          />

          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded border ${
                toast.priority === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-ai-accent/10 border-ai-accent/30 text-ai-accent'
              }`}>
                {toast.type === 'WHALE_AGGRESSION' ? <Skull size={14} /> : 
                 toast.type === 'TOXICITY_ALERT' ? <ShieldAlert size={14} /> : 
                 <Zap size={14} />}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${toast.priority === 'CRITICAL' ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                {toast.type.replace('_', ' ')}
              </span>
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-gray-700 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-black text-white leading-tight tracking-tight uppercase">
              {toast.message}
            </h4>
            <div className="flex items-center justify-between mt-1">
               <span className="text-[8px] text-gray-600 font-mono">
                 TIME: {new Date(toast.timestamp).toLocaleTimeString()}
               </span>
               <div className="flex items-center gap-1">
                 <div className={`w-1 h-1 rounded-full ${toast.priority === 'CRITICAL' ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
                 <span className="text-[8px] font-black uppercase text-gray-500 tracking-tighter">L0_SECURITY_ACK</span>
               </div>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes progress-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
