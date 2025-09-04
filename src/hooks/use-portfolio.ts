import { useState, useEffect } from 'react';
import { useWallet } from './use-wallet';
import { PortfolioStats, TokenTransaction, POLYMERS_TOKENS } from '@/types/tokens';

export function usePortfolio() {
  const { balance, authenticated, publicKey } = useWallet();
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock transaction data for demo
  const generateMockTransactions = (): TokenTransaction[] => {
    return [
      {
        signature: 'sig1234567890abcdef',
        timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
        type: 'receive',
        amount: 25.5,
        token: POLYMERS_TOKENS.PLY,
        from: 'sender123...',
        to: publicKey || '',
        fee: 0.001,
        status: 'confirmed'
      },
      {
        signature: 'sig0987654321fedcba',
        timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
        type: 'send',
        amount: 100.0,
        token: POLYMERS_TOKENS.USDC,
        from: publicKey || '',
        to: 'recipient456...',
        fee: 0.001,
        status: 'confirmed'
      },
      {
        signature: 'sig1357924680bdfhij',
        timestamp: Date.now() - 1000 * 60 * 60 * 6, // 6 hours ago
        type: 'receive',
        amount: 12.8,
        token: POLYMERS_TOKENS.RECO,
        from: 'recycling_node_1',
        to: publicKey || '',
        fee: 0.0005,
        status: 'confirmed'
      },
      {
        signature: 'sig2468013579acegik',
        timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
        type: 'stake',
        amount: 500.0,
        token: POLYMERS_TOKENS.PLY,
        fee: 0.002,
        status: 'confirmed'
      }
    ];
  };

  useEffect(() => {
    if (authenticated && balance) {
      setLoading(true);

      // Calculate portfolio statistics
      const stats: PortfolioStats = {
        totalValue: balance.totalUsdValue,
        totalChange24h: balance.totalChange24h,
        totalChangePercent24h: (balance.totalChange24h / balance.totalUsdValue) * 100,
        tokens: balance.tokens,
        transactions: generateMockTransactions()
      };

      setPortfolioStats(stats);
      setTransactions(stats.transactions);
      setLoading(false);
    }
  }, [authenticated, balance, publicKey]);

  const getTokenAllocation = () => {
    if (!portfolioStats) return [];

    return portfolioStats.tokens.map(tokenBalance => ({
      symbol: tokenBalance.token.symbol,
      value: tokenBalance.usdValue,
      percentage: (tokenBalance.usdValue / portfolioStats.totalValue) * 100,
      color: getTokenColor(tokenBalance.token.symbol)
    }));
  };

  const getTokenColor = (symbol: string): string => {
    const colors: Record<string, string> = {
      PLY: 'hsl(var(--eco-primary))',
      SOL: 'hsl(261, 86%, 65%)',
      USDC: 'hsl(215, 98%, 51%)',
      RECO: 'hsl(160, 84%, 39%)',
      CRT: 'hsl(45, 93%, 47%)'
    };
    return colors[symbol] || 'hsl(var(--muted))';
  };

  const getRecentTransactions = (limit: number = 10) => {
    return transactions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  };

  const getTransactionsByType = (type: TokenTransaction['type']) => {
    return transactions.filter(tx => tx.type === type);
  };

  const getTotalEarnings = () => {
    return transactions
      .filter(tx => tx.type === 'receive')
      .reduce((sum, tx) => sum + (tx.amount * (tx.token.price || 0)), 0);
  };

  return {
    portfolioStats,
    transactions,
    loading,
    getTokenAllocation,
    getRecentTransactions,
    getTransactionsByType,
    getTotalEarnings,
    authenticated
  };
}