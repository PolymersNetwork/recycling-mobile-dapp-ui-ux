import React, { useRef, useEffect, useState } from "react";
import { View, ScrollView, Text, Button } from "react-native";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ParticleEngine, ParticleRef } from "@/components/ui/ParticleEngine";
import { useRecycling } from "@/contexts/RecyclingContext";
import { EcoButton } from "@/components/ui/eco-button";

export function RecycleScreen() {
  const particleRef = useRef<ParticleRef>(null);
  const { plyBalance, crtBalance, units, logRecycleUnit, badges } = useRecycling();
  const [animatedPly, setAnimatedPly] = useState(plyBalance);
  const [animatedCrt, setAnimatedCrt] = useState(crtBalance);
  const [animatedUnits, setAnimatedUnits] = useState(units);

  // Animate counters & trigger particle bursts
  useEffect(() => {
    if (plyBalance > animatedPly) {
      setAnimatedPly(plyBalance);
      particleRef.current?.burstCoins({ count: 30, color: "#FFD700" });
    }
  }, [plyBalance]);

  useEffect(() => {
    if (crtBalance > animatedCrt) {
      setAnimatedCrt(crtBalance);
      particleRef.current?.burstCoins({ count: 20, color: "#00FFAA" });
    }
  }, [crtBalance]);

  useEffect(() => {
    if (units > animatedUnits) {
      setAnimatedUnits(units);
      particleRef.current?.sparkleBadge({ count: 15, color: "#FFAA00" });
    }
  }, [units]);

  const handleRecycle = () => {
    logRecycleUnit({ city: "Expo City", lat: 0, lng: 0 });
  };

  return (
    <View className="flex-1 bg-background relative">
      <ParticleEngine ref={particleRef} />
      <MobileHeader title="Recycle" />

      <ScrollView className="p-4 space-y-6">
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Your Stats</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="space-y-2">
            <Text>PLY: <AnimatedCounter value={animatedPly} /></Text>
            <Text>CRT: <AnimatedCounter value={animatedCrt} /></Text>
            <Text>Units Scanned: <AnimatedCounter value={animatedUnits} /></Text>
          </EcoCardContent>
        </EcoCard>

        <EcoButton onPress={handleRecycle}>
          Recycle Plastic
        </EcoButton>

        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Badges Earned</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex-row flex-wrap">
            {badges.map((b) => (
              <View key={b.id} className="bg-eco-primary/10 m-1 p-2 rounded">
                <Text>{b.name}</Text>
              </View>
            ))}
          </EcoCardContent>
        </EcoCard>
      </ScrollView>
    </View>
  );
}
