"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { transact, Web3MobileWallet } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { Metaplex } from "@metaplex-foundation/js";
import { ParticleRef } from "@/components/ui/ParticleEngine";
import type { Badge, Project, TokenBalance, MarketplaceItem, User } from "@/types";

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PLY_MINT = new PublicKey(process.env.NEXT_PUBLIC_PLY_MINT!);
const CANDY_MACHINE_ID = new PublicKey(process.env.NEXT_PUBLIC_CANDY_MACHINE_ID!);

interface RecyclingContextProps {
  user: User;
  balances: TokenBalance[];
  projects: Project[];
  marketplaceItems: MarketplaceItem[];
  nftBadges: Badge[];
  plyBalance: number;
  crtBalance: number;
  units: number;
  badges: Badge[];
  particleRef: React.RefObject<ParticleRef>;
  connectWallet: () => Promise<void>;
  contributeProject: (projectId: string) => Promise<void>;
  purchaseItem: (itemId: string) => Promise<void>;
  mintPLY: (amount: number) => Promise<void>;
  mintNFT: () => Promise<void>;
  disconnectWallet: () => void;
}

const RecyclingContext = createContext<RecyclingContextProps>({} as RecyclingContextProps);

export const RecyclingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const particleRef = useRef<ParticleRef>(null);
  const [wallet, setWallet] = useState<Web3MobileWallet | null>(null);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);

  const connection = useRef(new Connection(RPC_URL, "confirmed")).current;
  const metaplex = useRef(Metaplex.make(connection)).current;

  const [user, setUser] = useState<User>({
    id: "1",
    name: "Eco User",
    email: "eco@user.com",
    level: 1,
    totalTokens: 0,
    streakDays: 0,
    badges: [],
    createdAt: new Date().toISOString(),
  });

  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [nftBadges, setNFTBadges] = useState<Badge[]>([]);

  const plyBalance = balances.find(b => b.symbol === "PLY")?.amount || 0;
  const crtBalance = balances.find(b => b.symbol === "CRT")?.amount || 0;
  const units = user.streakDays; // Example usage
  const badges = nftBadges;

  /** Wallet Connection */
  const connectWallet = async () => {
    try {
      const connectedWallet = await transact<Web3MobileWallet>(async w => w);
      setWallet(connectedWallet);
      setPublicKey(connectedWallet.publicKey);
      await fetchBalances();
      await fetchNFTBadges();
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setPublicKey(null);
    setBalances([]);
    setNFTBadges([]);
  };

  /** Fetch SPL token balances */
  const fetchBalances = async () => {
    if (!publicKey) return;
    try {
      const plyAta = await getOrCreateAssociatedTokenAccount(connection, publicKey, PLY_MINT, publicKey);
      const plyAmt = Number(plyAta.amount);
      const solAmt = (await connection.getBalance(publicKey)) / 1e9;
      setBalances([
        { symbol: "PLY", amount: plyAmt, usdValue: 0, change24h: 0 },
        { symbol: "SOL", amount: solAmt, usdValue: 0, change24h: 0 },
      ]);
      setUser(prev => ({ ...prev, totalTokens: plyAmt }));
    } catch (err) {
      console.error("Error fetching balances:", err);
    }
  };

  /** Fetch NFT badges */
  const fetchNFTBadges = async () => {
    if (!publicKey) return;
    try {
      const nfts = await metaplex.nfts().findAllByOwner({ owner: publicKey });
      const candyNFTs = nfts.filter(nft => nft.candyMachine?.equals(CANDY_MACHINE_ID));
      const badges: Badge[] = await Promise.all(
        candyNFTs.map(async nft => {
          const metadata = await nft.metadataTask.run();
          return {
            id: nft.address.toBase58(),
            name: nft.name,
            description: metadata?.data?.description || "",
            icon: metadata?.data?.image || "/assets/badges/default.png",
            rarity: (metadata?.data?.attributes?.find(a => a.trait_type === "rarity")?.value as any) || "common",
            unlockedAt: new Date().toISOString(),
          };
        })
      );
      setNFTBadges(badges);
      setUser(prev => ({ ...prev, badges }));
    } catch (err) {
      console.error("Error fetching NFT badges:", err);
    }
  };

  /** Mint PLY */
  const mintPLY = async (amount: number) => {
    if (!wallet || !publicKey) return;
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
      const signedTx = await wallet.signTransaction(tx);
      const txId = await wallet.sendTransaction(signedTx, connection);
      await connection.confirmTransaction(txId, "confirmed");
      await fetchBalances();
      particleRef.current?.burstCoins({ count: 25, color: "#FFD700" });
    } catch (err) {
      console.error("Failed minting PLY:", err);
    }
  };

  /** Mint NFT badge */
  const mintNFT = async () => {
    if (!wallet || !publicKey) return;
    try {
      // placeholder for candy machine mint logic
      particleRef.current?.sparkleBadge({ count: 15, color: "#FFAA00" });
      await fetchNFTBadges();
    } catch (err) {
      console.error("Failed minting NFT:", err);
    }
  };

  /** Contribute to project */
  const contributeProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    // Update locally
    setProjects(prev =>
      prev.map(p => (p.id === projectId ? { ...p, currentAmount: p.currentAmount + 100, contributors: p.contributors + 1 } : p))
    );
    await mintPLY(100);
    await mintNFT();
  };

  /** Purchase marketplace item */
  const purchaseItem = async (itemId: string) => {
    const item = marketplaceItems.find(i => i.id === itemId);
    if (!item || !item.available) return;
    // Update locally
    setMarketplaceItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, available: false } : i))
    );
    await mintPLY(item.price);
    await mintNFT();
  };

  /** Mock initial projects & marketplace */
  useEffect(() => {
    setProjects([
      { id: "1", title: "Ocean Cleanup", description: "Remove plastic from oceans", currentAmount: 1000, targetAmount: 5000, contributors: 12, category: "cleanup", location: "Pacific Ocean", endDate: "2024-12-31", createdBy: "Ocean Foundation", impact: { co2Reduction: 100, treesPlanted: 0, plasticRemoved: 500 } },
      { id: "2", title: "Solar School", description: "Install solar panels", currentAmount: 500, targetAmount: 3000, contributors: 5, category: "renewable", location: "Kenya", endDate: "2024-11-30", createdBy: "Green Education", impact: { co2Reduction: 200, treesPlanted: 20, plasticRemoved: 0 } },
    ]);

    setMarketplaceItems([
      { id: "1", title: "Reusable Bottle", description: "Eco bottle", imageUrl: "/assets/placeholders/bottle.png", price: 25, currency: "PLY", type: "eco-product", seller: "EcoStore", available: true, category: "products" },
      { id: "2", title: "Carbon Credit", description: "Offset CO2", imageUrl: "/assets/placeholders/carbon.png", price: 50, currency: "PLY", type: "carbon-credit", seller: "EcoFund", available: true, category: "carbon-offset" },
    ]);
  }, []);

  return (
    <RecyclingContext.Provider
      value={{
        user,
        balances,
        projects,
        marketplaceItems,
        nftBadges,
        plyBalance,
        crtBalance,
        units,
        badges,
        particleRef,
        connectWallet,
        contributeProject,
        purchaseItem,
        mintPLY,
        mintNFT,
        disconnectWallet,
      }}
    >
      {children}
    </RecyclingContext.Provider>
  );
};

export const usePortfolio = () => useContext(RecyclingContext);
