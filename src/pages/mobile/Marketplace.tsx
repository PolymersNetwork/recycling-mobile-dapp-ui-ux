import React, { useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRecycling } from "@/contexts/RecyclingContext";
import { useWallet } from "@/contexts/WalletProvider";
import { ParticleEngine, triggerParticles } from "@/components/ParticleEngine";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge } from "@/components/ui/badge";

export function Marketplace() {
  const { plyBalance, crtBalance, badges, refreshBalances, contributeToProject } = useRecycling();
  const { wallet } = useWallet();

  const [purchaseInProgress, setPurchaseInProgress] = useState(false);

  const counterRefs = {
    ply: useRef<View>(null),
    crt: useRef<View>(null),
  };

  const items = [
    { id: 1, title: "Carbon Credits", price: 50, currency: "PLY", type: "credit" },
    { id: 2, title: "Eco Water Bottle", price: 25, currency: "CRT", type: "product" },
    { id: 3, title: "Tree Planting", price: 100, currency: "PLY", type: "donation" },
  ];

  const handlePurchase = async (item: typeof items[0]) => {
    try {
      setPurchaseInProgress(true);
      // On-chain mint or API contribution
      await contributeToProject(item.id.toString(), item.price, item.currency as "PLY" | "CRT");

      // Trigger particle + badge animations
      const ref = item.currency === "PLY" ? counterRefs.ply.current : counterRefs.crt.current;
      if (ref) triggerParticles(ref, "combo");

      await refreshBalances();
    } catch (err) {
      console.error("Purchase failed:", err);
    } finally {
      setPurchaseInProgress(false);
    }
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-background to-muted p-4">
      <ParticleEngine />

      <ScrollView contentContainerStyle={{ paddingBottom: 80, gap: 16 }}>
        {/* Counters */}
        <EcoCard>
          <EcoCardContent className="flex-row justify-around">
            <View ref={counterRefs.ply} className="items-center">
              <Text className="text-xl font-bold">{plyBalance} PLY</Text>
              <Text className="text-xs text-muted-foreground">PLY Balance</Text>
            </View>
            <View ref={counterRefs.crt} className="items-center">
              <Text className="text-xl font-bold">{crtBalance} CRT</Text>
              <Text className="text-xs text-muted-foreground">CRT Balance</Text>
            </View>
          </EcoCardContent>
        </EcoCard>

        {/* Marketplace Items */}
        {items.map((item) => (
          <EcoCard key={item.id}>
            <EcoCardHeader>
              <EcoCardTitle>{item.title}</EcoCardTitle>
            </EcoCardHeader>
            <EcoCardContent className="flex-row justify-between items-center">
              <Text className="text-lg font-bold text-eco-primary">
                {item.price} {item.currency}
              </Text>
              <EcoButton size="sm" onPress={() => handlePurchase(item)} disabled={purchaseInProgress}>
                Buy
              </EcoButton>
            </EcoCardContent>
          </EcoCard>
        ))}

        {/* Badges */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Your Badges</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex-row flex-wrap">
            {badges.map((badge) => (
              <TouchableOpacity key={badge.id} onPress={() => triggerParticles(document.getElementById(`badge-${badge.id}`), badge.rarity)}>
                <Badge variant={badge.unlocked ? "default" : "secondary"}>{badge.name}</Badge>
              </TouchableOpacity>
            ))}
          </EcoCardContent>
        </EcoCard>
      </ScrollView>
    </View>
  );
}
