// User types
export interface User {
  id: string;
  email: string;
  name: string;
  level: number;
  totalTokens: number;
  streakDays: number;
  badges: Badge[];
  createdAt: string;
}

// Badge types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: string;
}

// Token types
export interface TokenBalance {
  symbol: "POLY" | "SOL" | "USDC";
  amount: number;
  usdValue: number;
  change24h: number;
}

// Project types
export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentAmount: number;
  targetAmount: number;
  contributors: number;
  category: "cleanup" | "renewable" | "forest";
  location: string;
  endDate: string;
  createdBy: string;
  impact: {
    co2Reduced: number;
    wasteRemoved: number;
    treesPlanted: number;
  };
}

// Marketplace types
export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: "POLY" | "SOL" | "USDC";
  imageUrl: string;
  category: "eco-products" | "carbon-credits" | "donations";
  available: boolean;
}

// Recycling types
export interface RecyclingSubmission {
  id: string;
  userId: string;
  type: "plastic" | "paper" | "metal" | "glass";
  weight: number;
  location: string;
  imageUrl: string;
  verified: boolean;
  tokensEarned: number;
  createdAt: string;
}

// Challenge types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  reward: number;
  rewardType: "POLY" | "badge";
  deadline: string;
  completed: boolean;
}

// Leaderboard types
export interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  score: number;
  rank: number;
  change: number;
}

// IoT types
export interface IoTDevice {
  id: string;
  name: string;
  type: "bin" | "scale" | "scanner";
  location: string;
  status: "online" | "offline" | "maintenance";
  lastReading: {
    timestamp: string;
    value: number;
    unit: string;
  };
}

// Analytics types
export interface UserStats {
  totalRecycled: number;
  tokensEarned: number;
  carbonOffset: number;
  rank: number;
  streakDays: number;
  badgesUnlocked: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Particle effects types
export interface ParticleOptions {
  count?: number;
  colors?: string[];
  duration?: number;
  size?: number;
  spread?: number;
}