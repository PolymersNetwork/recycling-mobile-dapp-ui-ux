"use client";

import { useState, useRef } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useRecycling } from "@/contexts/RecyclingContext";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ParticleEngine, triggerParticles } from "@/components/ParticleEngine";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";
import { getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";

interface MarketplaceProps {
  walletKeypair: any;
  plyMint: PublicKey;
  candyMachineId: PublicKey;
}

export function Marketplace({ walletKeypair, plyMint, candyMachineId }: MarketplaceProps) {
  const { plyBalance, crtBalance, badges, refreshBalances } = useRecycling();
  const counterRefs = {
    ply: useRef<HTMLDivElement>(null),
    crt: useRef<HTMLDivElement>(null),
  };

  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(walletKeypair))
    .use(bundlrStorage({ address: "https://devnet.bundlr.network", providerUrl: connection.rpcEndpoint }));

  const wallet = walletKeypair.publicKey;

  const items = [
    { id: 1, title: "Carbon Credits", price: 50, currency: "PLY", type: "credit" },
    { id: 2, title: "Eco Water Bottle", price: 25, currency: "CRT", type: "product" },
    { id: 3, title: "Tree Planting", price: 100, currency: "PLY", type: "donation" },
  ];

  const handlePurchase = async (item: typeof items[0]) => {
    try {
      // 1️⃣ Mint SPL token reward (PLY/CRT)
      if (item.currency === "PLY") {
        const ata = await getOrCreateAssociatedTokenAccount(connection, walletKeypair, plyMint, wallet);
        await mintTo(connection, walletKeypair, plyMint, ata.address, walletKeypair, item.price);
      }

      // 2️⃣ Mint NFT badge using Candy Machine
      await metaplex.candyMachines().mint({ candyMachine: candyMachineId, payer: walletKeypair });

      // 3️⃣ Refresh local balances & badges
      await refreshBalances();

      // 4️⃣ Trigger particle + badge combo effects
      const ref = item.currency === "PLY" ? counterRefs.ply.current! : counterRefs.crt.current!;
      triggerParticles(ref, "combo");
    } catch (err) {
      console.error("Purchase failed:", err);
      alert("Transaction failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      <ParticleEngine />
      <MobileHeader title="Marketplace" />

      <main className="p-4 space-y-6">
        {/* Token Counters */}
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

        {/* Marketplace Items */}
        <div className="grid gap-4">
          {items.map((item) => (
            <EcoCard key={item.id} variant="elevated">
              <EcoCardHeader>
                <EcoCardTitle className="flex justify-between items-center">
                  {item.title}
                  <Badge variant="secondary">{item.type}</Badge>
                </EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-eco-primary">{item.price} {item.currency}</span>
                  <EcoButton size="sm" onClick={() => handlePurchase(item)}>
                    <ShoppingCart className="w-4 h-4" /> Buy
                  </EcoButton>
                </div>
              </EcoCardContent>
            </EcoCard>
          ))}
        </div>

        {/* Badge Showcase */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Your Badges</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex flex-wrap gap-4">
            {badges.map((badge) => (
              <Badge
                key={badge.id}
                variant={badge.unlocked ? "default" : "secondary"}
                onClick={(e) => triggerParticles(e.currentTarget, badge.rarity)}
                className="cursor-pointer transform transition-transform hover:scale-110"
              >
                {badge.name}
              </Badge>
            ))}
          </EcoCardContent>
        </EcoCard>
      </main>
    </div>
  );
}
