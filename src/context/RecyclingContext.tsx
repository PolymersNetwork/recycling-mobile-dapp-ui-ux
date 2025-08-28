import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useProjects } from "@/hooks/useProjects";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useCamera } from "@/hooks/useCamera";
import { generateUUID } from "@/lib/utils";
import { 
  fetchCityMetrics, 
  fetchBadgeStats, 
  fetchHistoricalTrends 
} from "@/lib/api";
import { calculateRewardForecast, calculateBadgeRarity } from "@/lib/forecast";
import { Badge as BadgeType, Project, MarketplaceItem } from "@/types";

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
  balances: ReturnType<typeof useWallet>["balances"];
  connectWallet: ReturnType<typeof useWallet>["connectWallet"];
  disconnectWallet: ReturnType<typeof useWallet>["disconnectWallet"];
  refreshBalances: ReturnType<typeof useWallet>["refreshBalances"];
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
  createProject: (data: Omit<Project, "id" | "currentAmount" | "contributors">) => Promise<Project>;
  marketplace: MarketplaceItem[];
  loadingMarketplace: boolean;
  refreshMarketplace: () => Promise<void>;
}

const RecyclingContext = createContext<RecyclingContextProps | undefined>(undefined);

export const RecyclingProvider = ({ children }: { children: ReactNode }) => {
  const { wallet, balances, connectWallet, disconnectWallet, refreshBalances } = useWallet();
  const { projects, loading: loadingProjects, fetchProjects, contributeToProject, createProject } = useProjects();
  const { marketplace, loading: loadingMarketplace, fetchMarketplace } = useMarketplace();
  const { isScanning, scanResult, cameraType, capturePhoto, scanQRCode, scanNFC, uploadFromGallery, clearResult } = useCamera();

  const [plyBalance, setPlyBalance] = useState(0);
  const [crtBalance, setCrtBalance] = useState(0);
  const [units, setUnits] = useState<Unit[]>([]);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [cityMetrics, setCityMetrics] = useState<Record<string, CityMetrics>>({});

  // Log a single scanned unit
  const logRecycleUnit = (unit: Omit<Unit, "id" | "scannedAt">) => {
    const newUnit: Unit = { ...unit, id: generateUUID(), scannedAt: new Date() };
    setUnits(prev => [...prev, newUnit]);
  };

  // Submit batch: verify units, update balances, refresh metrics & badges
  const submitBatch = async () => {
    if (units.length === 0) return;

    // Simulate verification & rewards
    const verifiedUnits = units; // Mock: all units verified
    const polyEarned = verifiedUnits.length;
    const crtEarned = verifiedUnits.length * 0.5;

    setPlyBalance(prev => prev + polyEarned);
    setCrtBalance(prev => prev + crtEarned);

    setUnits([]); // Clear units after submission
    await refreshCityMetrics();
    await refreshBadges();
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
    const updatedBadges = badgeData.map(badge => ({
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
        balances,
        connectWallet,
        disconnectWallet,
        refreshBalances,
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
        createProject,
        marketplace,
        loadingMarketplace,
        refreshMarketplace
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
