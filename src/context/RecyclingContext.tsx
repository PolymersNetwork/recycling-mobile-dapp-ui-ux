"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useWallet } from "@/contexts/WalletContext";
import { Metaplex } from "@metaplex-foundation/js";
import type { Badge, Project, MarketplaceItem, TokenBalance, User } from "@/types";

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PLY_MINT = new PublicKey(process.env.NEXT_PUBLIC_PLY_MINT!);
const CANDY_MACHINE_ID = new PublicKey(process.env.NEXT_PUBLIC_CANDY_MACHINE_ID!);

interface RecyclingContextProps {
  plyBalance: number;
  crtBalance: number;
  units: number;
  badges: Badge[];
  projects: Project[];
  marketplaceItems: MarketplaceItem[];
  fetchPortfolio: () => Promise<void>;
  contributeToProject: (projectId: string, amount?: number) => Promise<void>;
  purchaseItem: (itemId: string) => Promise<void>;
  mintPLYReward: (amount: number) => Promise<void>;
  mintNFTBadge: () => Promise<void>;
}

const RecyclingContext = createContext<RecyclingContextProps>({
  plyBalance: 0,
  crtBalance: 0,
  units: 0,
  badges: [],
  projects: [],
  marketplaceItems: [],
  fetchPortfolio: async () => {},
  contributeToProject: async () => {},
  purchaseItem: async () => {},
  mintPLYReward: async () => {},
  mintNFTBadge: async () => {},
});

export const RecyclingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { wallet } = useWallet();
  const connection = new Connection(RPC_URL, "confirmed");
  const metaplex = Metaplex.make(connection);

  const [plyBalance, setPlyBalance] = useState(0);
  const [crtBalance, setCrtBalance] = useState(0);
  const [units, setUnits] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);

  /** Fetch SPL balances */
  const fetchBalances = async () => {
    if (!wallet?.publicKey) return;
    try {
      const plyAccount = await getOrCreateAssociatedTokenAccount(connection, wallet.publicKey, PLY_MINT, wallet.publicKey);
      const plyAmt = Number(plyAccount.amount);
      const solAmt = await connection.getBalance(wallet.publicKey) / 1e9;
      setPlyBalance(plyAmt);
      setCrtBalance(solAmt);
    } catch (err) {
      console.error("Failed to fetch balances:", err);
    }
  };

  /** Fetch NFT badges */
  const fetchNFTBadges = async () => {
    if (!wallet?.publicKey) return;
    try {
      const nfts = await metaplex.nfts().findAllByOwner({ owner: wallet.publicKey });
      const candyNFTs = nfts.filter(nft => nft.candyMachine?.equals(CANDY_MACHINE_ID));
      const fetchedBadges: Badge[] = await Promise.all(
        candyNFTs.map(async nft => {
          const metadata = await nft.metadataTask.run();
          return {
            id: nft.address.toBase58(),
            name: nft.name,
            description: metadata?.data?.description || "",
            icon: metadata?.data?.image || "/badges/default.png",
            rarity: (metadata?.data?.attributes?.find(a => a.trait_type === "rarity")?.value as any) || "common",
            unlockedAt: nft.mint ? new Date().toISOString() : undefined,
          };
        })
      );
      setBadges(fetchedBadges);
    } catch (err) {
      console.error("Failed to fetch NFT badges:", err);
    }
  };

  /** Mint PLY tokens */
  const mintPLYReward = async (amount: number) => {
    if (!wallet?.publicKey || !wallet.signTransaction || !wallet.sendTransaction) return;
    try {
      const ata = await getOrCreateAssociatedTokenAccount(connection, wallet.publicKey, PLY_MINT, wallet.publicKey);
      const tx = new Transaction().add(
        mintTo({ mint: PLY_MINT, destination: ata.address, amount, authority: wallet.publicKey, programId: TOKEN_PROGRAM_ID })
      );
      const signedTx = await wallet.signTransaction(tx);
      const txId = await wallet.sendTransaction(signedTx, connection);
      await connection.confirmTransaction(txId, "confirmed");
      await fetchBalances();
    } catch (err) {
      console.error("Failed to mint PLY reward:", err);
    }
  };

  /** Mint NFT badge */
  const mintNFTBadge = async () => {
    if (!wallet?.publicKey) return;
    try {
      // Placeholder: actual Candy Machine mint logic goes here
      // await metaplex.candyMachines().mint({ candyMachine: CANDY_MACHINE_ID, wallet: wallet.publicKey });
      await fetchNFTBadges();
    } catch (err) {
      console.error("Failed to mint NFT badge:", err);
    }
  };

  /** Contribute to project */
  const contributeToProject = async (projectId: string, amount = 100) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, currentAmount: p.currentAmount + amount } : p));
    await mintPLYReward(amount);
    await mintNFTBadge();
  };

  /** Purchase marketplace item */
  const purchaseItem = async (itemId: string) => {
    setMarketplaceItems(prev => prev.map(i => i.id === itemId ? { ...i, available: false } : i));
    await mintPLYReward(50); // Example: reward PLY
    await mintNFTBadge();
  };

  /** Mock projects + marketplace items */
  useEffect(() => {
    setProjects([
      { id: "1", title: "Ocean Cleanup", description: "Remove plastic from oceans", imageUrl: "", targetAmount: 50000, currentAmount: 12300, contributors: 120, category: "cleanup", location: "Pacific", endDate: "2024-12-31", createdBy: "EcoFund", impact: { co2Reduction: 1250, treesPlanted: 0, plasticRemoved: 25000 } },
      { id: "2", title: "Solar Schools", description: "Install solar panels", imageUrl: "", targetAmount: 75000, currentAmount: 34000, contributors: 85, category: "renewable", location: "Kenya", endDate: "2024-11-15", createdBy: "GreenEnergy", impact: { co2Reduction: 2100, treesPlanted: 500, plasticRemoved: 0 } },
    ]);

    setMarketplaceItems([
      { id: "1", title: "Reusable Bottle", description: "Eco bottle", imageUrl: "", price: 25, currency: "USDC", type: "eco-product", seller: "EcoStore", available: true, category: "products" },
      { id: "2", title: "Carbon Credit Pack", description: "Offset 100kg CO2", imageUrl: "", price: 50, currency: "PLY", type: "carbon-credit", seller: "EcoFund", available: true, category: "carbon-offset" },
    ]);
  }, []);

  /** Fetch full portfolio */
  const fetchPortfolio = async () => {
    await fetchBalances();
    await fetchNFTBadges();
  };

  useEffect(() => {
    fetchPortfolio();
  }, [wallet?.publicKey]);

  return (
    <RecyclingContext.Provider value={{
      plyBalance,
      crtBalance,
      units: projects.reduce((a, p) => a + p.currentAmount, 0),
      badges,
      projects,
      marketplaceItems,
      fetchPortfolio,
      contributeToProject,
      purchaseItem,
      mintPLYReward,
      mintNFTBadge,
    }}>
      {children}
    </RecyclingContext.Provider>
  );
};

export const usePortfolio = () => useContext(RecyclingContext);
