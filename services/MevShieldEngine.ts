
import { UserSettings, RoutingConfig } from '../types';
import { CORE_CONFIG } from '../constants';

/**
 * v4.0 Logic: MEV-Shield Routing Strategy
 * Decides whether to use private Flashbots RPC or public Infura based on impact.
 */
export const routeTransaction = (settings: UserSettings, tradeImpact: number): RoutingConfig => {
  const { privacyLevel } = settings;

  // Respect global v4.0 toggle for MEV Shielding
  const shieldEnabled = CORE_CONFIG.MEV_SHIELD_ACTIVE;

  // Auto-switch to Stealth if trade impact is > 1% to prevent sandwich attacks
  if (shieldEnabled && (tradeImpact > 0.01 || privacyLevel === 'STEALTH')) {
    return {
      rpc: "https://rpc.flashbots.net", // Private RPC
      useMevShare: true,               // Enable MEV-Rebates
      priorityFee: "2.5gwei",          // Bribe to builders for private inclusion
      label: "STEALTH_EXECUTION"
    };
  }

  return {
    rpc: "https://mainnet.infura.io",   // Public RPC
    useMevShare: false,
    priorityFee: "1.0gwei",
    label: "HIGH_SPEED_PUBLIC"
  };
};
