"use client";

import React, { useEffect, useRef, useState } from "react";
import { View, ScrollView, Text, Image } from "react-native";
import { useRecycling } from "../contexts/RecyclingContext";
import { MobileHeader } from "../components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "../components/ui/eco-card";
import { Badge } from "../components/ui/badge";
import { Trophy, Zap, Target } from "lucide-react";
import { ParticleEngine, ParticleRef } from "../components/ui/ParticleEngine";
import { AnimatedCounter } from "../components/ui/AnimatedCounter";

export function Profile() {
  const { plyBalance, crtBalance, units, badges } = useRecycling();
  const particleRef = useRef<ParticleRef>(null);

  const [animatedPly, setAnimatedPly] = useState(plyBalance);
  const [animatedCrt, setAnimatedCrt] = useState(crtBalance);
  const [animatedUnits, setAnimatedUnits] = useState(units);

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

      <MobileHeader title="Profile" showSettings />

      <ScrollView className="p-4 space-y-4">
        {/* Stats Cards */}
        <View className="flex-row justify-between space-x-2">
          <EcoCard className="flex-1">
            <EcoCardContent className="items-center">
              <Trophy className="w-6 h-6 text-eco-warning mb-1" />
              <AnimatedCounter value={badges.length} />
              <Text className="text-xs text-muted-foreground">Badges</Text>
            </EcoCardContent>
          </EcoCard>
          <EcoCard className="flex-1">
            <EcoCardContent className="items-center">
              <Target className="w-6 h-6 text-eco-success mb-1" />
              <AnimatedCounter value={animatedPly} />
              <Text className="text-xs text-muted-foreground">PLY Earned</Text>
            </EcoCardContent>
          </EcoCard>
          <EcoCard className="flex-1">
            <EcoCardContent className="items-center">
              <Zap className="w-6 h-6 text-eco-primary mb-1" />
              <AnimatedCounter value={animatedUnits} />
              <Text className="text-xs text-muted-foreground">Scans</Text>
            </EcoCardContent>
          </EcoCard>
        </View>

        {/* Recent Badges */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Recent Achievements</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex-row flex-wrap">
            {badges.slice(-4).map((badge, idx) => (
              <View key={idx} className="items-center w-16 h-16 m-1">
                <Image source={{ uri: badge.icon }} className="w-12 h-12 rounded-full" />
                <Text className="text-xs text-center mt-1">{badge.name}</Text>
                <Badge variant={badge.unlocked ? "default" : "secondary"}>{badge.rarity}</Badge>
              </View>
            ))}
          </EcoCardContent>
        </EcoCard>
      </ScrollView>
    </View>
  );
}
