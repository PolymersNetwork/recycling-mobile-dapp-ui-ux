import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Leaf, Heart } from "lucide-react";

export function Marketplace() {
  const items = [
    { id: 1, title: "Carbon Credits", price: "50 PLY", type: "credit" },
    { id: 2, title: "Eco Water Bottle", price: "25 USDC", type: "product" },
    { id: 3, title: "Tree Planting", price: "100 PLY", type: "donation" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      <MobileHeader title="Marketplace" />
      
      <main className="p-4 space-y-6">
        <div className="grid gap-4">
          {items.map((item) => (
            <EcoCard key={item.id} variant="elevated">
              <EcoCardHeader>
                <EcoCardTitle className="flex items-center justify-between">
                  {item.title}
                  <Badge variant="secondary">{item.type}</Badge>
                </EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-eco-primary">{item.price}</span>
                  <EcoButton size="sm">
                    <ShoppingCart className="w-4 h-4" />
                    Buy
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