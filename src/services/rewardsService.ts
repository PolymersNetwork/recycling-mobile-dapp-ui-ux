import { createClient } from '@supabase/supabase-js';
import { TokenBalance } from '@/types';

export interface RewardClaim {
  amount: number;
  currency: 'PLY' | 'USDC' | 'SOL';
  source: 'scan' | 'challenge' | 'project' | 'referral';
  timestamp: number;
  txId?: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export class RewardsService {
  /** Fetch pending rewards from database */
  async previewRewards(userWallet: string): Promise<RewardClaim[]> {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('user_wallet', userWallet)
      .eq('claimed', false);

    if (error) {
      console.error('Failed to fetch rewards:', error);
      return [];
    }

    return data.map(r => ({
      amount: r.amount,
      currency: r.currency,
      source: r.source,
      timestamp: new Date(r.created_at).getTime(),
      txId: r.tx_id || undefined,
    }));
  }

  /** Claim rewards and mark them in database */
  async claimRewards(userWallet: string, rewards: RewardClaim[]): Promise<boolean> {
    try {
      if (rewards.length === 0) return true;

      const txId = `TX_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

      // Update DB to mark rewards as claimed
      const { error } = await supabase
        .from('rewards')
        .update({ claimed: true, tx_id: txId })
        .eq('user_wallet', userWallet)
        .in('id', rewards.map(r => r.txId));

      if (error) throw error;

      // Update user balances
      const totalRewards = rewards.reduce(
        (acc, r) => {
          acc[r.currency] = (acc[r.currency] || 0) + r.amount;
          return acc;
        },
        {} as Record<string, number>
      );

      await this.addRewards(userWallet, totalRewards);

      console.log(`Rewards claimed for ${userWallet}:`, rewards, txId);

      return true;
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      return false;
    }
  }

  /** Get current token balances for the user */
  async getTotalRewards(userWallet: string): Promise<TokenBalance[]> {
    const { data, error } = await supabase
      .from('balances')
      .select('*')
      .eq('user_wallet', userWallet);

    if (error) {
      console.error('Failed to fetch balances:', error);
      return [];
    }

    return data.map((row: any) => ({
      symbol: row.currency,
      amount: row.amount,
      usdValue: row.usd_value,
      change24h: row.change_24h,
    }));
  }

  /** Apply streak bonus multiplier */
  calculateStreakBonus(streakDays: number): number {
    if (streakDays >= 30) return 2.0;
    if (streakDays >= 14) return 1.5;
    if (streakDays >= 7) return 1.25;
    return 1.0;
  }

  /** Calculate referral bonus */
  calculateReferralBonus(referrals: number): number {
    return referrals * 10; // 10 PLY per referral
  }

  /** Add rewards to user wallet in DB */
  async addRewards(
    userWallet: string,
    rewards: { PLY?: number; CRT?: number; USDC?: number }
  ): Promise<void> {
    try {
      for (const [currency, amount] of Object.entries(rewards)) {
        if (!amount) continue;

        // Upsert user balance
        const { error } = await supabase
          .from('balances')
          .upsert({
            user_wallet: userWallet,
            currency,
            amount,
          }, { onConflict: ['user_wallet', 'currency'] });

        if (error) console.error('Failed to update balance:', error);
      }
      console.log('Rewards added for', userWallet, rewards);
    } catch (error) {
      console.error('Failed to add rewards:', error);
    }
  }

  /** Award scan reward with dynamic calculation */
  async awardScanReward(userWallet: string, basePLY: number, streakDays: number, referrals: number) {
    const streakMultiplier = this.calculateStreakBonus(streakDays);
    const referralBonus = this.calculateReferralBonus(referrals);
    const totalPLY = Math.round(basePLY * streakMultiplier + referralBonus);

    await supabase.from('rewards').insert({
      user_wallet: userWallet,
      amount: totalPLY,
      currency: 'PLY',
      source: 'scan',
      claimed: false,
      created_at: new Date().toISOString(),
    });

    console.log(`Awarded ${totalPLY} PLY to ${userWallet} (streak: ${streakDays}, referrals: ${referrals})`);
  }
}

export const rewardsService = new RewardsService();
