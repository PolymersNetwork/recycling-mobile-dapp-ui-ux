"use client";

import { useRef } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { usePortfolio } from "@/hooks/usePortfolio";
import { ParticleEngine, ParticleRef } from "@/components/ui/ParticleEngine";

export default function Marketplace() {
  const particleRef = useRef<ParticleRef>(null);
  const { marketplaceItems, purchaseMarketplaceItem } = usePortfolio();

  const handlePurchase = async (itemId: string) => {
    await purchaseMarketplaceItem(itemId);

    // Particle + badge reward
    particleRef.current?.burstCoins({ count: 25, color: "#FFD700" });
    particleRef.current?.sparkleBadge({ count: 10, color: "#4B6EE2" });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "carbon-offset": "bg-blue-500/10 text-blue-700 border-blue-200",
      products: "bg-green-500/10 text-green-700 border-green-200",
      donations: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
    };
    return colors[category] || colors["carbon-offset"];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20 relative">
      <ParticleEngine ref={particleRef} />
      <MobileHeader title="Marketplace" />

      <main className="p-4 space-y-6">
        {marketplaceItems.map(item => (
          <EcoCard key={item.id} variant="elevated">
            <div className="relative">
              <div className="aspect-[2/1] bg-gradient-to-br from-eco-primary-light/20 to-eco-primary/10 rounded-t-2xl flex items-center justify-center">
                <p className="text-xs text-muted-foreground">Item Image</p>
              </div>
              <UiBadge className={`absolute top-3 right-3 ${getCategoryColor(item.category)}`}>
                {item.category}
              </UiBadge>
            </div>
            <EcoCardContent>
              <EcoCardHeader>
                <EcoCardTitle>{item.title}</EcoCardTitle>
                <p>{item.description}</p>
              </EcoCardHeader>
              <div className="mt-4 flex justify-between items-center">
                <p>{item.price} {item.currency}</p>
                <EcoButton variant="eco" disabled={!item.available} onClick={() => handlePurchase(item.id)}>
                  <Heart className="w-4 h-4" /> {item.available ? "Buy" : "Sold"}
                </EcoButton>
              </div>
            </EcoCardContent>
          </EcoCard>
        ))}
      </main>
    </div>
  );
}
