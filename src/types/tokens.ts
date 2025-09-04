export interface Token {
  symbol: string;
  name: string;
  mintAddress: string;
  decimals: number;
  logoURI?: string;
  price?: number;
  priceChange24h?: number;
}

export interface TokenBalance {
  token: Token;
  balance: number;
  usdValue: number;
  change24h: number;
}

export interface WalletBalance {
  publicKey: string;
  tokens: TokenBalance[];
  totalUsdValue: number;
  totalChange24h: number;
}

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: string;
}

export interface TokenTransaction {
  signature: string;
  timestamp: number;
  type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake';
  amount: number;
  token: Token;
  from?: string;
  to?: string;
  fee?: number;
  status: 'confirmed' | 'pending' | 'failed';
}

export interface PortfolioStats {
  totalValue: number;
  totalChange24h: number;
  totalChangePercent24h: number;
  tokens: TokenBalance[];
  transactions: TokenTransaction[];
}

// Predefined tokens for the Polymers Network ecosystem
export const POLYMERS_TOKENS: Record<string, Token> = {
  PLY: {
    symbol: 'PLY',
    name: 'Polymers Token',
    mintAddress: 'PLY123...', // Placeholder - replace with actual mint
    decimals: 9,
    logoURI: '/tokens/ply.svg'
  },
  RECO: {
    symbol: 'RECO',
    name: 'Recycling Credits',
    mintAddress: 'RECO123...', // Placeholder - replace with actual mint
    decimals: 6,
    logoURI: '/tokens/reco.svg'
  },
  CRT: {
    symbol: 'CRT',
    name: 'Carbon Credits',
    mintAddress: 'CRT123...', // Placeholder - replace with actual mint
    decimals: 6,
    logoURI: '/tokens/crt.svg'
  },
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    mintAddress: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    logoURI: '/tokens/sol.svg'
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    logoURI: '/tokens/usdc.svg'
  }
};