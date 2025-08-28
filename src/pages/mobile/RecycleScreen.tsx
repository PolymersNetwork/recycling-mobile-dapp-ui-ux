"use client";

import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import Confetti from "react-native-confetti-cannon";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS } from "react-native-reanimated";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { actions, Metaplex } from "@metaplex/js";

import { useRecycling } from "@/contexts/RecyclingContext";
import { useTheme } from "@/theme/theme";
import { EcoCard, EcoCardHeader, EcoCardTitle, EcoCardContent } from "@/components/ui/eco-card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { Button } from "@/components/ui/button";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PLY_MINT = new PublicKey(process.env.NEXT_PUBLIC_PLY_MINT!);
const CANDY_MACHINE_ID = new PublicKey(process.env.NEXT_PUBLIC_CANDY_MACHINE_ID!);

const rarityColors: Record<string, string> = {
  legendary: "#FFD700",
  epic: "#4B7BFF",
  rare: "#00FF7F",
  common: "#B0B0B0",
};

export function RecycleScreen() {
  const { colors } = useTheme();
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const { plyBalance, crtBalance, units, badges, logRecycleUnit, streakDays, level } = useRecycling();

  const [showConfetti, setShowConfetti] = useState(false);
  const [coinBursts, setCoinBursts] = useState<{ x: number; y: number; color: string }[]>([]);

  const connection = new Connection(RPC_URL, "confirmed");
  const metaplex = Metaplex.make(connection);

  const animatedPLY = useSharedValue(plyBalance);
  const animatedCRT = useSharedValue(crtBalance);

  // Animate token counters
  useEffect(() => {
    animatedPLY.value = withTiming(plyBalance, { duration: 800 });
    animatedCRT.value = withTiming(crtBalance, { duration: 800 });
  }, [plyBalance, crtBalance]);

  const spawnCoinBurst = (x: number, y: number, color: string) => {
    const newCoins = Array.from({ length: 12 }, () => ({ x, y, color }));
    setCoinBursts((prev) => [...prev, ...newCoins]);
  };

  const handleRecycleScan = async () => {
    logRecycleUnit({ city: "New York", lat: 0, lng: 0 });
    setShowConfetti(true);

    // Mint PLY reward on-chain
    if (publicKey && signTransaction) {
      try {
        const ata = await getOrCreateAssociatedTokenAccount(connection, publicKey, PLY_MINT, publicKey);
        const tx = new Transaction().add(
          mintTo({ mint: PLY_MINT, destination: ata.address, amount: 10, authority: publicKey, programId: TOKEN_PROGRAM_ID })
        );
        const signedTx = await signTransaction(tx);
        await sendTransaction(signedTx, connection);
      } catch (err) {
        console.error("Failed to mint PLY:", err);
      }
    }

    // Mint NFT badge via Candy Machine
    if (publicKey) {
      try {
        const { mintOneToken } = actions;
        const nft = await mintOneToken({ connection, wallet: { publicKey, signTransaction }, candyMachine: CANDY_MACHINE_ID });
        // Trigger coin + sparkle burst at badge position
        const badgeX = Math.random() * (SCREEN_WIDTH - 50); // example random position
        const badgeY = 200; // approximate vertical position
        const rarityColor = rarityColors["legendary"]; // you can map based on nft metadata
        spawnCoinBurst(badgeX, badgeY, rarityColor);
      } catch (err) {
        console.error("Candy Machine mint failed:", err);
      }
    }

    setTimeout(() => setShowConfetti(false), 3000);
  };

  const renderCoin = (coin: { x: number; y: number; color: string }, index: number) => {
    const translateY = useSharedValue(coin.y);
    const translateX = useSharedValue(coin.x + (Math.random() - 0.5) * 50);
    const rotate = useSharedValue(Math.random() * 360);

    translateY.value = withTiming(translateY.value + 300, { duration: 1000 + Math.random() * 500, easing: Easing.out(Easing.exp) }, () => {
      runOnJS(setCoinBursts)((prev) => prev.filter((_, i) => i !== index));
    });

    const animatedStyle = useAnimatedStyle(() => ({
      position: "absolute",
      top: 0,
      left: 0,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
      ],
      opacity: withTiming(0, { duration: 1200 }),
    }));

    return (
      <Animated.View key={index} style={animatedStyle}>
        <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: coin.color }} />
      </Animated.View>
    );
  };

  const renderBadge = (badge: any) => {
    const scale = useSharedValue(1);
    useEffect(() => {
      scale.value = withTiming(1.5, { duration: 300 });
      setTimeout(() => { scale.value = withTiming(1, { duration: 300 }); }, 300);
    }, []);

    const badgeStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Animated.View key={badge.id} style={[{ margin: 4 }, badgeStyle]}>
        <TouchableOpacity
          onPress={() => {
            alert(`Unlocked: ${badge.unlockedAt || "Locked"}\nRarity: ${badge.rarity}`);
            // spawn coin burst at badge location
            const badgeX = Math.random() * (SCREEN_WIDTH - 50);
            const badgeY = 200; // Example vertical position
            const color = rarityColors[badge.rarity] || "#FFF";
            spawnCoinBurst(badgeX, badgeY, color);
          }}
        >
          <Badge variant={badge.unlocked ? "default" : "secondary"}>{badge.name} ({badge.rarity})</Badge>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <MobileHeader title="Recycle Dashboard" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* Scan Panel */}
        <EcoCard variant="eco" padding="sm">
          <EcoCardContent>
            <Text style={{ color: colors.text, fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>Scan Plastic</Text>
            <Button onPress={handleRecycleScan}>Scan + Earn PLY</Button>
          </EcoCardContent>
        </EcoCard>

        {/* Balances */}
        <EcoCard padding="sm" variant="gradient">
          <EcoCardContent>
            <Animated.Text style={{ color: colors.text }}>
              PLY: {animatedPLY.value.toFixed(0)}
            </Animated.Text>
            <Animated.Text style={{ color: colors.text }}>
              CRT: {animatedCRT.value.toFixed(0)}
            </Animated.Text>
            <Text style={{ color: colors.text }}>Units Recycled: {units}</Text>
            <Text style={{ color: colors.text }}>Level: {level} | Streak: {streakDays} days</Text>
          </EcoCardContent>
        </EcoCard>

        {/* NFT Badges */}
        <EcoCard padding="sm">
          <EcoCardHeader>
            <EcoCardTitle>NFT Badges</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {badges.map(renderBadge)}
          </EcoCardContent>
        </EcoCard>

        {/* Confetti & Coin Bursts */}
        {showConfetti && <Confetti count={200} origin={{ x: -10, y: 0 }} />}
        {coinBursts.map(renderCoin)}
      </ScrollView>
    </View>
  );
}
