"use client";

import { useState, useEffect } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Plus, RefreshCw, Eye, EyeOff, Heart, Users, Clock, MapPin } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { actions } from "@metaplex/js"; // Metaplex JS SDK
import type { TokenBalance, NFTBadge, Project } from "@/types";

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PLY_MINT = new PublicKey("PLYKdaCUgxTUw6rSjWbgSN97Qtecb6Fy6SazWf1tvAC");
const CANDY_MACHINE_ID = new PublicKey("YOUR_CANDY_MACHINE_ID_HERE"); // Replace with your Candy Machine ID

const mockProjects: Project[] = [
  {
    id: "1",
    title: "Ocean Cleanup",
    description: "Removing plastic from oceans and beaches.",
    imageUrl: "/api/placeholder/400/200",
    targetAmount: 50000,
    currentAmount: 32750,
    contributors: 247,
    category: "cleanup",
    location: "Pacific Ocean",
    endDate: "2024-12-31",
    createdBy: "Ocean Foundation",
    impact: { co2Reduction: 1250, treesPlanted: 0, plasticRemoved: 25000 },
  },
  {
    id: "2",
    title: "Solar School Initiative",
    description: "Installing solar panels in rural schools.",
    imageUrl: "/api/placeholder/400/200",
    targetAmount: 75000,
    currentAmount: 18500,
    contributors: 89,
    category: "renewable",
    location: "Kenya",
    endDate: "2024-11-15",
    createdBy: "Green Education",
    impact: { co2Reduction: 2100, treesPlanted: 500, plasticRemoved: 0 },
  },
];

export function Portfolio() {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [nftBadges, setNftBadges] = useState<NFTBadge[]>([]);
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  const connection = new Connection(RPC_URL, "confirmed");

  // Fetch SPL token balances
  const fetchBalances = async () => {
    if (!publicKey) return;
    try {
      const plyAccount = await getOrCreateAssociatedTokenAccount(connection, publicKey, PLY_MINT, publicKey);
      const plyBalance = Number(plyAccount.amount);
      const solBalance = await connection.getBalance(publicKey) / 1e9;
      setBalances([
        { symbol: "PLY", amount: plyBalance, usdValue: 0, change24h: 0 },
        { symbol: "SOL", amount: solBalance, usdValue: 0, change24h: 0 },
      ]);
    } catch (err) {
      console.error("Failed to fetch balances:", err);
    }
  };

  // Fetch NFT badges (on-chain Candy Machine)
  const fetchNFTBadges = async () => {
    if (!publicKey) return;
    // For simplicity, mock; in production, query Metaplex for user's NFTs in collection
    setNftBadges([
      { name: "Eco Warrior", image: "/badges/eco-warrior.png", mintedAt: Date.now() - 86400000 },
    ]);
  };

  useEffect(() => {
    if (publicKey) {
      fetchBalances();
      fetchNFTBadges();
    }
  }, [publicKey]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBalances();
    await fetchNFTBadges();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Mint SPL PLY reward
  const mintPLYReward = async (amount: number) => {
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
      const signedTx = await signTransaction(tx);
      const txId = await sendTransaction(signedTx, connection);
      await connection.confirmTransaction(txId, "confirmed");
      await fetchBalances();
    } catch (err) {
      console.error("Failed to mint PLY:", err);
    }
  };

  // Mint NFT badge using Metaplex Candy Machine
  const mintNFTBadge = async () => {
    if (!publicKey) return;
    try {
      const { mintOneToken } = actions;
      await mintOneToken({ connection, wallet: { publicKey, signTransaction }, candyMachine: CANDY_MACHINE_ID });
      await fetchNFTBadges();
    } catch (err) {
      console.error("Failed to mint NFT badge:", err);
    }
  };

  // Handle contribution: updates project, mints SPL + NFT
  const handleContribute = async (projectId: string) => {
    // Update local project
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, currentAmount: p.currentAmount + 100, contributors: p.contributors + 1 }
          : p
      )
    );

    // Mint SPL reward + NFT badge
    await mintPLYReward(100);
    await mintNFTBadge();
  };

  const getTokenIcon = (symbol: string) => `https://cryptoicons.cc/64/color/${symbol.toLowerCase()}.png`;

  const getCategoryColor = (category: Project['category']) => {
    const colors = {
      cleanup: "bg-blue-500/10 text-blue-700 border-blue-200",
      renewable: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
      conservation: "bg-green-500/10 text-green-700 border-green-200",
      education: "bg-purple-500/10 text-purple-700 border-purple-200",
    };
    return colors[category] || colors.cleanup;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      <MobileHeader title="Eco Dashboard" />

      <main className="p-4 space-y-6">
        {/* Total Balance */}
        <EcoCard variant="eco">
          <EcoCardHeader>
            <div className="flex items-center justify-between">
              <EcoCardTitle className="text-white">Total Portfolio Value</EcoCardTitle>
              <div className="flex items-center space-x-2">
                <EcoButton variant="eco-outline" size="icon" onClick={() => setBalanceVisible(!balanceVisible)}>
                  {balanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                </EcoButton>
                <EcoButton variant="eco-outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                </EcoButton>
              </div>
            </div>
          </EcoCardHeader>
          <EcoCardContent>
            <div className="space-y-2 text-white font-bold text-3xl">
              {balanceVisible ? `$${balances.reduce((sum, b) => sum + b.usdValue, 0).toLocaleString()}` : "••••••"}
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Projects */}
        <div className="space-y-4">
          {projects.map((project) => (
            <EcoCard key={project.id} variant="elevated">
              <div className="relative">
                <div className="aspect-[2/1] bg-gradient-to-br from-eco-primary-light/20 to-eco-primary/10 rounded-t-2xl flex items-center justify-center">
                  <p className="text-center text-xs text-muted-foreground">Project Image</p>
                </div>
                <Badge className={`absolute top-3 right-3 ${getCategoryColor(project.category)}`}>
                  {project.category}
                </Badge>
              </div>

              <EcoCardContent>
                <EcoCardHeader>
                  <EcoCardTitle>{project.title}</EcoCardTitle>
                  <p>{project.description}</p>
                </EcoCardHeader>

                <div className="mt-4 flex justify-between items-center">
                  <p>{project.currentAmount} / {project.targetAmount}</p>
                  <EcoButton variant="eco" onClick={() => handleContribute(project.id)}>
                    <Heart className="w-4 h-4" /> Contribute
                  </EcoButton>
                </div>
              </EcoCardContent>
            </EcoCard>
          ))}
        </div>

        {/* Tabs: Balances + NFT Badges */}
        <Tabs defaultValue="balances" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="balances">Balances</TabsTrigger>
            <TabsTrigger value="badges">NFT Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="balances" className="space-y-3">
            {balances.map((b) => (
              <EcoCard key={b.symbol} variant="elevated">
                <EcoCardContent className="flex items-center space-x-3">
                  <img src={getTokenIcon(b.symbol)} className="w-10 h-10 rounded-full" alt={b.symbol} />
                  <div>
                    <p className="font-semibold">{b.symbol}</p>
                    <p className="text-sm text-muted-foreground">
                      {balanceVisible ? b.amount.toLocaleString() : "••••••"}
                    </p>
                  </div>
                </EcoCardContent>
              </EcoCard>
            ))}
          </TabsContent>

          <TabsContent value="badges" className="grid grid-cols-2 gap-4">
            {nftBadges.map((badge) => (
              <EcoCard key={badge.name} variant="elevated">
                <EcoCardContent className="flex flex-col items-center space-y-2">
                  <img src={badge.image} className="w-16 h-16 rounded-full" alt={badge.name} />
                  <p className="font-medium">{badge.name}</p>
                </EcoCardContent>
              </EcoCard>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
