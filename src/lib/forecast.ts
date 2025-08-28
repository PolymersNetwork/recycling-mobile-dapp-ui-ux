import { BadgeStats, Unit } from '../types';

/**
 * Calculate projected POLY (PLY) and CRT rewards for a batch of units
 * based on historical trends and multipliers.
 */
export const calculateRewardForecast = (
  units: Unit[],
  historicalMultiplier = 1
) => {
  const polyPerUnit = 1;   // 1 PLY per unit
  const crtPerUnit = 0.5;  // 0.5 CRT per unit

  const totalPLY = units.length * polyPerUnit * historicalMultiplier;
  const totalCRT = units.length * crtPerUnit * historicalMultiplier;

  return {
    ply: Math.round(totalPLY),
    crt: Math.round(totalCRT),
  };
};

/**
 * Dynamically calculate badge rarity based on global unlocks
 */
export const calculateBadgeRarity = (badge: BadgeStats) => {
  const { unlockedCount, totalUsers } = badge;
  if (totalUsers === 0) return 0;

  const rarity = 100 - (unlockedCount / totalUsers) * 100;
  return Math.round(rarity);
};

/**
 * Estimate future POLY/CRT rewards per city
 */
export const projectCityRewards = (
  units: Unit[],
  cityMultiplier: Record<string, number>
) => {
  const projections: Record<string, { ply: number; crt: number }> = {};

  units.forEach((unit) => {
    const multiplier = cityMultiplier[unit.city] || 1;
    if (!projections[unit.city]) {
      projections[unit.city] = { ply: 0, crt: 0 };
    }
    projections[unit.city].ply += 1 * multiplier;
    projections[unit.city].crt += 0.5 * multiplier;
  });

  // Round results
  Object.keys(projections).forEach((city) => {
    projections[city].ply = Math.round(projections[city].ply);
    projections[city].crt = Math.round(projections[city].crt);
  });

  return projections;
};

/**
 * Calculate projected leaderboard impact for cities
 */
export const calculateLeaderboardImpact = (
  units: Unit[],
  cityMultiplier: Record<string, number>
) => {
  const projections = projectCityRewards(units, cityMultiplier);
  return Object.entries(projections)
    .map(([city, data]) => ({ city, ply: data.ply, crt: data.crt }))
    .sort((a, b) => b.ply - a.ply);
};
