"use client";

import React, { useRef } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useRecycling } from "@/contexts/RecyclingContext";
import { ParticleEngine, ParticleRef } from "@/components/ui/ParticleEngine";

export function Marketplace() {
  const { marketplaceItems, purchaseItem, loading } = useMarketplace();
  const { plyBalance, crtBalance, addTokens, addBadge, badges } = useRecycling();
  const particleRef = useRef<ParticleRef>(null);

  const handlePurchase = async (itemId: string) => {
    try {
      const item = await purchaseItem(itemId);

      // Update token balances
      if (item.currency === "PLY") {
        addTokens(item.price, 0, 0); // PLY, CRT, Units
        particleRef.current?.burstCoins({ count: 25, color: "#FFD700" });
      }
      if (item.currency === "CRT") {
        addTokens(0, item.price, 0);
        particleRef.current?.burstCoins({ count: 20, color: "#00FFAA" });
      }

      // Randomly grant an NFT badge reward
      const grantNFT = Math.random() < 0.3; // 30% chance to get NFT badge
      if (grantNFT) {
        const newBadge = {
          id: Date.now().toString(),
          name: `Eco Badge #${badges.length + 1}`,
          emoji: "🏆",
          rarity: ["common", "rare", "epic", "legendary"][Math.floor(Math.random() * 4)] as any,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        };
        addBadge(newBadge);

        // Trigger sparkle animation
        particleRef.current?.sparkleBadge({
          count: 20,
          color: newBadge.rarity === "legendary" ? "#FFD700" :
                 newBadge.rarity === "epic" ? "#4B6EE2" :
                 newBadge.rarity === "rare" ? "#00FFAA" : "#AAAAAA",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20 relative">
      {/* Particle Engine */}
      <ParticleEngine ref={particleRef} />

      <MobileHeader title="Marketplace" />

      <main className="p-4 space-y-6">
        {marketplaceItems.map((item) => (
          <EcoCard key={item.id} variant="elevated">
            <EcoCardHeader>
              <EcoCardTitle>{item.title}</EcoCardTitle>
            </EcoCardHeader>
            <EcoCardContent className="space-y-2">
              <p>{item.description}</p>
              <p>Price: {item.price} {item.currency}</p>
              <EcoButton
                variant="eco"
                disabled={loading || !item.available}
                onClick={() => handlePurchase(item.id)}
              >
                {item.available ? "Buy" : "Sold Out"}
              </EcoButton>
            </EcoCardContent>
          </EcoCard>
        ))}
      </main>
    </div>
  );
}
