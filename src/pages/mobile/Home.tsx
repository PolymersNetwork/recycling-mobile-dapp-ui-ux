import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { WalletButton } from "@/components/wallet/WalletButton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Zap, Target, TrendingUp, Camera, Leaf, Wallet, QrCode, Trophy, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import polymersLogo from "@/assets/polymers-logo.png";

export function Home() {
  const { connected, publicKey } = useWallet();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "EcoWarrior",
    level: 12,
    streakDays: 7,
    totalTokens: 2847,
    todayTokens: 125,
    weeklyGoal: 500,
    weeklyProgress: 342,
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recent recycling submissions
        const { data: submissions, error: submissionsError } = await supabase
          .from('recycling_submissions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (submissionsError) {
          console.error('Error fetching submissions:', submissionsError.message);
          toast({
            title: "Error",
            description: "Failed to load recent activity",
            variant: "destructive"
          });
        } else if (submissions) {
          setRecentSubmissions(submissions);
        }

        // Fetch user rewards data
        const { data: rewards, error: rewardsError } = await supabase
          .from('rewards')
          .select('amount, created_at')
          .order('created_at', { ascending: false });

        if (rewardsError) {
          console.error('Error fetching rewards:', rewardsError.message);
        } else if (rewards) {
          const totalTokens = rewards.reduce((sum, reward) => sum + (reward.amount || 0), 0);
          const today = new Date().toDateString();
          const todayTokens = rewards
            .filter(reward => new Date(reward.created_at).toDateString() === today)
            .reduce((sum, reward) => sum + (reward.amount || 0), 0);
          
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          const weeklyProgress = rewards
            .filter(reward => new Date(reward.created_at) >= weekAgo)
            .reduce((sum, reward) => sum + (reward.amount || 0), 0);

          setUser(prev => ({
            ...prev,
            totalTokens,
            todayTokens,
            weeklyProgress
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleScanNavigation = () => {
    navigate('/scan');
  };

  const handleProjectsNavigation = () => {
    navigate('/projects');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark via-brand-primary to-brand-dark pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-brand-dark/95 backdrop-blur-lg border-b border-brand-primary/20">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-accent to-brand-primary p-2">
              <img src={polymersLogo} alt="Polymers" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Good morning, {user.name}!</h1>
              <p className="text-xs text-brand-primary-light">Level {user.level} • {user.streakDays} day streak</p>
            </div>
          </div>
          
          {!connected ? (
            <WalletButton />
          ) : (
            <Button variant="brand-ghost" size="icon" className="relative">
              <Trophy className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-brand-accent">3</Badge>
            </Button>
          )}
        </div>
      </div>
      
      <main className="p-4 space-y-6">
        {/* Wallet Status */}
        {!connected && (
          <EcoCard className="border-brand-warning/30 bg-gradient-to-r from-brand-warning/10 to-brand-accent/10">
            <EcoCardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wallet className="w-5 h-5 text-brand-warning" />
                  <div>
                    <p className="font-semibold text-brand-warning">Connect Wallet</p>
                    <p className="text-xs text-muted-foreground">Connect to start earning rewards</p>
                  </div>
                </div>
                <WalletButton />
              </div>
            </EcoCardContent>
          </EcoCard>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <EcoCard className="bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 border-brand-primary/30">
            <EcoCardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-brand-primary/30 rounded-xl backdrop-blur-sm">
                  <Coins className="w-6 h-6 text-brand-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-primary-light">Total PLY</p>
                  <p className="text-2xl font-bold text-white">{user.totalTokens.toLocaleString()}</p>
                </div>
              </div>
            </EcoCardContent>
          </EcoCard>
          
          <EcoCard className="bg-gradient-to-br from-brand-success/20 to-brand-primary/20 border-brand-success/30">
            <EcoCardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-brand-success/30 rounded-xl backdrop-blur-sm">
                  <Zap className="w-6 h-6 text-brand-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-primary-light">Streak</p>
                  <p className="text-2xl font-bold text-white">{user.streakDays} days</p>
                </div>
              </div>
            </EcoCardContent>
          </EcoCard>
        </div>

        {/* Today's Progress */}
        <EcoCard className="bg-gradient-to-br from-brand-dark/80 to-brand-primary/20 border-brand-primary/30">
          <EcoCardHeader>
            <EcoCardTitle className="text-white flex items-center space-x-2">
              <Gift className="w-5 h-5 text-brand-accent" />
              <span>Today's Impact</span>
            </EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-primary-light">Tokens Earned</span>
                <span className="font-bold text-brand-accent text-lg">+{user.todayTokens} PLY</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-primary-light">Weekly Goal Progress</span>
                  <span className="text-white font-medium">{user.weeklyProgress}/{user.weeklyGoal} PLY</span>
                </div>
                <Progress 
                  value={(user.weeklyProgress / user.weeklyGoal) * 100} 
                  className="h-3 bg-brand-dark/50" 
                />
              </div>
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Quick Actions */}
        <EcoCard className="bg-gradient-to-br from-brand-dark/80 to-brand-primary/20 border-brand-primary/30">
          <EcoCardHeader>
            <EcoCardTitle className="text-white flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-brand-accent" />
              <span>Quick Actions</span>
            </EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="brand"
                onClick={handleScanNavigation}
                className="h-20 flex-col space-y-2 text-white font-semibold"
              >
                <Camera className="w-7 h-7" />
                <span className="text-sm">Scan Plastic</span>
              </Button>
              
              <Button 
                variant="brand-outline"
                onClick={handleProjectsNavigation}
                className="h-20 flex-col space-y-2 font-semibold"
              >
                <Target className="w-7 h-7" />
                <span className="text-sm">View Projects</span>
              </Button>
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Daily Challenges */}
        <EcoCard className="bg-gradient-to-br from-brand-dark/80 to-brand-primary/20 border-brand-primary/30">
          <EcoCardHeader>
            <EcoCardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-brand-accent" />
                <span>Daily Challenges</span>
              </div>
              <Badge className="bg-brand-accent text-brand-dark text-xs font-bold">2/3</Badge>
            </EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-brand-success/20 to-brand-accent/10 rounded-xl border border-brand-success/30">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-brand-success rounded-full shadow-lg"></div>
                  <span className="text-sm font-medium text-white">Scan 3 plastic items</span>
                </div>
                <span className="text-sm text-brand-success font-bold">+50 PLY</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-brand-primary/10 to-brand-dark/20 rounded-xl border border-brand-primary/20">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-brand-primary-light/50 rounded-full"></div>
                  <span className="text-sm font-medium text-brand-primary-light">Contribute to a project</span>
                </div>
                <span className="text-sm text-brand-primary-light font-bold">+100 PLY</span>
              </div>
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Recent Activity */}
        <EcoCard className="bg-gradient-to-br from-brand-dark/80 to-brand-primary/20 border-brand-primary/30">
          <EcoCardHeader>
            <EcoCardTitle className="text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-brand-accent" />
              <span>Recent Activity</span>
            </EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-3 p-3">
                    <div className="w-10 h-10 bg-brand-primary/30 rounded-xl"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-brand-primary/20 rounded mb-2"></div>
                      <div className="h-3 bg-brand-primary/10 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentSubmissions.length > 0 ? (
              <div className="space-y-3">
                {recentSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-brand-success/10 to-transparent rounded-xl border border-brand-success/20">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-success/30 to-brand-accent/20 rounded-xl flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-brand-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{submission.plastic_type} recycled</p>
                      <p className="text-xs text-brand-primary-light">
                        {new Date(submission.created_at).toLocaleDateString()} • 
                        {submission.weight}kg • <span className="text-brand-accent font-bold">+{submission.reward_amount || 25} PLY</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-brand-primary-light" />
                </div>
                <p className="text-sm text-brand-primary-light font-medium">No recent activity</p>
                <p className="text-xs text-brand-primary-light/70 mt-1">Start recycling to see your activity here!</p>
              </div>
            )}
          </EcoCardContent>
        </EcoCard>
      </main>
    </div>
  );
}