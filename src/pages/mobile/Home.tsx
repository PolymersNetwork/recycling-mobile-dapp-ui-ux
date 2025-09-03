import { useState, useEffect } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Coins, Zap, Target, TrendingUp, Camera, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function Home() {
  const [user, setUser] = useState({
    name: "Alex",
    level: 12,
    streakDays: 7,
    totalTokens: 0,
    todayTokens: 0,
    weeklyGoal: 500,
    weeklyProgress: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
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
                <p className="text-sm text-muted-foreground">Total PLY</p>
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
                <span className="font-semibold text-eco-primary">+{user.todayTokens} PLY</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Weekly Goal Progress</span>
                  <span>{user.weeklyProgress}/{user.weeklyGoal} PLY</span>
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
                <span className="text-xs text-eco-success font-medium">+50 PLY</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <span className="text-sm">Contribute to a project</span>
                </div>
                <span className="text-xs text-muted-foreground font-medium">+100 PLY</span>
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
            {loading ? (
              <div className="space-y-3">
                <div className="animate-pulse flex items-center space-x-3 p-2">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-1"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
                <div className="animate-pulse flex items-center space-x-3 p-2">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-1"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ) : recentSubmissions.length > 0 ? (
              <div className="space-y-3">
                {recentSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-center space-x-3 p-2">
                    <div className="w-8 h-8 bg-eco-success/20 rounded-full flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-eco-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{submission.plastic_type} recycled</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(submission.created_at).toLocaleDateString()} • 
                        {submission.weight}kg • +{submission.reward_amount || 25} PLY
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No recent activity</p>
                <p className="text-xs text-muted-foreground mt-1">Start recycling to see your activity here!</p>
              </div>
            )}
          </EcoCardContent>
        </EcoCard>
      </main>
    </div>
  );
}