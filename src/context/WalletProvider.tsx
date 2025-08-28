"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { transact, Web3MobileWallet } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";

interface WalletContextProps {
  wallet: Web3MobileWallet | null;
  connect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextProps>({
  wallet: null,
  connect: async () => {},
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<Web3MobileWallet | null>(null);

  const connect = async () => {
    try {
      const connectedWallet = await transact<Web3MobileWallet>(async (w) => w);
      setWallet(connectedWallet);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  useEffect(() => {
    connect();
  }, []);

  return <WalletContext.Provider value={{ wallet, connect }}>{children}</WalletContext.Provider>;
};

export const useWallet = () => useContext(WalletContext);
