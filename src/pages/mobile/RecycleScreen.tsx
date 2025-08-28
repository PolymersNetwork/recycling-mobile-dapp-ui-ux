"use client";

import { useState, useRef } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ParticleEngine, ParticleRef } from "@/components/ui/ParticleEngine";
import { useRecycling } from "@/contexts/RecyclingContext";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

interface RecycleScreenProps {
  walletKeypair: any;
  plyMint: PublicKey;
  candyMachineId: PublicKey;
}

export function RecycleScreen({ walletKeypair, plyMint, candyMachineId }: RecycleScreenProps) {
  const { plyBalance, crtBalance, badges, units, logRecycleUnit, refreshBalances } = useRecycling();
  const [isProcessing, setIsProcessing] = useState(false);
  const particleRef = useRef<ParticleRef>(null);

  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
    "confirmed"
  );
  const wallet = walletKeypair.publicKey;

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(walletKeypair))
    .use(bundlrStorage({ address: "https://devnet.bundlr.network", providerUrl: connection.rpcEndpoint }));

  const handleRecycleScan = async () => {
    logRecycleUnit({ city: "Local City", lat: 0, lng: 0 });

    // Trigger particle bursts on counters
    particleRef.current?.burstCoins({ count: 30, color: "#FFD700" }); // PLY
    particleRef.current?.burstCoins({ count: 20, color: "#00FFAA" }); // CRT

    try {
      setIsProcessing(true);

      // Mint SPL tokens (100 PLY per scan)
      const ata = await getOrCreateAssociatedTokenAccount(connection, walletKeypair, plyMint, wallet);
      await mintTo(connection, walletKeypair, plyMint, ata.address, walletKeypair, 100);

      // Mint NFT via Candy Machine
      await metaplex.candyMachines().mint({ candyMachine: candyMachineId, payer: walletKeypair });

      // Refresh balances & badges
      await refreshBalances();

      // Trigger badge sparkle & bounce effects
      badges.forEach(b => particleRef.current?.sparkleBadge({ count: 20, color: "#FFD700" }));
    } catch (err) {
      console.error("Contribution failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20 relative">
      <ParticleEngine ref={particleRef} />
      <MobileHeader title="Recycle Dashboard" />

      <main className="p-4 space-y-6">
        {/* Animated Counters */}
        <EcoCard>
          <EcoCardContent className="flex justify-around">
            <div className="text-center">
              <AnimatedCounter value={plyBalance} suffix=" PLY" />
              <p className="text-xs text-muted-foreground">PLY Balance</p>
            </div>
            <div className="text-center">
              <AnimatedCounter value={crtBalance} suffix=" CRT" />
              <p className="text-xs text-muted-foreground">CRT Balance</p>
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Scan / Contribute Button */}
        <EcoCard>
          <EcoCardContent>
            <EcoButton onClick={handleRecycleScan} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Scan & Contribute"}
            </EcoButton>
          </EcoCardContent>
        </EcoCard>

        {/* Level & Streak Progress */}
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

        {/* NFT Badges */}
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
                onClick={(e) => particleRef.current?.sparkleBadge({ count: 20, color: "#FFD700" })}
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
