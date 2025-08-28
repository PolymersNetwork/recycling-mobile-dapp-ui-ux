"use client";

import { useState, useEffect } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Plus, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { TokenBalance, NFTBadge } from "@/types";

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PLY_MINT = new PublicKey("PLYTokenMintAddressHere"); // Replace with your PLY SPL token mint
const NFT_COLLECTION_MINT = new PublicKey("NFTCollectionMintAddressHere"); // Replace with your NFT collection mint

export function Portfolio() {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [nftBadges, setNftBadges] = useState<NFTBadge[]>([]);

  const connection = new Connection(RPC_URL, "confirmed");

  // Fetch SPL token balances for PLY and SOL
  const fetchBalances = async () => {
    if (!publicKey) return;

    try {
      // Get PLY balance
      const plyAccount = await getOrCreateAssociatedTokenAccount(connection, publicKey, PLY_MINT, publicKey);
      const plyBalance = Number(plyAccount.amount);

      // Get SOL balance
      const solBalance = await connection.getBalance(publicKey) / 1e9;

      setBalances([
        { symbol: "PLY", amount: plyBalance, usdValue: 0, change24h: 0 },
        { symbol: "SOL", amount: solBalance, usdValue: 0, change24h: 0 },
      ]);
    } catch (err) {
      console.error("Failed to fetch balances:", err);
    }
  };

  // Fetch NFT badges (mock for now)
  const fetchNFTBadges = async () => {
    if (!publicKey) return;

    setNftBadges([
      { name: "Eco Warrior", image: "/badges/eco-warrior.png", mintedAt: Date.now() - 86400000 },
      { name: "Ocean Hero", image: "/badges/ocean-hero.png", mintedAt: Date.now() - 3600000 },
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

  // Mint PLY SPL reward
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
      console.error("Failed to mint PLY reward:", err);
    }
  };

  // Mint NFT badge
  const mintNFTBadge = async (badgeName: string, badgeImage: string) => {
    if (!publicKey) return;

    // TODO: Replace with real Metaplex on-chain minting
    setNftBadges((prev) => [{ name: badgeName, image: badgeImage, mintedAt: Date.now() }, ...prev]);
  };

  const getTokenIcon = (symbol: string) => `https://cryptoicons.cc/64/color/${symbol.toLowerCase()}.png`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      <MobileHeader title="Portfolio" />

      <main className="p-4 space-y-6">
        {/* Total Balance */}
        <EcoCard variant="eco">
          <EcoCardHeader>
            <div className="flex items-center justify-between">
              <EcoCardTitle className="text-white">Total Portfolio Value</EcoCardTitle>
              <div className="flex items-center space-x-2">
                <EcoButton
                  variant="eco-outline"
                  size="icon"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="h-8 w-8 border-white/20 text-white hover:bg-white/10"
                >
                  {balanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                </EcoButton>

                <EcoButton
                  variant="eco-outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-8 w-8 border-white/20 text-white hover:bg-white/10"
                >
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

        {/* Wallet Actions */}
        <div className="grid grid-cols-2 gap-3">
          <EcoButton variant="eco" className="h-12" onClick={() => mintPLYReward(50)}>
            <Plus className="w-4 h-4" />
            Claim PLY Reward
          </EcoButton>

          <EcoButton variant="eco-outline" className="h-12" onClick={() => mintNFTBadge("Eco Hero", "/badges/eco-hero.png")}>
            <Wallet className="w-4 h-4" />
            Mint NFT Badge
          </EcoButton>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="balances" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="balances">Balances</TabsTrigger>
            <TabsTrigger value="badges">NFT Badges</TabsTrigger>
          </TabsList>

          {/* Token Balances */}
          <TabsContent value="balances" className="space-y-3">
            {balances.map((balance) => (
              <EcoCard key={balance.symbol} variant="elevated">
                <EcoCardContent>
                  <div className="flex items-center space-x-3">
                    <img src={getTokenIcon(balance.symbol)} className="w-10 h-10 rounded-full" alt={balance.symbol} />
                    <div>
                      <p className="font-semibold">{balance.symbol}</p>
                      <p className="text-sm text-muted-foreground">
                        {balanceVisible ? balance.amount.toLocaleString() : "••••••"}
                      </p>
                    </div>
                  </div>
                </EcoCardContent>
              </EcoCard>
            ))}
          </TabsContent>

          {/* NFT Badges */}
          <TabsContent value="badges" className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {nftBadges.map((badge) => (
                <EcoCard key={badge.name} variant="elevated">
                  <EcoCardContent className="flex flex-col items-center space-y-2">
                    <img src={badge.image} className="w-16 h-16 rounded-full" alt={badge.name} />
                    <p className="font-medium">{badge.name}</p>
                  </EcoCardContent>
                </EcoCard>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
