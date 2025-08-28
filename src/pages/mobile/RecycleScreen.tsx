import React, { useRef } from "react";
import { View, ScrollView } from "react-native";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { Badge } from "@/components/ui/badge";
import { EcoButton } from "@/components/ui/eco-button";
import { useRecycling } from "@/contexts/RecyclingContext";
import { ParticleEngine, ParticleRef, triggerParticles } from "@/components/ui/ParticleEngine";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export function RecycleScreen() {
  const { plyBalance, crtBalance, units, badges, logRecycleUnit, submitBatch } = useRecycling();
  const particleRef = useRef<ParticleRef>(null);

  const handleScan = async () => {
    logRecycleUnit({ city: "Local City", lat: 0, lng: 0 });

    // Animate coin bursts on counters
    triggerParticles(particleRef.current!, "coin");

    await submitBatch();
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-background to-muted">
      <ParticleEngine ref={particleRef} />
      <MobileHeader title="Recycle Dashboard" />

      <ScrollView className="p-4 space-y-6">
        {/* Animated Counters */}
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

        {/* Scan / Contribute */}
        <EcoCard>
          <EcoCardContent>
            <EcoButton onPress={handleScan}>Scan & Contribute</EcoButton>
          </EcoCardContent>
        </EcoCard>

        {/* Badges */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Your NFT Badges</EcoCardTitle>
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
