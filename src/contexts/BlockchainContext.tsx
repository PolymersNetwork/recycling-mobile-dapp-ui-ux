import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TokenBalance, PortfolioStats } from '@/types/tokens';
import { PythConnection } from '@pythnetwork/client';
import { useToast } from '@/hooks/use-toast';

interface BlockchainContextType {
  // Wallet state
  balance: number | null;
  tokenBalances: TokenBalance[];
  portfolioStats: PortfolioStats | null;
  
  // Loading states
  loading: boolean;
  
  // Functions
  refreshBalance: () => Promise<void>;
  getTokenPrice: (symbol: string) => Promise<number>;
  createPaymentRequest: (amount: number, token: string) => Promise<string>;
}

const BlockchainContext = createContext<BlockchainContextType | null>(null);

export function BlockchainProvider({ children }: { children: React.ReactNode }) {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const { toast } = useToast();
  
  const [balance, setBalance] = useState<number | null>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize Pyth for price feeds
  const pythConnection = useMemo(() => {
    try {
      // Mock Pyth connection for development
      return null; // Simplified for now
    } catch (error) {
      console.error('Failed to initialize Pyth connection:', error);
      return null;
    }
  }, [connection]);

  const refreshBalance = async () => {
    if (!publicKey || !connected) return;
    
    setLoading(true);
    try {
      // Get SOL balance
      const solBalance = await connection.getBalance(publicKey);
      setBalance(solBalance / LAMPORTS_PER_SOL);

      // Mock token balances for now
      const mockTokens: TokenBalance[] = [
        {
          token: {
            symbol: 'PLY',
            name: 'Polymers Token',
            mintAddress: 'PLY123...',
            decimals: 9,
            logoURI: '/tokens/ply.svg'
          },
          balance: 1250.50,
          usdValue: 1250.50,
          change24h: 5.2
        },
        {
          token: {
            symbol: 'RECO',
            name: 'Recycling Credits',
            mintAddress: 'RECO123...',
            decimals: 6,
            logoURI: '/tokens/reco.svg'
          },
          balance: 890.25,
          usdValue: 178.05,
          change24h: -2.1
        }
      ];
      
      setTokenBalances(mockTokens);

      // Calculate portfolio stats
      const totalValue = mockTokens.reduce((sum, token) => sum + token.usdValue, 0) + (solBalance / LAMPORTS_PER_SOL * 100);
      const totalChange = mockTokens.reduce((sum, token) => sum + token.change24h, 0) / mockTokens.length;
      
      setPortfolioStats({
        totalValue,
        totalChange24h: totalChange,
        totalChangePercent24h: (totalChange / totalValue) * 100,
        tokens: mockTokens,
        transactions: []
      });

    } catch (error) {
      console.error('Failed to fetch balance:', error);
      toast({
        title: "Error",
        description: "Failed to fetch wallet balance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTokenPrice = async (symbol: string): Promise<number> => {
    try {
      // Mock prices for development
      const mockPrices: Record<string, number> = {
        'SOL': 100,
        'PLY': 1.0,
        'RECO': 0.2,
        'CRT': 0.5,
        'USDC': 1.0
      };
      return mockPrices[symbol] || 0;
    } catch (error) {
      console.error('Failed to fetch token price:', error);
      return 0;
    }
  };

  const createPaymentRequest = async (amount: number, token: string): Promise<string> => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    // Generate Solana Pay URL
    const searchParams = new URLSearchParams();
    searchParams.set('recipient', publicKey.toString());
    searchParams.set('amount', amount.toString());
    searchParams.set('spl-token', token);
    searchParams.set('reference', PublicKey.default.toString());
    searchParams.set('label', 'Polymers Network');
    searchParams.set('message', 'Payment for recycling rewards');
    
    return `solana:${publicKey.toString()}?${searchParams.toString()}`;
  };

  useEffect(() => {
    if (connected && publicKey) {
      refreshBalance();
    } else {
      setBalance(null);
      setTokenBalances([]);
      setPortfolioStats(null);
    }
  }, [connected, publicKey]);

  const value: BlockchainContextType = {
    balance,
    tokenBalances,
    portfolioStats,
    loading,
    refreshBalance,
    getTokenPrice,
    createPaymentRequest,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
}

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};