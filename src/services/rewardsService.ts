import { TokenBalance } from '@/types';

export interface RewardClaim {
  amount: number;
  currency: 'PLY' | 'USDC' | 'SOL';
  source: 'scan' | 'challenge' | 'project' | 'referral';
  timestamp: number;
  txId?: string;
}

class RewardsService {
  async previewRewards(userId: string): Promise<RewardClaim[]> {
    // Mock reward calculation
    return [
      {
        amount: 25,
        currency: 'PLY',
        source: 'scan',
        timestamp: Date.now()
      },
      {
        amount: 50,
        currency: 'PLY', 
        source: 'challenge',
        timestamp: Date.now() - 3600000
      }
    ];
  }

  async claimRewards(userId: string, rewards: RewardClaim[]): Promise<boolean> {
    try {
      // Simulate claiming rewards
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock transaction processing
      const txId = `PLY_TX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      rewards.forEach(reward => {
        reward.txId = txId;
      });
      
      return true;
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      return false;
    }
  }

  async getTotalRewards(userId: string): Promise<TokenBalance[]> {
    return [
      { symbol: 'PLY', amount: 2840.75, usdValue: 852.23, change24h: 12.5 },
      { symbol: 'USDC', amount: 150.0, usdValue: 150.0, change24h: 0.0 }
    ];
  }

  calculateStreakBonus(streakDays: number): number {
    if (streakDays >= 30) return 2.0; // 100% bonus
    if (streakDays >= 14) return 1.5; // 50% bonus  
    if (streakDays >= 7) return 1.25; // 25% bonus
    return 1.0; // No bonus
  }

  calculateReferralBonus(referrals: number): number {
    return referrals * 10; // 10 PLY per referral
  }

  async addRewards(userWallet: string, rewards: { PLY?: number; CRT?: number; USDC?: number }): Promise<void> {
    // Mock implementation - in production, this would update Supabase
    console.log('Adding rewards:', userWallet, rewards);
  }
}

export const rewardsService = new RewardsService();