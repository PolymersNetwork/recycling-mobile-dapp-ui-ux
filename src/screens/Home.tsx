"use client";

import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, Image } from "react-native";
import { useRecycling } from "../contexts/RecyclingContext";
import { MobileHeader } from "../components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "../components/ui/eco-card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Leaf } from "lucide-react";
import { ParticleEngine, ParticleRef } from "../components/ui/ParticleEngine";
import { AnimatedCounter } from "../components/ui/AnimatedCounter";

export function Home() {
  const { plyBalance, crtBalance, units, badges } = useRecycling();
  const [animatedPly, setAnimatedPly] = useState(plyBalance);
  const [animatedCrt, setAnimatedCrt] = useState(crtBalance);
  const [animatedUnits, setAnimatedUnits] = useState(units);
  const particleRef = React.useRef<ParticleRef>(null);

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

  return (
    <View className="flex-1 bg-background">
      <ParticleEngine ref={particleRef} />

      <MobileHeader title="Good morning, Eco Warrior!" />

      <ScrollView className="p-4 space-y-4">
        {/* Hero Card */}
        <EcoCard variant="eco">
          <EcoCardContent className="items-center justify-center">
            <Leaf className="w-10 h-10 mb-2 text-white" />
            <Text className="text-white text-2xl font-bold mb-1">Level 5 Eco Hero</Text>
            <Text className="text-white/80 mb-3">Making the planet greener one scan at a time</Text>

            <View className="flex-row justify-around w-full">
              <View className="items-center">
                <Text className="text-white text-xl font-bold">{animatedPly}</Text>
                <Text className="text-white/70 text-xs">PLY</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-xl font-bold">{animatedCrt}</Text>
                <Text className="text-white/70 text-xs">CRT</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-xl font-bold">{animatedUnits}</Text>
                <Text className="text-white/70 text-xs">Scans</Text>
              </View>
            </View>
          </EcoCardContent>
        </EcoCard>

        {/* NFT Badges */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Your NFT Badges</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex-row flex-wrap">
            {badges.length > 0 ? (
              badges.map((badge, idx) => (
                <View key={idx} className="w-16 h-16 m-1 items-center">
                  <Image source={{ uri: badge.icon }} className="w-12 h-12 rounded-full" />
                  <Text className="text-xs text-center mt-1">{badge.name}</Text>
                  <Badge variant={badge.unlocked ? "default" : "secondary"} className="text-xs">
                    {badge.rarity}
                  </Badge>
                </View>
              ))
            ) : (
              <Text className="text-sm text-muted-foreground">No badges earned yet</Text>
            )}
          </EcoCardContent>
        </EcoCard>
      </ScrollView>
    </View>
  );
}
