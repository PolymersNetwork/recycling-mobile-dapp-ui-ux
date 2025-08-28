"use client";

import React, { useRef, useState, useEffect } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Badge } from "@/components/ui/badge";
import { ParticleEngine, ParticleRef } from "@/components/ui/ParticleEngine";
import { Heart, Zap, Loader2 } from "lucide-react";
import useSound from "use-sound";
import rewardSound from "@/assets/sounds/reward.mp3";
import type { MarketplaceItem } from "@/types";

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PLY_MINT = new PublicKey(process.env.NEXT_PUBLIC_PLY_MINT!);

const mockItems: MarketplaceItem[] = [
  {
    id: "1",
    title: "Carbon Credit Pack",
    description: "Offset 100kg CO2 emissions",
    imageUrl: "https://images.unsplash.com/photo-1581091870620-0d7f52f0e0e5?w=400&h=300",
    price: 50,
    currency: "PLY",
    type: "carbon-credit",
    seller: "EcoFund",
    available: true,
    category: "carbon-offset",
  },
  {
    id: "2",
    title: "Reusable Bottle",
    description: "Eco-friendly stainless steel bottle",
    imageUrl: "https://images.unsplash.com/photo-1556911073-52527ac437f5?w=400&h=300",
    price: 25,
    currency: "USDC",
    type: "eco-product",
    seller: "EcoStore",
    available: true,
    category: "products",
  },
  {
    id: "3",
    title: "Plant a Tree Donation",
    description: "Support tree planting campaigns worldwide",
    imageUrl: "https://images.unsplash.com/photo-1600185362811-0d6c3a2b12b6?w=400&h=300",
    price: 10,
    currency: "SOL",
    type: "donation",
    seller: "GreenWorld",
    available: true,
    category: "donations",
  },
];

export function MarketplaceScreen() {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const particleRef = useRef<ParticleRef>(null);
  const [play] = useSound(rewardSound);

  const connection = new Connection(RPC_URL, "confirmed");

  /** Simulate fetching items */
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setItems(mockItems);
      setLoading(false);
    }, 1000);
  }, []);

  /** Mint PLY reward */
  const mintPLY = async (amount: number) => {
    if (!publicKey || !signTransaction) return;
    try {
      const ata = await getOrCreateAssociatedTokenAccount(connection, publicKey, PLY_MINT, publicKey);
      const tx = new Transaction().add(
        mintTo({ mint: PLY_MINT, destination: ata.address, amount, authority: publicKey, programId: TOKEN_PROGRAM_ID })
      );
      const signedTx = await signTransaction(tx);
      await sendTransaction(signedTx, connection);
      play();
    } catch (err) {
      console.error("Failed to mint PLY:", err);
    }
  };

  /** Purchase an item */
  const handlePurchase = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || !item.available) return;

    setLoading(true);
    setTimeout(async () => {
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, available: false } : i));

      // Particle reward effect
      particleRef.current?.burstCoins({ count: 20, color: "#FFD700" });
      particleRef.current?.sparkleBadge({ count: 10, color: "#FFAA00" });

      if (item.currency === "PLY") await mintPLY(item.price);

      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-24 relative">
      <ParticleEngine ref={particleRef} />
      <MobileHeader title="Marketplace" />

      <main className="p-4 space-y-6">
        {loading && <Loader2 className="animate-spin w-8 h-8 text-eco-primary mx-auto" />}

        {items.map(item => (
          <EcoCard key={item.id}>
            <div className="relative aspect-[2/1] bg-gradient-to-br from-eco-primary-light/20 to-eco-primary/10 rounded-t-2xl flex items-center justify-center">
              <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-full rounded-t-2xl" />
              <Badge className="absolute top-2 right-2 capitalize">{item.category}</Badge>
            </div>
            <EcoCardContent>
              <EcoCardHeader>
                <EcoCardTitle>{item.title}</EcoCardTitle>
                <p>{item.description}</p>
              </EcoCardHeader>
              <div className="mt-4 flex justify-between items-center">
                <span>{item.price} {item.currency}</span>
                <EcoButton variant="eco" onClick={() => handlePurchase(item.id)} disabled={!item.available}>
                  <Heart className="w-4 h-4" /> {item.available ? "Buy" : "Sold"}
                </EcoButton>
              </div>
            </EcoCardContent>
          </EcoCard>
        ))}
      </main>
    </div>
  );
}
