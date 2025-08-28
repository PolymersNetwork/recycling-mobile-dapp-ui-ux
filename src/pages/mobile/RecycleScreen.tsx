"use client";

import { useState, useEffect, useRef } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRecycling } from "@/contexts/RecyclingContext";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ParticleEngine, triggerParticles } from "@/components/ParticleEngine";

export function RecycleScreen() {
  const { plyBalance, crtBalance, badges, logRecycleUnit, submitBatch, cityMetrics } = useRecycling();
  const [scanning, setScanning] = useState(false);
  const counterRefs = {
    ply: useRef<HTMLDivElement>(null),
    crt: useRef<HTMLDivElement>(null),
  };

  const handleScan = () => {
    logRecycleUnit({ city: "New York", lat: 0, lng: 0 });
    triggerParticles(counterRefs.ply.current!, "coin");
    triggerParticles(counterRefs.crt.current!, "coin");
  };

  const handleSubmit = async () => {
    await submitBatch();
    triggerParticles(counterRefs.ply.current!, "combo");
    triggerParticles(counterRefs.crt.current!, "combo");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      <ParticleEngine />
      <MobileHeader title="Recycle Dashboard" />

      <main className="p-4 space-y-6">
        {/* Scan + Earn */}
        <EcoCard variant="eco">
          <EcoCardContent className="flex flex-col items-center space-y-2">
            <EcoButton onClick={handleScan}>Scan Plastic</EcoButton>
          </EcoCardContent>
        </EcoCard>

        {/* Token Balances */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Balances</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex justify-around">
            <div ref={counterRefs.ply} className="text-center">
              <AnimatedCounter value={plyBalance} suffix=" PLY" />
              <p className="text-xs text-muted-foreground">PLY</p>
            </div>
            <div ref={counterRefs.crt} className="text-center">
              <AnimatedCounter value={crtBalance} suffix=" CRT" />
              <p className="text-xs text-muted-foreground">CRT</p>
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Badges */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Badges</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex flex-wrap gap-4">
            {badges.map((badge) => (
              <Badge
                key={badge.id}
                variant={badge.unlocked ? "default" : "secondary"}
                onClick={(e) => triggerParticles(e.currentTarget, badge.rarity)}
                className="cursor-pointer transform transition-transform hover:scale-110"
              >
                {badge.name}
              </Badge>
            ))}
          </EcoCardContent>
        </EcoCard>

        {/* City Metrics */}
        {Object.entries(cityMetrics).map(([city, metric]) => (
          <EcoCard key={city}>
            <EcoCardHeader>
              <EcoCardTitle>{city} Metrics</EcoCardTitle>
            </EcoCardHeader>
            <EcoCardContent>
              <p>PLY Forecast: {metric.forecast?.ply || 0}</p>
              <p>CRT Forecast: {metric.forecast?.crt || 0}</p>
              <Progress value={(metric.polyEarned / (metric.forecast?.ply || 1)) * 100} />
            </EcoCardContent>
          </EcoCard>
        ))}

        <EcoButton onClick={handleSubmit} variant="eco" className="w-full mt-4">
          Submit Batch
        </EcoButton>
      </main>
    </div>
  );
}
