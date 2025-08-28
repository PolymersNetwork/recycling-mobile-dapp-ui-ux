"use client";

import { useRef } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { ParticleEngine, ParticleRef } from "@/components/ui/ParticleEngine";
import { useRecycling } from "@/contexts/RecyclingContext";
import { useWallet } from "@/contexts/WalletContext";
import { Trash2, RefreshCw, LogOut } from "lucide-react";

export function Settings() {
  const particleRef = useRef<ParticleRef>(null);
  const { resetProgress, plyBalance, crtBalance, units, badges, setBadges } = useRecycling();
  const { wallet, connect } = useWallet();

  const handleReset = () => {
    resetProgress();
    setBadges([]);
    particleRef.current?.burstCoins({ count: 50, color: "#FF0000" });
    particleRef.current?.sparkleBadge({ count: 20, color: "#FFA500" });
  };

  const handleFakeReward = () => {
    particleRef.current?.burstCoins({ count: 30, color: "#FFD700" });
    particleRef.current?.sparkleBadge({ count: 15, color: "#00FFAA" });
  };

  const handleDisconnect = () => {
    // Reset wallet connection (simulated)
    connect(); // Optionally reconnect after disconnect
    alert("Wallet disconnected. Reconnect to continue.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20 relative">
      {/* Particle Engine */}
      <ParticleEngine ref={particleRef} />

      <MobileHeader title="Settings" showBack />

      <main className="p-4 space-y-6">
        {/* Wallet Management */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Wallet Management</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="space-y-2">
            <p>Connected Wallet:</p>
            <p className="font-mono text-sm text-eco-primary break-all">{wallet?.publicKey.toString() || "Not connected"}</p>
            <EcoButton variant="eco" onClick={handleDisconnect}>
              <LogOut className="w-4 h-4 mr-2" /> Disconnect Wallet
            </EcoButton>
          </EcoCardContent>
        </EcoCard>

        {/* Wallet & Recycling Stats */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Wallet Info</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="space-y-2">
            <p>PLY Balance: {plyBalance}</p>
            <p>CRT Balance: {crtBalance}</p>
            <p>Units Scanned: {units}</p>
            <p>Badges Earned: {badges.length}</p>
          </EcoCardContent>
        </EcoCard>

        {/* Actions */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Actions</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="space-y-3">
            <EcoButton variant="eco" onClick={handleReset}>
              <Trash2 className="w-4 h-4 mr-2" /> Reset Progress
            </EcoButton>

            <EcoButton variant="eco" onClick={handleFakeReward}>
              <RefreshCw className="w-4 h-4 mr-2" /> Trigger Particle Reward
            </EcoButton>
          </EcoCardContent>
        </EcoCard>
      </main>
    </div>
  );
}
