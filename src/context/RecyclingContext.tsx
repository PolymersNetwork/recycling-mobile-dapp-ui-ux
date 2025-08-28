import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateUUID } from '../lib/utils';
import { fetchCityMetrics, fetchLeaderboard, logRecycleBatch, fetchBadgeStats, fetchHistoricalTrends } from '../lib/api';
import { sendRecycleTransaction, verifyWithOracles, releaseEscrow, subscribeLeaderboard } from '../lib/solana';
import { calculateRewardForecast, calculateBadgeRarity } from '../lib/forecast';

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
  plyEarned: number;
  crtEarned: number;
  batchCount: number;
  leaderboard: any[];
  trends?: any[];
}

interface RecyclingContextProps {
  plyBalance: number;
  crtBalance: number;
  badges: Badge[];
  units: Unit[];
  cityMetrics: Record<string, CityMetrics>;
  logRecycleUnit: (unit: Omit<Unit, 'id' | 'scannedAt'>) => void;
  submitBatch: () => Promise<void>;
  refreshCityMetrics: () => Promise<void>;
  refreshBadges: () => Promise<void>;
}

const RecyclingContext = createContext<RecyclingContextProps | undefined>(undefined);

export const RecyclingProvider = ({ children }: { children: ReactNode }) => {
  const [plyBalance, setPlyBalance] = useState(0);
  const [crtBalance, setCrtBalance] = useState(0);
  const [units, setUnits] = useState<Unit[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [cityMetrics, setCityMetrics] = useState<Record<string, CityMetrics>>({});

  // Add a scanned unit
  const logRecycleUnit = (unit: Omit<Unit, 'id' | 'scannedAt'>) => {
    const newUnit: Unit = { ...unit, id: generateUUID(), scannedAt: new Date() };
    setUnits(prev => [...prev, newUnit]);
  };

  // Submit batch: verify, reward, Solana tx, escrow
  const submitBatch = async () => {
    if (units.length === 0) return;

    // 1. Verify units via Chainlink + Pyth oracles
    const verificationResults = await verifyWithOracles(units);
    const verifiedUnits = units.filter((_, idx) => verificationResults[idx]);
    if (verifiedUnits.length === 0) return;

    // 2. Send transaction to Solana
    await sendRecycleTransaction(verifiedUnits);

    // 3. Release escrow for corporate/NGO donations
    await releaseEscrow(verifiedUnits);

    // 4. Log batch in backend
    await logRecycleBatch(verifiedUnits);

    // 5. Update PLY/CRT balances
    const { ply, crt } = calculateRewardForecast(verifiedUnits.length);
    setPlyBalance(prev => prev + ply);
    setCrtBalance(prev => prev + crt);

    // 6. Refresh city metrics and badges
    await refreshCityMetrics();
    await refreshBadges();

    // 7. Clear submitted units
    setUnits([]);
  };

  // Refresh city metrics including trends
  const refreshCityMetrics = async () => {
    const cities = await fetchCityMetrics();
    const metrics: Record<string, CityMetrics> = {};
    for (const city of cities) {
      const trends = await fetchHistoricalTrends(city.id);
      metrics[city.name] = { ...city, trends };
    }
    setCityMetrics(metrics);
  };

  // Refresh badge stats and calculate rarity
  const refreshBadges = async () => {
    const badgeData = await fetchBadgeStats();
    const updatedBadges = badgeData.map(badge => ({
      ...badge,
      rarity: calculateBadgeRarity(badge),
    }));
    setBadges(updatedBadges);
  };

  // Subscribe to real-time leaderboard via WebSocket
  useEffect(() => {
    const ws = subscribeLeaderboard((update) => {
      setCityMetrics(prev => {
        const updated = { ...prev };
        update.forEach(entry => {
          if (updated[entry.city]) {
            updated[entry.city].leaderboard = entry.leaderboard;
          }
        });
        return updated;
      });
    });
    return () => ws.close();
  }, []);

  // Load initial metrics and badges
  useEffect(() => {
    refreshCityMetrics();
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
        logRecycleUnit,
        submitBatch,
        refreshCityMetrics,
        refreshBadges,
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
