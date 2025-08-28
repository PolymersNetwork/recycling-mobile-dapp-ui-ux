"use client";

import React, { useRef, useState } from "react";
import { View, ScrollView } from "react-native";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Badge } from "@/components/ui/badge";
import { ParticleEngine, triggerParticles } from "@/components/ParticleEngine";
import { useRecycling } from "@/contexts/RecyclingContext";

export const RecycleScreen = () => {
  const { plyBalance, crtBalance, badges, logRecycleUnit, submitBatch } = useRecycling();
  const counterRefs = { ply: useRef(null), crt: useRef(null) };
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    logRecycleUnit({ city: "Local City", lat: 0, lng: 0 });
    triggerParticles(counterRefs.ply.current, "coin");
    triggerParticles(counterRefs.crt.current, "coin");

    setLoading(true);
    await submitBatch();
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f4f8" }}>
      <ParticleEngine />
      <MobileHeader title="Recycle Dashboard" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        {/* PLY / CRT Counters */}
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

        {/* Scan Button */}
        <EcoCard>
          <EcoCardContent>
            <EcoButton onPress={handleScan} disabled={loading}>
              {loading ? "Processing..." : "Scan & Contribute"}
            </EcoButton>
          </EcoCardContent>
        </EcoCard>

        {/* Badge List */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Your NFT Badges</EcoCardTitle>
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
