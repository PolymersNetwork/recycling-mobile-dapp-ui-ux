import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Leaf, Smartphone, Zap, Users } from "lucide-react-native";

import { useWallet } from "@/contexts/WalletContext";
import { EcoButton } from "@/components/ui/eco-button";
import { EcoCard, EcoCardHeader, EcoCardTitle, EcoCardContent } from "@/components/ui/eco-card";
import { Badge } from "@/components/ui/badge";
import { ParticleEngine, ParticleRef } from "@/components/ui/ParticleEngine";

export function Start() {
  const navigation = useNavigation<any>();
  const { connectWallet, isConnecting } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [particles, setParticles] = useState<{ id: string; x: number; y: number; type: "coin" | "sparkle" }[]>([]);

  const triggerParticleBurst = (type: "coin" | "sparkle") => {
    const newBurst = { id: crypto.randomUUID(), x: Math.random() * 300, y: Math.random() * 100, type };
    setParticles(prev => [...prev, newBurst]);
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== newBurst.id)), 1500);
  };

  const handleConnectWallet = async (walletType: "phantom" | "solflare" | "backpack") => {
    setSelectedWallet(walletType);
    try {
      await connectWallet(walletType);
      triggerParticleBurst("coin");
      triggerParticleBurst("sparkle");
      navigation.navigate("Home");
    } catch (error: any) {
      console.error("Wallet connection failed:", error);
    }
  };

  const handleSkip = () => {
    navigation.navigate("Home");
  };

  return (
    <ScrollView className="flex-1 bg-gradient-to-br from-background via-background to-eco-primary/5 p-4">
      <ParticleEngine particles={particles} />

      <View className="items-center mt-12 mb-6">
        <View className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-eco-primary to-eco-success animate-bounce overflow-hidden">
          <Leaf className="w-12 h-12 text-white" />
        </View>
        <Text className="text-4xl font-bold text-white mt-4">Polymers</Text>
        <Text className="text-white/80 mt-2 text-center">
          Earn PLY tokens by recycling plastic and unlocking NFT badges
        </Text>
        <Badge variant="secondary" className="mt-2">v1.0 Beta</Badge>
      </View>

      <View className="grid grid-cols-2 gap-4 mb-6">
        {[
          { icon: Smartphone, title: "Scan Plastic", subtitle: "AI Detection" },
          { icon: Zap, title: "Earn PLY", subtitle: "Token Rewards" },
          { icon: Users, title: "Community", subtitle: "Leaderboards" },
          { icon: Leaf, title: "NFT Badges", subtitle: "Achievements" },
        ].map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <EcoCard key={idx} variant="elevated" className="p-4 items-center justify-center">
              <Icon className="w-8 h-8 text-eco-primary mb-2" />
              <Text className="font-semibold text-sm text-center">{feature.title}</Text>
              <Text className="text-xs text-muted-foreground text-center">{feature.subtitle}</Text>
            </EcoCard>
          );
        })}
      </View>

      <EcoCard variant="eco" className="mb-4">
        <EcoCardHeader>
          <EcoCardTitle className="text-center">Connect Your Wallet</EcoCardTitle>
        </EcoCardHeader>
        <EcoCardContent className="space-y-3">
          <EcoButton
            variant="eco"
            onPress={() => handleConnectWallet("phantom")}
            disabled={isConnecting}
          >
            <Smartphone className="w-5 h-5" />
            {isConnecting && selectedWallet === "phantom" ? "Connecting..." : "Phantom Wallet"}
          </EcoButton>

          <EcoButton
            variant="eco-outline"
            onPress={() => handleConnectWallet("solflare")}
            disabled={isConnecting}
          >
            <Zap className="w-5 h-5" />
            {isConnecting && selectedWallet === "solflare" ? "Connecting..." : "Solflare Wallet"}
          </EcoButton>

          <EcoButton
            variant="eco-outline"
            onPress={() => handleConnectWallet("backpack")}
            disabled={isConnecting}
          >
            <Users className="w-5 h-5" />
            {isConnecting && selectedWallet === "backpack" ? "Connecting..." : "Backpack Wallet"}
          </EcoButton>
        </EcoCardContent>
      </EcoCard>

      <TouchableOpacity onPress={handleSkip} className="items-center mt-2">
        <Text className="text-sm text-muted-foreground">Skip for now</Text>
      </TouchableOpacity>

      <EcoCard className="bg-eco-primary/5 border-eco-primary/20 mt-6">
        <EcoCardContent className="text-center p-4">
          <Text className="text-sm text-eco-primary font-medium">
            🌱 Every recycled item helps save our planet
          </Text>
          <Text className="text-xs text-muted-foreground mt-1">
            Join thousands of eco-warriors earning rewards for recycling
          </Text>
        </EcoCardContent>
      </EcoCard>
    </ScrollView>
  );
}
