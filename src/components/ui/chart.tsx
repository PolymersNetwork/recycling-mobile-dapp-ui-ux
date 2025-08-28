import * as React from "react";
import { View, ScrollView, Text } from "react-native";
import { Camera } from "expo-camera";
import ConfettiCannon from "react-native-confetti-cannon";
import useSound from "use-sound";

import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Typography } from "@/components/ui/Typography";
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/Chart";

import { useRecycling } from "@/contexts/RecyclingContext";
import { useProjects } from "@/hooks/useProjects";
import { useMarketplace } from "@/hooks/useMarketplace";

import scanSuccessSound from "@/assets/sounds/scan-success.mp3";

export function RecycleScreen() {
  const { wallet, balances, logRecycleUnit, badges, cityMetrics } = useRecycling();
  const { projects, contributeToProject } = useProjects();
  const { marketplaceItems } = useMarketplace();
  const [play] = useSound(scanSuccessSound);
  const [showConfetti, setShowConfetti] = React.useState(false);

  const handleScanSuccess = () => {
    logRecycleUnit({ city: "Sample City", lat: 0, lng: 0 });
    play();
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const chartConfig = React.useMemo(() => {
    const config: any = {};
    Object.keys(cityMetrics).forEach((city) => {
      config[city] = { label: city, color: "#10b981" };
    });
    return config;
  }, [cityMetrics]);

  return (
    <ScrollView className="flex-1 bg-background p-4">
      {showConfetti && <ConfettiCannon count={200} origin={{ x: -10, y: 0 }} fadeOut />}

      {/* Wallet Balances */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {balances.map((b) => (
            <View key={b.symbol} className="flex-row justify-between items-center">
              <Typography>{b.symbol}</Typography>
              <Typography className="font-bold">
                {b.amount.toFixed(2)} ({b.usdValue.toFixed(2)}$)
              </Typography>
            </View>
          ))}
        </CardContent>
      </Card>

      {/* Camera Scan */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Scan Plastic</CardTitle>
        </CardHeader>
        <CardContent className="items-center justify-center">
          <Camera style={{ width: "100%", height: 200, borderRadius: 16 }} />
          <Button className="mt-3" onPress={handleScanSuccess}>
            Scan
          </Button>
        </CardContent>
      </Card>

      {/* NFT Badges */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>NFT Badges</CardTitle>
        </CardHeader>
        <CardContent className="flex-row flex-wrap gap-2">
          {badges.map((badge) => (
            <Badge key={badge.id} variant={badge.unlocked ? "default" : "secondary"}>
              {badge.name} ({badge.rarity})
            </Badge>
          ))}
        </CardContent>
      </Card>

      {/* City Metrics Chart */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>City Metrics & Projections</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 200 }}>
          <ChartContainer config={chartConfig}>
            {/* Replace with actual Recharts components or compatible RN chart library */}
            <ChartTooltipContent />
            <ChartLegendContent />
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Active Projects */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.map((p) => (
            <View key={p.id} className="flex-row justify-between items-center mb-2">
              <Typography>{p.title}</Typography>
              <Button size="sm" onPress={() => contributeToProject(p.id, 10, "PLY")}>
                +10 PLY
              </Button>
            </View>
          ))}
        </CardContent>
      </Card>

      {/* Marketplace Items */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Marketplace Items</CardTitle>
        </CardHeader>
        <CardContent>
          {marketplaceItems.map((item) => (
            <View key={item.id} className="flex-row justify-between items-center mb-2">
              <Typography>{item.title}</Typography>
              <Typography className="font-bold">
                {item.price} {item.currency}
              </Typography>
            </View>
          ))}
        </CardContent>
      </Card>
    </ScrollView>
  );
}
