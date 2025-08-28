import React, { useRef, useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRecycling } from "@/contexts/RecyclingContext";
import { useWallet } from "@/contexts/WalletProvider";
import { ParticleEngine, triggerParticles } from "@/components/ParticleEngine";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge } from "@/components/ui/badge";

export function RecycleScreen() {
  const { wallet } = useWallet();
  const { plyBalance, crtBalance, badges, units, logRecycleUnit, submitBatch } = useRecycling();

  const [contributionInProgress, setContributionInProgress] = useState(false);

  const counterRefs = {
    ply: useRef<View>(null),
    crt: useRef<View>(null),
  };

  const handleRecycleScan = async () => {
    logRecycleUnit({ city: "Local City", lat: 0, lng: 0 });

    // Trigger particle bursts on counters
    if (counterRefs.ply.current) triggerParticles(counterRefs.ply.current, "coin");
    if (counterRefs.crt.current) triggerParticles(counterRefs.crt.current, "coin");

    try {
      setContributionInProgress(true);
      await submitBatch();

      // Animate badge sparkle/bounce
      badges.forEach((b) => {
        const ref = document.getElementById(`badge-${b.id}`);
        if (ref) triggerParticles(ref, b.rarity);
      });
    } catch (err) {
      console.error("Contribution failed:", err);
    } finally {
      setContributionInProgress(false);
    }
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-background to-muted p-4">
      <ParticleEngine />

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
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

        {/* Scan / Contribute */}
        <EcoCard>
          <EcoCardContent>
            <EcoButton onPress={handleRecycleScan} disabled={contributionInProgress}>
              {contributionInProgress ? "Processing..." : "Scan & Contribute"}
            </EcoButton>
          </EcoCardContent>
        </EcoCard>

        {/* Badges */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Your NFT Badges</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex-row flex-wrap">
            {badges.map((badge) => (
              <TouchableOpacity
                key={badge.id}
                onPress={() => triggerParticles(document.getElementById(`badge-${badge.id}`), badge.rarity)}
              >
                <Badge variant={badge.unlocked ? "default" : "secondary"}>{badge.name}</Badge>
              </TouchableOpacity>
            ))}
          </EcoCardContent>
        </EcoCard>
      </ScrollView>
    </View>
  );
}
