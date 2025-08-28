"use client";

import React, { useEffect, useState, useRef } from "react";
import { View, ScrollView, Text } from "react-native";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { ParticleEngine, ParticleRef } from "@/components/ui/ParticleEngine";
import { useRecycling } from "@/contexts/RecyclingContext";
import { Zap } from "lucide-react";

export function Marketplace() {
  const { plyBalance, mintPLY } = useRecycling();
  const particleRef = useRef<ParticleRef>(null);
  const [items, setItems] = useState([
    { id: "1", title: "Eco Badge", price: 100, currency: "PLY" },
    { id: "2", title: "Reusable Bottle", price: 250, currency: "PLY" },
  ]);

  const handlePurchase = async (itemId: string, price: number) => {
    try {
      await mintPLY(price); // Deduct/mint PLY from user wallet
      particleRef.current?.burstCoins({ count: 30, color: "#FFD700" });
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      console.error("Purchase failed:", err);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#111" }}>
      <ParticleEngine ref={particleRef} />

      <MobileHeader title="Marketplace" />

      <ScrollView style={{ padding: 16 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>PLY Balance: {plyBalance}</EcoCardTitle>
          </EcoCardHeader>
        </EcoCard>

        {items.map(item => (
          <EcoCard key={item.id} style={{ marginTop: 16 }}>
            <EcoCardContent style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: "#fff", fontSize: 16 }}>{item.title}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ color: "#FFD700" }}>{item.price} PLY</Text>
                <EcoButton onPress={() => handlePurchase(item.id, item.price)}>
                  <Zap color="#fff" size={16} />
                  Buy
                </EcoButton>
              </View>
            </EcoCardContent>
          </EcoCard>
        ))}
      </ScrollView>
    </View>
  );
}
