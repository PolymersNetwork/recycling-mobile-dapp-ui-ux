"use client";

import React, { useState, useEffect, useRef } from "react";
import { ScrollView, View, Text, Animated, Easing, Dimensions } from "react-native";
import Confetti from "react-native-confetti-cannon";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { actions } from "@metaplex/js";

import { useTheme } from "@/theme/theme";
import { EcoCard, EcoCardHeader, EcoCardTitle, EcoCardContent } from "@/components/ui/eco-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { ParticleEngine } from "@/components/animations/ParticleEngine"; // reusable particle system

import type { Badge as NFTBadge, Project } from "@/types";

// Constants
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PLY_MINT = new PublicKey(process.env.NEXT_PUBLIC_PLY_MINT!);
const CANDY_MACHINE_ID = new PublicKey(process.env.NEXT_PUBLIC_CANDY_MACHINE_ID!);
const SCREEN_WIDTH = Dimensions.get("window").width;

// Mock projects
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

export function RecycleScreen() {
  const { colors } = useTheme();
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const connection = new Connection(RPC_URL, "confirmed");

  const [plyBalance, setPlyBalance] = useState(0);
  const [crtBalance, setCrtBalance] = useState(0);
  const [units, setUnits] = useState(0);
  const [badges, setBadges] = useState<NFTBadge[]>([]);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [showConfetti, setShowConfetti] = useState(false);

  // Animated counters
  const plyAnim = useRef(new Animated.Value(0)).current;
  const crtAnim = useRef(new Animated.Value(0)).current;

  // Level/Streak state
  const [level, setLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState(0); // 0-100
  const [streakDays, setStreakDays] = useState(0);
  const [streakProgress, setStreakProgress] = useState(0); // 0-100

  const particleEngineRef = useRef<any>(null);

  // Fetch on-chain SPL balances
  const fetchBalances = async () => {
    if (!publicKey) return;
    try {
      const ata = await getOrCreateAssociatedTokenAccount(connection, publicKey, PLY_MINT, publicKey);
      const balance = Number(ata.amount);
      setPlyBalance(balance);
      Animated.timing(plyAnim, { toValue: balance, duration: 800, useNativeDriver: false, easing: Easing.out(Easing.exp) }).start();
    } catch (err) {
      console.error("Failed to fetch PLY balance:", err);
    }
  };

  // Fetch NFT badges from Candy Machine
  const fetchBadges = async () => {
    if (!publicKey) return;
    try {
      const { mintAll } = actions; // placeholder: replace with actual Metaplex query
      const userNFTs = []; // Fetch user's NFTs from Candy Machine collection
      setBadges(userNFTs);
    } catch (err) {
      console.error("Failed to fetch badges:", err);
    }
  };

  useEffect(() => {
    fetchBalances();
    fetchBadges();
  }, [publicKey]);

  // Handle contribution
  const handleContribute = async (projectId: string) => {
    if (!publicKey || !signTransaction) return;

    try {
      // 1️⃣ Update local project
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, currentAmount: p.currentAmount + 100, contributors: p.contributors + 1 }
            : p
        )
      );

      // 2️⃣ Mint PLY reward
      const ata = await getOrCreateAssociatedTokenAccount(connection, publicKey, PLY_MINT, publicKey);
      const tx = new Transaction().add(
        mintTo({
          mint: PLY_MINT,
          destination: ata.address,
          amount: 100,
          authority: publicKey,
          programId: TOKEN_PROGRAM_ID,
        })
      );
      const signedTx = await signTransaction(tx);
      await sendTransaction(signedTx, connection);

      // 3️⃣ Animate coin burst from counter
      particleEngineRef.current?.emitCoins("plyCounter", 100);

      // 4️⃣ Mint NFT badge via Candy Machine
      const { mintOneToken } = actions;
      await mintOneToken({ connection, wallet: { publicKey, signTransaction }, candyMachine: CANDY_MACHINE_ID });

      // 5️⃣ Trigger badge sparkle + bounce
      particleEngineRef.current?.emitSparkles("latestBadge", "legendary");

      // 6️⃣ Refresh balances & badges
      fetchBalances();
      fetchBadges();

      // 7️⃣ Update level and streak dynamically
      const newLevelProgress = Math.min((plyBalance + 100) % 1000 / 10, 100); // example
      setLevelProgress(newLevelProgress);
      if (newLevelProgress === 100) setLevel(level + 1);

      const newStreak = streakDays + 1;
      setStreakDays(newStreak);
      setStreakProgress(Math.min((newStreak % 30) / 30 * 100, 100));

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

    } catch (err) {
      console.error("Contribution failed:", err);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <MobileHeader title="Recycle Dashboard" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>

        {/* Animated PLY/CRT Counters */}
        <EcoCard padding="sm" variant="gradient">
          <EcoCardContent>
            <Text style={{ color: colors.text, fontWeight: "bold" }}>PLY: </Text>
            <Animated.Text style={{ color: colors.text, fontSize: 24 }}>
              {plyAnim.interpolate({ inputRange: [0, plyBalance], outputRange: [0, plyBalance], extrapolate: "clamp" }).__getValue().toFixed(0)}
            </Animated.Text>
            <Text style={{ color: colors.text, fontWeight: "bold" }}>CRT: {crtBalance}</Text>
          </EcoCardContent>
        </EcoCard>

        {/* Level & Streak Progress */}
        <EcoCard padding="sm">
          <EcoCardHeader>
            <EcoCardTitle>Level & Streak</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <Text style={{ color: colors.text }}>Level {level}</Text>
            <ProgressBar value={levelProgress} color="gold" />
            <Text style={{ color: colors.text }}>Streak: {streakDays} days</Text>
            <ProgressBar value={streakProgress} color="cyan" />
          </EcoCardContent>
        </EcoCard>

        {/* NFT Badges */}
        <EcoCard padding="sm">
          <EcoCardHeader>
            <EcoCardTitle>NFT Badges</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {badges.map((badge) => (
              <Badge key={badge.id} variant="default" id="latestBadge">
                {badge.name} ({badge.rarity})
              </Badge>
            ))}
          </EcoCardContent>
        </EcoCard>

        {/* Projects */}
        {projects.map((project) => (
          <EcoCard key={project.id} variant="elevated">
            <EcoCardContent>
              <EcoCardHeader>
                <EcoCardTitle>{project.title}</EcoCardTitle>
                <Text>{project.description}</Text>
              </EcoCardHeader>
              <Button onPress={() => handleContribute(project.id)}>Contribute + Earn</Button>
            </EcoCardContent>
          </EcoCard>
        ))}

        {/* Particle engine for coins + sparkles + bounce */}
        <ParticleEngine ref={particleEngineRef} />

        {showConfetti && <Confetti count={200} origin={{ x: -10, y: 0 }} />}
      </ScrollView>
    </View>
  );
}
