import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";

import { useWallet } from "@/hooks/useWallet";
import { useProjects } from "@/hooks/useProjects";
import { useMarketplace } from "@/hooks/useMarketplace";
import { generateUUID } from "@/lib/utils";
import { fetchCityMetrics, fetchBadgeStats, fetchHistoricalTrends } from "@/lib/api";
import { calculateRewardForecast, calculateBadgeRarity } from "@/lib/forecast";
import type { Badge as BadgeType, Project, MarketplaceItem } from "@/types";

interface Unit {
  id: string;
  city: string;
  lat: number;
  lng: number;
  scannedAt: Date;
}

interface CityMetrics {
  polyEarned: number;
  crtEarned: number;
  batchCount: number;
  leaderboard: any[];
  historicalTrends: any[];
  forecast?: { ply: number; crt: number };
}

interface RecyclingContextProps {
  wallet: ReturnType<typeof useWallet>["wallet"];
  plyBalance: number;
  crtBalance: number;
  badges: BadgeType[];
  units: Unit[];
  cityMetrics: Record<string, CityMetrics>;
  logRecycleUnit: (unit: Omit<Unit, "id" | "scannedAt">) => void;
  submitBatch: () => Promise<void>;
  refreshCityMetrics: () => Promise<void>;
  refreshBadges: () => Promise<void>;
  projects: Project[];
  loadingProjects: boolean;
  contributeToProject: (projectId: string, amount: number, currency: "PLY" | "USDC" | "SOL") => Promise<void>;
  marketplace: MarketplaceItem[];
  loadingMarketplace: boolean;
  refreshMarketplace: () => Promise<void>;
}

const RecyclingContext = createContext<RecyclingContextProps | undefined>(undefined);

export const RecyclingProvider = ({ children }: { children: ReactNode }) => {
  const { wallet, balances, connectWallet, disconnectWallet, refreshBalances } = useWallet();
  const { projects, loading: loadingProjects, fetchProjects, contributeToProject, createProject } = useProjects();
  const { marketplace, loading: loadingMarketplace, fetchMarketplace } = useMarketplace();

  const [plyBalance, setPlyBalance] = useState(0);
  const [crtBalance, setCrtBalance] = useState(0);
  const [units, setUnits] = useState<Unit[]>([]);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [cityMetrics, setCityMetrics] = useState<Record<string, CityMetrics>>({});

  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");
  const metaplex = wallet?.keypair
    ? Metaplex.make(connection)
        .use(keypairIdentity(wallet.keypair))
        .use(bundlrStorage({ address: "https://devnet.bundlr.network", providerUrl: connection.rpcEndpoint }))
    : null;

  const PLY_MINT = new PublicKey(process.env.NEXT_PUBLIC_PLY_MINT!);
  const CANDY_MACHINE_ID = new PublicKey(process.env.NEXT_PUBLIC_CANDY_MACHINE_ID!);

  // Log a single scanned unit
  const logRecycleUnit = (unit: Omit<Unit, "id" | "scannedAt">) => {
    const newUnit: Unit = { ...unit, id: generateUUID(), scannedAt: new Date() };
    setUnits((prev) => [...prev, newUnit]);
  };

  // Submit batch: mint SPL + NFT rewards on-chain
  const submitBatch = async () => {
    if (!wallet?.publicKey || !metaplex || units.length === 0) return;

    const verifiedUnits = units; // mock verification
    const polyEarned = verifiedUnits.length;
    const crtEarned = verifiedUnits.length * 0.5;

    // Mint PLY tokens to wallet
    try {
      const ata = await getOrCreateAssociatedTokenAccount(connection, wallet.keypair, PLY_MINT, wallet.publicKey);
      await mintTo(connection, wallet.keypair, PLY_MINT, ata.address, wallet.keypair, BigInt(polyEarned));
      setPlyBalance((prev) => prev + polyEarned);
    } catch (err) {
      console.error("Failed to mint PLY:", err);
    }

    // Mint NFT badges for milestone
    try {
      await metaplex.nfts().mintFromCandyMachine({ candyMachine: CANDY_MACHINE_ID });
      await refreshBadges();
    } catch (err) {
      console.error("Failed to mint NFT badge:", err);
    }

    setCrtBalance((prev) => prev + crtEarned);
    setUnits([]); // clear batch after submission
    await refreshCityMetrics();
  };

  const refreshCityMetrics = async () => {
    const metricsArray = await fetchCityMetrics();
    const metricsRecord: Record<string, CityMetrics> = {};

    for (const metric of metricsArray) {
      const historicalTrends = await fetchHistoricalTrends(metric.cityId);
      const forecast = calculateRewardForecast(metric, historicalTrends);
      metricsRecord[metric.cityId] = { ...metric, historicalTrends, forecast };
    }

    setCityMetrics(metricsRecord);
  };

  const refreshBadges = async () => {
    const badgeData = await fetchBadgeStats();
    const updatedBadges = badgeData.map((badge) => ({
      ...badge,
      rarity: calculateBadgeRarity(badge),
    }));
    setBadges(updatedBadges);
  };

  const refreshMarketplace = async () => {
    await fetchMarketplace();
  };

  useEffect(() => {
    refreshCityMetrics();
    refreshBadges();
    fetchProjects();
    fetchMarketplace();
  }, []);

  return (
    <RecyclingContext.Provider
      value={{
        wallet,
        plyBalance,
        crtBalance,
        badges,
        units,
        cityMetrics,
        logRecycleUnit,
        submitBatch,
        refreshCityMetrics,
        refreshBadges,
        projects,
        loadingProjects,
        contributeToProject,
        marketplace,
        loadingMarketplace,
        refreshMarketplace,
      }}
    >
      {children}
    </RecyclingContext.Provider>
  );
};

export const useRecycling = () => {
  const context = useContext(RecyclingContext);
  if (!context) throw new Error("useRecycling must be used within RecyclingProvider");
  return context;
};
