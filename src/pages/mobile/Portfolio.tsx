import { useState } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, TrendingUp, TrendingDown, RefreshCw, Plus, Eye, EyeOff } from "lucide-react";
import type { TokenBalance } from "@/types";

const mockBalances: TokenBalance[] = [
  { symbol: "POLY", amount: 2840.75, usdValue: 568.15, change24h: 12.5 },
  { symbol: "SOL", amount: 5.2, usdValue: 832.40, change24h: -3.2 },
  { symbol: "USDC", amount: 150.0, usdValue: 150.0, change24h: 0.0 },
  { symbol: "SUI", amount: 8.7, usdValue: 43.50, change24h: 8.1 },
];

const mockTransactions = [
  { id: "1", type: "reward", amount: "+25 POLY", description: "Plastic bottle scan", timestamp: "2 hours ago" },
  { id: "2", type: "contribution", amount: "-100 USDC", description: "Ocean Cleanup project", timestamp: "1 day ago" },
  { id: "3", type: "reward", amount: "+50 POLY", description: "Daily challenge bonus", timestamp: "2 days ago" },
  { id: "4", type: "purchase", amount: "-2 SOL", description: "Carbon credit purchase", timestamp: "3 days ago" },
];

export function Portfolio() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const totalUsdValue = mockBalances.reduce((sum, balance) => sum + balance.usdValue, 0);
  const totalChange24h = mockBalances.reduce((sum, balance) => sum + (balance.usdValue * balance.change24h / 100), 0);
  const totalChangePercent = (totalChange24h / totalUsdValue) * 100;

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const getTokenIcon = (symbol: string) => {
    const icons: Record<string, string> = {
      POLY: "🌱",
      SOL: "◎",
      USDC: "$",
      SUI: "~"
    };
    return icons[symbol] || "?";
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "reward": return "🎁";
      case "contribution": return "💚";
      case "purchase": return "🛒";
      default: return "💱";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20">
      <MobileHeader title="Portfolio" />
      
      <main className="p-4 space-y-6">
        {/* Total Balance */}
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

        {/* Wallet Actions */}
        <div className="grid grid-cols-2 gap-3">
          <EcoButton variant="eco" className="h-12">
            <Plus className="w-4 h-4" />
            Connect Wallet
          </EcoButton>
          
          <EcoButton variant="eco-outline" className="h-12">
            <Wallet className="w-4 h-4" />
            Manage Wallets
          </EcoButton>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="balances" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="balances">Balances</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Token Balances */}
          <TabsContent value="balances" className="space-y-3">
            {mockBalances.map((balance) => (
              <EcoCard key={balance.symbol} variant="elevated">
                <EcoCardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-eco-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-lg">{getTokenIcon(balance.symbol)}</span>
                      </div>
                      
                      <div>
                        <p className="font-semibold">{balance.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {balanceVisible ? balance.amount.toLocaleString() : "••••••"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">
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
                </EcoCardContent>
              </EcoCard>
            ))}
          </TabsContent>

          {/* Transaction History */}
          <TabsContent value="history" className="space-y-3">
            {mockTransactions.map((tx) => (
              <EcoCard key={tx.id} variant="elevated">
                <EcoCardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-lg">{getTransactionIcon(tx.type)}</span>
                      </div>
                      
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{tx.timestamp}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-semibold ${
                        tx.amount.startsWith("+") ? "text-eco-success" : "text-eco-danger"
                      }`}>
                        {tx.amount}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {tx.type}
                      </Badge>
                    </div>
                  </div>
                </EcoCardContent>
              </EcoCard>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}