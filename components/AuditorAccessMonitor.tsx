
import React, { useState } from 'react';
import { ShieldPlus, Timer, ExternalLink, Key, Loader2, CheckCircle2, UserPlus, Info } from 'lucide-react';
import { grantAuditorAccess } from '../services/AuditorAccessEngine';
import { AuditorAccessGrant } from '../types';

export const AuditorAccessMonitor: React.FC = () => {
  const [auditorId, setAuditorId] = useState('');
  const [duration, setDuration] = useState(7); // default 7 days
  const [grant, setGrant] = useState<AuditorAccessGrant | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGrant = async () => {
    if (!auditorId) return;
    setIsProcessing(true);
    setGrant(null);
    try {
      const result = await grantAuditorAccess(auditorId, duration);
      setGrant(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#050505] border border-ai-accent/20 rounded-lg p-3 font-mono flex flex-col gap-3 shadow-xl relative overflow-hidden group">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/10 rounded border border-blue-500/20">
             <ShieldPlus size={12} className="text-ai-accent" />
          </div>
          <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Auditor_Access_v6.0</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
           <div className="flex-1 flex flex-col gap-1">
             <span className="text-[7px] text-gray-600 font-black uppercase px-1">Auditor_ID</span>
             <input 
               type="text" 
               placeholder="AGENT_CODE..."
               className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[9px] text-white focus:border-ai-accent outline-none font-mono"
               value={auditorId}
               onChange={(e) => setAuditorId(e.target.value)}
             />
           </div>
           <div className="w-20 flex flex-col gap-1">
             <span className="text-[7px] text-gray-600 font-black uppercase px-1">Duration (D)</span>
             <input 
               type="number" 
               min="1" 
               max="365"
               className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[9px] text-white focus:border-ai-accent outline-none font-mono"
               value={duration}
               onChange={(e) => setDuration(parseInt(e.target.value))}
             />
           </div>
        </div>

        <button 
          onClick={handleGrant}
          disabled={isProcessing || !auditorId}
          className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-[8px] font-black uppercase tracking-widest transition-all ${
            isProcessing || !auditorId ? 'bg-gray-800 text-gray-500' : 'bg-ai-accent/10 text-ai-accent border border-ai-accent/30 hover:bg-ai-accent hover:text-white'
          }`}
        >
          {isProcessing ? <Loader2 size={10} className="animate-spin" /> : <UserPlus size={10} />}
          Generate_Time_Bound_Key
        </button>
      </div>

      {grant && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-2 rounded animate-in zoom-in-95 duration-300 space-y-2">
           <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <CheckCircle2 size={10} className="text-emerald-500" />
                 <span className="text-[8px] text-emerald-400 font-bold uppercase">View_Key_Active</span>
              </div>
              <div className="flex items-center gap-1 text-[7px] text-gray-500 font-bold">
                 <Timer size={8} />
                 EXPIRES: {new Date(grant.expiry).toLocaleDateString()}
              </div>
           </div>
           <div className="p-2 bg-black/40 border border-white/5 rounded">
              <div className="flex items-center gap-1.5 mb-1 text-[7px] text-gray-600 font-black uppercase">
                 <Key size={10} className="text-ai-accent" /> Secure_Portal_Handshake
              </div>
              <a 
                href={grant.portalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[8px] text-blue-400 break-all hover:underline flex items-center gap-1"
              >
                {grant.portalUrl}
                <ExternalLink size={8} />
              </a>
           </div>
           <div className="flex items-start gap-1.5">
              <Info size={10} className="text-gray-600 shrink-0 mt-0.5" />
              <span className="text-[7px] text-gray-500 italic leading-tight">{grant.instructions}</span>
           </div>
        </div>
      )}

      <div className="mt-1 pt-2 border-t border-white/5 flex justify-between items-center text-[7px] text-gray-700 font-black uppercase">
         <div className="flex items-center gap-2">
            <Timer size={10} className="text-ai-accent" /> Temporal_ZK_Proof_Service
         </div>
         <span className="text-ai-accent">L0_Oversight_Enabled</span>
      </div>
    </div>
  );
};
