import { useState, useEffect } from 'react';
import { TokenBalance, Wallet } from '@/types';

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async (type: 'phantom' | 'solflare' | 'backpack' | 'sui') => {
    setIsConnecting(true);
    setLoading(true);
    try {
      // Mock wallet connection - replace with actual wallet adapter
      const mockWallet: Wallet = {
        id: `${type}-${Date.now()}`,
        type,
        address: `${type.toUpperCase()}_ADDRESS_${Math.random().toString(36).substr(2, 9)}`,
        connected: true,
        balances: [
          { symbol: 'PLY', amount: 1250.75, usdValue: 375.23, change24h: 8.5 },
          { symbol: 'SOL', amount: 5.2, usdValue: 832.40, change24h: -3.2 },
          { symbol: 'USDC', amount: 150.0, usdValue: 150.0, change24h: 0.0 },
        ]
      };
      
      setWallet(mockWallet);
      setBalances(mockWallet.balances);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setLoading(false);
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setBalances([]);
  };

  const refreshBalances = async () => {
    if (!wallet) return;
    setLoading(true);
    
    // Mock balance refresh
    setTimeout(() => {
      const updatedBalances = balances.map(balance => ({
        ...balance,
        amount: balance.amount * (1 + (Math.random() - 0.5) * 0.1),
        change24h: (Math.random() - 0.5) * 20
      }));
      setBalances(updatedBalances);
      setLoading(false);
    }, 1500);
  };

  return {
    wallet,
    balances,
    loading,
    isConnecting,
    connectWallet,
    disconnectWallet,
    refreshBalances
  };
}