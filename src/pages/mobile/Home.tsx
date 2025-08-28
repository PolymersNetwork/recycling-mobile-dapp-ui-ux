import { useState, useEffect } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Leaf, ArrowRight, Star } from "lucide-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { programs } from "@metaplex/js"; // for NFT metadata
import { TOKEN_PROGRAM_ID } from "@/constants";

interface User {
  name: string;
  level: number;
  streakDays: number;
  totalTokens: number;
  todayTokens: number;
  weeklyGoal: number;
  weeklyProgress: number;
  wallet: string;
}

interface NFTBadge {
  name: string;
  image: string;
}

interface SPLTokenBalance {
  symbol: string;
  amount: number;
}

export function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [badges, setBadges] = useState<NFTBadge[]>([]);
  const [splBalances, setSplBalances] = useState<SPLTokenBalance[]>([]);

  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com");

  useEffect(() => {
    async function fetchUserData() {
      // Mock fetch user info from backend
      const wallet = "YOUR_USER_WALLET_PUBLIC_KEY"; // dynamically fetch from auth
      setUser({
        name: "Alex",
        level: 12,
        streakDays: 7,
        totalTokens: 2840,
        todayTokens: 125,
        weeklyGoal: 500,
        weeklyProgress: 275,
        wallet,
      });

      // Fetch SPL tokens
      const tokens: SPLTokenBalance[] = [];
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        new PublicKey(wallet),
        { programId: TOKEN_PROGRAM_ID }
      );
      tokenAccounts.value.forEach((acc) => {
        const info = acc.account.data.parsed.info;
        const amount = parseInt(info.tokenAmount.amount) / 10 ** info.tokenAmount.decimals;
        tokens.push({ symbol: info.mint, amount });
      });
      setSplBalances(tokens);

      // Fetch NFTs via Metaplex
      const metadataProgram = programs.metadata.MetadataProgram;
      const nfts: NFTBadge[] = [];
      const nftAccounts = await metadataProgram.getProgramAccounts(connection, {
        filters: [
          { dataSize: 679 }, // adjust based on your NFT standard
          { memcmp: { offset: 33, bytes: wallet } },
        ],
      });
      for (let acc of nftAccounts) {
        const metadata = await programs.metadata.Metadata.load(connection, acc.pubkey);
        nfts.push({ name: metadata.data.data.name, image: metadata.data.data.uri });
      }
      setBadges(nfts);
    }

    fetchUserData();
  }, []);

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      <MobileHeader title={`Good morning, ${user.name}!`} notificationCount={3} />

      <main className="px-4 pt-2 pb-6 space-y-5">
        {/* Hero Stats */}
        <EcoCard variant="eco">
          <EcoCardContent className="p-6 text-center">
            <Leaf className="w-8 h-8 mx-auto mb-2 text-white" />
            <h2 className="text-2xl font-bold text-white mb-1">Level {user.level} Eco Warrior</h2>
            <p className="text-white/80 text-sm mb-4">Making the planet greener, one scan at a time</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-white">{user.totalTokens.toLocaleString()}</div>
                <div className="text-white/70 text-xs uppercase tracking-wide">Total POLY</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{user.streakDays}</div>
                <div className="text-white/70 text-xs uppercase tracking-wide">Day Streak</div>
              </div>
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* SPL Token Balances */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>SPL Token Balances</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex flex-wrap gap-2">
            {splBalances.map((t) => (
              <Badge key={t.symbol} className="bg-eco-primary/10 text-eco-primary border-eco-primary/20">
                {t.symbol}: {t.amount.toFixed(2)}
              </Badge>
            ))}
          </EcoCardContent>
        </EcoCard>

        {/* NFT Badge Collection */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>NFT Badge Collection</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex flex-wrap gap-4">
            {badges.length > 0 ? (
              badges.map((badge, idx) => (
                <div key={idx} className="w-20 h-20 bg-muted/10 rounded-lg flex flex-col items-center justify-center overflow-hidden">
                  <img src={badge.image} alt={badge.name} className="w-full h-full object-cover" />
                  <span className="text-xs truncate text-center mt-1">{badge.name}</span>
                </div>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No badges earned yet</span>
            )}
          </EcoCardContent>
        </EcoCard>
      </main>
    </div>
  );
}
