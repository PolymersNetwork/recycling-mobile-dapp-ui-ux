import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';

interface WalletContextType {
  wallet: {
    publicKey: PublicKey | null;
    connected: boolean;
    signTransaction?: (transaction: any) => Promise<any>;
    sendTransaction?: (transaction: any, connection: Connection) => Promise<string>;
  } | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  connecting: boolean;
}

const WalletContext = createContext<WalletContextType>({
  wallet: null,
  connect: async () => {},
  disconnect: () => {},
  connecting: false,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletContextType['wallet']>(null);
  const [connecting, setConnecting] = useState(false);

  const connect = async () => {
    setConnecting(true);
    try {
      // Simulate wallet connection
      // In a real app, this would integrate with actual wallet adapters
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWallet({
        publicKey: new PublicKey('11111111111111111111111111111111'),
        connected: true,
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setWallet(null);
  };

  return (
    <WalletContext.Provider value={{ wallet, connect, disconnect, connecting }}>
      {children}
    </WalletContext.Provider>
  );
};