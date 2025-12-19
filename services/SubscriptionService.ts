
import { UserSubscription, SubscriptionTier, PaymentRecord, SubscriptionStatus } from '../types';

/**
 * Mock Database for v2.0 Subscription Management
 * Simulates persistence for Users and Payments tables.
 */
const mockDb = {
  users: {
    findUnique: async ({ where }: { where: { telegramId: string } }): Promise<UserSubscription | null> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const sessionUser = localStorage.getItem(`user_${where.telegramId}`);
      if (sessionUser) return JSON.parse(sessionUser);

      // Default mock user: ELITE tier, Active status
      return {
        telegramId: where.telegramId,
        username: "ForensicWhale_Alpha",
        expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        joinDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
        tier: 'ELITE',
        status: 'ACTIVE'
      };
    }
  },
  payments: {
    findMany: async ({ where }: { where: { userId: string } }): Promise<PaymentRecord[]> => {
      const stored = localStorage.getItem(`payments_${where.userId}`);
      if (stored) return JSON.parse(stored);
      
      return [{
        transactionId: "TX_INIT_88291",
        userId: where.userId,
        amountUsdt: 299.00,
        network: 'TRC20',
        status: 'CONFIRMED',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
      }];
    }
  }
};

/**
 * v2.0 Subscription Middleware
 * Validates access based on tier-locked signal permissions and subscription status.
 */
export const checkSubscriptionAccess = async (userId: string, signalType: string) => {
  const user = await mockDb.users.findUnique({ where: { telegramId: userId } });

  if (!user) return { allowed: false, reason: 'USER_NOT_FOUND' };

  // 1. Check if sub has expired or status is not ACTIVE
  const isExpired = new Date() > new Date(user.expiryDate);
  const isSuspended = user.status !== 'ACTIVE';

  if (isSuspended) return { allowed: false, reason: `SUBSCRIPTION_${user.status}` };
  if (isExpired) return { allowed: false, reason: 'SUBSCRIPTION_EXPIRED' };
  
  // 2. Map signals to tiers
  const tierPermissions: Record<string, SubscriptionTier[]> = {
    'BASIC_TAPE': ['FREE', 'PRO', 'ELITE'],
    'GUNPOINT_ALERTS': ['PRO', 'ELITE'],
    'AI_FINGERPRINT': ['ELITE'],
    'LIQUIDITY_SWEEP': ['PRO', 'ELITE'],
    'PREDATORY_ALGO': ['ELITE']
  };

  const allowedTiers = tierPermissions[signalType] || ['ELITE'];
  const isAllowed = allowedTiers.includes(user.tier);
  
  return { 
    allowed: isAllowed, 
    reason: isAllowed ? 'OK' : 'UPGRADE_REQUIRED',
    tier: user.tier,
    user: user
  };
};

/**
 * Utility to fetch user payment history
 */
export const getUserPayments = (userId: string) => mockDb.payments.findMany({ where: { userId } });

/**
 * Utility to manually override local tier/status for testing UI states
 */
export const setLocalSubscriptionOverride = (
  userId: string, 
  tier: SubscriptionTier, 
  status: SubscriptionStatus = 'ACTIVE',
  username: string = "User_Demo"
) => {
  const user: UserSubscription = {
    telegramId: userId,
    username,
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    joinDate: new Date().toISOString(),
    tier,
    status
  };
  localStorage.setItem(`user_${userId}`, JSON.stringify(user));
};
