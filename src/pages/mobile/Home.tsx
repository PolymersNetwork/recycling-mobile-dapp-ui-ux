import { useState } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Coins, Zap, Target, TrendingUp, Camera, Leaf, Globe, Award, Star, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <MobileHeader title="Good morning, Alex!" notificationCount={3} />
      
      <main className="px-4 pt-2 pb-6 space-y-5">
        {/* Hero Stats Card */}
        <EcoCard variant="eco" className="shadow-glow animate-fade-in">
          <EcoCardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-white/20 rounded-full animate-bounce-subtle">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Level {user.level} Eco Warrior</h2>
                <p className="text-white/80 text-sm">Making the planet greener, one scan at a time</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{user.totalTokens.toLocaleString()}</div>
                  <div className="text-white/70 text-xs uppercase tracking-wide">Total POLY</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{user.streakDays}</div>
                  <div className="text-white/70 text-xs uppercase tracking-wide">Day Streak</div>
                </div>
              </div>
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 animate-slide-up">
          <EcoCard variant="elevated" className="shadow-card">
            <EcoCardContent className="p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 bg-eco-success/10 rounded-full flex items-center justify-center">
                <Coins className="w-5 h-5 text-eco-success" />
              </div>
              <div className="text-lg font-bold text-eco-success">+{user.todayTokens}</div>
              <div className="text-xs text-muted-foreground">Today</div>
            </EcoCardContent>
          </EcoCard>
          
          <EcoCard variant="elevated" className="shadow-card">
            <EcoCardContent className="p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 bg-eco-warning/10 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-eco-warning" />
              </div>
              <div className="text-lg font-bold text-eco-warning">{user.level}</div>
              <div className="text-xs text-muted-foreground">Level</div>
            </EcoCardContent>
          </EcoCard>
          
          <EcoCard variant="elevated" className="shadow-card">
            <EcoCardContent className="p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 bg-eco-primary/10 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-eco-primary" />
              </div>
              <div className="text-lg font-bold text-eco-primary">2.4kg</div>
              <div className="text-xs text-muted-foreground">CO₂ Saved</div>
            </EcoCardContent>
          </EcoCard>
        </div>

        {/* Weekly Progress */}
        <EcoCard className="shadow-card">
          <EcoCardHeader className="pb-3">
            <EcoCardTitle className="flex items-center justify-between">
              <span>Weekly Goal</span>
              <Badge variant="secondary" className="bg-eco-success/10 text-eco-success border-eco-success/20">
                {Math.round((user.weeklyProgress / user.weeklyGoal) * 100)}%
              </Badge>
            </EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{user.weeklyProgress}/{user.weeklyGoal} POLY</span>
                </div>
                <Progress value={(user.weeklyProgress / user.weeklyGoal) * 100} className="h-3" />
              </div>
              
              <div className="bg-eco-success/5 rounded-lg p-3 border border-eco-success/10">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-eco-success" />
                  <span className="text-sm font-medium text-eco-success">
                    {user.weeklyGoal - user.weeklyProgress} POLY to unlock weekly bonus!
                  </span>
                </div>
              </div>
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Quick Actions */}
        <EcoCard className="shadow-card">
          <EcoCardHeader className="pb-3">
            <EcoCardTitle>Quick Actions</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <div className="grid grid-cols-2 gap-4">
              <EcoButton variant="eco" className="h-24 flex-col space-y-2 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <Camera className="w-7 h-7" />
                <div className="text-center">
                  <span className="text-sm font-medium">Scan Plastic</span>
                  <div className="text-xs opacity-80">Earn POLY tokens</div>
                </div>
              </EcoButton>
              
              <EcoButton variant="eco-outline" className="h-24 flex-col space-y-2 group">
                <Target className="w-7 h-7" />
                <div className="text-center">
                  <span className="text-sm font-medium">Projects</span>
                  <div className="text-xs opacity-70">Support eco causes</div>
                </div>
              </EcoButton>
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Daily Challenges */}
        <EcoCard className="shadow-card">
          <EcoCardHeader className="pb-3">
            <EcoCardTitle className="flex items-center justify-between">
              <span>Daily Challenges</span>
              <Badge variant="secondary" className="bg-eco-primary/10 text-eco-primary border-eco-primary/20">
                2 of 3 complete
              </Badge>
            </EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <div className="space-y-3">
              <div className="group p-4 bg-gradient-to-r from-eco-success/10 to-eco-success/5 rounded-xl border border-eco-success/20 hover:border-eco-success/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-eco-success/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-eco-success rounded-full"></div>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Scan 3 plastic items</span>
                      <div className="text-xs text-muted-foreground">3/3 complete ✓</div>
                    </div>
                  </div>
                  <Badge className="bg-eco-success text-white">+50 POLY</Badge>
                </div>
              </div>
              
              <div className="group p-4 bg-gradient-to-r from-eco-success/10 to-eco-success/5 rounded-xl border border-eco-success/20 hover:border-eco-success/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-eco-success/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-eco-success rounded-full"></div>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Share your impact</span>
                      <div className="text-xs text-muted-foreground">1/1 complete ✓</div>
                    </div>
                  </div>
                  <Badge className="bg-eco-success text-white">+25 POLY</Badge>
                </div>
              </div>
              
              <div className="group p-4 bg-muted/30 rounded-xl border border-muted hover:border-muted-foreground/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full"></div>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Contribute to a project</span>
                      <div className="text-xs text-muted-foreground">0/1 remaining</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge variant="outline">+100 POLY</Badge>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Recent Activity */}
        <EcoCard className="shadow-card">
          <EcoCardHeader className="pb-3">
            <EcoCardTitle className="flex items-center justify-between">
              <span>Recent Activity</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="w-10 h-10 bg-eco-success/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-5 h-5 text-eco-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Plastic bottle scanned</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>2 hours ago</span>
                    <Badge variant="outline" className="text-eco-success border-eco-success/30 bg-eco-success/5">
                      +25 POLY
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="w-10 h-10 bg-eco-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-eco-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Ocean Cleanup donation</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>1 day ago</span>
                    <Badge variant="outline" className="text-eco-primary border-eco-primary/30 bg-eco-primary/5">
                      -100 POLY
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="w-10 h-10 bg-eco-warning/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-eco-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Level up achievement</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>2 days ago</span>
                    <Badge variant="outline" className="text-eco-warning border-eco-warning/30 bg-eco-warning/5">
                      Level 12
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </EcoCardContent>
        </EcoCard>
      </main>
    </div>
  );
}