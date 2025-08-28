"use client";

import { useState, useEffect, useRef } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle, EcoCardDescription } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@/types";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";
import { TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { ParticleEngine, ParticleRef } from "@/components/ui/ParticleEngine";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

interface NFTBadge {
  name: string;
  image: string;
}

interface SPLTokenBalance {
  symbol: string;
  amount: number;
}

interface ProjectsProps {
  walletKeypair: any;
  candyMachineId: PublicKey;
  plyMint: PublicKey;
}

export function Projects({ walletKeypair, candyMachineId, plyMint }: ProjectsProps) {
  const [filter, setFilter] = useState<string>("all");
  const [badges, setBadges] = useState<NFTBadge[]>([]);
  const [splBalances, setSplBalances] = useState<SPLTokenBalance[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [animatedPly, setAnimatedPly] = useState(0);

  const particleRef = useRef<ParticleRef>(null);
  const { toast } = useToast();

  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
    "confirmed"
  );

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(walletKeypair))
    .use(bundlrStorage({ address: "https://devnet.bundlr.network", providerUrl: connection.rpcEndpoint }));

  const wallet = walletKeypair.publicKey;

  // Fetch SPL tokens & NFT badges
  const fetchOnChainData = async () => {
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet, { programId: TOKEN_PROGRAM_ID });
      const tokens: SPLTokenBalance[] = tokenAccounts.value.map(acc => {
        const info = acc.account.data.parsed.info;
        return {
          symbol: info.mint,
          amount: parseInt(info.tokenAmount.amount) / 10 ** info.tokenAmount.decimals
        };
      });
      setSplBalances(tokens);
      const plyBalance = tokens.find(t => t.symbol === plyMint.toBase58())?.amount || 0;
      if (plyBalance > animatedPly) {
        setAnimatedPly(plyBalance);
        particleRef.current?.burstCoins({ count: 50, color: "#FFD700" });
      }

      const nftAccounts = await metaplex.nfts().findAllByOwner({ owner: wallet });
      const nfts: NFTBadge[] = nftAccounts.map(nft => ({
        name: nft.name,
        image: nft.metadataUri
      }));
      setBadges(nfts);
    } catch (err) {
      console.error("Failed to fetch on-chain data:", err);
    }
  };

  useEffect(() => {
    fetchOnChainData();
    // Mock projects
    setProjects([
      {
        id: "1",
        title: "Pacific Ocean Cleanup",
        description: "Removing plastic and waste from the Pacific Ocean to protect marine life.",
        imageUrl: "/api/placeholder/400/200",
        targetAmount: 100000,
        currentAmount: 75630,
        contributors: 324,
        category: "cleanup",
        location: "Pacific Ocean",
        endDate: "2025-01-31",
        createdBy: "Ocean Foundation",
        impact: { co2Reduction: 2100, treesPlanted: 0, plasticRemoved: 50000 }
      },
      {
        id: "2",
        title: "Solar Schools Africa",
        description: "Providing solar energy to schools in rural Africa for sustainable education.",
        imageUrl: "/api/placeholder/400/200",
        targetAmount: 80000,
        currentAmount: 43500,
        contributors: 142,
        category: "renewable",
        location: "Kenya",
        endDate: "2024-12-15",
        createdBy: "Green Education",
        impact: { co2Reduction: 1800, treesPlanted: 400, plasticRemoved: 0 }
      },
      {
        id: "3",
        title: "Urban Tree Planting",
        description: "Planting trees in urban areas to reduce CO₂ and improve air quality.",
        imageUrl: "/api/placeholder/400/200",
        targetAmount: 60000,
        currentAmount: 31250,
        contributors: 198,
        category: "conservation",
        location: "New York, USA",
        endDate: "2024-11-30",
        createdBy: "Green City Org",
        impact: { co2Reduction: 900, treesPlanted: 250, plasticRemoved: 0 }
      }
    ]);
  }, []);

  const handleContribute = async (project: Project) => {
    try {
      toast({ title: "Contribution in progress...", description: "Minting rewards on-chain." });

      // Update project locally
      setProjects(prev =>
        prev.map(p => p.id === project.id ? { ...p, currentAmount: p.currentAmount + 100, contributors: p.contributors + 1 } : p)
      );

      // Mint SPL token reward (100 PLY per contribution)
      const ata = await getOrCreateAssociatedTokenAccount(connection, walletKeypair, plyMint, wallet);
      await mintTo(connection, walletKeypair, plyMint, ata.address, walletKeypair, 100);
      particleRef.current?.burstCoins({ count: 30, color: "#FFD700" });

      // Mint NFT badge via Candy Machine
      await metaplex.candyMachines().mint({ candyMachine: candyMachineId, payer: walletKeypair });
      particleRef.current?.sparkleBadge({ count: 20, color: "#FFD700" });

      // Refresh balances & badges
      await fetchOnChainData();

      toast({ title: "Contribution Successful!", description: `100 PLY minted + NFT badge issued!` });
    } catch (err) {
      console.error("Contribution failed:", err);
      toast({ title: "Contribution Failed", description: "Please try again." });
    }
  };

  const getTimeLeft = (endDate: string) => {
    const diff = new Date(endDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : "Ended";
  };

  const getCategoryColor = (category: Project['category']) => {
    const colors = {
      cleanup: "bg-blue-500/10 text-blue-700 border-blue-200",
      renewable: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
      conservation: "bg-green-500/10 text-green-700 border-green-200",
      education: "bg-purple-500/10 text-purple-700 border-purple-200"
    };
    return colors[category] || colors.cleanup;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20 relative">
      <ParticleEngine ref={particleRef} />
      <MobileHeader title="Eco Projects" />

      <main className="p-4 space-y-6">
        {/* Filter Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {["all", "cleanup", "renewable", "conservation", "education"].map(category => (
            <EcoButton
              key={category}
              variant={filter === category ? "eco" : "eco-outline"}
              size="sm"
              onClick={() => setFilter(category)}
              className="capitalize whitespace-nowrap"
            >
              {category}
            </EcoButton>
          ))}
        </div>

        {/* SPL Token Balances */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Your SPL Tokens</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex flex-wrap gap-2">
            {splBalances.length ? splBalances.map(t => (
              <Badge key={t.symbol} className="bg-eco-primary/10 text-eco-primary border-eco-primary/20">
                {t.symbol}: <AnimatedCounter value={t.amount} className="inline" />
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
              <div
                key={idx}
                className="w-20 h-20 bg-muted/10 rounded-lg flex flex-col items-center justify-center overflow-hidden transform transition-transform duration-300 hover:scale-110"
                onMouseEnter={() => particleRef.current?.sparkleBadge({ count: 15, color: "#FFD700" })}
              >
                <img src={badge.image} alt={badge.name} className="w-full h-full object-cover" />
                <span className="text-xs truncate text-center mt-1">{badge.name}</span>
              </div>
            )) : <span className="text-sm text-muted-foreground">No badges earned yet</span>}
          </EcoCardContent>
        </EcoCard>

        {/* Project List */}
        <div className="space-y-4">
          {projects.filter(p => filter === "all" || p.category === filter).map(project => (
            <EcoCard key={project.id} variant="elevated">
              <EcoCardContent>
                <EcoCardHeader>
                  <EcoCardTitle>{project.title}</EcoCardTitle>
                  <EcoCardDescription>{project.description}</EcoCardDescription>
                </EcoCardHeader>

                <div className="space-y-2 mt-2">
                  <Progress value={(project.currentAmount / project.targetAmount) * 100} className="h-2" />
                  <EcoButton variant="eco" className="w-full" onClick={() => handleContribute(project)}>
                    Contribute Now
                  </EcoButton>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{project.contributors} contributors</span>
                    <span>{getTimeLeft(project.endDate)}</span>
                    <span>{project.location}</span>
                  </div>
                </div>
              </EcoCardContent>
            </EcoCard>
          ))}
        </div>
      </main>
    </div>
  );
}
