"use client";

import React, { useRef, useState } from "react";
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

export function Marketplace() {
  const { walletKeypair, candyMachineId, plyMint, walletConnected } = useWallet();
  const { plyBalance, crtBalance, badges, refreshBalances } = useRecycling();

  const counterRefs = {
    ply: useRef<View>(null),
    crt: useRef<View>(null),
  };

  const particleRef = useRef<ParticleEngine>(null);
  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");

  const metaplex = walletKeypair
    ? Metaplex.make(connection)
        .use(keypairIdentity(walletKeypair))
        .use(bundlrStorage({ address: "https://devnet.bundlr.network", providerUrl: connection.rpcEndpoint }))
    : null;

  const items = [
    { id: 1, title: "Carbon Credits", price: 50, currency: "PLY", type: "credit" },
    { id: 2, title: "Eco Water Bottle", price: 25, currency: "CRT", type: "product" },
    { id: 3, title: "Tree Planting", price: 100, currency: "PLY", type: "donation" },
  ];

  const [purchaseInProgress, setPurchaseInProgress] = useState(false);

  const handlePurchase = async (item: typeof items[0]) => {
    if (!walletConnected || !walletKeypair || !metaplex) return;

    try {
      setPurchaseInProgress(true);

      // 1️⃣ Mint SPL token reward
      const ata = await getOrCreateAssociatedTokenAccount(
        connection,
        walletKeypair,
        plyMint,
        walletKeypair.publicKey
      );
      if (item.currency === "PLY") {
        await mintTo(connection, walletKeypair, plyMint, ata.address, walletKeypair, item.price);
      }

      // 2️⃣ Mint NFT badge via Candy Machine
      await metaplex.candyMachines().mint({ candyMachine: candyMachineId, payer: walletKeypair });

      // 3️⃣ Refresh balances
      await refreshBalances();

      // 4️⃣ Trigger particle combo
      const ref = item.currency === "PLY" ? counterRefs.ply.current! : counterRefs.crt.current!;
      triggerParticles(ref, "combo");
    } catch (err) {
      console.error("Purchase failed:", err);
    } finally {
      setPurchaseInProgress(false);
    }
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-background to-muted">
      <ParticleEngine ref={particleRef} />
      <MobileHeader title="Marketplace" />
      <ScrollView className="p-4 space-y-6">

        {/* Counters */}
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

        {/* Marketplace Items */}
        {items.map(item => (
          <EcoCard key={item.id} variant="elevated">
            <EcoCardHeader>
              <EcoCardTitle className="flex-row justify-between">
                {item.title} <Badge variant="secondary">{item.type}</Badge>
              </EcoCardTitle>
            </EcoCardHeader>
            <EcoCardContent className="flex-row justify-between items-center">
              <AnimatedCounter value={item.price} suffix={` ${item.currency}`} />
              <EcoButton onPress={() => handlePurchase(item)} disabled={purchaseInProgress}>
                {purchaseInProgress ? "Processing..." : "Buy"}
              </EcoButton>
            </EcoCardContent>
          </EcoCard>
        ))}

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
