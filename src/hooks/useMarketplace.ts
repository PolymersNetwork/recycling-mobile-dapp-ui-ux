"use client";

import React, { useRef, useState } from "react";
import { View, ScrollView, Text, Image, TouchableOpacity } from "react-native";
import { MobileHeader } from "../components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "../components/ui/eco-card";
import { useMarketplace } from "../hooks/useMarketplace";
import { useWallet } from "../contexts/WalletContext";
import { ParticleEngine, ParticleRef } from "../components/ui/ParticleEngine";
import { AnimatedCounter } from "../components/ui/AnimatedCounter";
import { Zap } from "lucide-react";

export function Marketplace() {
  const { marketplaceItems, purchaseItem, loading } = useMarketplace();
  const { wallet } = useWallet();
  const particleRef = useRef<ParticleRef>(null);
  const [purchases, setPurchases] = useState<{ [key: string]: boolean }>({});

  const handlePurchase = async (itemId: string) => {
    if (!wallet) return alert("Connect your wallet first!");
    try {
      await purchaseItem(itemId);
      setPurchases(prev => ({ ...prev, [itemId]: true }));
      particleRef.current?.burstCoins({ count: 20, color: "#FFD700" });
    } catch (err) {
      console.error(err);
      alert("Purchase failed or item unavailable");
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ParticleEngine ref={particleRef} />

      <MobileHeader title="Marketplace" />

      <ScrollView className="p-4 space-y-4">
        {marketplaceItems.map(item => (
          <EcoCard key={item.id}>
            <EcoCardHeader>
              <EcoCardTitle>{item.title}</EcoCardTitle>
            </EcoCardHeader>
            <EcoCardContent className="space-y-2">
              <Image source={{ uri: item.imageUrl }} className="w-full h-40 rounded-lg" />
              <Text className="text-sm text-muted-foreground">{item.description}</Text>
              <View className="flex-row justify-between items-center mt-2">
                <Text className="font-bold">{item.price} {item.currency}</Text>
                <TouchableOpacity
                  disabled={loading || !item.available || purchases[item.id]}
                  onPress={() => handlePurchase(item.id)}
                  className={`px-3 py-1 rounded ${
                    item.available && !purchases[item.id] ? "bg-eco-primary" : "bg-gray-400"
                  }`}
                >
                  <Text className="text-white text-sm">
                    {purchases[item.id] ? "Purchased" : "Buy"}
                  </Text>
                </TouchableOpacity>
              </View>
            </EcoCardContent>
          </EcoCard>
        ))}
      </ScrollView>
    </View>
  );
}
