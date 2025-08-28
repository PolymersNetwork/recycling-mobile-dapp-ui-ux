"use client";

import { useEffect, useRef, useState } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Zap, Target } from "lucide-react";
import { useRecycling } from "@/contexts/RecyclingContext";
import { ParticleEngine, ParticleRef } from "@/components/ui/ParticleEngine";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export function Profile() {
  const { plyBalance, crtBalance, units, badges } = useRecycling();
  const particleRef = useRef<ParticleRef>(null);

  const [animatedPly, setAnimatedPly] = useState(plyBalance);
  const [animatedCrt, setAnimatedCrt] = useState(crtBalance);
  const [animatedUnits, setAnimatedUnits] = useState(units);

  // Animate counters whenever values update
  useEffect(() => {
    if (plyBalance > animatedPly) {
      setAnimatedPly(plyBalance);
      particleRef.current?.burstCoins({ count: 30, color: "#FFD700" });
    }
  }, [plyBalance]);

  useEffect(() => {
    if (crtBalance > animatedCrt) {
      setAnimatedCrt(crtBalance);
      particleRef.current?.burstCoins({ count: 20, color: "#00FFAA" });
    }
  }, [crtBalance]);

  useEffect(() => {
    if (units > animatedUnits) {
      setAnimatedUnits(units);
      particleRef.current?.sparkleBadge({ count: 15, color: "#FFAA00" });
    }
  }, [units]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20 relative">
      <ParticleEngine ref={particleRef} />
      <MobileHeader title="Profile" showSettings />

      <main className="p-4 space-y-6">
        {/* Profile Header */}
        <EcoCard variant="eco">
          <EcoCardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-white text-eco-primary text-xl font-bold">
                  U
                </AvatarFallback>
              </Avatar>
              <div className="text-white">
                <h2 className="text-xl font-bold">Underdog User</h2>
                <p className="text-eco-primary-light">Eco Champion</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Zap className="w-4 h-4" />
                  <AnimatedCounter value={animatedUnits} className="text-sm" /> scans
                </div>
              </div>
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <EcoCard padding="sm">
            <div className="text-center">
              <Trophy className="w-6 h-6 text-eco-warning mx-auto mb-2" />
              <AnimatedCounter value={badges.length} className="text-lg font-bold" />
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
          </EcoCard>
          <EcoCard padding="sm">
            <div className="text-center">
              <Target className="w-6 h-6 text-eco-success mx-auto mb-2" />
              <AnimatedCounter value={animatedPly} className="text-lg font-bold" />
              <p className="text-xs text-muted-foreground">PLY Earned</p>
            </div>
          </EcoCard>
          <EcoCard padding="sm">
            <div className="text-center">
              <Zap className="w-6 h-6 text-eco-primary mx-auto mb-2" />
              <AnimatedCounter value={animatedUnits} className="text-lg font-bold" />
              <p className="text-xs text-muted-foreground">Scans</p>
            </div>
          </EcoCard>
        </div>

        {/* Recent Badges */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Recent Achievements</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <div className="grid grid-cols-4 gap-3">
              {badges.slice(-4).map((badge, i) => (
                <div
                  key={i}
                  className="text-center relative"
                  onMouseEnter={() => particleRef.current?.sparkleBadge({ count: 20, color: "#FFD700" })}
                >
                  <div className="w-12 h-12 bg-eco-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 transform transition-transform duration-300 hover:scale-110">
                    <span className="text-xl">{badge.emoji || "🏆"}</span>
                  </div>
                  <Badge
                    variant={badge.unlocked ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {badge.name}
                  </Badge>
                </div>
              ))}
            </div>
          </EcoCardContent>
        </EcoCard>
      </main>
    </div>
  );
}
