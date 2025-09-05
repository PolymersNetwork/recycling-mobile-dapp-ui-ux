export interface Reward {
  id: string;
  user_id: string;
  type: 'recycling' | 'staking' | 'referral' | 'challenge' | 'bonus';
  amount: number;
  token: 'PLY' | 'RECO' | 'CRT' | 'SOL' | 'USDC';
  status: 'pending' | 'claimed' | 'processing' | 'failed';
  submission_id?: string;
  transaction_signature?: string;
  metadata?: {
    plasticType?: string;
    weight?: number;
    location?: string;
    multiplier?: number;
    reason?: string;
  };
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface RewardClaim {
  rewards: string[]; // reward IDs
  total_amount: number;
  token: string;
  estimated_fees: number;
  wallet_address: string;
}

export interface RewardDistribution {
  id: string;
  batch_id: string;
  total_rewards: number;
  total_recipients: number;
  token: string;
  status: 'preparing' | 'processing' | 'completed' | 'failed';
  transaction_signatures: string[];
  created_at: string;
  completed_at?: string;
}

export interface StakingReward {
  id: string;
  user_id: string;
  amount: number;
  staked_amount: number;
  duration_days: number;
  apy: number;
  status: 'active' | 'completed' | 'withdrawn';
  start_date: string;
  end_date: string;
  last_reward_date: string;
}

export interface ReferralReward {
  id: string;
  referrer_id: string;
  referee_id: string;
  reward_amount: number;
  bonus_amount: number;
  level: number; // referral level (1st level, 2nd level, etc.)
  action_type: 'signup' | 'first_submission' | 'milestone';
  created_at: string;
}