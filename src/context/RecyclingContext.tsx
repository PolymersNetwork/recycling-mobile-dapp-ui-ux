import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateUUID, groupUnitsByCity } from '../lib/utils';
import {
  fetchCityMetrics,
  fetchLeaderboard,
  fetchBadgeStats,
  fetchHistoricalTrends,
  logRecycleBatch,
} from '../lib/api';
import { sendRecycleTransaction, verifyWithOracles, releaseEscrow } from '../lib/solana';
import { calculateBadgeRarity, calculateRewardForecast } from '../lib/forecast';

export interface Unit {
  id: string;
  city: string;
  lat: number;
  lng: number;
  scannedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  unlocked: boolean;
  rarity: number;
  imageUrl: string;
}

export interface CityMetrics {
  cityId: string;
  polyEarned: number;
  crtEarned: number;
  batchCount: number;
  leaderboard: any[];
  historicalTrends?: any[];
}

interface RecyclingContextProps {
  plyBalance: number;
  crtBalance: number;
  badges: Badge[];
  units: Unit[];
  cityMetrics: Record<string, CityMetrics>;
  leaderboard: any[];
  logRecycleUnit: (unit: Omit<Unit, 'id' | 'scannedAt'>) => void;
  submitBatch: () => Promise<void>;
  refreshCityMetrics: () => Promise<void>;
  refreshBadges: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  fetchCityHistoricalTrends: (cityId: string) => Promise<void>;
}

const RecyclingContext = createContext<RecyclingContextProps | undefined>(undefined);

export const RecyclingProvider = ({ children }: { children: ReactNode }) => {
  const [plyBalance, setPlyBalance] = useState(0);
  const [crtBalance, setCrtBalance] = useState(0);
  const [units, setUnits] = useState<Unit[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [cityMetrics, setCityMetrics] = useState<Record<string, CityMetrics>>({});
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Add a single scanned unit
  const logRecycleUnit = (unit: Omit<Unit, 'id' | 'scannedAt'>) => {
    const newUnit: Unit = { ...unit, id: generateUUID(), scannedAt: new Date() };
    setUnits(prev => [...prev, newUnit]);
  };

  // Submit batch: verify units, update balances, trigger Solana tx & escrow
  const submitBatch = async () => {
    if (units.length === 0) return;

    try {
      // 1. Verify units via Chainlink + Pyth oracles
      const verificationResults = await verifyWithOracles(units);

      // 2. Filter verified units
      const verifiedUnits = units.filter((_, idx) => verificationResults[idx]);

      if (verifiedUnits.length === 0) return;

      // 3. Send transaction to Solana program
      await sendRecycleTransaction(verifiedUnits);

      // 4. Release escrow for corporate/NGO donations
      await releaseEscrow(verifiedUnits);

      // 5. Log batch in backend
      await logRecycleBatch(verifiedUnits);

      // 6. Update POLY/CRT balances
      const polyEarned = verifiedUnits.length; // 1:1 PLY
      const crtEarned = verifiedUnits.length * 0.5; // 0.5 CRT
      setPlyBalance(prev => prev + polyEarned);
      setCrtBalance(prev => prev + crtEarned);

      // 7. Refresh city metrics and leaderboard
      await refreshCityMetrics();
      await refreshLeaderboard();

      // 8. Refresh badge stats
      await refreshBadges();

      // 9. Clear units after submission
      setUnits([]);
    } catch (error) {
      console.error("Batch submission error:", error);
    }
  };

  const refreshCityMetrics = async () => {
    try {
      const metricsArray = await fetchCityMetrics();
      const metricsRecord: Record<string, CityMetrics> = {};
      for (const city of metricsArray) {
        metricsRecord[city.cityId] = { ...city };
      }
      setCityMetrics(metricsRecord);
    } catch (error) {
      console.error("Failed to fetch city metrics:", error);
    }
  };

  const refreshLeaderboard = async () => {
    try {
      const data = await fetchLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    }
  };

  const refreshBadges = async () => {
    try {
      const badgeData = await fetchBadgeStats();
      const updatedBadges = badgeData.map(badge => ({
        ...badge,
        rarity: calculateBadgeRarity(badge),
      }));
      setBadges(updatedBadges);
    } catch (error) {
      console.error("Failed to fetch badges:", error);
    }
  };

  const fetchCityHistoricalTrends = async (cityId: string) => {
    try {
      const trends = await fetchHistoricalTrends(cityId);
      setCityMetrics(prev => ({
        ...prev,
        [cityId]: { ...prev[cityId], historicalTrends: trends },
      }));
    } catch (error) {
      console.error(`Failed to fetch historical trends for city ${cityId}:`, error);
    }
  };

  // Initial load
  useEffect(() => {
    refreshCityMetrics();
    refreshLeaderboard();
    refreshBadges();
  }, []);

  return (
    <RecyclingContext.Provider
      value={{
        plyBalance,
        crtBalance,
        badges,
        units,
        cityMetrics,
        leaderboard,
        logRecycleUnit,
        submitBatch,
        refreshCityMetrics,
        refreshBadges,
        refreshLeaderboard,
        fetchCityHistoricalTrends,
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
