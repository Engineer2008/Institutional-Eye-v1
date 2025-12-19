
import axios from 'axios';
import { checkSubscriptionAccess } from './SubscriptionService';
import { CORE_CONFIG } from '../constants';

export interface VerifiedSignal {
  type: 'GUNPOINT' | 'LIQUIDITY_SWEEP' | 'AI_ACCUMULATION' | 'PREDATORY_ALGO';
  conviction: number;
  price: number;
  aiTag: string;
  congruenceScore: number;
}

/**
 * v4.1 Global Alert Broadcaster
 * Dispatches high-fidelity signals to external monitoring endpoints.
 * Now integrated with Subscription Middleware for access control.
 */
export const dispatchSignal = async (signal: VerifiedSignal) => {
  // Only alert if Conviction > 85% and Global Congruence is high (Updated to v4.0 threshold)
  if (signal.conviction < 85 || signal.congruenceScore < CORE_CONFIG.MIN_CONGRUENCE_SCORE) return;

  // Safely check for credentials before attempting dispatch
  const token = (process.env as any).TG_TOKEN;
  const chatId = (process.env as any).TG_CHAT_ID;

  if (!token || !chatId) {
    // Forensic local logging (muted console.warn for production cleaner logs)
    return;
  }

  // v2.0 SUBSCRIPTION CHECK
  const signalKeyMap: Record<string, string> = {
    'GUNPOINT': 'GUNPOINT_ALERTS',
    'LIQUIDITY_SWEEP': 'LIQUIDITY_SWEEP',
    'AI_ACCUMULATION': 'BASIC_TAPE',
    'PREDATORY_ALGO': 'AI_FINGERPRINT'
  };

  const access = await checkSubscriptionAccess(chatId, signalKeyMap[signal.type] || 'BASIC_TAPE');
  
  if (!access.allowed) {
    return;
  }

  const message = `
👁️ **INSTITUTIONAL EYE v4.1 ALERT [${access.tier}]**
-----------------------------------
🚨 **SIGNAL:** ${signal.type}
🎯 **PRICE:** $${signal.price.toFixed(2)}
🧠 **AI FINGERPRINT:** ${signal.aiTag}
📊 **CONVICTION:** ${signal.conviction}%
🌍 **GLOBAL CONGRUENCE:** ${(signal.congruenceScore * 100).toFixed(0)}%
-----------------------------------
*Clearance: ${CORE_CONFIG.INSTITUTIONAL_CLEARANCE_LEVEL}*
*Action: Consult Forensic Dashboard for Exit Targets.*
  `;

  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });
  } catch (err) {
    // Silent fail for transport layer to avoid UI interruption
  }
};
