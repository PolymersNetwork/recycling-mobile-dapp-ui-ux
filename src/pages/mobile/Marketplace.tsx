"use client";

import { useState, useRef } from "react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShoppingCart } from "lucide-react";
import { useRecycling } from "@/contexts/RecyclingContext";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { ParticleEngine, ParticleRef } from "@/components/ui/ParticleEngine";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

interface DashboardProps {
  walletKeypair: any;
  plyMint: PublicKey;
  candyMachineId: PublicKey;
}

export function Dashboard({ walletKeypair, plyMint, candyMachineId }: DashboardProps) {
  const { plyBalance, crtBalance, badges, units, logRecycleUnit, refreshBalances } = useRecycling();
  const [isProcessing, setIsProcessing] = useState(false);
  const particleRef = useRef<ParticleRef>(null);

  const counterRefs = {
    ply: useRef<HTMLDivElement>(null),
    crt: useRef<HTMLDivElement>(null),
  };

  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");
  const wallet = walletKeypair.publicKey;

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(walletKeypair))
    .use(bundlrStorage({ address: "https://devnet.bundlr.network", providerUrl: connection.rpcEndpoint }));

  const marketplaceItems = [
    { id: 1, title: "Carbon Credits", price: 50, currency: "PLY", type: "credit" },
    { id: 2, title: "Eco Water Bottle", price: 25, currency: "CRT", type: "product" },
    { id: 3, title: "Tree Planting", price: 100, currency: "PLY", type: "donation" },
  ];

  // Handle recycle scan contribution
  const handleRecycleScan = async () => {
    logRecycleUnit({ city: "Local City", lat: 0, lng: 0 });
    particleRef.current?.burstCoins({ count: 30, color: "#FFD700" }); // PLY
    particleRef.current?.burstCoins({ count: 20, color: "#00FFAA" }); // CRT

    try {
      setIsProcessing(true);

      const ata = await getOrCreateAssociatedTokenAccount(connection, walletKeypair, plyMint, wallet);
      await mintTo(connection, walletKeypair, plyMint, ata.address, walletKeypair, 100);

      await metaplex.candyMachines().mint({ candyMachine: candyMachineId, payer: walletKeypair });

      await refreshBalances();

      badges.forEach(b => particleRef.current?.sparkleBadge({ count: 20, color: "#FFD700" }));
    } catch (err) {
      console.error("Scan contribution failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle marketplace purchase
  const handlePurchase = async (item: typeof marketplaceItems[0]) => {
    try {
      setIsProcessing(true);

      if (item.currency === "PLY") {
        const ata = await getOrCreateAssociatedTokenAccount(connection, walletKeypair, plyMint, wallet);
        await mintTo(connection, walletKeypair, plyMint, ata.address, walletKeypair, item.price);
      }

      await metaplex.candyMachines().mint({ candyMachine: candyMachineId, payer: walletKeypair });

      await refreshBalances();

      const ref = item.currency === "PLY" ? counterRefs.ply.current! : counterRefs.crt.current!;
      particleRef.current?.burstCoins({ count: 25, color: item.currency === "PLY" ? "#FFD700" : "#00FFAA" });
    } catch (err) {
      console.error("Purchase failed:", err);
      alert("Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20 relative">
      <ParticleEngine ref={particleRef} />
      <MobileHeader title="Eco Dashboard" />

      <main className="p-4 space-y-6">
        {/* Animated Counters */}
        <EcoCard>
          <EcoCardContent className="flex justify-around">
            <div ref={counterRefs.ply} className="text-center">
              <AnimatedCounter value={plyBalance} suffix=" PLY" />
              <p className="text-xs text-muted-foreground">PLY Balance</p>
            </div>
            <div ref={counterRefs.crt} className="text-center">
              <AnimatedCounter value={crtBalance} suffix=" CRT" />
              <p className="text-xs text-muted-foreground">CRT Balance</p>
            </div>
          </EcoCardContent>
        </EcoCard>

        {/* Scan & Contribute */}
        <EcoCard>
          <EcoCardContent>
            <EcoButton onClick={handleRecycleScan} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Scan & Contribute"}
            </EcoButton>
          </EcoCardContent>
        </EcoCard>

        {/* Marketplace Items */}
        <div className="grid gap-4">
          {marketplaceItems.map(item => (
            <EcoCard key={item.id} variant="elevated">
              <EcoCardHeader>
                <EcoCardTitle className="flex justify-between items-center">
                  {item.title}
                  <Badge variant="secondary">{item.type}</Badge>
                </EcoCardTitle>
              </EcoCardHeader>
              <EcoCardContent className="flex justify-between items-center">
                <span className="text-lg font-bold text-eco-primary">{item.price} {item.currency}</span>
                <EcoButton size="sm" onClick={() => handlePurchase(item)} disabled={isProcessing}>
                  <ShoppingCart className="w-4 h-4" /> Buy
                </EcoButton>
              </EcoCardContent>
            </EcoCard>
          ))}
        </div>

        {/* NFT Badges */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Your NFT Badges</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="flex flex-wrap gap-4">
            {badges.map(badge => (
              <Badge
                key={badge.id}
                variant={badge.unlocked ? "default" : "secondary"}
                className="cursor-pointer transform transition-transform hover:scale-110"
                onClick={(e) => particleRef.current?.sparkleBadge({ count: 20, color: "#FFD700" })}
              >
                {badge.name}
              </Badge>
            ))}
          </EcoCardContent>
        </EcoCard>

        {/* Level & Streak Progress */}
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>Progress</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent>
            <p className="text-sm text-muted-foreground">Level Progress</p>
            <Progress value={(plyBalance % 100) / 100 * 100} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">Streak Progress</p>
            <Progress value={(units.length % 7) / 7 * 100} className="h-3" />
          </EcoCardContent>
        </EcoCard>
      </main>
    </div>
  );
}
