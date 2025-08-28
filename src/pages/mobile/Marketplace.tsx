import React, { useRef } from "react";
import { View, ScrollView } from "react-native";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { Badge } from "@/components/ui/badge";
import { EcoButton } from "@/components/ui/eco-button";
import { ShoppingCart } from "lucide-react";
import { useRecycling } from "@/contexts/RecyclingContext";
import { ParticleEngine, ParticleRef, triggerParticles } from "@/components/ui/ParticleEngine";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export function Marketplace() {
  const { plyBalance, crtBalance, badges, marketplace, refreshBalances, submitBatch } = useRecycling();
  const particleRef = useRef<ParticleRef>(null);

  const handlePurchase = async (item: any) => {
    // Update balances & mint on-chain
    await submitBatch(); // simplified; integrates minting
    refreshBalances();

    // Particle + badge effects
    triggerParticles(particleRef.current!, "combo");
  };

  const items = [
    { id: 1, title: "Carbon Credits", price: 50, currency: "PLY", type: "credit" },
    { id: 2, title: "Eco Water Bottle", price: 25, currency: "CRT", type: "product" },
    { id: 3, title: "Tree Planting", price: 100, currency: "PLY", type: "donation" },
  ];

  return (
    <View className="flex-1 bg-gradient-to-br from-background to-muted">
      <ParticleEngine ref={particleRef} />
      <MobileHeader title="Marketplace" />

      <ScrollView className="p-4 space-y-6">
        {/* Counters */}
        <EcoCard>
          <EcoCardContent className="flex-row justify-around">
            <View>
              <AnimatedCounter value={plyBalance} suffix=" PLY" />
            </View>
            <View>
              <AnimatedCounter value={crtBalance} suffix=" CRT" />
            </View>
          </EcoCardContent>
        </EcoCard>

        {/* Marketplace Items */}
        {items.map(item => (
          <EcoCard key={item.id}>
            <EcoCardHeader>
              <EcoCardTitle>{item.title}</EcoCardTitle>
            </EcoCardHeader>
            <EcoCardContent className="flex-row justify-between items-center">
              <View>
                <Badge>{item.type}</Badge>
              </View>
              <EcoButton onPress={() => handlePurchase(item)}>
                <ShoppingCart />
                Buy {item.price} {item.currency}
              </EcoButton>
            </EcoCardContent>
          </EcoCard>
        ))}

        {/* Badge Showcase */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Your Badges</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex-row flex-wrap">
            {badges.map(badge => (
              <Badge
                key={badge.id}
                variant={badge.unlocked ? "default" : "secondary"}
                onPress={() => triggerParticles(particleRef.current!, badge.rarity)}
              >
                {badge.name}
              </Badge>
            ))}
          </EcoCardContent>
        </EcoCard>
      </ScrollView>
    </View>
  );
}
