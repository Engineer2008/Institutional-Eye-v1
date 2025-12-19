
import React from 'react';
import { HeartPulse, ShieldAlert, Activity, AlertCircle, TrendingUp } from 'lucide-react';
import { PortfolioHealthReport, Position } from '../types';

interface PortfolioHealthMonitorProps {
  report: PortfolioHealthReport;
  positions: Position[];
}

export const PortfolioHealthMonitor: React.FC<PortfolioHealthMonitorProps> = ({ report, positions }) => {
  const isDanger = report.status === 'DANGER';
  const isWarning = report.status === 'WARNING';

  const statusColor = isDanger ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-emerald-500';
  const statusBg = isDanger ? 'bg-red-500/10' : isWarning ? 'bg-amber-500/10' : 'bg-emerald-500/10';
  const statusBorder = isDanger ? 'border-red-500/30 shadow-neon-red' : isWarning ? 'border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'border-emerald-500/20';

  return (
    <div className={`bg-black/60 border rounded-lg p-3 font-mono flex flex-col gap-2 transition-all duration-500 ${statusBorder}`}>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <HeartPulse size={12} className={statusColor} />
          <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Portfolio_Vitals_v4.0</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[8px] font-black tracking-widest uppercase ${statusBg} ${statusColor}`}>
           {isDanger ? <ShieldAlert size={10} className="animate-pulse" /> : <Activity size={10} />}
           {report.status}
        </div>
      </div>

      <div className="flex items-end justify-between border-b border-white/5 pb-2">
        <div className="flex flex-col">
          <span className="text-[8px] text-gray-700 font-black uppercase tracking-tighter">Health_Factor</span>
          <span className={`text-2xl font-black tabular-nums tracking-tighter ${statusColor}`}>
            {report.score}
          </span>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-[8px] text-gray-700 font-black uppercase">Active_Positions</span>
          <span className="text-[12px] font-black text-white">{positions.length} NODES</span>
        </div>
      </div>

      <div className="space-y-1 mt-1">
        {positions.map((pos, i) => {
          const ltv = (pos.debtUSD / pos.collateralUSD) * 100;
          return (
            <div key={i} className="flex justify-between items-center text-[8px] group">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">{pos.asset}</span>
                <span className="text-gray-600">LTV: {ltv.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-mono tabular-nums">${(pos.collateralUSD / 1000).toFixed(0)}k</span>
                <div className={`w-8 h-1 bg-gray-900 rounded-full overflow-hidden`}>
                  <div className={`h-full ${ltv > 85 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${ltv}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {report.actionRequired !== "NONE" && (
        <div className="mt-1 flex items-center gap-1.5 p-1.5 bg-red-500/20 border border-red-500/40 rounded text-[7px] text-red-400 font-black uppercase animate-in slide-in-from-top-1">
          <AlertCircle size={10} /> CRITICAL: {report.actionRequired}
        </div>
      )}
    </div>
  );
};
