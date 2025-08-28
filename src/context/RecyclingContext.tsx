"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { PublicKey, Connection, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import type { ReactNode } from "react";

interface Badge {
  id: string;
  name: string;
  emoji?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
}

interface RecyclingContextProps {
  plyBalance: number;
  crtBalance: number;
  units: number;
  badges: Badge[];
  logRecycleUnit: (data?: { city?: string; lat?: number; lng?: number }) => Promise<number>;
  mintPLY: (amount: number) => Promise<void>;
}

const RecyclingContext = createContext<RecyclingContextProps>({
  plyBalance: 0,
  crtBalance: 0,
  units: 0,
  badges: [],
  logRecycleUnit: async () => 0,
  mintPLY: async () => {},
});

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PLY_MINT = new PublicKey(process.env.NEXT_PUBLIC_PLY_MINT!);

export const RecyclingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const connection = new Connection(RPC_URL, "confirmed");

  const [plyBalance, setPlyBalance] = useState(0);
  const [crtBalance, setCrtBalance] = useState(0);
  const [units, setUnits] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);

  // Fetch SPL token balance
  const fetchBalances = async () => {
    if (!publicKey) return;
    try {
      const ata = await getOrCreateAssociatedTokenAccount(connection, publicKey, PLY_MINT, publicKey);
      setPlyBalance(Number(ata.amount));
    } catch (err) {
      console.error("Failed to fetch PLY balance:", err);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchBalances();
    }
  }, [publicKey]);

  // Mint PLY tokens
  const mintPLY = async (amount: number) => {
    if (!publicKey || !signTransaction) return;
    try {
      const ata = await getOrCreateAssociatedTokenAccount(connection, publicKey, PLY_MINT, publicKey);
      const tx = new Transaction().add(
        mintTo({
          mint: PLY_MINT,
          destination: ata.address,
          amount,
          authority: publicKey,
          programId: TOKEN_PROGRAM_ID,
        })
      );
      const signed = await signTransaction(tx);
      const txId = await sendTransaction(signed, connection);
      await connection.confirmTransaction(txId, "confirmed");
      await fetchBalances();
    } catch (err) {
      console.error("Failed to mint PLY:", err);
    }
  };

  // Log recycling unit + reward PLY
  const logRecycleUnit = async (data?: { city?: string; lat?: number; lng?: number }) => {
    const reward = Math.floor(Math.random() * 50) + 10; // Example: 10–60 PLY
    setUnits(prev => prev + 1);
    setCrtBalance(prev => prev + 1);
    setPlyBalance(prev => prev + reward);

    // Unlock a badge occasionally
    if (units % 5 === 0) {
      setBadges(prev => [
        ...prev,
        {
          id: `${Date.now()}`,
          name: `Eco Badge #${prev.length + 1}`,
          rarity: ["common", "rare", "epic", "legendary"][Math.floor(Math.random() * 4)] as any,
          unlocked: true,
        },
      ]);
    }

    await mintPLY(reward); // Mint PLY to wallet
    return reward;
  };

  return (
    <RecyclingContext.Provider
      value={{
        plyBalance,
        crtBalance,
        units,
        badges,
        logRecycleUnit,
        mintPLY,
      }}
    >
      {children}
    </RecyclingContext.Provider>
  );
};

export const useRecycling = () => useContext(RecyclingContext);
