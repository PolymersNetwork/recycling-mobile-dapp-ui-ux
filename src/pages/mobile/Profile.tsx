import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Zap, Target } from "lucide-react";
import { useRecycling } from "@/contexts/RecyclingContext";

export function Profile() {
  const { plyBalance, crtBalance, units, badges } = useRecycling();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
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
                  <span className="text-sm">{units} scans</span>
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
              <p className="text-lg font-bold">{badges.length}</p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
          </EcoCard>
          <EcoCard padding="sm">
            <div className="text-center">
              <Target className="w-6 h-6 text-eco-success mx-auto mb-2" />
              <p className="text-lg font-bold">{plyBalance}</p>
              <p className="text-xs text-muted-foreground">PLY Earned</p>
            </div>
          </EcoCard>
          <EcoCard padding="sm">
            <div className="text-center">
              <Zap className="w-6 h-6 text-eco-primary mx-auto mb-2" />
              <p className="text-lg font-bold">{units}</p>
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
                <div key={i} className="text-center">
                  <div className="w-12 h-12 bg-eco-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl">{badge.emoji || "🏆"}</span>
                  </div>
                  <Badge variant={badge.unlocked ? "default" : "secondary"} className="text-xs">
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
