"use client";

import { usePortfolio } from "@/contexts/RecyclingContext";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { UiBadge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

export function Marketplace() {
  const { marketplaceItems, purchaseItem, particleRef } = usePortfolio();

  const handlePurchase = async (itemId: string) => {
    await purchaseItem(itemId);
    // Particle effect for badges
    particleRef.current?.sparkleBadge({ count: 15, color: "#FFAA00" });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      cleanup: "bg-blue-500/10 text-blue-700 border-blue-200",
      renewable: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
      conservation: "bg-green-500/10 text-green-700 border-green-200",
      education: "bg-purple-500/10 text-purple-700 border-purple-200",
      "products": "bg-eco-primary/10 text-eco-primary/80 border-eco-primary/20",
      "carbon-offset": "bg-gray-100/20 text-gray-700 border-gray-200",
    };
    return colors[category] || colors.products;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      <MobileHeader title="Marketplace" />

      <main className="p-4 space-y-4">
        {marketplaceItems.map(item => (
          <EcoCard key={item.id} variant="elevated">
            <div className="relative">
              <div className="aspect-[2/1] bg-gray-200 rounded-t-2xl flex items-center justify-center">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover rounded-t-2xl" />
              </div>
              <UiBadge className={`absolute top-3 right-3 ${getCategoryColor(item.category)}`}>
                {item.category}
              </UiBadge>
            </div>
            <EcoCardContent>
              <EcoCardHeader>
                <EcoCardTitle>{item.title}</EcoCardTitle>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </EcoCardHeader>
              <div className="mt-4 flex justify-between items-center">
                <p className="font-semibold">{item.price} {item.currency}</p>
                <EcoButton
                  variant={item.available ? "eco" : "disabled"}
                  onClick={() => handlePurchase(item.id)}
                  disabled={!item.available}
                >
                  <ShoppingCart className="w-4 h-4 mr-1" /> {item.available ? "Buy" : "Sold Out"}
                </EcoButton>
              </div>
            </EcoCardContent>
          </EcoCard>
        ))}
      </main>
    </div>
  );
}
