import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateGeoHash, groupUnitsByCity, generateUUID } from '../lib/utils';
import { fetchCityMetrics, fetchLeaderboard, logRecycleBatch, fetchBadgeStats } from '../lib/api';
import { sendRecycleTransaction, verifyWithOracles, releaseEscrow } from '../lib/solana';
import { calculateRewardForecast, calculateBadgeRarity } from '../lib/forecast';

interface Unit {
  id: string;
  city: string;
  lat: number;
  lng: number;
  scannedAt: Date;
}

interface Badge {
  id: string;
  name: string;
  unlocked: boolean;
  rarity: number;
  imageUrl: string;
}

interface CityMetrics {
  polyEarned: number;
  crtEarned: number;
  batchCount: number;
  leaderboard: any[];
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

  // Add a single scanned unit
  const logRecycleUnit = (unit: Omit<Unit, 'id' | 'scannedAt'>) => {
    const newUnit: Unit = { ...unit, id: generateUUID(), scannedAt: new Date() };
    setUnits(prev => [...prev, newUnit]);
  };

  // Submit batch: verify units, update balances, trigger Solana tx & escrow
  const submitBatch = async () => {
    if (units.length === 0) return;

    // 1. Verify units via Chainlink + Pyth oracles
    const verificationResults = await verifyWithOracles(units);

    // 2. Filter verified units
    const verifiedUnits = units.filter((_, idx) => verificationResults[idx]);

    // 3. Send transaction to Solana program
    await sendRecycleTransaction(verifiedUnits);

    // 4. Release any escrow for corporate/NGO donations
    await releaseEscrow(verifiedUnits);

    // 5. Log batch in backend
    await logRecycleBatch(verifiedUnits);

    // 6. Update POLY/CRT balances
    const polyEarned = verifiedUnits.length; // 1:1 for simplicity
    const crtEarned = verifiedUnits.length * 0.5;
    setPlyBalance(prev => prev + polyEarned);
    setCrtBalance(prev => prev + crtEarned);

    // 7. Update city metrics
    await refreshCityMetrics();

    // 8. Refresh badge stats
    await refreshBadges();

    // 9. Clear units after submission
    setUnits([]);
  };

  const refreshCityMetrics = async () => {
    const metrics = await fetchCityMetrics();
    setCityMetrics(metrics);
  };

  const refreshBadges = async () => {
    const badgeData = await fetchBadgeStats();
    const updatedBadges = badgeData.map(badge => ({
      ...badge,
      rarity: calculateBadgeRarity(badge),
    }));
    setBadges(updatedBadges);
  };

  // Load initial data
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
