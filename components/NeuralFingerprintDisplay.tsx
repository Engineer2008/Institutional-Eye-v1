
import React from 'react';
import { Fingerprint, ShieldAlert, Cpu, Activity, Zap, Timer, Target } from 'lucide-react';
import { NeuralFeatures } from '../services/NeuralFeatureExtractor';

interface NeuralFingerprintDisplayProps {
  isBot: boolean;
  fingerprintID: string;
  threatLevel: "HIGH_PREDATION" | "NORMAL";
  probability: number;
  features: NeuralFeatures;
}

export const NeuralFingerprintDisplay: React.FC<NeuralFingerprintDisplayProps> = ({ 
  isBot, 
  fingerprintID, 
  threatLevel, 
  probability,
  features
}) => {
  return (
    <div className="bg-black/40 border border-ai-border/50 rounded p-3 flex flex-col gap-2 font-mono relative group overflow-hidden">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <Fingerprint size={12} className={isBot ? "text-rose-500" : "text-ai-accent"} />
          <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Neural_Fingerprint_ID</span>
        </div>
        <div className={`flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 rounded border ${
          isBot ? 'bg-rose-500/20 text-rose-500 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        }`}>
          {fingerprintID}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-[8px] text-gray-700 font-black uppercase">Detection_Prob</span>
          <span className={`text-lg font-black tabular-nums tracking-tighter ${isBot ? 'text-rose-500' : 'text-white'}`}>
            {(probability * 100).toFixed(1)}%
          </span>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-[8px] text-gray-700 font-black uppercase">Threat_Level</span>
          <span className={`text-[10px] font-black tracking-widest ${threatLevel === 'HIGH_PREDATION' ? 'text-rose-500 animate-pulse' : 'text-gray-400'}`}>
            {threatLevel}
          </span>
        </div>
      </div>

      {/* Feature Vector Visualization */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1 border-t border-white/5 pt-2">
        <div className="flex justify-between items-center group/feat">
          <span className="text-[7px] text-gray-600 uppercase flex items-center gap-1"><Zap size={8}/> Variance</span>
          <span className={`text-[8px] font-bold ${features.sizeVariance < 0.1 ? 'text-rose-400' : 'text-gray-400'}`}>
            {features.sizeVariance.toFixed(3)}
          </span>
        </div>
        <div className="flex justify-between items-center group/feat">
          <span className="text-[7px] text-gray-600 uppercase flex items-center gap-1"><Timer size={8}/> Entropy</span>
          <span className={`text-[8px] font-bold ${features.temporalEntropy < 1.5 ? 'text-rose-400' : 'text-gray-400'}`}>
            {features.temporalEntropy.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center group/feat">
          <span className="text-[7px] text-gray-600 uppercase flex items-center gap-1"><Target size={8}/> Aggr_Ratio</span>
          <span className="text-[8px] text-gray-400 font-bold">{(features.aggressionRatio * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between items-center group/feat">
          <span className="text-[7px] text-gray-600 uppercase flex items-center gap-1"><Activity size={8}/> Pulsing</span>
          <span className={`text-[8px] font-bold ${features.isPulsing ? 'text-rose-400 animate-pulse' : 'text-gray-700'}`}>
            {features.isPulsing ? 'DETECTED' : 'ORGANIC'}
          </span>
        </div>
      </div>

      <div className="mt-2 h-1 w-full bg-gray-900 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-700 ${isBot ? 'bg-rose-500 shadow-[0_0_8px_#EF4444]' : 'bg-ai-accent'}`}
          style={{ width: `${probability * 100}%` }}
        />
      </div>

      {isBot && (
        <div className="mt-1 flex items-center gap-1.5 text-[8px] text-rose-500 font-bold uppercase animate-in fade-in slide-in-from-top-1">
          <ShieldAlert size={10} /> Algorithmic predatory sequence detected
        </div>
      )}
    </div>
  );
};

export default NeuralFingerprintDisplay;
