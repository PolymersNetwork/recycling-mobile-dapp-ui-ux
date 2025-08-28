import React, { useState } from "react";
import { View, ScrollView, Text } from "react-native";
import Confetti from "react-native-confetti-cannon";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoButton } from "@/components/ui/eco-button";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, Zap, CheckCircle, Wifi, QrCode } from "lucide-react-native";
import { useCamera } from "@/hooks/useCamera";
import { useRecycling } from "@/contexts/RecyclingContext";
import { useProjects } from "@/hooks/useProjects";
import { useMarketplace } from "@/hooks/useMarketplace";
import useSound from "use-sound";
import scanSuccessSound from "@/assets/sounds/scan-success.mp3";

export function Scan() {
  const { isScanning, cameraType, capturePhoto, scanQRCode, scanNFC, uploadFromGallery, scanResult, clearResult } = useCamera();
  const { plyBalance, crtBalance, units, logRecycleUnit, badges, cityMetrics } = useRecycling();
  const { projects, contributeToProject } = useProjects();
  const { marketplace } = useMarketplace();
  const [play] = useSound(scanSuccessSound);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleScan = async (type: "camera" | "qr" | "nfc" = "camera") => {
    try {
      let result;
      switch (type) {
        case "camera":
          result = await capturePhoto();
          break;
        case "qr":
          result = await scanQRCode();
          break;
        case "nfc":
          result = await scanNFC();
          break;
      }

      if (result?.verified) {
        logRecycleUnit({ city: result.location || "Unknown", lat: 0, lng: 0 });
        play();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (err) {
      console.error("Scan failed:", err);
    }
  };

  const handleUpload = () => uploadFromGallery();

  return (
    <ScrollView className="flex-1 bg-gradient-to-br from-background to-muted pb-24">
      <MobileHeader title="Scan Plastic" />
      {showConfetti && <Confetti count={200} origin={{ x: 160, y: 0 }} />}

      {/* Scan Panel */}
      <EcoCard variant="elevated" padding="none">
        <View className="relative aspect-[4/3] bg-muted rounded-2xl flex items-center justify-center">
          {isScanning ? (
            <View className="items-center">
              <Zap className="w-12 h-12 text-eco-primary animate-spin" />
              <Text className="text-sm text-muted-foreground">Processing {cameraType}</Text>
              <Progress value={75} className="w-48 mt-2" />
            </View>
          ) : (
            <View className="items-center">
              <Camera className="w-16 h-16 text-muted-foreground" />
              <Text className="font-semibold mt-2">Ready to Scan</Text>
            </View>
          )}
        </View>
        <View className="p-4 grid grid-cols-2 gap-3">
          <EcoButton onPress={() => handleScan("camera")} disabled={isScanning}>
            <Camera className="w-5 h-5" /> Camera
          </EcoButton>
          <EcoButton onPress={() => handleScan("qr")} disabled={isScanning}>
            <QrCode className="w-5 h-5" /> QR Code
          </EcoButton>
          <EcoButton onPress={() => handleScan("nfc")} disabled={isScanning}>
            <Wifi className="w-5 h-5" /> NFC Scan
          </EcoButton>
          <EcoButton onPress={handleUpload}>
            <Upload className="w-5 h-5" /> Upload
          </EcoButton>
        </View>
      </EcoCard>

      {/* Scan Result */}
      {scanResult && (
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>
              <CheckCircle className="w-5 h-5 text-eco-success" /> Scan Result
            </EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <View className="flex-row justify-between">
              <Text>Plastic Type</Text>
              <Badge variant="secondary">{scanResult.plasticType}</Badge>
            </View>
            <View className="flex-row justify-between mt-1">
              <Text>Confidence</Text>
              <Progress value={scanResult.confidence * 100} className="w-32" />
            </View>
            <View className="flex-row justify-between mt-1">
              <Text>Tokens Earned</Text>
              <Text className="font-bold text-eco-success">+{scanResult.tokensEarned} PLY</Text>
            </View>
            <View className="flex-row justify-between mt-1">
              <Text>Status</Text>
              <Badge variant={scanResult.verified ? "default" : "secondary"}>
                {scanResult.verified ? "Verified" : "Pending"}
              </Badge>
            </View>
          </EcoCardContent>
        </EcoCard>
      )}

      {/* City Metrics */}
      <EcoCard>
        <EcoCardHeader>
          <EcoCardTitle>City Metrics & Projections</EcoCardTitle>
        </EcoCardHeader>
        <EcoCardContent>
          {Object.entries(cityMetrics).map(([city, metric]) => (
            <View key={city} className="border-b border-muted py-2">
              <View className="flex-row justify-between">
                <Text className="font-semibold">{city}</Text>
                <Text>
                  PLY: {metric.forecast?.ply || 0}, CRT: {metric.forecast?.crt || 0}
                </Text>
              </View>
              <Progress value={Math.min((metric.polyEarned / (metric.forecast?.ply || 1)) * 100, 100)} />
            </View>
          ))}
        </EcoCardContent>
      </EcoCard>

      {/* NFT Badges */}
      <EcoCard>
        <EcoCardHeader>
          <EcoCardTitle>NFT Badges</EcoCardTitle>
        </EcoCardHeader>
        <EcoCardContent className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <Badge key={badge.id} variant={badge.unlocked ? "default" : "secondary"}>
              {badge.name} ({badge.rarity})
            </Badge>
          ))}
        </EcoCardContent>
      </EcoCard>

      {/* Projects */}
      <EcoCard>
        <EcoCardHeader>
          <EcoCardTitle>Active Projects</EcoCardTitle>
        </EcoCardHeader>
        <EcoCardContent>
          {projects.map((p) => (
            <View key={p.id} className="flex-row justify-between items-center mt-2">
              <Text>{p.title}</Text>
              <EcoButton size="sm" onPress={() => contributeToProject(p.id, 10, "PLY")}>
                +10 PLY
              </EcoButton>
            </View>
          ))}
        </EcoCardContent>
      </EcoCard>

      {/* Marketplace */}
      <EcoCard>
        <EcoCardHeader>
          <EcoCardTitle>Marketplace Items</EcoCardTitle>
        </EcoCardHeader>
        <EcoCardContent>
          {marketplace.map((item) => (
            <View key={item.id} className="flex-row justify-between items-center mt-2">
              <Text>{item.title}</Text>
              <Text className="font-semibold">{item.price} {item.currency}</Text>
            </View>
          ))}
        </EcoCardContent>
      </EcoCard>
    </ScrollView>
  );
}
