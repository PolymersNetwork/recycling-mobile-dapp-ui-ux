"use client";

import React, { useRef, useState, useEffect } from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { ParticleEngine, ParticleRef } from "@/components/ui/ParticleEngine";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { useRecycling } from "@/contexts/RecyclingContext";
import { Zap, Leaf, CheckCircle } from "lucide-react";

export function RecycleScreen() {
  const { plyBalance, crtBalance, units, logRecycleUnit, badges } = useRecycling();
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

  const handleRecycle = async () => {
    // Simulate scanning plastic + minting rewards
    const reward = await logRecycleUnit({ city: "Local", lat: 0, lng: 0 });
    particleRef.current?.burstCoins({ count: 25, color: "#FFD700" });
    particleRef.current?.sparkleBadge({ count: 15, color: "#FFAA00" });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#111" }}>
      <ParticleEngine ref={particleRef} />

      <MobileHeader title="Recycle Plastic" />

      <ScrollView style={{ padding: 16 }} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Wallet & Tokens */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Wallet Balances</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <View style={{ alignItems: "center" }}>
              <Leaf color="#FFD700" size={24} />
              <AnimatedCounter value={animatedPly} />
              <Text style={{ color: "#fff" }}>PLY</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Zap color="#00FFAA" size={24} />
              <AnimatedCounter value={animatedCrt} />
              <Text style={{ color: "#fff" }}>CRT</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <CheckCircle color="#FFAA00" size={24} />
              <AnimatedCounter value={animatedUnits} />
              <Text style={{ color: "#fff" }}>Scans</Text>
            </View>
          </EcoCardContent>
        </EcoCard>

        {/* Recycle Action */}
        <EcoButton onPress={handleRecycle} style={{ marginTop: 16 }}>
          Recycle Plastic & Earn PLY
        </EcoButton>

        {/* Badges */}
        <EcoCard style={{ marginTop: 16 }}>
          <EcoCardHeader>
            <EcoCardTitle>Recent Badges</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {badges.map((b, idx) => (
              <EcoCard key={idx} style={{ width: 60, height: 60, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 24 }}>{b.emoji || "🏆"}</Text>
              </EcoCard>
            ))}
          </EcoCardContent>
        </EcoCard>
      </ScrollView>
    </View>
  );
}
