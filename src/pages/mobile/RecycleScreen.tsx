import React, { useState } from "react";
import { ScrollView, View, Text } from "react-native";
import { Camera } from "expo-camera";
import Confetti from "react-native-confetti-cannon";
import useSound from "use-sound";

import { useRecycling } from "@/contexts/RecyclingContext";
import { useProjects } from "@/hooks/useProjects";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useTheme } from "@/theme/theme";

import scanSuccessSound from "@/assets/sounds/scan-success.mp3";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Typography } from "@/components/ui/Typography";

export const RecycleScreen: React.FC = () => {
  const { plyBalance, crtBalance, units, logRecycleUnit, badges, cityMetrics } = useRecycling();
  const { projects, contributeToProject } = useProjects();
  const { marketplaceItems } = useMarketplace();
  const { colors } = useTheme();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [play] = useSound(scanSuccessSound);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    // Mock scanning logic
    setTimeout(() => {
      const result = {
        verified: true,
        plasticType: "PET",
        confidence: 0.95,
        tokensEarned: 5,
        location: "San Francisco",
      };
      setScanResult(result);
      logRecycleUnit({ city: result.location, lat: 0, lng: 0 });
      play();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      setIsScanning(false);
    }, 1500);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      {showConfetti && <Confetti count={200} origin={{ x: 200, y: 0 }} />}

      {/* Wallet Balances */}
      <Card style={{ marginBottom: 16, backgroundColor: colors.card }}>
        <CardHeader>
          <CardTitle>Wallet Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="subtitle">PLY: {plyBalance}</Typography>
          <Typography variant="subtitle">CRT: {crtBalance}</Typography>
        </CardContent>
      </Card>

      {/* Scan Panel */}
      <Card style={{ marginBottom: 16, backgroundColor: colors.card }}>
        <CardHeader>
          <CardTitle>Scan Plastic</CardTitle>
        </CardHeader>
        <CardContent>
          {hasPermission === false ? (
            <Typography variant="body">Camera permission denied</Typography>
          ) : (
            <Button onPress={handleScan} disabled={isScanning}>
              {isScanning ? "Scanning..." : "Start Scan"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Scan Result */}
      {scanResult && (
        <Card style={{ marginBottom: 16, backgroundColor: colors.card }}>
          <CardHeader>
            <CardTitle>Scan Result</CardTitle>
          </CardHeader>
          <CardContent>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text>Plastic Type</Text>
              <Badge>{scanResult.plasticType}</Badge>
            </View>
            <View style={{ marginBottom: 8 }}>
              <Text>Confidence</Text>
              <ProgressBar value={scanResult.confidence} />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text>Tokens Earned</Text>
              <Text style={{ fontWeight: "bold", color: colors.success }}>+{scanResult.tokensEarned} PLY</Text>
            </View>
          </CardContent>
        </Card>
      )}

      {/* City Metrics */}
      <Card style={{ marginBottom: 16, backgroundColor: colors.card }}>
        <CardHeader>
          <CardTitle>City Metrics & Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(cityMetrics).map(([city, metric]: any) => (
            <View key={city} style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontWeight: "bold" }}>{city}</Text>
                <Text>
                  PLY: {metric.forecast?.ply || 0}, CRT: {metric.forecast?.crt || 0}
                </Text>
              </View>
              <ProgressBar value={Math.min((metric.polyEarned / (metric.forecast?.ply || 1)) * 100, 100)} />
            </View>
          ))}
        </CardContent>
      </Card>

      {/* NFT Badges */}
      <Card style={{ marginBottom: 16, backgroundColor: colors.card }}>
        <CardHeader>
          <CardTitle>NFT Badges</CardTitle>
        </CardHeader>
        <CardContent style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {badges.map((badge: any) => (
            <Badge key={badge.id} variant={badge.unlocked ? "default" : "secondary"}>
              {badge.name} ({badge.rarity})
            </Badge>
          ))}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card style={{ marginBottom: 16, backgroundColor: colors.card }}>
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.map((p: any) => (
            <View key={p.id} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text>{p.title}</Text>
              <Button size="sm" onPress={() => contributeToProject(p.id, 10, "PLY")}>
                +10 PLY
              </Button>
            </View>
          ))}
        </CardContent>
      </Card>

      {/* Marketplace */}
      <Card style={{ marginBottom: 16, backgroundColor: colors.card }}>
        <CardHeader>
          <CardTitle>Marketplace Items</CardTitle>
        </CardHeader>
        <CardContent>
          {marketplaceItems.map((item: any) => (
            <View key={item.id} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text>{item.title}</Text>
              <Text style={{ fontWeight: "bold" }}>
                {item.price} {item.currency}
              </Text>
            </View>
          ))}
        </CardContent>
      </Card>
    </ScrollView>
  );
};
