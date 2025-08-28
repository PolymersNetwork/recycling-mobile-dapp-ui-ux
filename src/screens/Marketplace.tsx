"use client";

import React from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useRecycling } from "@/contexts/RecyclingContext";

export function Marketplace() {
  const { marketplaceItems, purchaseItem, loading } = useMarketplace();
  const { plyBalance, crtBalance, addTokens } = useRecycling();

  const handlePurchase = async (itemId: string) => {
    try {
      const item = await purchaseItem(itemId);

      // Add PLY tokens for eco rewards
      if (item.currency === "PLY") {
        addTokens(item.price, 0, 0); // PLY, CRT, Units
      }

      // TODO: implement NFT rewards if needed
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      <MobileHeader title="Marketplace" />

      <main className="p-4 space-y-6">
        {marketplaceItems.map((item) => (
          <EcoCard key={item.id} variant="elevated">
            <EcoCardHeader>
              <EcoCardTitle>{item.title}</EcoCardTitle>
            </EcoCardHeader>
            <EcoCardContent className="space-y-2">
              <p>{item.description}</p>
              <p>
                Price: {item.price} {item.currency}
              </p>
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
