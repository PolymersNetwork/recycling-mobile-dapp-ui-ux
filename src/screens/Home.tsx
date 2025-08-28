"use client";

import { useEffect, useRef, useState } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart } from "lucide-react";
import { EcoButton } from "@/components/ui/eco-button";
import { ParticleEngine, ParticleRef } from "@/components/ui/ParticleEngine";
import { usePortfolio } from "@/contexts/RecyclingContext";

export function Home() {
  const particleRef = useRef<ParticleRef>(null);
  const {
    plyBalance,
    badges,
    projects,
    contributeToProject,
  } = usePortfolio();

  const [animatedPly, setAnimatedPly] = useState(plyBalance);

  useEffect(() => {
    if (plyBalance > animatedPly) {
      setAnimatedPly(plyBalance);
      particleRef.current?.burstCoins({ count: 30, color: "#FFD700" });
    }
  }, [plyBalance]);

  const handleContribute = async (projectId: string) => {
    await contributeToProject(projectId, 100);

    const el = document.getElementById(`project-${projectId}`);
    if (el) {
      el.classList.add("animate-pulse");
      setTimeout(() => el.classList.remove("animate-pulse"), 1000);
    }
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
      <MobileHeader title="Eco Dashboard" />

      <main className="p-4 space-y-6">
        {/* User PLY Balance */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>PLY Balance</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="text-eco-primary font-bold text-lg">
            {animatedPly.toLocaleString()} PLY
          </EcoCardContent>
        </EcoCard>

        {/* Projects */}
        <div className="space-y-4">
          {projects.map(project => (
            <EcoCard key={project.id} id={`project-${project.id}`} variant="elevated">
              <EcoCardHeader>
                <EcoCardTitle>{project.title}</EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent>
                <p>{project.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <p>{project.currentAmount} / {project.targetAmount}</p>
                  <EcoButton variant="eco" onClick={() => handleContribute(project.id)}>
                    <Heart className="w-4 h-4" /> Contribute
                  </EcoButton>
                </div>
                <Progress value={(project.currentAmount / project.targetAmount) * 100} className="mt-2 h-4" />
                <UiBadge className={`mt-2 ${getCategoryColor(project.category)}`}>{project.category}</UiBadge>
              </EcoCardContent>
            </EcoCard>
          ))}
        </div>

        {/* NFT Badges */}
        <Tabs defaultValue="badges">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="badges">NFT Badges</TabsTrigger>
          </TabsList>
          <TabsContent value="badges" className="grid grid-cols-2 gap-4 mt-4">
            {badges.map(b => (
              <EcoCard key={b.id} variant="elevated">
                <EcoCardContent className="flex flex-col items-center space-y-2">
                  <img src={b.icon} className="w-16 h-16 rounded-full" alt={b.name} />
                  <p className="font-medium">{b.name}</p>
                  {b.unlockedAt && <p className="text-xs text-muted-foreground">{new Date(b.unlockedAt).toLocaleDateString()}</p>}
                  <UiBadge className={`capitalize ${b.rarity === "legendary" ? "bg-yellow-500/20 text-yellow-600" :
                                               b.rarity === "epic" ? "bg-purple-500/20 text-purple-600" :
                                               b.rarity === "rare" ? "bg-blue-500/20 text-blue-600" :
                                               "bg-gray-200 text-gray-700"}`}>
                    {b.rarity}
                  </UiBadge>
                </EcoCardContent>
              </EcoCard>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
