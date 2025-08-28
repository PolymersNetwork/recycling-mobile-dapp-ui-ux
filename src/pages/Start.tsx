"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EcoButton } from "@/components/ui/eco-button";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Coins, Trophy, Users, Camera, Smartphone, Zap } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { eventsService } from "@/services/events";
import { ROUTES } from "@/constants";
import { ParticleEngine } from "@/components/ui/ParticleEngine";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

interface StartProps {
  logoUrl?: string;
  appName?: string;
}

export function Start({ logoUrl, appName = "Polymers" }: StartProps) {
  const navigate = useNavigate();
  const { connectWallet, isConnecting } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [particles, setParticles] = useState<{ id: string; x: number; y: number; type: "coin" | "sparkle" }[]>([]);

  const triggerParticleBurst = (type: "coin" | "sparkle") => {
    const newBurst = { id: crypto.randomUUID(), x: Math.random() * 300, y: Math.random() * 100, type };
    setParticles(prev => [...prev, newBurst]);
    // auto-clear after animation duration
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== newBurst.id)), 1500);
  };

  const handleConnectWallet = async (walletType: 'phantom' | 'solflare' | 'backpack' | 'sui') => {
    setSelectedWallet(walletType);
    try {
      await connectWallet(walletType);
      eventsService.trackWalletConnect(walletType);

      // Trigger coin + sparkle burst
      triggerParticleBurst("coin");
      triggerParticleBurst("sparkle");

      navigate(ROUTES.HOME);
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      eventsService.trackError('wallet_connection_failed', { walletType, error: error.message });
    }
  };

  const handleSkipForNow = () => {
    navigate(ROUTES.HOME);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-eco-primary/5 p-4 overflow-hidden">
      {/* Particle Layer */}
      <ParticleEngine particles={particles} />

      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 pt-12">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-eco-primary to-eco-success animate-bounce">
            {logoUrl ? (
              <img src={logoUrl} alt={appName} className="w-full h-full object-cover" />
            ) : (
              <Leaf className="w-10 h-10 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-eco-primary to-eco-success bg-clip-text text-transparent animate-pulse">
              {appName}
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Earn <AnimatedCounter value={0} /> PLY tokens by recycling plastic
            </p>
            <Badge variant="secondary" className="mt-2 animate-bounce">
              v1.0 Beta
            </Badge>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Camera, title: "Scan Plastic", subtitle: "AI Detection" },
            { icon: Coins, title: "Earn PLY", subtitle: "Token Rewards" },
            { icon: Trophy, title: "NFT Badges", subtitle: "Achievements" },
            { icon: Users, title: "Community", subtitle: "Leaderboards" },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <EcoCard key={idx} variant="elevated" className="text-center p-4">
                <Icon className="w-8 h-8 text-eco-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.subtitle}</p>
              </EcoCard>
            );
          })}
        </div>

        {/* Wallet Connection */}
        <EcoCard variant="eco">
          <EcoCardHeader>
            <EcoCardTitle className="text-center">Connect Your Wallet</EcoCardTitle>
            <p className="text-center text-sm text-muted-foreground">
              Connect a Solana wallet to start earning PLY tokens
            </p>
          </EcoCardHeader>
          <EcoCardContent className="space-y-3">
            <EcoButton
              variant="eco"
              className="w-full h-12"
              onClick={() => handleConnectWallet('phantom')}
              disabled={isConnecting}
            >
              <Smartphone className="w-5 h-5" />
              {isConnecting && selectedWallet === 'phantom' ? 'Connecting...' : 'Phantom Wallet'}
            </EcoButton>
            
            <EcoButton
              variant="eco-outline"
              className="w-full h-12"
              onClick={() => handleConnectWallet('solflare')}
              disabled={isConnecting}
            >
              <Zap className="w-5 h-5" />
              {isConnecting && selectedWallet === 'solflare' ? 'Connecting...' : 'Solflare Wallet'}
            </EcoButton>
            
            <EcoButton
              variant="eco-outline"
              className="w-full h-12"
              onClick={() => handleConnectWallet('backpack')}
              disabled={isConnecting}
            >
              <Users className="w-5 h-5" />
              {isConnecting && selectedWallet === 'backpack' ? 'Connecting...' : 'Backpack Wallet'}
            </EcoButton>
          </EcoCardContent>
        </EcoCard>

        {/* Skip Option */}
        <div className="text-center">
          <button 
            onClick={handleSkipForNow}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        </div>

        {/* Info */}
        <EcoCard className="bg-eco-primary/5 border-eco-primary/20">
          <EcoCardContent className="text-center p-4">
            <p className="text-sm text-eco-primary font-medium">
              🌱 Every plastic item recycled helps save our planet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Join thousands of eco-warriors earning rewards for recycling
            </p>
          </EcoCardContent>
        </EcoCard>
      </div>
    </div>
  );
}
