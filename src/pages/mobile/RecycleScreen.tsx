import React, { useState } from "react";
import { ScrollView, View, Text } from "react-native";
import Confetti from "react-native-confetti-cannon";
import { useRecycling } from "@/contexts/RecyclingContext";
import { useTheme } from "@/theme/theme";
import { EcoCard, EcoCardHeader, EcoCardTitle, EcoCardContent } from "@/components/ui/eco-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MobileHeader } from "@/components/mobile/MobileHeader";

export function RecycleScreen() {
  const { colors } = useTheme();
  const { plyBalance, crtBalance, units, badges, cityMetrics, logRecycleUnit } = useRecycling();
  const [showConfetti, setShowConfetti] = useState(false);

  const handleMockScan = () => {
    logRecycleUnit({ city: "New York", lat: 0, lng: 0 });
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <MobileHeader title="Recycle Dashboard" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>

        {/* Scan Panel */}
        <EcoCard variant="eco" padding="sm">
          <EcoCardContent>
            <Text style={{ color: colors.text, fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
              Scan Plastic
            </Text>
            <Button onPress={handleMockScan}>Mock Scan + Earn PLY</Button>
          </EcoCardContent>
        </EcoCard>

        {/* City Metrics */}
        <EcoCard padding="sm">
          <EcoCardHeader>
            <EcoCardTitle>City Metrics & Forecast</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            {Object.entries(cityMetrics).map(([city, metric]) => (
              <View key={city} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={{ color: colors.text, fontWeight: "600" }}>{city}</Text>
                  <Text style={{ color: colors.text }}>PLY: {metric.forecast?.ply || 0}, CRT: {metric.forecast?.crt || 0}</Text>
                </View>
                <ProgressBar value={Math.min((metric.polyEarned / (metric.forecast?.ply || 1)) * 100, 100)} />
              </View>
            ))}
          </EcoCardContent>
        </EcoCard>

        {/* NFT Badges */}
        <EcoCard padding="sm">
          <EcoCardHeader>
            <EcoCardTitle>NFT Badges</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {badges.map(badge => (
              <Badge key={badge.id} variant={badge.unlocked ? "default" : "secondary"}>
                {badge.name} ({badge.rarity})
              </Badge>
            ))}
          </EcoCardContent>
        </EcoCard>

        {/* Balances */}
        <EcoCard padding="sm" variant="gradient">
          <EcoCardContent>
            <Text style={{ color: colors.text }}>PLY Balance: {plyBalance}</Text>
            <Text style={{ color: colors.text }}>CRT Balance: {crtBalance}</Text>
            <Text style={{ color: colors.text }}>Recycled Units: {units}</Text>
          </EcoCardContent>
        </EcoCard>

        {showConfetti && <Confetti count={200} origin={{ x: -10, y: 0 }} />}
      </ScrollView>
    </View>
  );
}
