"use client";

import { useRef } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { ParticleEngine, ParticleRef } from "@/components/ui/ParticleEngine";
import { usePortfolio } from "@/contexts/RecyclingContext";
import { ShoppingCart } from "lucide-react";

export function Marketplace() {
  const particleRef = useRef<ParticleRef>(null);
  const { marketplaceItems, purchaseItem, plyBalance } = usePortfolio();

  const handlePurchase = async (itemId: string) => {
    await purchaseItem(itemId);

    const el = document.getElementById(`item-${itemId}`);
    if (el) {
      el.classList.add("animate-pulse");
      particleRef.current?.burstCoins({ count: 20, color: "#FFD700" });
      setTimeout(() => el.classList.remove("animate-pulse"), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20 relative">
      <ParticleEngine ref={particleRef} />
      <MobileHeader title="Marketplace" />

      <main className="p-4 space-y-6">
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>PLY Balance</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="font-bold text-eco-primary text-lg">{plyBalance.toLocaleString()} PLY</EcoCardContent>
        </EcoCard>

        <div className="space-y-4">
          {marketplaceItems.map(item => (
            <EcoCard key={item.id} id={`item-${item.id}`} variant="elevated">
              <EcoCardHeader>
                <EcoCardTitle>{item.title}</EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent>
                <p>{item.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <p>{item.price} {item.currency}</p>
                  <EcoButton
                    variant="eco"
                    disabled={!item.available}
                    onClick={() => handlePurchase(item.id)}
                  >
                    <ShoppingCart className="w-4 h-4" /> {item.available ? "Buy" : "Sold"}
                  </EcoButton>
                </div>
              </EcoCardContent>
            </EcoCard>
          ))}
        </div>
      </main>
    </div>
  );
}
