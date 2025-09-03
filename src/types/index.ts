export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  level: number;
  totalTokens: number;
  streakDays: number;
  badges: Badge[];
  createdAt: string;
}

export interface TokenBalance {
  symbol: string;
  amount: number;
  usdValue: number;
  change24h: number;
}

export interface Wallet {
  id: string;
  type: 'phantom' | 'solflare' | 'backpack' | 'sui';
  address: string;
  connected: boolean;
  balances: TokenBalance[];
}

export interface Submission {
  id: string;
  userId: string;
  imageUrl: string;
  plasticType: string;
  confidence: number;
  verified: boolean;
  tokensEarned: number;
  location?: {
    lat: number;
    lng: number;
  };
  timestamp: string;
  status: 'pending' | 'verified' | 'rejected';
  aiMetadata?: {
    classification: string;
    confidence: number;
    boundingBoxes: any[];
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetAmount: number;
  currentAmount: number;
  contributors: number;
  category: 'renewable' | 'conservation' | 'cleanup' | 'education';
  location: string;
  endDate: string;
  createdBy: string;
  impact: {
    co2Reduction: number;
    treesPlanted: number;
    plasticRemoved: number;
  };
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  currency: 'PLY' | 'USDC' | 'SOL';
  type: 'carbon-credit' | 'eco-product' | 'donation';
  seller: string;
  available: boolean;
  category: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  requirement: number;
  progress: number;
  reward: number;
  expiresAt: string;
  completed: boolean;
}

export interface AnalyticsEvent {
  id: string;
  userId: string;
  event: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reward' | 'challenge' | 'project' | 'system';
  read: boolean;
  data?: any;
  createdAt: string;
}