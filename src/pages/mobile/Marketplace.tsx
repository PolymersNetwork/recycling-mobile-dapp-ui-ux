"use client";

import { useEffect, useState, useRef } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Leaf, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";
import { TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { ParticleEngine, ParticleRef } from "@/components/ui/ParticleEngine";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

interface MarketplaceItem {
  id: number;
  title: string;
  price: string;
  type: "credit" | "product" | "donation";
}

interface NFTBadge {
  name: string;
  image: string;
}

interface SPLTokenBalance {
  symbol: string;
  amount: number;
}

interface MarketplaceProps {
  walletKeypair: any;
  plyMint: PublicKey;
}

export function Marketplace({ walletKeypair, plyMint }: MarketplaceProps) {
  const { toast } = useToast();

  const [items, setItems] = useState<MarketplaceItem[]>([
    { id: 1, title: "Carbon Credits", price: "50 POLY", type: "credit" },
    { id: 2, title: "Eco Water Bottle", price: "25 USDC", type: "product" },
    { id: 3, title: "Tree Planting", price: "100 POLY", type: "donation" },
  ]);

  const [splBalances, setSplBalances] = useState<SPLTokenBalance[]>([]);
  const [badges, setBadges] = useState<NFTBadge[]>([]);
  const [animatedBalances, setAnimatedBalances] = useState<Record<string, number>>({});

  const particleRef = useRef<ParticleRef>(null);

  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(walletKeypair))
    .use(bundlrStorage({ address: "https://devnet.bundlr.network", providerUrl: connection.rpcEndpoint }));

  const wallet = walletKeypair.publicKey;

  const fetchOnChainData = async () => {
    try {
      // SPL token balances
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet, { programId: TOKEN_PROGRAM_ID });
      const tokens: SPLTokenBalance[] = tokenAccounts.value.map(acc => {
        const info = acc.account.data.parsed.info;
        return {
          symbol: info.mint,
          amount: parseInt(info.tokenAmount.amount) / 10 ** info.tokenAmount.decimals
        };
      });
      setSplBalances(tokens);

      // Animate counters to reflect new balances
      const newAnimated: Record<string, number> = {};
      tokens.forEach(t => {
        newAnimated[t.symbol] = animatedBalances[t.symbol] || 0;
      });
      setAnimatedBalances(newAnimated);

      // NFT badges
      const nftAccounts = await metaplex.nfts().findAllByOwner({ owner: wallet });
      const nfts: NFTBadge[] = nftAccounts.map(nft => ({ name: nft.name, image: nft.metadataUri }));
      setBadges(nfts);
    } catch (err) {
      console.error("Failed to fetch on-chain data:", err);
    }
  };

  useEffect(() => {
    fetchOnChainData();
  }, []);

  const handleBuy = async (item: MarketplaceItem) => {
    try {
      toast({ title: "Purchase in progress...", description: `Spending ${item.price} to buy ${item.title}` });

      // Animate coins from button
      particleRef.current?.burstCoins({ count: 20, color: "#FFD700" });

      // Example: mint SPL token as reward
      if (item.price.includes("POLY")) {
        const amount = parseInt(item.price);
        const ata = await getOrCreateAssociatedTokenAccount(connection, walletKeypair, plyMint, wallet);
        await mintTo(connection, walletKeypair, plyMint, ata.address, walletKeypair, amount);

        // Animate balance count up
        setAnimatedBalances(prev => ({
          ...prev,
          [plyMint.toBase58()]: (prev[plyMint.toBase58()] || 0) + amount
        }));

        particleRef.current?.burstCoins({ count: 40, color: "#FFD700" }); // bigger burst for SPL gain
      }

      // Mint NFT badge & animate sparkles/bounce
      const nft = await metaplex.candyMachines().mint({ candyMachine: plyMint }); // example
      particleRef.current?.sparkleBadge({ color: "#FFD700", count: 30 }); // gold sparkle
      particleRef.current?.bounceBadge();

      toast({ title: "Purchase Successful!", description: `${item.title} purchased!` });

      await fetchOnChainData();
    } catch (err) {
      console.error("Purchase failed:", err);
      toast({ title: "Purchase Failed", description: "Please try again." });
    }
  };

  const getTypeIcon = (type: MarketplaceItem["type"]) => {
    switch (type) {
      case "credit": return <Leaf className="w-4 h-4 mr-1" />;
      case "product": return <ShoppingCart className="w-4 h-4 mr-1" />;
      case "donation": return <Heart className="w-4 h-4 mr-1" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20 relative">
      <ParticleEngine ref={particleRef} />
      <MobileHeader title="Marketplace" />

      <main className="p-4 space-y-6">
        {/* SPL Token Balances */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Your SPL Tokens</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex flex-wrap gap-2">
            {splBalances.length ? splBalances.map(t => (
              <Badge key={t.symbol} className="bg-eco-primary/10 text-eco-primary border-eco-primary/20">
                {t.symbol}: <AnimatedCounter value={animatedBalances[t.symbol] || 0} />
              </Badge>
            )) : <span className="text-sm text-muted-foreground">No SPL tokens yet</span>}
          </EcoCardContent>
        </EcoCard>

        {/* NFT Badges */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Your NFT Badges</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex flex-wrap gap-4">
            {badges.length ? badges.map((badge, idx) => (
              <div key={idx} className="w-20 h-20 bg-muted/10 rounded-lg flex flex-col items-center justify-center overflow-hidden relative">
                <img src={badge.image} alt={badge.name} className="w-full h-full object-cover" />
                <span className="text-xs truncate text-center mt-1">{badge.name}</span>
              </div>
            )) : <span className="text-sm text-muted-foreground">No badges earned yet</span>}
          </EcoCardContent>
        </EcoCard>

        {/* Marketplace Items */}
        <div className="grid gap-4">
          {items.map((item) => (
            <EcoCard key={item.id} variant="elevated">
              <EcoCardHeader>
                <EcoCardTitle className="flex items-center justify-between">
                  <div className="flex items-center">{getTypeIcon(item.type)}{item.title}</div>
                  <Badge variant="secondary">{item.type}</Badge>
                </EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-eco-primary">{item.price}</span>
                  <EcoButton size="sm" onClick={() => handleBuy(item)}>
                    Buy
                  </EcoButton>
                </div>
              </EcoCardContent>
            </EcoCard>
          ))}
        </div>
      </main>
    </div>
  );
}
