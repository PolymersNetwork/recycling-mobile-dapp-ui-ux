"use client";

import { useState, useEffect } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { Badge } from "@/components/ui/badge";
import { Leaf } from "lucide-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@/constants";
import { useWallet } from "@/contexts/WalletProvider";
import { programs } from "@metaplex/js"; // Metaplex NFT metadata

interface NFTBadge {
  name: string;
  image: string;
}

interface SPLTokenBalance {
  symbol: string;
  amount: number;
}

interface User {
  name: string;
  level: number;
  streakDays: number;
  totalTokens: number;
  wallet: string;
}

export function Home() {
  const { wallet } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [badges, setBadges] = useState<NFTBadge[]>([]);
  const [splBalances, setSplBalances] = useState<SPLTokenBalance[]>([]);

  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com");

  useEffect(() => {
    if (!wallet?.publicKey) return;

    const fetchData = async () => {
      const publicKey = wallet.publicKey;

      // 1️⃣ Fetch SPL tokens
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID });
      const tokens: SPLTokenBalance[] = tokenAccounts.value.map(acc => {
        const info = acc.account.data.parsed.info;
        const amount = parseInt(info.tokenAmount.amount) / 10 ** info.tokenAmount.decimals;
        return { symbol: info.mint, amount };
      });
      setSplBalances(tokens);

      // 2️⃣ Fetch NFTs via Metaplex JS
      const metadataProgram = programs.metadata.MetadataProgram;
      const nftAccounts = await metadataProgram.getProgramAccounts(connection, {
        filters: [
          { dataSize: 679 }, // adjust to actual metadata size
          { memcmp: { offset: 33, bytes: publicKey.toBase58() } }, // owner filter
        ],
      });
      const nftBadges: NFTBadge[] = [];
      for (const acc of nftAccounts) {
        const metadata = await programs.metadata.Metadata.load(connection, acc.pubkey);
        nftBadges.push({ name: metadata.data.data.name, image: metadata.data.data.uri });
      }
      setBadges(nftBadges);

      // 3️⃣ User stats (compute from SPL balances / NFT count)
      setUser({
        name: "Eco Hero",
        level: Math.min(Math.floor(tokens.reduce((sum, t) => sum + t.amount, 0) / 100), 50),
        streakDays: nftBadges.length > 0 ? Math.min(nftBadges.length, 7) : 0,
        totalTokens: tokens.reduce((sum, t) => sum + t.amount, 0),
        wallet: publicKey.toBase58(),
      });
    };

    fetchData();
  }, [wallet]);

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-eco-primary/5 pb-20">
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
