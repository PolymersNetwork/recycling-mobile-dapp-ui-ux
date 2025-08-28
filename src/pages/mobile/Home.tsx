"use client";

import React, { useState, useEffect, useRef } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { EcoCard, EcoCardContent, EcoCardHeader, EcoCardTitle } from "@/components/ui/eco-card";
import { EcoButton } from "@/components/ui/eco-button";
import { Progress } from "@/components/ui/progress";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { ParticleEngine, ParticleRef } from "@/components/ui/ParticleEngine";
import type { Project, Badge, User } from "@/types";

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PLY_MINT = new PublicKey(process.env.NEXT_PUBLIC_PLY_MINT!);

export function HomeScreen() {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [user, setUser] = useState<User>({
    id: "1",
    email: "eco@user.com",
    name: "Eco User",
    level: 3,
    totalTokens: 1240,
    streakDays: 5,
    badges: [],
    createdAt: new Date().toISOString(),
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const particleRef = useRef<ParticleRef>(null);

  const connection = new Connection(RPC_URL, "confirmed");

  /** Simulate fetching projects */
  useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: "1",
        title: "Ocean Cleanup",
        description: "Removing plastic from oceans and beaches.",
        imageUrl: "/api/placeholder/400/200",
        targetAmount: 50000,
        currentAmount: 32750,
        contributors: 247,
        category: "cleanup",
        location: "Pacific Ocean",
        endDate: "2024-12-31",
        createdBy: "Ocean Foundation",
        impact: { co2Reduction: 1250, treesPlanted: 0, plasticRemoved: 25000 },
      },
      {
        id: "2",
        title: "Solar School Initiative",
        description: "Installing solar panels in rural schools.",
        imageUrl: "/api/placeholder/400/200",
        targetAmount: 75000,
        currentAmount: 18500,
        contributors: 89,
        category: "renewable",
        location: "Kenya",
        endDate: "2024-11-15",
        createdBy: "Green Education",
        impact: { co2Reduction: 2100, treesPlanted: 500, plasticRemoved: 0 },
      },
    ];
    setProjects(mockProjects);
  }, []);

  /** Mint PLY reward */
  const mintPLYReward = async (amount: number) => {
    if (!publicKey || !signTransaction) return;
    try {
      const ata = await getOrCreateAssociatedTokenAccount(connection, publicKey, PLY_MINT, publicKey);
      const tx = new Transaction().add(
        mintTo({ mint: PLY_MINT, destination: ata.address, amount, authority: publicKey, programId: TOKEN_PROGRAM_ID })
      );
      const signedTx = await signTransaction(tx);
      await sendTransaction(signedTx, connection);
      particleRef.current?.burstCoins({ count: 20, color: "#FFD700" });
    } catch (err) {
      console.error("Failed to mint PLY reward:", err);
    }
  };

  const handleContribute = async (projectId: string) => {
    setProjects(prev =>
      prev.map(p => p.id === projectId ? { ...p, currentAmount: p.currentAmount + 100, contributors: p.contributors + 1 } : p)
    );
    await mintPLYReward(100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted pb-20 relative">
      <ParticleEngine ref={particleRef} />
      <MobileHeader title="Home" />

      <main className="p-4 space-y-6">
        <EcoCard>
          <EcoCardHeader>
            <EcoCardTitle>{user.name}'s Progress</EcoCardTitle>
          </EcoCardHeader>
          <EcoCardContent className="space-y-2">
            <p>Level {user.level}</p>
            <Progress value={(user.totalTokens % 500) / 5} className="h-4" />
            <p>Streak: {user.streakDays} days</p>
            <Progress value={(user.streakDays % 30) * 3.33} className="h-4" />
            <p className="text-lg font-bold text-eco-primary mt-1">Tokens: {user.totalTokens}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.badges.map(b => (
                <UiBadge key={b.id} className={`capitalize bg-gray-200 text-gray-700`} title={`Unlocked: ${b.unlockedAt}`}>
                  {b.name}
                </UiBadge>
              ))}
            </div>
          </EcoCardContent>
        </EcoCard>

        {projects.map(project => (
          <EcoCard key={project.id}>
            <div className="relative aspect-[2/1] bg-gray-100 rounded-t-2xl flex items-center justify-center">
              <p className="text-xs text-muted-foreground">Project Image</p>
            </div>
            <EcoCardContent>
              <EcoCardHeader>
                <EcoCardTitle>{project.title}</EcoCardTitle>
                <p>{project.description}</p>
              </EcoCardHeader>
              <div className="mt-4 flex justify-between items-center">
                <p>{project.currentAmount} / {project.targetAmount}</p>
                <EcoButton variant="eco" onClick={() => handleContribute(project.id)}>
                  <Heart className="w-4 h-4" /> Contribute
                </EcoButton>
              </div>
            </EcoCardContent>
          </EcoCard>
        ))}
      </main>
    </div>
  );
}
