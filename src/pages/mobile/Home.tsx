"use client";

import { useEffect } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart } from "lucide-react";
import { usePortfolio } from "@/contexts/RecyclingContext";

export function Home() {
  const {
    user,
    balances,
    projects,
    nftBadges,
    contributeProject,
    particleRef,
  } = usePortfolio();

  const handleContribute = async (projectId: string) => {
    await contributeProject(projectId);
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      <MobileHeader title="Gamified Eco Dashboard" />

      <main className="p-4 space-y-6">
        {/* User Progress */}
        <EcoCard>
          <EcoCardHeader className="flex justify-between items-center">
            <EcoCardTitle>{user.name}'s Progress</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="space-y-2">
            <p>Level {user.level}</p>
            <Progress value={(user.totalTokens % 500) / 5} className="h-4" />
            <p>Streak: {user.streakDays} days</p>
            <Progress value={(user.streakDays % 30) * 3.33} className="h-4" />
            <p id="token-achievement" className="text-lg font-bold text-eco-primary mt-1">
              Tokens: {user.totalTokens}
            </p>

            <div className="flex flex-wrap gap-2 mt-2">
              {nftBadges.map(b => (
                <UiBadge
                  key={b.id}
                  className={`capitalize ${
                    b.rarity === "legendary"
                      ? "bg-yellow-500/20 text-yellow-600"
                      : b.rarity === "epic"
                      ? "bg-purple-500/20 text-purple-600"
                      : b.rarity === "rare"
                      ? "bg-blue-500/20 text-blue-600"
                      : "bg-gray-200 text-gray-700"
                  }`}
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

        {/* Tabs: Balances + NFT Badges */}
        <Tabs defaultValue="balances" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="balances">Balances</TabsTrigger>
            <TabsTrigger value="badges">NFT Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="balances" className="space-y-3">
            {balances.map(b => (
              <EcoCard key={b.symbol} variant="elevated">
                <EcoCardContent className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {b.symbol}
                  </div>
                  <div>
                    <p className="font-semibold">{b.symbol}</p>
                    <p className="text-sm text-muted-foreground">{b.amount.toLocaleString()}</p>
                  </div>
                </EcoCardContent>
              </EcoCard>
            ))}
          </TabsContent>

          <TabsContent value="badges" className="grid grid-cols-2 gap-4">
            {nftBadges.map(b => (
              <EcoCard key={b.id} variant="elevated">
                <EcoCardContent className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center">
                    <img src={b.icon} alt={b.name} className="w-16 h-16 rounded-full" />
                  </div>
                  <p className="font-medium text-center">{b.name}</p>
                  {b.unlockedAt && <p className="text-xs text-muted-foreground">{new Date(b.unlockedAt).toLocaleDateString()}</p>}
                  <UiBadge className={`capitalize ${
                    b.rarity === "legendary"
                      ? "bg-yellow-500/20 text-yellow-600"
                      : b.rarity === "epic"
                      ? "bg-purple-500/20 text-purple-600"
                      : b.rarity === "rare"
                      ? "bg-blue-500/20 text-blue-600"
                      : "bg-gray-200 text-gray-700"
                  }`}>{b.rarity}</UiBadge>
                </EcoCardContent>
              </EcoCard>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
