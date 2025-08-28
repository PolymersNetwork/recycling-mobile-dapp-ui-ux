"use client";

import React, { useRef, useState } from "react";
import { View, ScrollView } from "react-native";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ParticleEngine, triggerParticles } from "@/components/ParticleEngine";
import { useRecycling } from "@/contexts/RecyclingContext";

export const MarketplaceScreen = () => {
  const { plyBalance, crtBalance, badges, refreshBalances, marketplace } = useRecycling();
  const counterRefs = { ply: useRef(null), crt: useRef(null) };
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (item) => {
    setLoading(true);

    try {
      // Update balances via context (API or SPL mint logic internally)
      await refreshBalances();
      const ref = item.currency === "PLY" ? counterRefs.ply.current : counterRefs.crt.current;
      triggerParticles(ref, "combo");
    } catch (err) {
      console.error("Purchase failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f4f8" }}>
      <ParticleEngine />
      <MobileHeader title="Marketplace" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        {/* Counters */}
        <EcoCard>
          <EcoCardContent style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <View ref={counterRefs.ply}>
              <AnimatedCounter value={plyBalance} suffix=" PLY" />
            </View>
            <View ref={counterRefs.crt}>
              <AnimatedCounter value={crtBalance} suffix=" CRT" />
            </View>
          </EcoCardContent>
        </EcoCard>

        {/* Marketplace Items */}
        {marketplace.map((item) => (
          <EcoCard key={item.id} variant="elevated">
            <EcoCardHeader>
              <EcoCardTitle>{item.title}</EcoCardTitle>
            </EcoCardHeader>
            <EcoCardContent style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Badge variant="secondary">{item.type}</Badge>
              <EcoButton onPress={() => handlePurchase(item)} disabled={loading}>
                Buy {item.price} {item.currency}
              </EcoButton>
            </EcoCardContent>
          </EcoCard>
        ))}

        {/* Badge List */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Your Badges</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {badges.map((badge) => (
              <Badge
                key={badge.id}
                variant={badge.unlocked ? "default" : "secondary"}
                onPress={(e) => triggerParticles(e.currentTarget, badge.rarity)}
              >
                {badge.name}
              </Badge>
            ))}
          </EcoCardContent>
        </EcoCard>
      </ScrollView>
    </View>
  );
};
