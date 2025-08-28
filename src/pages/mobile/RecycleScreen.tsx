"use client";

import React, { useState, useEffect, useRef } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import Confetti from "react-native-confetti-cannon";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Metaplex, actions } from "@metaplex/js";
import { EcoCard, EcoCardHeader, EcoCardTitle, EcoCardContent } from "@/components/ui/eco-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { useTheme } from "@/theme/theme";

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PLY_MINT = new PublicKey(process.env.NEXT_PUBLIC_PLY_MINT || "");
const CANDY_MACHINE_ID = new PublicKey(process.env.NEXT_PUBLIC_CANDY_MACHINE_ID || "");

const rarityRank: Record<string, number> = { legendary: 4, epic: 3, rare: 2, common: 1 };

export function RecycleScreen() {
  const { colors } = useTheme();
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const connection = new Connection(RPC_URL, "confirmed");
  const metaplex = Metaplex.make(connection);

  const [plyBalance, setPlyBalance] = useState(0);
  const [crtBalance, setCrtBalance] = useState(0);
  const [units, setUnits] = useState(0);
  const [badges, setBadges] = useState<any[]>([]);
  const [level, setLevel] = useState(1);
  const [streakDays, setStreakDays] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<any>(null);

  // Fetch SPL PLY balance
  const fetchPlyBalance = async () => {
    if (!publicKey) return;
    try {
      const ata = await getOrCreateAssociatedTokenAccount(connection, publicKey, PLY_MINT, publicKey);
      setPlyBalance(Number(ata.amount));
    } catch (err) {
      console.error("Failed to fetch PLY balance:", err);
    }
  };

  // Fetch NFTs from Candy Machine
  const fetchBadges = async () => {
    if (!publicKey) return;
    try {
      const nftAccounts = await metaplex.nfts().findAllByOwner({ owner: publicKey });
      const candyNFTs = nftAccounts.filter(nft => nft.collection?.key.equals(CANDY_MACHINE_ID));
      setBadges(
        candyNFTs.map(nft => ({
          id: nft.mint.toBase58(),
          name: nft.name,
          image: nft.metadataUri,
          rarity: nft.attributes?.find((a: any) => a.trait_type === "Rarity")?.value || "common",
          unlockedAt: nft.edition?.timestamp,
          unlocked: true,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch NFT badges:", err);
    }
  };

  useEffect(() => {
    fetchPlyBalance();
    fetchBadges();
  }, [publicKey]);

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
      const signedTx = await signTransaction(tx);
      const txId = await sendTransaction(signedTx, connection);
      await connection.confirmTransaction(txId, "confirmed");
      setPlyBalance(prev => prev + amount);
    } catch (err) {
      console.error("Failed to mint PLY:", err);
    }
  };

  const mintNFTBadge = async () => {
    if (!publicKey) return;
    try {
      const { mintOneToken } = actions;
      await mintOneToken({ connection, wallet: { publicKey, signTransaction }, candyMachine: CANDY_MACHINE_ID });
      await fetchBadges();
    } catch (err) {
      console.error("Failed to mint NFT badge:", err);
    }
  };

  const handleRecycle = async () => {
    // 1️⃣ Update local units & streak
    setUnits(prev => prev + 1);
    setStreakDays(prev => prev + 1);

    // 2️⃣ Animate confetti
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);

    // 3️⃣ Mint rewards
    await mintPLY(10);
    await mintNFTBadge();

    // 4️⃣ Level up logic
    const newLevel = Math.floor(units / 10) + 1;
    setLevel(newLevel);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <MobileHeader title="Recycle Dashboard" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>

        {/* Scan Panel */}
        <EcoCard variant="eco" padding="sm">
          <EcoCardContent>
            <Text style={{ color: colors.text, fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
              Scan Plastic
            </Text>
            <Button onPress={handleRecycle}>Scan + Earn PLY</Button>
          </EcoCardContent>
        </EcoCard>

        {/* User Progress */}
        <EcoCard padding="sm">
          <EcoCardHeader>
            <EcoCardTitle>Progress & Streak</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <Text style={{ color: colors.text }}>Level: {level}</Text>
            <ProgressBar value={(units % 10) * 10} />
            <Text style={{ color: colors.text, marginTop: 8 }}>Streak: {streakDays} days</Text>
            <ProgressBar value={(streakDays % 7) * 14.28} />
          </EcoCardContent>
        </EcoCard>

        {/* Balances */}
        <EcoCard padding="sm" variant="gradient">
          <EcoCardContent>
            <Text style={{ color: colors.text }}>PLY Balance: {plyBalance}</Text>
            <Text style={{ color: colors.text }}>CRT Balance: {crtBalance}</Text>
            <Text style={{ color: colors.text }}>Recycled Units: {units}</Text>
          </EcoCardContent>
        </EcoCard>

        {/* NFT Badges */}
        <EcoCard padding="sm">
          <EcoCardHeader>
            <EcoCardTitle>NFT Badges</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {badges
              .sort((a, b) => rarityRank[b.rarity] - rarityRank[a.rarity])
              .map(badge => (
                <TouchableOpacity
                  key={badge.id}
                  onPress={() => alert(`Unlocked: ${badge.unlockedAt || "Locked"}\nRarity: ${badge.rarity}`)}
                >
                  <Badge variant={badge.unlocked ? "default" : "secondary"}>
                    {badge.name} ({badge.rarity})
                  </Badge>
                </TouchableOpacity>
              ))}
          </EcoCardContent>
        </EcoCard>

        {showConfetti && <Confetti ref={confettiRef} count={200} origin={{ x: -10, y: 0 }} />}
      </ScrollView>
    </View>
  );
}
