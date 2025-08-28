import { CityMetrics, BadgeStats } from '../types';

/**
 * Calculate PLY & CRT reward projections for next period
 */
export const calculateRewardForecast = (
  cityMetrics: CityMetrics,
  dailyGrowthRate = 0.001
) => {
  const projectedPLY = cityMetrics.totalPLY * (1 + dailyGrowthRate);
  const projectedCRT = cityMetrics.totalCRT * (1 + dailyGrowthRate);
  return { projectedPLY, projectedCRT };
};

/**
 * Calculate NFT badge rarity dynamically based on global scans
 */
export const calculateBadgeRarity = (badgeStats: BadgeStats[], totalScans: number) => {
  return badgeStats.map((badge) => ({
    ...badge,
    rarity: badge.earnedBy / totalScans, // lower = rarer
  }));
};
