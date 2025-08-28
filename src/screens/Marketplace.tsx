"use client";

import { useRef } from "react";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge as UiBadge } from "@/components/ui/badge";
import { ParticleEngine, ParticleRef } from "@/components/ui/ParticleEngine";
import { usePortfolio } from "@/hooks/usePortfolio";
import { Heart } from "lucide-react";

export default function Marketplace() {
  const { projects, contributeToProject, nftBadges } = usePortfolio();
  const particleRef = useRef<ParticleRef>(null);

  const mockItems = [
    { id: "1", title: "Carbon Credit Pack", description: "Offset 100kg CO2", price: 50, currency: "PLY", category: "carbon-offset" },
    { id: "2", title: "Reusable Bottle", description: "Eco-friendly bottle", price: 25, currency: "USDC", category: "products" },
    { id: "3", title: "Plant a Tree Donation", description: "Support tree planting", price: 10, currency: "SOL", category: "donations" },
  ];

  const handlePurchase = async (itemId: string) => {
    const item = mockItems.find(i => i.id === itemId);
    if (!item) return;

    // Simulate purchase + gamified reward
    await contributeToProject(item.id, item.price); 
    particleRef.current?.burstCoins({ count: 20, color: "#FFD700" });
    particleRef.current?.sparkleBadge({ count: 10, color: "#FFAA00" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20 relative">
      <ParticleEngine ref={particleRef} />
      <main className="p-4 space-y-4">
        {mockItems.map(item => (
          <EcoCard key={item.id} variant="elevated">
            <EcoCardHeader>
              <EcoCardTitle>{item.title}</EcoCardTitle>
            </EcoCardHeader>
            <EcoCardContent>
              <p>{item.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span>{item.price} {item.currency}</span>
                <EcoButton variant="eco" onClick={() => handlePurchase(item.id)}>
                  <Heart className="w-4 h-4" /> Buy
                </EcoButton>
              </div>
            </EcoCardContent>
          </EcoCard>
        ))}

        <h3 className="text-lg font-bold mt-6">Your NFT Badges</h3>
        <div className="grid grid-cols-4 gap-3 mt-2">
          {nftBadges.map(b => (
            <div key={b.id} className="text-center">
              <img src={b.icon} className="w-12 h-12 rounded-full mx-auto mb-1" />
              <UiBadge className="text-xs">{b.name}</UiBadge>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
