"use client";

import { useState, useEffect } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Metaplex } from "@metaplex-foundation/js";
import { useWallet } from "@/contexts/WalletContext";
import type { Badge, TokenBalance, Project, User } from "@/types";

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
const PLY_MINT = new PublicKey(process.env.NEXT_PUBLIC_PLY_MINT!);
const CANDY_MACHINE_ID = new PublicKey(process.env.NEXT_PUBLIC_CANDY_MACHINE_ID!);

export function usePortfolio() {
  const { wallet } = useWallet();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [nftBadges, setNftBadges] = useState<Badge[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const connection = new Connection(RPC_URL, "confirmed");
  const metaplex = Metaplex.make(connection);

  /** Fetch SPL balances */
  const fetchBalances = async () => {
    if (!wallet?.publicKey) return;
    try {
      const plyAccount = await getOrCreateAssociatedTokenAccount(connection, wallet.publicKey, PLY_MINT, wallet.publicKey);
      const plyBalance = Number(plyAccount.amount);
      const solBalance = await connection.getBalance(wallet.publicKey) / 1e9;
      setBalances([
        { symbol: "PLY", amount: plyBalance, usdValue: 0, change24h: 0 },
        { symbol: "SOL", amount: solBalance, usdValue: 0, change24h: 0 },
      ]);

      setUser(prev => prev ? { ...prev, totalTokens: plyBalance } : {
        id: "1",
        email: "eco@user.com",
        name: "Eco User",
        level: 1,
        totalTokens: plyBalance,
        streakDays: 0,
        badges: [],
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to fetch balances:", err);
    }
  };

  /** Fetch NFT badges */
  const fetchNFTBadges = async () => {
    if (!wallet?.publicKey) return;
    try {
      const nfts = await metaplex.nfts().findAllByOwner({ owner: wallet.publicKey });
      const candyNFTs = nfts.filter(nft => nft.candyMachine?.equals(CANDY_MACHINE_ID));
      const badges: Badge[] = await Promise.all(
        candyNFTs.map(async nft => {
          const metadata = await nft.metadataTask.run();
          return {
            id: nft.address.toBase58(),
            name: nft.name,
            description: metadata?.data?.description || "",
            icon: metadata?.data?.image || "/badges/default.png",
            rarity: (metadata?.data?.attributes?.find(attr => attr.trait_type === "rarity")?.value as any) || "common",
            unlockedAt: nft.mint ? new Date().toISOString() : undefined,
          };
        })
      );
      const rarityOrder = ["legendary", "epic", "rare", "common"];
      badges.sort((a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity));
      setNftBadges(badges);
      setUser(prev => prev ? { ...prev, badges } : null);
    } catch (err) {
      console.error("Failed to fetch NFT badges:", err);
    }
  };

  /** Mint PLY reward to user */
  const mintPLYReward = async (amount: number) => {
    if (!wallet?.publicKey || !wallet.signTransaction || !wallet.sendTransaction) return;
    try {
      const ata = await getOrCreateAssociatedTokenAccount(connection, wallet.publicKey, PLY_MINT, wallet.publicKey);
      const tx = new Transaction().add(
        mintTo({ mint: PLY_MINT, destination: ata.address, amount, authority: wallet.publicKey, programId: TOKEN_PROGRAM_ID })
      );
      const signedTx = await wallet.signTransaction(tx);
      const txId = await wallet.sendTransaction(signedTx, connection);
      await connection.confirmTransaction(txId, "confirmed");
      await fetchBalances();
    } catch (err) {
      console.error("Failed to mint PLY reward:", err);
    }
  };

  /** Mint NFT badge from Candy Machine */
  const mintNFTBadge = async () => {
    if (!wallet?.publicKey) return;
    try {
      // Placeholder for candy machine mint action
      // Replace with actual Metaplex mint logic
      // e.g. await metaplex.candyMachines().mint({ candyMachine: CANDY_MACHINE_ID, payer: wallet.publicKey })
      console.log("Minting NFT badge...");
      await fetchNFTBadges();
    } catch (err) {
      console.error("Failed to mint NFT badge:", err);
    }
  };

  /** Contribute to a project */
  const contributeToProject = async (projectId: string, plyAmount: number) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, currentAmount: p.currentAmount + plyAmount, contributors: (p.contributors || 0) + 1 } : p));
    await mintPLYReward(plyAmount);
    await mintNFTBadge();
  };

  useEffect(() => {
    if (wallet?.publicKey) {
      fetchBalances();
      fetchNFTBadges();
    }
  }, [wallet?.publicKey]);

  return {
    balances,
    nftBadges,
    user,
    projects,
    loading,
    fetchBalances,
    fetchNFTBadges,
    mintPLYReward,
    mintNFTBadge,
    contributeToProject,
    setProjects,
  };
}
