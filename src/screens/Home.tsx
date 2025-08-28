"use client";

import { useEffect, useRef } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { EcoButton } from "@/components/ui/eco-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { usePortfolio } from "@/hooks/usePortfolio";
import { ParticleEngine, ParticleRef } from "@/components/ui/ParticleEngine";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export default function Home() {
  const particleRef = useRef<ParticleRef>(null);
  const {
    plyBalance,
    units,
    badges,
    projects,
    loading,
    contributeToProject,
  } = usePortfolio();

  const handleContribute = async (projectId: string) => {
    await contributeToProject(projectId);

    // Animate token achievement
    particleRef.current?.burstCoins({ count: 30, color: "#FFD700" });
    particleRef.current?.sparkleBadge({ count: 15, color: "#FFAA00" });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      cleanup: "bg-blue-500/10 text-blue-700 border-blue-200",
      renewable: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
      conservation: "bg-green-500/10 text-green-700 border-green-200",
      education: "bg-purple-500/10 text-purple-700 border-purple-200",
    };
    return colors[category] || colors.cleanup;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20 relative">
      <ParticleEngine ref={particleRef} />
      <MobileHeader title="Gamified Eco Dashboard" />

      <main className="p-4 space-y-6">
        {/* User Progress */}
        <EcoCard>
          <EcoCardHeader className="flex justify-between items-center">
            <EcoCardTitle>Your Progress</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="space-y-2">
            <p>PLY Earned</p>
            <Progress value={plyBalance % 500} className="h-4" />
            <p>Units: <AnimatedCounter value={units} /></p>
            <div className="flex flex-wrap gap-2 mt-2">
              {badges.map(b => (
                <UiBadge key={b.id} className={`capitalize ${b.rarity === "legendary" ? "bg-yellow-500/20 text-yellow-600" :
                                                   b.rarity === "epic" ? "bg-purple-500/20 text-purple-600" :
                                                   b.rarity === "rare" ? "bg-blue-500/20 text-blue-600" :
                                                   "bg-gray-200 text-gray-700"}`}>
                  {b.name}
                </UiBadge>
              ))}
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Projects */}
        <div className="space-y-4">
          {projects.map(project => (
            <EcoCard key={project.id} variant="elevated">
              <div className="relative">
                <div className="aspect-[2/1] bg-gradient-to-br from-eco-primary-light/20 to-eco-primary/10 rounded-t-2xl flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">Project Image</p>
                </div>
                <UiBadge className={`absolute top-3 right-3 ${getCategoryColor(project.category)}`}>
                  {project.category}
                </UiBadge>
              </div>
              <EcoCardContent>
                <EcoCardHeader>
                  <EcoCardTitle>{project.title}</EcoCardTitle>
                  <p>{project.description}</p>
                </EcoCardHeader>
                <div className="mt-4 flex justify-between items-center">
                  <p>{project.currentAmount} / {project.targetAmount}</p>
                  <EcoButton variant="eco" onClick={() => handleContribute(project.id)}>
                    <Heart className="w-4 h-4" /> Contribute
                  </EcoButton>
                </div>
              </EcoCardContent>
            </EcoCard>
          ))}
        </div>
      </main>
    </div>
  );
}
