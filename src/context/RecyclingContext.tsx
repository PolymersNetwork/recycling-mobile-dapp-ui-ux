import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateUUID } from '../lib/utils';
import {
  fetchCityMetrics,
  fetchLeaderboard,
  logRecycleBatch,
  fetchBadgeStats,
  fetchHistoricalTrends,
  fetchRewardProjections,
} from '../lib/api';
import { sendRecycleTransaction, verifyWithOracles, releaseEscrow, subscribeLeaderboardUpdates } from '../lib/solana';
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
  polyEarned: number;
  crtEarned: number;
  batchCount: number;
  leaderboard: any[];
  historicalTrends?: any[];
  rewardProjections?: any;
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
}

const RecyclingContext = createContext<RecyclingContextProps | undefined>(undefined);

export const RecyclingProvider = ({ children }: { children: ReactNode }) => {
  const [plyBalance, setPlyBalance] = useState(0);
  const [crtBalance, setCrtBalance] = useState(0);
  const [units, setUnits] = useState<Unit[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [cityMetrics, setCityMetrics] = useState<Record<string, CityMetrics>>({});
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // --- Add a scanned unit ---
  const logRecycleUnit = (unit: Omit<Unit, 'id' | 'scannedAt'>) => {
    const newUnit: Unit = { ...unit, id: generateUUID(), scannedAt: new Date() };
    setUnits(prev => [...prev, newUnit]);
  };

  // --- Submit batch: verify, transact, update balances & metrics ---
  const submitBatch = async () => {
    if (units.length === 0) return;

    try {
      // 1. Oracle verification (Pyth + Chainlink)
      const verificationResults = await verifyWithOracles(units);

      // 2. Filter verified units
      const verifiedUnits = units.filter((_, idx) => verificationResults[idx]);

      // 3. Send Solana transaction
      await sendRecycleTransaction(verifiedUnits);

      // 4. Release corporate/NGO escrow automatically
      await releaseEscrow(verifiedUnits);

      // 5. Log batch in backend
      await logRecycleBatch({ id: 'current-user-id' }, verifiedUnits);

      // 6. Update balances
      const polyEarned = verifiedUnits.length;
      const crtEarned = verifiedUnits.length * 0.5;
      setPlyBalance(prev => prev + polyEarned);
      setCrtBalance(prev => prev + crtEarned);

      // 7. Refresh multi-city metrics
      await refreshCityMetrics();

      // 8. Refresh badges
      await refreshBadges();

      // 9. Refresh leaderboard
      await refreshLeaderboard();

      // 10. Clear scanned units
      setUnits([]);
    } catch (err) {
      console.error('Error submitting batch:', err);
    }
  };

  // --- Fetch metrics per city with historical trends & projections ---
  const refreshCityMetrics = async () => {
    try {
      const metrics = await fetchCityMetrics();
      const updatedMetrics: Record<string, CityMetrics> = {};

      for (const city in metrics) {
        const historicalTrends = await fetchHistoricalTrends(city);
        const rewardProjections = await fetchRewardProjections(city);
        updatedMetrics[city] = {
          ...metrics[city],
          historicalTrends,
          rewardProjections,
        };
      }

      setCityMetrics(updatedMetrics);
    } catch (err) {
      console.error('Error refreshing city metrics:', err);
    }
  };

  // --- Fetch and update NFT badges ---
  const refreshBadges = async () => {
    try {
      const badgeData = await fetchBadgeStats();
      const updatedBadges = badgeData.map(b => ({
        ...b,
        rarity: calculateBadgeRarity(b),
      }));
      setBadges(updatedBadges);
    } catch (err) {
      console.error('Error refreshing badges:', err);
    }
  };

  // --- Fetch global leaderboard ---
  const refreshLeaderboard = async () => {
    try {
      const data = await fetchLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error('Error refreshing leaderboard:', err);
    }
  };

  // --- Subscribe to WebSocket leaderboard updates ---
  useEffect(() => {
    const unsubscribe = subscribeLeaderboardUpdates((updatedLeaderboard) => {
      setLeaderboard(updatedLeaderboard);
    });

    return () => unsubscribe();
  }, []);

  // --- Initial load ---
  useEffect(() => {
    refreshCityMetrics();
    refreshBadges();
    refreshLeaderboard();
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
      }}
    >
      {children}
    </RecyclingContext.Provider>
  );
};

export const useRecycling = () => {
  const context = useContext(RecyclingContext);
  if (!context) throw new Error('useRecycling must be used within RecyclingProvider');
  return context;
};
