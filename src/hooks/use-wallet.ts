import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TokenBalance, WalletBalance, POLYMERS_TOKENS } from '@/types/tokens';

const SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com';

export function useWallet() {
  const { user, authenticated, connectWallet } = usePrivy();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

  const fetchBalance = async (publicKey: string) => {
    setLoading(true);
    setError(null);

    try {
      const pubKey = new PublicKey(publicKey);
      
      // Fetch SOL balance
      const solBalance = await connection.getBalance(pubKey);
      const solBalanceFormatted = solBalance / LAMPORTS_PER_SOL;

      // Create mock token balances for demo purposes
      const mockTokenBalances: TokenBalance[] = [
        {
          token: POLYMERS_TOKENS.PLY,
          balance: 2847.5,
          usdValue: 284.75,
          change24h: 12.5
        },
        {
          token: POLYMERS_TOKENS.SOL,
          balance: solBalanceFormatted,
          usdValue: solBalanceFormatted * 100, // Mock price
          change24h: -2.3
        },
        {
          token: POLYMERS_TOKENS.USDC,
          balance: 1250.0,
          usdValue: 1250.0,
          change24h: 0.1
        },
        {
          token: POLYMERS_TOKENS.RECO,
          balance: 156.8,
          usdValue: 78.4,
          change24h: 5.2
        },
        {
          token: POLYMERS_TOKENS.CRT,
          balance: 45.2,
          usdValue: 135.6,
          change24h: 8.7
        }
      ];

      const totalUsdValue = mockTokenBalances.reduce((sum, token) => sum + token.usdValue, 0);
      const totalChange24h = mockTokenBalances.reduce((sum, token) => sum + (token.usdValue * token.change24h / 100), 0);

      const walletBalance: WalletBalance = {
        publicKey,
        tokens: mockTokenBalances,
        totalUsdValue,
        totalChange24h
      };

      setBalance(walletBalance);
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
      setError('Failed to fetch wallet balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      fetchBalance(user.wallet.address);
    }
  }, [authenticated, user?.wallet?.address]);

  const refreshBalance = () => {
    if (user?.wallet?.address) {
      fetchBalance(user.wallet.address);
    }
  };

  return {
    user,
    authenticated,
    balance,
    loading,
    error,
    connectWallet,
    refreshBalance,
    publicKey: user?.wallet?.address || null
  };
}