"use client";

import React, { useRef, useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import { MobileHeader } from "../components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "../components/ui/eco-card";
import { EcoButton } from "../components/ui/eco-button";
import { Badge } from "../components/ui/badge";
import { AnimatedCounter } from "../components/ui/AnimatedCounter";
import { ParticleEngine, triggerParticles } from "../components/ui/ParticleEngine";
import { useRecycling } from "../contexts/RecyclingContext";
import { useWallet } from "../contexts/WalletProvider";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

export function RecycleScreen() {
  const { walletKeypair, candyMachineId, plyMint, walletConnected } = useWallet();
  const { plyBalance, crtBalance, badges, units, logRecycleUnit, refreshBalances } = useRecycling();

  const counterRefs = {
    ply: useRef<View>(null),
    crt: useRef<View>(null),
  };

  const particleRef = useRef<ParticleEngine>(null);
  const [contributionInProgress, setContributionInProgress] = useState(false);

  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
    "confirmed"
  );

  const metaplex = walletKeypair
    ? Metaplex.make(connection)
        .use(keypairIdentity(walletKeypair))
        .use(bundlrStorage({ address: "https://devnet.bundlr.network", providerUrl: connection.rpcEndpoint }))
    : null;

  const handleRecycleScan = async () => {
    // Local unit log
    logRecycleUnit({ city: "Local City", lat: 0, lng: 0 });

    // Particle bursts
    if (counterRefs.ply.current) triggerParticles(counterRefs.ply.current, "coin");
    if (counterRefs.crt.current) triggerParticles(counterRefs.crt.current, "coin");

    if (!walletConnected || !walletKeypair || !metaplex) return;

    try {
      setContributionInProgress(true);

      // 1️⃣ Mint SPL token reward
      const ata = await getOrCreateAssociatedTokenAccount(connection, walletKeypair, plyMint, walletKeypair.publicKey);
      await mintTo(connection, walletKeypair, plyMint, ata.address, walletKeypair, 100);

      // 2️⃣ Mint NFT badge via Candy Machine
      await metaplex.candyMachines().mint({ candyMachine: candyMachineId, payer: walletKeypair });

      // 3️⃣ Refresh balances and badges
      await refreshBalances();

      // 4️⃣ Trigger badge sparkle + bounce
      badges.forEach(b => {
        const badgeEl = document.getElementById(`badge-${b.id}`);
        if (badgeEl) triggerParticles(badgeEl, b.rarity);
      });
    } catch (err) {
      console.error("On-chain contribution failed:", err);
    } finally {
      setContributionInProgress(false);
    }
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-background to-muted">
      <ParticleEngine ref={particleRef} />
      <MobileHeader title="Recycle Dashboard" />

      <ScrollView className="p-4 space-y-6">
        {/* Animated Counters */}
        <EcoCard>
          <EcoCardContent className="flex-row justify-around">
            <View ref={counterRefs.ply} className="items-center">
              <AnimatedCounter value={plyBalance} suffix=" PLY" />
              <Badge variant="secondary">PLY Balance</Badge>
            </View>
            <View ref={counterRefs.crt} className="items-center">
              <AnimatedCounter value={crtBalance} suffix=" CRT" />
              <Badge variant="secondary">CRT Balance</Badge>
            </View>
          </EcoCardContent>
        </EcoCard>

        {/* Scan / Contribute */}
        <EcoCard>
          <EcoCardContent>
            <EcoButton onPress={handleRecycleScan} disabled={contributionInProgress}>
              {contributionInProgress ? "Processing..." : "Scan & Contribute"}
            </EcoButton>
          </EcoCardContent>
        </EcoCard>

        {/* Badges */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Your NFT Badges</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex flex-wrap gap-2">
            {badges.map(badge => (
              <Badge
                key={badge.id}
                id={`badge-${badge.id}`}
                variant={badge.unlocked ? "default" : "secondary"}
                onPress={() => triggerParticles(document.getElementById(`badge-${badge.id}`)!, badge.rarity)}
              >
                {badge.name}
              </Badge>
            ))}
          </EcoCardContent>
        </EcoCard>
      </ScrollView>
    </View>
  );
}
