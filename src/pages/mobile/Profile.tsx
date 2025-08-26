import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Zap, Target, Settings } from "lucide-react";

export function Profile() {
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
                  A
                </AvatarFallback>
              </Avatar>
              <div className="text-white">
                <h2 className="text-xl font-bold">Alex Green</h2>
                <p className="text-eco-primary-light">Level 12 Eco Warrior</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">7 day streak</span>
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
              <p className="text-lg font-bold">12</p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
          </EcoCard>
          <EcoCard padding="sm">
            <div className="text-center">
              <Target className="w-6 h-6 text-eco-success mx-auto mb-2" />
              <p className="text-lg font-bold">2.8K</p>
              <p className="text-xs text-muted-foreground">POLY Earned</p>
            </div>
          </EcoCard>
          <EcoCard padding="sm">
            <div className="text-center">
              <Zap className="w-6 h-6 text-eco-primary mx-auto mb-2" />
              <p className="text-lg font-bold">156</p>
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
              {["🌱", "🏆", "⚡", "🎯"].map((emoji, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 bg-eco-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl">{emoji}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">New</Badge>
                </div>
              ))}
            </div>
          </EcoCardContent>
        </EcoCard>
      </main>
    </div>
  );
}