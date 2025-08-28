"use client";

import { useState, useRef, useEffect } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ParticleEngine, triggerParticles } from "@/components/ParticleEngine";
import { useRecycling } from "@/contexts/RecyclingContext";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";
import { getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";

interface RecycleScreenProps {
  walletKeypair: any;
  plyMint: PublicKey;
  candyMachineId: PublicKey;
}

export function RecycleScreen({ walletKeypair, plyMint, candyMachineId }: RecycleScreenProps) {
  const { plyBalance, crtBalance, badges, units, logRecycleUnit, refreshBalances } = useRecycling();

  const counterRefs = {
    ply: useRef<HTMLDivElement>(null),
    crt: useRef<HTMLDivElement>(null),
  };

  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");
  const wallet = walletKeypair.publicKey;

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(walletKeypair))
    .use(bundlrStorage({ address: "https://devnet.bundlr.network", providerUrl: connection.rpcEndpoint }));

  const [contributionInProgress, setContributionInProgress] = useState(false);

  const handleRecycleScan = async () => {
    // Log a unit locally
    logRecycleUnit({ city: "Local City", lat: 0, lng: 0 });

    // Animate coin burst on PLY/CRT counters
    if (counterRefs.ply.current) triggerParticles(counterRefs.ply.current, "coin");
    if (counterRefs.crt.current) triggerParticles(counterRefs.crt.current, "coin");

    // Update on-chain SPL token balances & mint Candy Machine NFT
    try {
      setContributionInProgress(true);

      // 1️⃣ Mint SPL token reward (PLY)
      const ata = await getOrCreateAssociatedTokenAccount(connection, walletKeypair, plyMint, wallet);
      await mintTo(connection, walletKeypair, plyMint, ata.address, walletKeypair, 100);

      // 2️⃣ Mint NFT badge via Candy Machine
      await metaplex.candyMachines().mint({ candyMachine: candyMachineId, payer: walletKeypair });

      // 3️⃣ Refresh balances and badges in context
      await refreshBalances();

      // 4️⃣ Trigger badge sparkle + bounce
      badges.forEach(b => triggerParticles(document.getElementById(`badge-${b.id}`)!, b.rarity));

    } catch (err) {
      console.error("On-chain contribution failed:", err);
    } finally {
      setContributionInProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      <ParticleEngine />
      <MobileHeader title="Recycle Dashboard" />

      <main className="p-4 space-y-6">
        {/* Animated Counters */}
        <EcoCard>
          <EcoCardContent className="flex justify-around">
            <div ref={counterRefs.ply} className="text-center">
              <AnimatedCounter value={plyBalance} suffix=" PLY" />
              <p className="text-xs text-muted-foreground">PLY Balance</p>
            </div>
            <div ref={counterRefs.crt} className="text-center">
              <AnimatedCounter value={crtBalance} suffix=" CRT" />
              <p className="text-xs text-muted-foreground">CRT Balance</p>
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Scan / Contribute */}
        <EcoCard>
          <EcoCardContent>
            <EcoButton onClick={handleRecycleScan} disabled={contributionInProgress}>
              {contributionInProgress ? "Processing..." : "Scan & Contribute"}
            </EcoButton>
          </EcoCardContent>
        </EcoCard>

        {/* Level + Streak Progress */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Progress</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <p className="text-sm text-muted-foreground">Level Progress</p>
            <Progress value={(plyBalance % 100) / 100 * 100} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">Streak Progress</p>
            <Progress value={(units.length % 7) / 7 * 100} className="h-3" />
          </EcoCardContent>
        </EcoCard>

        {/* Badges */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Your NFT Badges</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex flex-wrap gap-4">
            {badges.map(badge => (
              <div
                key={badge.id}
                id={`badge-${badge.id}`}
                className="cursor-pointer transform transition-transform hover:scale-110"
                onClick={(e) => triggerParticles(e.currentTarget, badge.rarity)}
              >
                <Badge variant={badge.unlocked ? "default" : "secondary"}>{badge.name}</Badge>
              </div>
            ))}
          </EcoCardContent>
        </EcoCard>
      </main>
    </div>
  );
}
