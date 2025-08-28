"use client";

import { useEffect, useRef, useState } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart } from "lucide-react";
import { useRecycling } from "@/contexts/RecyclingContext";
import { ParticleEngine, ParticleRef } from "@/components/ui/ParticleEngine";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export function Home() {
  const { plyBalance, crtBalance, units, badges, addTokens, addBadge } = useRecycling();
  const particleRef = useRef<ParticleRef>(null);

  const [animatedPly, setAnimatedPly] = useState(plyBalance);
  const [animatedCrt, setAnimatedCrt] = useState(crtBalance);
  const [animatedUnits, setAnimatedUnits] = useState(units);

  // Mock projects for demo
  const [projects, setProjects] = useState([
    { id: "1", title: "Ocean Cleanup", description: "Removing plastic from oceans", currentAmount: 32750, targetAmount: 50000, contributors: 247, category: "cleanup" },
    { id: "2", title: "Solar School Initiative", description: "Installing solar panels", currentAmount: 18500, targetAmount: 75000, contributors: 89, category: "renewable" },
  ]);

  // Animate counters on balance changes
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

  // Handle contributing to a project
  const handleContribute = async (projectId: string) => {
    // Update project progress
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, currentAmount: p.currentAmount + 100, contributors: p.contributors + 1 }
          : p
      )
    );

    // Reward user tokens
    addTokens(100, 0, 1); // Example: 100 PLY + 1 Unit
    particleRef.current?.burstCoins({ count: 25, color: "#FFD700" });

    // Randomly grant NFT badge
    if (Math.random() < 0.3) {
      const newBadge = {
        id: Date.now().toString(),
        name: `Eco Badge #${badges.length + 1}`,
        emoji: "🏆",
        rarity: ["common", "rare", "epic", "legendary"][Math.floor(Math.random() * 4)] as any,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      };
      addBadge(newBadge);

      particleRef.current?.sparkleBadge({
        count: 20,
        color: newBadge.rarity === "legendary" ? "#FFD700" :
               newBadge.rarity === "epic" ? "#4B6EE2" :
               newBadge.rarity === "rare" ? "#00FFAA" : "#AAAAAA",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20 relative">
      {/* Particle Engine */}
      <ParticleEngine ref={particleRef} />

      <MobileHeader title="Gamified Eco Dashboard" />

      <main className="p-4 space-y-6">
        {/* User Progress */}
        <EcoCard>
          <EcoCardHeader className="flex justify-between items-center">
            <EcoCardTitle>Your Progress</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="space-y-2">
            <p>PLY Balance:</p>
            <AnimatedCounter value={animatedPly} className="text-lg font-bold" />
            <Progress value={(animatedPly % 500) / 5} className="h-4" />
            <p>CRT Balance:</p>
            <AnimatedCounter value={animatedCrt} className="text-lg font-bold" />
            <Progress value={(animatedCrt % 500) / 5} className="h-4" />
            <p>Units Scanned:</p>
            <AnimatedCounter value={animatedUnits} className="text-lg font-bold" />
            <Progress value={(animatedUnits % 30) * 3.33} className="h-4" />

            <div className="flex flex-wrap gap-2 mt-2">
              {badges.map(b => (
                <UiBadge
                  key={b.id}
                  className={`capitalize ${b.rarity === "legendary" ? "bg-yellow-500/20 text-yellow-600" :
                                          b.rarity === "epic" ? "bg-purple-500/20 text-purple-600" :
                                          b.rarity === "rare" ? "bg-blue-500/20 text-blue-600" :
                                          "bg-gray-200 text-gray-700"}`}
                  title={`Unlocked: ${b.unlockedAt}`}
                >
                  {b.name}
                </UiBadge>
              ))}
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Projects */}
        <div className="space-y-4">
          {projects.map(p => (
            <EcoCard key={p.id} variant="elevated">
              <EcoCardHeader>
                <EcoCardTitle>{p.title}</EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent>
                <p>{p.description}</p>
                <p>{p.currentAmount} / {p.targetAmount}</p>
                <EcoButton variant="eco" onClick={() => handleContribute(p.id)}>
                  <Heart className="w-4 h-4" /> Contribute
                </EcoButton>
              </EcoCardContent>
            </EcoCard>
          ))}
        </div>
      </main>
    </div>
  );
}
