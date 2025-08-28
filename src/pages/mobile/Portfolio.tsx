"use client";

import { useState, useEffect } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@solana/wallet-adapter-react";
import { Heart, RefreshCw, Eye, EyeOff } from "lucide-react";
import { Metaplex } from "@metaplex-foundation/js";
import type { TokenBalance, Project, Badge, User } from "@/types";

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PLY_MINT = new PublicKey(process.env.NEXT_PUBLIC_PLY_MINT!);
const CANDY_MACHINE_ID = new PublicKey(process.env.NEXT_PUBLIC_CANDY_MACHINE_ID!);

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
  const [nftBadges, setNftBadges] = useState<Badge[]>([]);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [user, setUser] = useState<User>({
    id: "1",
    email: "eco@user.com",
    name: "Eco User",
    level: 3,
    totalTokens: 1240,
    streakDays: 5,
    badges: [],
    createdAt: new Date().toISOString(),
  });

  const connection = new Connection(RPC_URL, "confirmed");
  const metaplex = Metaplex.make(connection);

  // Fetch SPL balances
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
      setUser(prev => ({ ...prev, totalTokens: prev.totalTokens + plyBalance }));
    } catch (err) {
      console.error("Failed to fetch balances:", err);
    }
  };

  // Fetch NFT badges with rarity & unlockedAt
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
            icon: metadata?.data?.image || "/badges/default.png",
            rarity: (metadata?.data?.attributes?.find(attr => attr.trait_type === "rarity")?.value as any) || "common",
            unlockedAt: nft.mint ? new Date().toISOString() : undefined,
          };
        })
      );
      const rarityOrder = ["legendary", "epic", "rare", "common"];
      badges.sort((a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity));
      setNftBadges(badges);
      setUser(prev => ({ ...prev, badges }));
    } catch (err) {
      console.error("Failed to fetch NFT badges:", err);
    }
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

  const mintPLYReward = async (amount: number) => {
    if (!publicKey || !signTransaction) return;
    try {
      const ata = await getOrCreateAssociatedTokenAccount(connection, publicKey, PLY_MINT, publicKey);
      const tx = new Transaction().add(
        mintTo({ mint: PLY_MINT, destination: ata.address, amount, authority: publicKey, programId: TOKEN_PROGRAM_ID })
      );
      const signedTx = await signTransaction(tx);
      const txId = await sendTransaction(signedTx, connection);
      await connection.confirmTransaction(txId, "confirmed");
      await fetchBalances();
    } catch (err) {
      console.error("Failed to mint PLY reward:", err);
    }
  };

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

  const handleContribute = async (projectId: string) => {
    setProjects(prev =>
      prev.map(p => p.id === projectId ? { ...p, currentAmount: p.currentAmount + 100, contributors: p.contributors + 1 } : p)
    );
    await mintPLYReward(100);
    await mintNFTBadge();
    // Animate token achievement
    const el = document.getElementById("token-achievement");
    if (el) {
      el.classList.add("animate-pulse");
      setTimeout(() => el.classList.remove("animate-pulse"), 1000);
    }
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
      <MobileHeader title="Gamified Eco Dashboard" />
      <main className="p-4 space-y-6">

        {/* User Progress with Level + Streak Bars */}
        <EcoCard>
          <EcoCardHeader className="flex justify-between items-center">
            <EcoCardTitle>{user.name}'s Progress</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="space-y-2">
            <p>Level {user.level}</p>
            <Progress value={(user.totalTokens % 500) / 5} className="h-4" /> {/* Example XP progress */}
            <p>Streak: {user.streakDays} days</p>
            <Progress value={(user.streakDays % 30) * 3.33} className="h-4" /> {/* Example 30-day streak */}
            <p id="token-achievement" className="text-lg font-bold text-eco-primary mt-1">Tokens: {user.totalTokens}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.badges.map(b => (
                <UiBadge key={b.id} className={`capitalize ${b.rarity === "legendary" ? "bg-yellow-500/20 text-yellow-600" :
                                                   b.rarity === "epic" ? "bg-purple-500/20 text-purple-600" :
                                                   b.rarity === "rare" ? "bg-blue-500/20 text-blue-600" :
                                                   "bg-gray-200 text-gray-700"}`} title={`Unlocked: ${b.unlockedAt}`}>
                  {b.name}
                </UiBadge>
              ))}
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Projects */}
        <div className="space-y-4">
          {projects.map(project => (
            <EcoCard key={project.id} variant="elevated">
              <div className="relative">
                <div className="aspect-[2/1] bg-gradient-to-br from-eco-primary-light/20 to-eco-primary/10 rounded-t-2xl flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">Project Image</p>
                </div>
                <UiBadge className={`absolute top-3 right-3 ${getCategoryColor(project.category)}`}>{project.category}</UiBadge>
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
            {balances.map(b => (
              <EcoCard key={b.symbol} variant="elevated">
                <EcoCardContent className="flex items-center space-x-3">
                  <img src={getTokenIcon(b.symbol)} className="w-10 h-10 rounded-full" alt={b.symbol} />
                  <div>
                    <p className="font-semibold">{b.symbol}</p>
                    <p className="text-sm text-muted-foreground">{balanceVisible ? b.amount.toLocaleString() : "••••••"}</p>
                  </div>
                </EcoCardContent>
              </EcoCard>
            ))}
          </TabsContent>

          <TabsContent value="badges" className="grid grid-cols-2 gap-4">
            {nftBadges.map(b => (
              <EcoCard key={b.id} variant="elevated" title={`Rarity: ${b.rarity}`}>
                <EcoCardContent className="flex flex-col items-center space-y-2">
                  <img src={b.icon} className="w-16 h-16 rounded-full" alt={b.name} />
                  <p className="font-medium text-center">{b.name}</p>
                  {b.unlockedAt && <p className="text-xs text-muted-foreground">{new Date(b.unlockedAt).toLocaleDateString()}</p>}
                  <UiBadge className={`capitalize ${b.rarity === "legendary" ? "bg-yellow-500/20 text-yellow-600" :
                                               b.rarity === "epic" ? "bg-purple-500/20 text-purple-600" :
                                               b.rarity === "rare" ? "bg-blue-500/20 text-blue-600" :
                                               "bg-gray-200 text-gray-700"}`}>
                    {b.rarity}
                  </UiBadge>
                </EcoCardContent>
              </EcoCard>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
