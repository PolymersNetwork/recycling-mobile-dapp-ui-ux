"use client";

import React, { useEffect, useRef } from "react";
import { View, ScrollView, Text, LayoutRectangle } from "react-native";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardHeader, EcoCardTitle, EcoCardContent } from "@/components/ui/eco-card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { useRecycling } from "@/contexts/RecyclingContext";
import Animated, { withTiming, useSharedValue, useAnimatedStyle, Easing } from "react-native-reanimated";
import ParticleEngine, { triggerParticles } from "@/components/ParticleEngine";

export function RecycleScreen() {
  const { plyBalance, crtBalance, badges, units, logRecycleUnit, submitBatch, cityMetrics } = useRecycling();

  // Animated counters
  const plyAnim = useSharedValue(plyBalance);
  const crtAnim = useSharedValue(crtBalance);

  const plyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(1 + (Math.sin(Date.now() / 200) * 0.05), { duration: 200 }) }],
  }));

  const crtStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(1 + (Math.sin(Date.now() / 200) * 0.05), { duration: 200 }) }],
  }));

  useEffect(() => {
    plyAnim.value = withTiming(plyBalance, { duration: 1000, easing: Easing.out(Easing.exp) });
  }, [plyBalance]);

  useEffect(() => {
    crtAnim.value = withTiming(crtBalance, { duration: 1000, easing: Easing.out(Easing.exp) });
  }, [crtBalance]);

  // Refs for measuring badge positions
  const badgeRefs = useRef<Record<string, LayoutRectangle>>({});

  const handleBadgeLayout = (id: string, layout: LayoutRectangle) => {
    badgeRefs.current[id] = layout;
  };

  const handleMockScan = async () => {
    logRecycleUnit({ city: "New York", lat: 0, lng: 0 });
    await submitBatch();

    // Trigger coin + sparkle + bounce effects
    triggerParticles({
      origin: { x: 200, y: 100 }, // Example origin; in production, measure badge position
      type: "combo",
      count: 30,
      color: "gold",
      bounce: true,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <MobileHeader title="Recycle Dashboard" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        
        {/* PLY/CRT Counters */}
        <EcoCard variant="eco">
          <EcoCardContent>
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>PLY Balance</Text>
            <Animated.Text style={[{ color: "#ffd700", fontSize: 32 }, plyStyle]}>
              {plyAnim.value.toFixed(0)}
            </Animated.Text>

            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18, marginTop: 8 }}>CRT Balance</Text>
            <Animated.Text style={[{ color: "#00ffff", fontSize: 32 }, crtStyle]}>
              {crtAnim.value.toFixed(1)}
            </Animated.Text>
          </EcoCardContent>
        </EcoCard>

        {/* Scan / Earn */}
        <EcoCard variant="eco" style={{ marginTop: 16 }}>
          <EcoCardContent>
            <Button onPress={handleMockScan}>Scan Plastic + Earn PLY/CRT</Button>
          </EcoCardContent>
        </EcoCard>

        {/* NFT Badges */}
        <EcoCard style={{ marginTop: 16 }}>
          <EcoCardHeader>
            <EcoCardTitle>Badges</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {badges.map((badge) => (
              <Animated.View
                key={badge.id}
                onLayout={(e) => handleBadgeLayout(badge.id, e.nativeEvent.layout)}
                style={{
                  transform: [
                    { scale: withTiming(1.2, { duration: 300 }) }, // simple bounce on mount
                  ],
                }}
              >
                <Badge variant="default">{badge.name} ({badge.rarity})</Badge>
              </Animated.View>
            ))}
          </EcoCardContent>
        </EcoCard>

        {/* City Metrics & Progress Bars */}
        <EcoCard style={{ marginTop: 16 }}>
          <EcoCardHeader>
            <EcoCardTitle>City Metrics</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            {Object.entries(cityMetrics).map(([city, metric]) => (
              <View key={city} style={{ marginBottom: 12 }}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>{city}</Text>
                <ProgressBar value={Math.min((metric.polyEarned / (metric.forecast?.ply || 1)) * 100, 100)} />
                <Text style={{ color: "#ccc", fontSize: 12 }}>
                  PLY: {metric.polyEarned.toFixed(0)}, CRT: {metric.crtEarned.toFixed(1)}
                </Text>
              </View>
            ))}
          </EcoCardContent>
        </EcoCard>
      </ScrollView>

      {/* Particle Engine */}
      <ParticleEngine />
    </View>
  );
}
