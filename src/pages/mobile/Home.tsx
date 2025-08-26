import { useState } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Coins, Zap, Target, TrendingUp, Camera, Leaf } from "lucide-react";

export function Home() {
  const [user] = useState({
    name: "Alex",
    level: 12,
    streakDays: 7,
    totalTokens: 2840,
    todayTokens: 125,
    weeklyGoal: 500,
    weeklyProgress: 275,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      <MobileHeader title="Good morning, Alex!" notificationCount={3} />
      
      <main className="p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <EcoCard variant="eco" padding="sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Coins className="w-5 h-5 text-eco-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total POLY</p>
                <p className="text-lg font-bold text-eco-primary">{user.totalTokens.toLocaleString()}</p>
              </div>
            </div>
          </EcoCard>
          
          <EcoCard variant="eco" padding="sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Zap className="w-5 h-5 text-eco-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-lg font-bold text-eco-success">{user.streakDays} days</p>
              </div>
            </div>
          </EcoCard>
        </div>

        {/* Today's Progress */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Today's Impact</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tokens Earned</span>
                <span className="font-semibold text-eco-primary">+{user.todayTokens} POLY</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Weekly Goal Progress</span>
                  <span>{user.weeklyProgress}/{user.weeklyGoal} POLY</span>
                </div>
                <Progress value={(user.weeklyProgress / user.weeklyGoal) * 100} className="h-2" />
              </div>
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Quick Actions */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Quick Actions</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <div className="grid grid-cols-2 gap-3">
              <EcoButton variant="eco" className="h-20 flex-col">
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-xs">Scan Plastic</span>
              </EcoButton>
              
              <EcoButton variant="eco-outline" className="h-20 flex-col">
                <Target className="w-6 h-6 mb-1" />
                <span className="text-xs">View Projects</span>
              </EcoButton>
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Daily Challenges */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle className="flex items-center justify-between">
              Daily Challenges
              <Badge variant="secondary" className="text-xs">2/3</Badge>
            </EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-eco-success/10 rounded-lg border border-eco-success/20">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-eco-success rounded-full"></div>
                  <span className="text-sm">Scan 3 plastic items</span>
                </div>
                <span className="text-xs text-eco-success font-medium">+50 POLY</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <span className="text-sm">Contribute to a project</span>
                </div>
                <span className="text-xs text-muted-foreground font-medium">+100 POLY</span>
              </div>
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Recent Activity */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Recent Activity</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-2">
                <div className="w-8 h-8 bg-eco-success/20 rounded-full flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-eco-success" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Plastic bottle scanned</p>
                  <p className="text-xs text-muted-foreground">2 hours ago • +25 POLY</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-2">
                <div className="w-8 h-8 bg-eco-primary/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-eco-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Ocean Cleanup donation</p>
                  <p className="text-xs text-muted-foreground">1 day ago • -100 POLY</p>
                </div>
              </div>
            </div>
          </EcoCardContent>
        </EcoCard>
      </main>
    </div>
  );
}