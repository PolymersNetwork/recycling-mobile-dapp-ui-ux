import { useState, useEffect } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, TrendingUp, TrendingDown, RefreshCw, Plus, Eye, EyeOff, 
  Trophy, Zap, Target, Map, BarChart3, Users, Award, Coins,
  Activity, Clock, CheckCircle, Star, Filter, Globe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { TokenBalance } from "@/types";

interface NFTData {
  id: string;
  title: string;
  status: string;
  metadata_uri: string | null;
  created_at: string;
}

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  eco_score: number;
  total_earned: number;
  tier: string;
}

interface EcoBadge {
  id: string;
  name: string;
  description: string;
  achieved_at: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const mockBalances: TokenBalance[] = [
  { symbol: "PLY", amount: 2840.75, usdValue: 568.15, change24h: 12.5 },
  { symbol: "RECO", amount: 156.3, usdValue: 234.45, change24h: 8.7 },
  { symbol: "CRT", amount: 45.2, usdValue: 67.80, change24h: 5.2 },
  { symbol: "SOL", amount: 5.2, usdValue: 832.40, change24h: -3.2 },
  { symbol: "USDC", amount: 150.0, usdValue: 150.0, change24h: 0.0 },
];

const mockEcoBadges: EcoBadge[] = [
  { id: "1", name: "Eco Warrior", description: "First 100 scans", achieved_at: "2024-01-15", rarity: "common" },
  { id: "2", name: "Green Champion", description: "30-day streak", achieved_at: "2024-01-20", rarity: "rare" },
  { id: "3", name: "Ocean Protector", description: "50 plastic bottles", achieved_at: "2024-01-25", rarity: "epic" },
  { id: "4", name: "Climate Hero", description: "Top 10 monthly", achieved_at: "2024-02-01", rarity: "legendary" }
];

export function Portfolio() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [transactions, setTransactions] = useState([]);
  const [userStats, setUserStats] = useState({
    ecoScore: 0,
    totalEarned: 0,
    cleanedAreas: 0,
    streakDays: 7,
    currentRank: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time subscriptions
    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'por_nfts'
      }, (payload) => {
        console.log('NFT update:', payload);
        fetchNFTs();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rewards'
      }, (payload) => {
        console.log('Reward update:', payload);
        fetchTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchNFTs(),
        fetchLeaderboard(),
        fetchTransactions(),
        fetchUserStats()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNFTs = async () => {
    const { data, error } = await supabase
      .from('por_nfts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!error && data) {
      setNfts(data);
    }
  };

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, display_name, eco_score, total_earned, tier')
      .order('eco_score', { ascending: false })
      .limit(10);
    
    if (!error && data) {
      setLeaderboard(data);
    }
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (!error && data) {
      setTransactions(data);
    }
  };

  const fetchUserStats = async () => {
    // Fetch user profile and compute stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .single();
    
    if (profile) {
      setUserStats({
        ecoScore: profile.eco_score || 0,
        totalEarned: profile.total_earned || 0,
        cleanedAreas: 15, // Mock data
        streakDays: 7, // Mock data
        currentRank: 8 // Mock data
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const totalUsdValue = mockBalances.reduce((sum, balance) => sum + balance.usdValue, 0);
  const totalChange24h = mockBalances.reduce((sum, balance) => sum + (balance.usdValue * balance.change24h / 100), 0);
  const totalChangePercent = (totalChange24h / totalUsdValue) * 100;

  const getTokenIcon = (symbol: string) => {
    const icons: Record<string, string> = {
      PLY: "🌱", RECO: "♻️", CRT: "🌍", SOL: "◎", USDC: "$"
    };
    return icons[symbol] || "?";
  };

  const getBadgeIcon = (rarity: string) => {
    const icons = {
      common: "🥉", rare: "🥈", epic: "🥇", legendary: "👑"
    };
    return icons[rarity as keyof typeof icons] || "🏅";
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: "text-slate-500",
      rare: "text-blue-500", 
      epic: "text-purple-500",
      legendary: "text-yellow-500"
    };
    return colors[rarity as keyof typeof colors] || "text-gray-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      <MobileHeader title="Polymers Dashboard" />
      
      <main className="p-4 space-y-6">
        {/* Real-Time Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <EcoCard variant="eco" padding="sm">
            <div className="text-center text-white">
              <Coins className="w-6 h-6 mx-auto mb-2" />
              <p className="text-2xl font-bold">{userStats.totalEarned.toLocaleString()}</p>
              <p className="text-xs opacity-80">Total PLY Earned</p>
            </div>
          </EcoCard>
          
          <EcoCard variant="eco" padding="sm">
            <div className="text-center text-white">
              <Trophy className="w-6 h-6 mx-auto mb-2" />
              <p className="text-2xl font-bold">#{userStats.currentRank}</p>
              <p className="text-xs opacity-80">Global Rank</p>
            </div>
          </EcoCard>
        </div>

        {/* Portfolio Value */}
        <EcoCard variant="eco">
          <EcoCardHeader>
            <div className="flex items-center justify-between">
              <EcoCardTitle className="text-white">Total Portfolio Value</EcoCardTitle>
              <div className="flex items-center space-x-2">
                <EcoButton
                  variant="eco-outline"
                  size="icon"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="h-8 w-8 border-white/20 text-white hover:bg-white/10"
                >
                  {balanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                </EcoButton>
                
                <EcoButton
                  variant="eco-outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-8 w-8 border-white/20 text-white hover:bg-white/10"
                >
                  <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                </EcoButton>
              </div>
            </div>
          </EcoCardHeader>
          <EcoCardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">
                {balanceVisible ? `$${totalUsdValue.toLocaleString()}` : "••••••"}
              </div>
              
              <div className="flex items-center space-x-2">
                {totalChangePercent >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-eco-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-eco-danger" />
                )}
                <span className={`text-sm font-medium ${
                  totalChangePercent >= 0 ? "text-eco-success" : "text-eco-danger"
                }`}>
                  {totalChangePercent >= 0 ? "+" : ""}{totalChangePercent.toFixed(2)}% (24h)
                </span>
              </div>
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Tabs for different dashboard sections */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 text-xs">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="nfts">NFTs</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Token Balances */}
            <EcoCard>
              <EcoCardHeader>
                <EcoCardTitle>Token Balances</EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent>
                <div className="space-y-3">
                  {mockBalances.slice(0, 3).map((balance) => (
                    <div key={balance.symbol} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-eco-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm">{getTokenIcon(balance.symbol)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{balance.symbol}</p>
                          <p className="text-xs text-muted-foreground">
                            {balanceVisible ? balance.amount.toLocaleString() : "••••••"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {balanceVisible ? `$${balance.usdValue.toFixed(2)}` : "••••••"}
                        </p>
                        <div className="flex items-center space-x-1">
                          {balance.change24h >= 0 ? (
                            <TrendingUp className="w-3 h-3 text-eco-success" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-eco-danger" />
                          )}
                          <span className={`text-xs ${
                            balance.change24h >= 0 ? "text-eco-success" : "text-eco-danger"
                          }`}>
                            {balance.change24h >= 0 ? "+" : ""}{balance.change24h.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </EcoCardContent>
            </EcoCard>

            {/* Eco Badges */}
            <EcoCard>
              <EcoCardHeader>
                <EcoCardTitle className="flex items-center justify-between">
                  Recent Achievements
                  <Badge variant="secondary" className="text-xs">{mockEcoBadges.length} earned</Badge>
                </EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent>
                <div className="grid grid-cols-2 gap-3">
                  {mockEcoBadges.slice(0, 4).map((badge) => (
                    <div key={badge.id} className="flex items-center space-x-2 p-2 bg-muted/50 rounded-lg">
                      <span className="text-lg">{getBadgeIcon(badge.rarity)}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${getRarityColor(badge.rarity)}`}>
                          {badge.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </EcoCardContent>
            </EcoCard>
          </TabsContent>

          {/* NFTs Tab */}
          <TabsContent value="nfts" className="space-y-4">
            <EcoCard>
              <EcoCardHeader>
                <EcoCardTitle className="flex items-center justify-between">
                  Your PoR NFTs
                  <Badge variant="secondary">{nfts.length} minted</Badge>
                </EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
                        <div className="w-12 h-12 bg-muted rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded mb-2"></div>
                          <div className="h-3 bg-muted rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : nfts.length > 0 ? (
                  <div className="space-y-3">
                    {nfts.map((nft) => (
                      <div key={nft.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-eco-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-lg">🏆</span>
                          </div>
                          <div>
                            <p className="font-medium">{nft.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(nft.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={nft.status === 'minted' ? 'default' : 'secondary'}>
                          {nft.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No NFTs minted yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Complete recycling submissions to earn PoR NFTs</p>
                  </div>
                )}
              </EcoCardContent>
            </EcoCard>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-4">
            <EcoCard>
              <EcoCardHeader>
                <EcoCardTitle className="flex items-center justify-between">
                  Global Leaderboard
                  <div className="flex items-center space-x-1">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">Top 10</span>
                  </div>
                </EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-3 p-2">
                        <div className="w-8 h-8 bg-muted rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded mb-1"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <div key={entry.user_id} className="flex items-center justify-between p-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index < 3 ? 'bg-gradient-to-r from-eco-primary to-eco-success text-white' : 'bg-muted'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{entry.display_name || 'Anonymous'}</p>
                            <p className="text-xs text-muted-foreground capitalize">{entry.tier} tier</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{entry.eco_score}</p>
                          <p className="text-xs text-muted-foreground">eco points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </EcoCardContent>
            </EcoCard>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <EcoCard>
              <EcoCardHeader>
                <EcoCardTitle>Impact Analytics</EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-eco-primary">{userStats.ecoScore}</div>
                    <p className="text-xs text-muted-foreground">Eco Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-eco-success">{userStats.cleanedAreas}</div>
                    <p className="text-xs text-muted-foreground">Areas Cleaned</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Weekly Goal</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Monthly Target</span>
                      <span>60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>
              </EcoCardContent>
            </EcoCard>

            {/* Recent Transactions */}
            <EcoCard>
              <EcoCardHeader>
                <EcoCardTitle>Recent Activity</EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-eco-success/10 rounded-full flex items-center justify-center">
                          <Activity className="w-4 h-4 text-eco-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tx.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-eco-success">
                          +{tx.amount} {tx.token}
                        </p>
                        <Badge variant="secondary" className="text-xs">{tx.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </EcoCardContent>
            </EcoCard>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}